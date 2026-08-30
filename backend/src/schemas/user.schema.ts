// backend/src/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Item } from './item.schema';

export type UserDocument = User & Document;

// Sub-schema untuk menyimpan progres misi
@Schema({ _id: false })
export class QuestProgress {
  @Prop({ required: true })
  questId!: string;

  @Prop({ default: 0 })
  progress!: number;

  @Prop({ default: false })
  claimed!: boolean;

  @Prop({ required: true })
  lastUpdated!: Date;
}

@Schema({ _id: false })
export class GameScores {
  @Prop({ default: 0 }) catcher!: number;
  @Prop({ default: 0 }) snake!: number;
  @Prop({ default: 0 }) quiz!: number;
}

@Schema({ _id: false })
export class PointEntry {
  @Prop({ required: true }) amount!: number;
  @Prop({ default: Date.now }) createdAt!: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true }) email!: string;
  @Prop({ required: true }) passwordHash!: string;
  @Prop({ required: true }) fullName!: string;
  @Prop({ unique: true, sparse: true, lowercase: true, trim: true }) username?: string;
  @Prop({ default: '' }) bio!: string;
  @Prop() usernameChangedAt?: Date;
  @Prop() schoolClass!: string;
  @Prop({ default: 'student', enum: ['student', 'admin'] }) role!: string;
  @Prop({ default: 'pending', enum: ['pending', 'active', 'rejected'] }) status!: string;
  @Prop({ type: Date, default: null, nullable: true }) lastSeen?: Date | null;
  @Prop({ default: 0 }) ijoCoins!: number;
  @Prop({ default: 0 }) gameTickets!: number;
  @Prop({ default: 0 }) scanPoints!: number;
  
  @Prop({ type: GameScores, default: () => ({ catcher: 0, snake: 0, quiz: 0 }) })
  gameScores!: GameScores;

  @Prop({ type: GameScores, default: () => ({ catcher: 0, snake: 0, quiz: 0 }) })
  weeklyGameScores!: GameScores;
  
  @Prop({ default: 0 }) totalScore!: number;
  @Prop({ default: 0 }) weeklyTotalScore!: number;
  @Prop() weeklyLeaderboardUpdatedAt?: Date;
  @Prop() lastWeeklyRewardAt?: Date;
  @Prop({ type: Types.ObjectId, ref: 'Item' }) activeItem!: Item;
  @Prop({ default: 'id' }) language!: string;

  // FIELD BARU: Array pelacakan misi
  @Prop({ type: [QuestProgress], default: [] })
  quests!: QuestProgress[];

  @Prop({ type: [PointEntry], default: [] })
  pointHistory!: PointEntry[];
}

export const UserSchema = SchemaFactory.createForClass(User);