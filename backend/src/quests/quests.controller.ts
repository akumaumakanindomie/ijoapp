// backend/src/quests/quests.controller.ts
import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { QuestsService } from './quests.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Get()
  getQuests(@Request() req) {
    return this.questsService.getQuests(req.user.userId);
  }

  @Post(':id/claim')
  claimQuest(@Request() req, @Param('id') id: string) {
    return this.questsService.claimQuest(req.user.userId, id);
  }
}