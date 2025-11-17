import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from 'src/users/entities/user.entity';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(signInDto: SignInDto): Promise<{ access_token: string }> {
    const { email, password } = signInDto;

    const user = await this.usersService.findOne({ email });

    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return {
        access_token: this.jwtService.sign({ userId: user.id }),
      };
    } else {
      throw new UnauthorizedException('Email or password is incorrect.');
    }
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const { username, email } = registerDto;

    const existingUsername = await this.usersService.findOne({ username });
    if (existingUsername) {
      throw new ConflictException('User with this username already existed');
    }

    const existingEmail = await this.usersService.findOne({ email });
    if (existingEmail) {
      throw new ConflictException('User with this email already existed');
    }

    const hashedPassword = await bcrypt.hash(
      registerDto.password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS || '10'),
    );

    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
    return newUser;
  }
}
