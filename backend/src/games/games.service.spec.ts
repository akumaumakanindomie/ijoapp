import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../schemas/user.schema';
import { GamesService } from './games.service';
import { QuestsService } from '../quests/quests.service';

describe('GamesService', () => {
  let service: GamesService;

  beforeEach(async () => {
    const userModel = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: getModelToken(User.name),
          useValue: userModel,
        },
        {
          provide: QuestsService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('awards coins to top 10 weekly leaderboard users with score >= 500 once per week', async () => {
    const userModel = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([
              { _id: 'u1', weeklyTotalScore: 1200, lastWeeklyRewardAt: null },
              { _id: 'u2', weeklyTotalScore: 950, lastWeeklyRewardAt: null },
              { _id: 'u3', weeklyTotalScore: 700, lastWeeklyRewardAt: null },
              { _id: 'u4', weeklyTotalScore: 540, lastWeeklyRewardAt: null },
              { _id: 'u5', weeklyTotalScore: 520, lastWeeklyRewardAt: null },
              { _id: 'u6', weeklyTotalScore: 510, lastWeeklyRewardAt: null },
              { _id: 'u7', weeklyTotalScore: 500, lastWeeklyRewardAt: null },
              { _id: 'u8', weeklyTotalScore: 499, lastWeeklyRewardAt: null },
              { _id: 'u9', weeklyTotalScore: 600, lastWeeklyRewardAt: null },
              { _id: 'u10', weeklyTotalScore: 470, lastWeeklyRewardAt: null },
              { _id: 'u11', weeklyTotalScore: 800, lastWeeklyRewardAt: null },
            ]),
          }),
        }),
      }),
      findById: jest.fn((id: string) => ({
        _id: id,
        ijoCoins: 0,
        lastWeeklyRewardAt: null,
        save: jest.fn().mockResolvedValue(true),
      })),
    };

    service = new GamesService(userModel as any, {} as any);

    const result = await service.distributeWeeklyLeaderboardRewards();

    expect(result.totalAwarded).toBeGreaterThan(0);
    expect(result.grantedUsers).toEqual(expect.arrayContaining(['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7']));
    expect(result.grantedUsers).not.toContain('u8');
    expect(result.grantedUsers).not.toContain('u10');
  });
});
