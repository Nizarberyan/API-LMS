import { IsEnum, IsMongoId, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ProgressStatus } from '../entities/module-progress.entity';

export class CreateModuleProgressDto {
  @IsMongoId()
  apprenantId: string;

  @IsMongoId()
  enrollmentId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercentage: number;

  @IsEnum(ProgressStatus)
  status: ProgressStatus;

  @IsBoolean()
  isLocked: boolean;
}
