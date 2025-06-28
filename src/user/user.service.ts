import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/utils/password.utils';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await hashPassword(createUserDto.password);
      createUserDto.password = hashedPassword;
      // Create a new user instance using the DTO
      const users = Object.create(createUserDto);
      await this.userRepository.save(users);
      return {
        message: 'User created successfully',
      };
    } catch (error) {
      if (error.code === '23505') {
        // Handle unique constraint violation
        throw new HttpException('Email already exists', 400);
      }
      // Handle other errors
      throw new Error(error);
    }
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findMultiUsersById(Ids: number[]): Promise<User[]> {
    return await this.userRepository.findBy(Ids.map((id) => ({ id })));
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  async findOne(id: number) {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { id },
      });
      return user;
    } catch (err) {
      throw new HttpException(err.message, 404);
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.findOne(id);
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }
      const updatedUser = Object.assign(user, updateUserDto);
      await this.userRepository.save(updatedUser);
      return {
        message: 'User updated successfully',
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    await this.userRepository.remove(user);
    return {
      message: 'User removed successfully',
    };
  }

  async removeMultiUsers(Ids: number[]) {
    try {
      const users = await this.findMultiUsersById(Ids);
      if (users.length === 0) {
        throw new Error('No users found with the provided IDs');
      }
      await this.userRepository.remove(users);
      return {
        message: 'Users removed successfully',
      };
    } catch (error) {
      throw new Error(error);
    }
  }
}
