import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

const USERNAME_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
const PRESENCE_TTL_MS = 60 * 1000;

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  getPresenceState(lastSeen?: Date | string | null) {
    if (!lastSeen) return { online: false, lastSeen: null, ttlMs: PRESENCE_TTL_MS };

    const seenAt = new Date(lastSeen).getTime();
    const now = Date.now();
    const online = now - seenAt <= PRESENCE_TTL_MS;

    return {
      online,
      lastSeen: new Date(lastSeen),
      ttlMs: PRESENCE_TTL_MS,
    };
  }

  async heartbeat(userId: string) {
    const lastSeen = new Date();
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { lastSeen },
      { new: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return {
      ...this.getPresenceState(updatedUser.lastSeen || lastSeen),
      userId,
      ttlSeconds: Math.floor(PRESENCE_TTL_MS / 1000),
    };
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash').lean();
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const now = new Date();
    const weeklyStart = new Date(now);
    const day = weeklyStart.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    weeklyStart.setDate(weeklyStart.getDate() + diffToMonday);
    weeklyStart.setHours(0, 0, 0, 0);

    const weeklyPoints = (user.pointHistory || [])
      .filter((entry) => new Date(entry.createdAt) >= weeklyStart)
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      _id: user._id,
      fullName: user.fullName,
      username: user.username || user.email.split('@')[0],
      bio: user.bio || '',
      email: user.email,
      totalPoints: user.totalScore || 0,
      weeklyPoints,
      monthlyPoints: weeklyPoints,
      usernameChangedAt: user.usernameChangedAt || null,
    };
  }

  async getPublicProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash').lean();
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const now = new Date();
    const weeklyStart = new Date(now);
    const day = weeklyStart.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    weeklyStart.setDate(weeklyStart.getDate() + diffToMonday);
    weeklyStart.setHours(0, 0, 0, 0);

    const monthlyStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weeklyPoints = (user.pointHistory || [])
      .filter((entry) => new Date(entry.createdAt) >= weeklyStart)
      .reduce((sum, entry) => sum + entry.amount, 0);
    const monthlyPoints = (user.pointHistory || [])
      .filter((entry) => new Date(entry.createdAt) >= monthlyStart)
      .reduce((sum, entry) => sum + entry.amount, 0);

    return {
      _id: user._id,
      fullName: user.fullName,
      username: user.username || user.email.split('@')[0],
      bio: user.bio || '',
      totalPoints: user.totalScore || 0,
      weeklyPoints,
      monthlyPoints,
    };
  }

  async updateProfile(userId: string, changes: UpdateProfileDto) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User tidak ditemukan');

    if (changes.username && changes.username.toLowerCase() !== user.username?.toLowerCase()) {
      if (user.usernameChangedAt && Date.now() - user.usernameChangedAt.getTime() < USERNAME_COOLDOWN_MS) {
        const nextChangeAt = new Date(user.usernameChangedAt.getTime() + USERNAME_COOLDOWN_MS);
        throw new BadRequestException(`Username dapat diganti lagi pada ${nextChangeAt.toLocaleDateString('id-ID')}`);
      }

      const existing = await this.userModel.exists({
        username: changes.username.toLowerCase(),
        _id: { $ne: userId },
      });
      if (existing) throw new ConflictException('Username sudah digunakan');
      user.username = changes.username.toLowerCase();
      user.usernameChangedAt = new Date();
    }

    if (changes.fullName !== undefined) user.fullName = changes.fullName.trim();
    if (changes.bio !== undefined) user.bio = changes.bio.trim();
    await user.save();
    return this.getProfile(userId);
  }

  // 1. Ambil Semua User (Kecuali Admin)
  async findAllUsers() {
    return this.userModel
      .find({ role: 'student' })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPendingUsers() {
    return this.userModel
      .find({ role: 'student', status: 'pending' })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .exec();
  }

  // 2. Approve / Reject User
  async updateUserStatus(userId: string, status: 'active' | 'rejected') {
    if (status === 'rejected') {
      const deletedUser = await this.userModel.findByIdAndDelete(userId);

      if (!deletedUser) {
        throw new NotFoundException('User tidak ditemukan');
      }

      return {
        message: 'Registrasi ditolak dan data pengguna berhasil dihapus',
        deleted: true,
        user: deletedUser,
      };
    }

    if (status !== 'active') {
      throw new BadRequestException('Status yang valid hanya active atau rejected');
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status: 'active' },
      { new: true },
    );

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    return {
      message: 'User berhasil diubah statusnya menjadi active',
      user,
    };
  }

  // 3. Delete User (Opsional)
  async deleteUser(userId: string) {
    return this.userModel.findByIdAndDelete(userId);
  }
}
