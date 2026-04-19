import { IsOptional, IsString } from 'class-validator';

export class AuthRedirectQueryDto {
  @IsOptional()
  @IsString()
  returnTo?: string;
}
