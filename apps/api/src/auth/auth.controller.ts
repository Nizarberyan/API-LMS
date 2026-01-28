import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  UseGuards,
  Headers,
  Req,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokensFromDto(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(
    @Headers('authorization') authHeader: string,
    @CurrentUser() user: User,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    return this.authService.logout(token, user?._id.toString());
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: User) {
    return {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture,
      role: user.role,
    };
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @CurrentUser() user: User,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(user, updateProfileDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user._id.toString(),
      changePasswordDto,
    );
  }

  @Post('profile/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.authService.uploadAvatar(user._id.toString(), file);
  }
}
