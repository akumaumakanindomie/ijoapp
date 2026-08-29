import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

const QUEST_DICTIONARY = [
  { id: 'daily-scan', type: 'daily', title: 'Pilah 3 Sampah', description: 'Scan tiga sampah dan bantu catat dampaknya untuk bumi.', target: 3, rewardTickets: 1, icon: 'ScanLine', actionLabel: 'Mulai Scan', actionHref: '/dashboard/scan' },
  { id: 'daily-checkin', type: 'daily', title: 'Rawat Partner', description: 'Lakukan check-in pada partner hijau milikmu hari ini.', target: 1, rewardTickets: 1, icon: 'Leaf', actionLabel: 'Ke Dashboard', actionHref: '/dashboard' },
  { id: 'weekly-games', type: 'weekly', title: 'Main 2 Kali', description: 'Selesaikan dua permainan dan kumpulkan skor terbaikmu.', target: 2, rewardTickets: 3, icon: 'Gamepad2', actionLabel: 'Pilih Game', actionHref: '/dashboard/game' },
  { id: 'weekly-score', type: 'weekly', title: 'Raih 200 Poin', description: 'Raih total skor sebanyak 200 poin dari bermain game minggu ini.', target: 200, rewardTickets: 5, icon: 'Trophy', actionLabel: 'Pilih Game', actionHref: '/dashboard/game' },
];

@Injectable()
export class QuestsService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  private getResetBounds() {
    const now = new Date();
    
    // Daily Reset (00:00 Hari berikutnya)
    const dailyReset = new Date(now);
    dailyReset.setHours(24, 0, 0, 0);
    const dailyStart = new Date(dailyReset.getTime() - 86400000);

    // Weekly Reset (Senin 00:00)
    const weeklyReset = new Date(now);
    const daysUntilMonday = (8 - weeklyReset.getDay()) % 7 || 7;
    weeklyReset.setDate(weeklyReset.getDate() + daysUntilMonday);
    weeklyReset.setHours(0, 0, 0, 0);
    const weeklyStart = new Date(weeklyReset.getTime() - 7 * 86400000);

    return { dailyReset, dailyStart, weeklyReset, weeklyStart };
  }

  private hasCheckedInToday(lastCheckIn?: Date | null) {
    if (!lastCheckIn) return false;

    const lastDate = new Date(lastCheckIn);
    const today = new Date();
    return (
      lastDate.getDate() === today.getDate() &&
      lastDate.getMonth() === today.getMonth() &&
      lastDate.getFullYear() === today.getFullYear()
    );
  }

  async getQuests(userId: string) {
    const user = await this.userModel.findById(userId).populate('activeItem');
    if (!user) throw new NotFoundException('User not found');
    const bounds = this.getResetBounds();
    return QUEST_DICTIONARY.map((qDef) => {
      const records = user.quests ?? [];
      const record = records.find((q) => q.questId === qDef.id);
      const isDaily = qDef.type === 'daily';
      const periodStart = isDaily ? bounds.dailyStart : bounds.weeklyStart;
      const resetAt = isDaily ? bounds.dailyReset : bounds.weeklyReset;

      // Evaluasi apakah progres hangus (reset)
      if (record && record.lastUpdated < periodStart) {
        record.progress = 0;
        record.claimed = false;
      }

      const checkedInToday = this.hasCheckedInToday(
        (user.activeItem as any)?.lastCheckIn,
      );
      const progressVal =
        qDef.id === 'daily-checkin'
          ? checkedInToday
            ? qDef.target
            : 0
          : record
            ? record.progress
            : 0;
      const claimedVal = record ? record.claimed : false;
      const completedVal = progressVal >= qDef.target;

      return {
        id: qDef.id,
        type: qDef.type,
        title: qDef.title,
        description: qDef.description,
        target: qDef.target,
        progress: progressVal,
        rewardTickets: qDef.rewardTickets,
        completed: completedVal,
        claimed: claimedVal,
        resetAt: resetAt.toISOString(),
        icon: qDef.icon,
        actionLabel: qDef.actionLabel,
        actionHref: qDef.actionHref
      };
    });
  }

  async incrementProgress(userId: string, questId: string, amount: number = 1) {
    const user = await this.userModel.findById(userId);
    if (!user) return;

    const qDef = QUEST_DICTIONARY.find((quest) => quest.id === questId);
    if (!qDef) return;

    const records = user.quests ?? (user.quests = []);
    let record = records.find((q) => q.questId === questId);
    const bounds = this.getResetBounds();
    const periodStart = qDef.type === 'daily' ? bounds.dailyStart : bounds.weeklyStart;

    if (record && record.lastUpdated < periodStart) {
      record.progress = 0;
      record.claimed = false;
    }

    if (!record) {
      record = { questId, progress: 0, claimed: false, lastUpdated: new Date() };
      records.push(record);
    }

    record.progress = Math.min(qDef.target, record.progress + amount);
    record.lastUpdated = new Date();
    
    user.markModified('quests');
    await user.save();
  }

  async claimQuest(userId: string, questId: string) {
    const user = await this.userModel.findById(userId).populate('activeItem');
    const qDef = QUEST_DICTIONARY.find((q) => q.id === questId);
    
    if (!qDef) throw new BadRequestException('Quest tidak valid');
    if (!user) throw new NotFoundException('User not found');

    const records = user.quests ?? [];
    let record = records.find((q) => q.questId === questId);
    if (questId === 'daily-checkin' && this.hasCheckedInToday((user.activeItem as any)?.lastCheckIn)) {
      if (!record) {
        record = {
          questId,
          progress: qDef.target,
          claimed: false,
          lastUpdated: new Date(),
        };
        records.push(record);
      } else {
        record.progress = qDef.target;
      }
    }
    if (!record || record.progress < qDef.target) {
      throw new BadRequestException('Misi belum selesai');
    }
    if (record.claimed) {
      throw new BadRequestException('Hadiah sudah diklaim');
    }

    // Eksekusi klaim secara atomik
    record.claimed = true;
    user.gameTickets += qDef.rewardTickets;
    user.markModified('quests');
    
    await user.save();

    return {
      message: 'Klaim berhasil',
      gameTickets: user.gameTickets,
      questId
    };
  }
}