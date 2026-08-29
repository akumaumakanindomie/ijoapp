import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Delete,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req: { user: { userId: string } }) {
    return this.usersService.getProfile(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('profile')
  updateProfile(
    @Request() req: { user: { userId: string } },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('pending')
  getPendingUsers(@Request() req: { user: { role?: string } }) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Akses hanya untuk admin');
    }

    return this.usersService.findPendingUsers();
  }

  // Get Semua Siswa
  @UseGuards(AuthGuard('jwt'))
  @Get()
  getAllUsers(@Request() req: { user: { role?: string } }) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Akses hanya untuk admin');
    }

    return this.usersService.findAllUsers();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  getPublicProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }

  // Approve atau Reject User
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id/status')
  updateStatus(
    @Request() req: { user: { role?: string } },
    @Param('id') id: string,
    @Body('status') status: 'active' | 'rejected',
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Akses hanya untuk admin');
    }

    return this.usersService.updateUserStatus(id, status);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  deleteUser(@Request() req: { user: { role?: string } }, @Param('id') id: string) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Akses hanya untuk admin');
    }

    return this.usersService.deleteUser(id);
  }
}
