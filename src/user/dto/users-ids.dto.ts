import { Type } from 'class-transformer';
import { IsArray, IsInt } from 'class-validator';

export class UsersIdsDto {
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  ids: number[];
}
