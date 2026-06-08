import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Role } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findAll(page = 1, limit = 20) {
    const [data, total] = await this.usersRepository.findAndCount({
      where: { isActive: true },
      relations: ['roles', 'manager'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'manager'],
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findOne({ where: { email }, relations: ['roles'] });
  }

  async create(dto: Partial<User> & { password: string }) {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({ ...dto, passwordHash });
    return this.usersRepository.save(user);
  }

  async update(id: string, dto: Partial<User>) {
    await this.findOne(id);
    await this.usersRepository.update(id, dto);
    return this.findOne(id);
  }

  async deactivate(id: string) {
    await this.findOne(id);
    await this.usersRepository.update(id, { isActive: false });
    return { message: 'User deactivated successfully' };
  }

  async getTeamMembers(managerId: string) {
    return this.usersRepository.find({
      where: { managerId, isActive: true },
      relations: ['roles'],
    });
  }
}
