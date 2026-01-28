import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';

import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Role } from '../common/enums/role.enum';
import { BCRYPT_ROUNDS } from '../common/constants';
import { TokenBlacklistService } from './token-blacklist.service';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  async getTokens(userId: string, email: string, role: Role) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
          role,
        },
        {
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    await this.userModel.findByIdAndUpdate(userId, {
      currentHashedRefreshToken: hash,
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userModel
      .findById(userId)
      .select('+currentHashedRefreshToken');
    if (!user || !user.currentHashedRefreshToken)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(
      user._id.toString(),
      user.email,
      user.role,
    );
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  async refreshTokensFromDto(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      const userId = payload.sub;
      return this.refreshTokens(userId, refreshToken);
    } catch (e) {
      throw new ForbiddenException('Invalid Refresh Token');
    }
  }

  async register(registerDto: RegisterDto): Promise<{
    message: string;
    accessToken: string;
    refreshToken: string;
    user: Partial<User>;
  }> {
    const existingUser = await this.userModel.findOne({
      email: registerDto.email,
    });
    if (existingUser) {
      throw new ConflictException(
        'An account with this email address already exists. Please use a different email or try logging in.',
      );
    }

    const userCount = await this.userModel.countDocuments();
    let role: Role;
    if (userCount === 0) {
      // First user: must not send role
      if (registerDto.role) {
        throw new ConflictException(
          'Do not send a role for the first user. The first user will automatically be an admin.',
        );
      }
      role = Role.ADMIN;
    } else {
      // Other users: must provide role, cannot be admin
      if (!registerDto.role) {
        throw new ConflictException('Role is required for registration');
      }
      if (registerDto.role === Role.ADMIN) {
        throw new ConflictException('Cannot register as admin');
      }
      role = registerDto.role;
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      BCRYPT_ROUNDS,
    );

    const user = new this.userModel({
      ...registerDto,
      password: hashedPassword,
      role,
    });

    await user.save();

    const tokens = await this.getTokens(
      user._id.toString(),
      user.email,
      user.role,
    );
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      message: 'Registration successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<{
    message: string;
    accessToken: string;
    refreshToken: string;
    user: Partial<User>;
  }> {
    const user = await this.userModel.findOne({ email: loginDto.email });
    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password. Please check your credentials and try again.',
      );
    }

    if (user.deletedAt) {
      throw new UnauthorizedException(
        'This account has been deleted. Please contact support if you believe this is an error.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Your account has been deactivated. Please contact support to reactivate your account.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid email or password. Please check your credentials and try again.',
      );
    }

    const tokens = await this.getTokens(
      user._id.toString(),
      user.email,
      user.role,
    );
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      message: 'Login successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async logout(token: string, userId?: string): Promise<{ message: string }> {
    // If we have userId (from verified token), clear refresh token
    if (userId) {
      await this.userModel.findByIdAndUpdate(userId, {
        currentHashedRefreshToken: null,
      });
    }

    if (!token) {
      // If no access token, just return success if we cleared refresh token
      if (userId) return { message: 'Logout successful.' };
      throw new UnauthorizedException('No token provided for logout.');
    }

    try {
      // Decode token to get expiration time
      const decoded = this.jwtService.decode(token);
      if (decoded && decoded.exp) {
        const expiresAt = new Date(decoded.exp * 1000);
        // Blacklist the token
        await this.tokenBlacklistService.blacklistToken(token, expiresAt);
      }

      return {
        message: 'Logout successful. Your session has been terminated.',
      };
    } catch {
      // Even if token invalid, we want to allow logout to proceed on client usually
      return { message: 'Logout successful.' };
    }
  }

  async updateProfile(
    user: User,
    updateProfileDto: UpdateProfileDto,
  ): Promise<{ message: string; user: Partial<User> }> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      user._id,
      { $set: updateProfileDto },
      { new: true },
    );

    if (!updatedUser) {
      throw new UnauthorizedException('User not found.');
    }

    return {
      message: 'Profile updated successfully.',
      user: {
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
      },
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId).select('+password');
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password.');
    }

    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      BCRYPT_ROUNDS,
    );

    await this.userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });

    return { message: 'Password changed successfully.' };
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ message: string; user: Partial<User> }> {
    if (!file) {
      throw new UnauthorizedException('No file uploaded');
    }

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${userId}-${Date.now()}.jpeg`;
    const filePath = path.join(uploadDir, filename);

    await sharp(file.buffer)
      .resize(500, 500, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(filePath);

    const profilePictureUrl = `/uploads/${filename}`;

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { profilePicture: profilePictureUrl },
      { new: true },
    );

    if (!updatedUser) {
      throw new UnauthorizedException('User not found');
    }

    return {
      message: 'Avatar uploaded successfully',
      user: {
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
      },
    };
  }
}
