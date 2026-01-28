import { Types } from 'mongoose';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer'; // 👈 You must import this
import { ModuleType } from '@src/common/enums/module-type.enum';

export class CreateModuleDto {
  @IsMongoId()
  course!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  order!: number;

  @IsEnum(ModuleType)
  @IsNotEmpty()
  moduleType!: ModuleType;

  @IsString()
  @IsOptional()
  content?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublished?: boolean;
}
