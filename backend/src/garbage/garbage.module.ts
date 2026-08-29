import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // Import ini
import { GarbageService } from './garbage.service';
import { GarbageController } from './garbage.controller';
import { User, UserSchema } from '../schemas/user.schema'; // Import Schema User
import { QuestsModule } from '../quests/quests.module';

@Module({
  imports: [
    // Agar GarbageService bisa edit data User
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    QuestsModule,
  ],
  controllers: [GarbageController],
  providers: [GarbageService],
})
export class GarbageModule {}
