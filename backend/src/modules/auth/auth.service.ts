import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private auditLogsService: AuditLogsService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { email, isActive: true },
      select: ['id', 'email', 'passwordHash', 'firstName', 'lastName', 'employeeId', 'isActive'],
      relations: ['roles'],
    });

    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    return user;
  }

  async login(email: string, password: string, ipAddress?: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roleNames = user.roles?.map((r) => r.name) || [];

    const payload = {
      sub: user.id,
      email: user.email,
      employeeId: user.employeeId,
      roles: roleNames,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const token = this.jwtService.sign(payload);

    // Update last login
    await this.usersRepository.update(user.id, { lastLoginAt: new Date() });

    // Audit log
    await this.auditLogsService.log({
      userId: user.id,
      userEmail: user.email,
      roleName: roleNames[0],
      action: 'LOGIN',
      description: 'User logged in',
      ipAddress,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId: user.employeeId,
        roles: roleNames,
      },
    };
  }

  async getProfile(userId: string) {
    return this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'manager'],
    });
  }
}
