import {
  Injectable,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, role, firstName, lastName } = registerDto;

    if (role === 'ADMIN') {
      const existingAdminCount = await this.prisma.user.count({
        where: { role: 'ADMIN' },
      });

      if (existingAdminCount > 0) {
        throw new ForbiddenException('Admin registration is not allowed');
      }
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'CUSTOMER',
        firstName,
        lastName,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    });

    // Generate JWT token
    const token = await this.generateToken(user.id, user.email, user.role);

    return {
      success: true,
      data: {
        user,
        token,
      },
      message: 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is blocked
    if (user.isBlocked) {
      throw new UnauthorizedException(
        'Your account has been blocked due to excessive order cancellations',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const token = await this.generateToken(user.id, user.email, user.role);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      },
      message: 'Login successful',
    };
  }

  private async generateToken(
    userId: string,
    email: string,
    role: string,
  ): Promise<string> {
    const payload = { sub: userId, email, role };
    return this.jwtService.sign(payload);
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isBlocked: true,
      },
    });
  }
}
