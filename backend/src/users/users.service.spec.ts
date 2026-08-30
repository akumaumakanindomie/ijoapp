import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  beforeEach(() => {
    userModel = {
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findById: jest.fn(),
      exists: jest.fn(),
    };

    service = new UsersService(userModel);
  });

  it('should mark a user as online when heartbeat is received within the TTL window', async () => {
    userModel.findByIdAndUpdate.mockResolvedValue({
      _id: 'user-1',
      lastSeen: new Date(Date.now() - 20000),
    });

    const result = await service.heartbeat('user-1');

    expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'user-1',
      { lastSeen: expect.any(Date) },
      { new: true },
    );
    expect(result.online).toBe(true);
    expect(result.lastSeen).toBeInstanceOf(Date);
    expect(result.lastSeen.getTime()).toBeGreaterThan(Date.now() - 60000);
  });

  it('should return only pending student registrations sorted newest first', async () => {
    const pendingUsers = [{ _id: '1', email: 'a@mail.com' }];
    const findQuery = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(pendingUsers),
        }),
      }),
    });

    userModel.find.mockReturnValue(findQuery());

    const result = await service.findPendingUsers();

    expect(userModel.find).toHaveBeenCalledWith({ role: 'student', status: 'pending' });
    expect(result).toEqual(pendingUsers);
  });

  it('should delete the user data when admin rejects the registration', async () => {
    const deletedUser = { _id: 'user-1', email: 'dummy@mail.com' };
    userModel.findByIdAndDelete.mockResolvedValue(deletedUser);

    const result = await service.updateUserStatus('user-1', 'rejected');

    expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('user-1');
    expect(result).toMatchObject({
      message: 'Registrasi ditolak dan data pengguna berhasil dihapus',
      deleted: true,
    });
  });
});
