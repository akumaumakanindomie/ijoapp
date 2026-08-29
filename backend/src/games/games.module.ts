import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GamesService } from './games.service';
import { GamesController } from './games.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { QuestsModule } from '../quests/quests.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    QuestsModule,
  ],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}
