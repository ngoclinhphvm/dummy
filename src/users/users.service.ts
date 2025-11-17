import {
  ClassSerializerInterceptor,
  Injectable,
  NotFoundException,
  UseInterceptors,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User(createUserDto);
    return this.userRepository.save(user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users.map((user) => new User(user));
  }

  findOne(fields: {
    username?: string;
    id?: string;
    email?: string;
  }): Promise<User | null> {
    return this.userRepository.findOne({ where: fields });
  }

  // upsert
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.preload({ id, ...updateUserDto });
    if (!user) {
      throw new NotFoundException();
    }
    return this.userRepository.save(user);
  }

  remove(id: string) {
    return this.userRepository.delete({ id });
  }
}
