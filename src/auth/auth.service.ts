import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { comparePassword } from 'src/utils/password.utils';
import { LoginDto } from './dto/login-dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService, // Inject UserService to access user-related methods
    private readonly jwtService: JwtService, // Inject JwtService to handle JWT operations
  ) {}

  async login(data: LoginDto) {
    const user = await this.userService.findUserByEmail(data.email);
    if (!user) {
      throw new Error('User not found');
    }
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload); // Generate JWT token
    return {
      access_token: token, // Return the generated token
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
