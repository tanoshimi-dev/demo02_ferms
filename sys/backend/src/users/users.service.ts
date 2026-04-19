import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthUser } from '../auth/auth.types';
import { UserEntity } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async ensureAuthUser(user: AuthUser): Promise<UserEntity> {
    await this.usersRepository.upsert(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ['id'],
    );

    return this.usersRepository.findOneByOrFail({
      id: user.id,
    });
  }
}
