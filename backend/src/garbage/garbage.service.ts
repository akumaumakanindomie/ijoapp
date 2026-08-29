import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { QuestsService } from '../quests/quests.service'; // INJEKSI QUEST SERVICE

@Injectable()
export class GarbageService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private questsService: QuestsService // DAFTARKAN DI CONSTRUCTOR
  ) {}

  async scanTrash(userId: string, trashCategory: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const rewardCoins = 5;
    const rewardPoints = 5;
    user.ijoCoins += rewardCoins;
    user.scanPoints = (user.scanPoints || 0) + rewardPoints;
    user.totalScore = (user.totalScore || 0) + rewardPoints;
    user.pointHistory = user.pointHistory || [];
    user.pointHistory.push({ amount: rewardPoints, createdAt: new Date() });

    await user.save();
    await this.questsService.incrementProgress(userId, 'daily-scan', 1);

    return {
      message: 'Sampah berhasil dipilah!',
      category: trashCategory,
      newCoinBalance: user.ijoCoins,
      scanPoints: user.scanPoints,
      totalScore: user.totalScore,
      tickets: user.gameTickets,
      reward: `+${rewardCoins} Coins, +${rewardPoints} Points`,
    };
  }
}