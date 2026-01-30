import { Types } from 'mongoose';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class CreateEnrollmentDto {
  @IsNotEmpty()
  @IsMongoId()
  student: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  course: Types.ObjectId;
}
