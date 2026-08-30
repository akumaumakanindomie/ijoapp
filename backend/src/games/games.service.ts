import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { QuestsService } from '../quests/quests.service';

const WEEKLY_LEADERBOARD_REWARDS: Record<number, number> = {
  1: 300,
  2: 275,
  3: 250,
  4: 225,
  5: 200,
  6: 175,
  7: 150,
  8: 125,
  9: 110,
  10: 100,
};

@Injectable()
export class GamesService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private questsService: QuestsService,
  ) {}

  private getWeeklyStartDate() {
    const now = new Date();
    const weeklyReset = new Date(now);
    const daysUntilMonday = (8 - weeklyReset.getDay()) % 7 || 7;
    weeklyReset.setDate(weeklyReset.getDate() + daysUntilMonday);
    weeklyReset.setHours(0, 0, 0, 0);
    return new Date(weeklyReset.getTime() - 7 * 86400000);
  }

  private getWeeklyRewardAmount(rank: number) {
    return WEEKLY_LEADERBOARD_REWARDS[rank] ?? 0;
  }

  async distributeWeeklyLeaderboardRewards() {
    const weeklyStart = this.getWeeklyStartDate();
    const users = await this.userModel
      .find()
      .select('_id weeklyTotalScore ijoCoins lastWeeklyRewardAt')
      .sort({ weeklyTotalScore: -1 })
      .lean();

    const eligibleUsers = users.filter((user) => {
      const score = Number(user.weeklyTotalScore ?? 0);
      const lastAward = user.lastWeeklyRewardAt
        ? new Date(user.lastWeeklyRewardAt)
        : null;

      return score >= 500 && (!lastAward || lastAward < weeklyStart);
    });

    const grantedUsers: string[] = [];

    for (const [index, userSummary] of eligibleUsers.slice(0, 10).entries()) {
      const rank = index + 1;
      const reward = this.getWeeklyRewardAmount(rank);

      if (!reward) continue;

      const user = await this.userModel.findById(userSummary._id);
      if (!user) continue;

      const lastAward = user.lastWeeklyRewardAt
        ? new Date(user.lastWeeklyRewardAt)
        : null;

      if (lastAward && lastAward >= weeklyStart) continue;

      user.ijoCoins = (user.ijoCoins || 0) + reward;
      user.lastWeeklyRewardAt = new Date();
      await user.save();
      grantedUsers.push(String(userSummary._id));
    }

    return {
      totalAwarded: grantedUsers.length,
      grantedUsers,
    };
  }

  private resetWeeklyScoresIfNeeded(user: UserDocument) {
    const weeklyStart = this.getWeeklyStartDate();
    const lastReset = user.weeklyLeaderboardUpdatedAt ? new Date(user.weeklyLeaderboardUpdatedAt) : null;

    if (!user.weeklyGameScores) {
      user.weeklyGameScores = { catcher: 0, snake: 0, quiz: 0 };
    }

    if (!user.weeklyTotalScore && user.weeklyTotalScore !== 0) {
      user.weeklyTotalScore = 0;
    }

    if (!lastReset || lastReset < weeklyStart) {
      user.weeklyTotalScore = 0;
      user.weeklyGameScores = { catcher: 0, snake: 0, quiz: 0 };
      user.weeklyLeaderboardUpdatedAt = new Date();
    }
  }

  // 1. MULAI GAME (Bayar Tiket)
  async startGame(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.gameTickets < 1) {
      throw new BadRequestException('Tiket habis! Silakan pilah sampah dulu.');
    }

    user.gameTickets -= 1;
    await user.save();

    await this.questsService.incrementProgress(userId, 'weekly-games', 1);

    return { message: 'Game Start!', remainingTickets: user.gameTickets };
  }

  // 2. SELESAI GAME (Simpan Skor ke Dompet Spesifik)
  async saveScore(userId: string, newScore: number, gameType: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.gameScores) {
      user.gameScores = { catcher: 0, snake: 0, quiz: 0 };
    }

    if (!user.weeklyGameScores) {
      user.weeklyGameScores = { catcher: 0, snake: 0, quiz: 0 };
    }

    this.resetWeeklyScoresIfNeeded(user);

    const currentScore = user.gameScores[gameType] || 0;
    const currentWeeklyScore = user.weeklyGameScores[gameType] || 0;
    const coinReward = Math.floor(newScore / 40);

    let message = 'Score saved (No new record)';

    user.totalScore = (user.totalScore || 0) + newScore;
    user.weeklyTotalScore = (user.weeklyTotalScore || 0) + newScore;
    user.ijoCoins = (user.ijoCoins || 0) + coinReward;
    user.pointHistory = user.pointHistory || [];
    user.pointHistory.push({ amount: newScore, createdAt: new Date() });

    if (newScore > currentScore) {
      user.gameScores[gameType] = newScore;
      user.markModified('gameScores');
      message = `New High Score for ${gameType}!`;
    }

    if (newScore > currentWeeklyScore) {
      user.weeklyGameScores[gameType] = newScore;
      user.markModified('weeklyGameScores');
    }

    user.weeklyLeaderboardUpdatedAt = new Date();
    await user.save();

    await this.questsService.incrementProgress(userId, 'weekly-score', newScore);

    return {
      message: message,
      gameType: gameType,
      yourScore: newScore,
      totalGlobalScore: user.totalScore,
      weeklyTotalScore: user.weeklyTotalScore,
      ijoCoinsEarned: coinReward,
      currentIjoCoins: user.ijoCoins,
    };
  }

  async getLeaderboard(gameType: string = 'all', scope: 'all' | 'weekly' = 'all') {
    if (scope === 'weekly') {
      await this.distributeWeeklyLeaderboardRewards();
    }

    const isWeekly = scope === 'weekly';
    let sortCriteria: any = isWeekly ? { weeklyTotalScore: -1 } : { totalScore: -1 };

    if (gameType && gameType !== 'all') {
      sortCriteria = isWeekly
        ? { [`weeklyGameScores.${gameType}`]: -1 }
        : { [`gameScores.${gameType}`]: -1 };
    }

    return this.userModel
      .find()
      .sort(sortCriteria)
      .limit(10)
      .select(
        isWeekly
          ? 'fullName schoolClass weeklyTotalScore weeklyGameScores activeItem'
          : 'fullName schoolClass totalScore gameScores activeItem',
      )
      .populate('activeItem');
  }

  async getMyLeaderboardRank(userId: string, gameType: string = 'all', scope: 'all' | 'weekly' = 'all') {
    if (scope === 'weekly') {
      await this.distributeWeeklyLeaderboardRewards();
    }

    const isWeekly = scope === 'weekly';
    const users = await this.userModel
      .find()
      .select(
        isWeekly
          ? 'fullName schoolClass weeklyTotalScore weeklyGameScores _id'
          : 'fullName schoolClass totalScore gameScores _id',
      )
      .lean();

    const getScore = (user: any) => {
      if (gameType && gameType !== 'all') {
        const gameScores = isWeekly ? user.weeklyGameScores : user.gameScores;
        return gameScores?.[gameType] || 0;
      }

      return isWeekly ? (user.weeklyTotalScore || 0) : (user.totalScore || 0);
    };

    const rankedUsers = [...users]
      .map((user) => ({
        _id: user._id,
        score: getScore(user),
      }))
      .sort((a, b) => b.score - a.score);

    const currentIndex = rankedUsers.findIndex((user) => user._id.toString() === userId);

    return {
      myRank: currentIndex >= 0 ? currentIndex + 1 : null,
      myScore: currentIndex >= 0 ? rankedUsers[currentIndex].score : null,
      totalRankedUsers: rankedUsers.length,
    };
  }
}
