import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

export interface AuthenticatedRequest extends Request {
  user: User;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOkResponse({ type: User, isArray: true })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  findAll(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    return this.usersService.findAll(limit, offset);
  }

  @Get(':id')
  @ApiOkResponse({ type: User })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findOne({ id });
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const { user } = req;
    console.log('user in req', user);
    if (user.id !== id) {
      throw new UnauthorizedException();
    }
    return this.usersService.update(id, updateUserDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    if (req.user.id !== id) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.findOne({ id });
    if (!user) {
      throw new NotFoundException();
    }
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
