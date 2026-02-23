import { Controller, Post, Body, Param, Get, BadRequestException } from '@nestjs/common';
import { ModuleProgressService } from './module-progress.service';
import { Types } from 'mongoose';
import { CreateModuleProgressDto } from './dto/create-module-progress.dto';

@Controller('module-progress')
export class ModuleProgressController {
  constructor(private readonly moduleProgressService: ModuleProgressService) { }

  @Post(':moduleId')
  async updateProgress(
    @Param('moduleId') moduleId: string,
    @Body() body: CreateModuleProgressDto,
  ) {
    if (!Types.ObjectId.isValid(moduleId) ||
      !Types.ObjectId.isValid(body.apprenantId) ||
      !Types.ObjectId.isValid(body.enrollmentId)) {
      throw new BadRequestException('Invalid ID format');
    }

    return this.moduleProgressService.updateOrCreate(
      new Types.ObjectId(body.apprenantId),
      new Types.ObjectId(moduleId),
      new Types.ObjectId(body.enrollmentId),
      body.progressPercentage,
      body.status,
      body.isLocked,
    );
  }

  @Get(':moduleId/:apprenantId')
  async getProgress(
    @Param('moduleId') moduleId: string,
    @Param('apprenantId') apprenantId: string,
  ) {
    if (!Types.ObjectId.isValid(moduleId) || !Types.ObjectId.isValid(apprenantId)) {
      throw new BadRequestException('Invalid ID format');
    }

    return this.moduleProgressService.getByModuleAndUser(
      new Types.ObjectId(moduleId),
      new Types.ObjectId(apprenantId),
    );
  }
}
