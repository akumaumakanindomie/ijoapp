import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

describe('GamesController', () => {
  let controller: GamesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: {
            saveScore: jest.fn(),
            getLeaderboard: jest.fn(),
            getMyLeaderboardRank: jest.fn(),
            startGame: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('exposes the authenticated personal leaderboard rank endpoint', () => {
    expect(typeof controller.getMyLeaderboardRank).toBe('function');
  });
});
