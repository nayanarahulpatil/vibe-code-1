import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PolicyRule } from './entities/policy-rule.entity';
import { ExpenseLineItem, ExpenseCategory } from '../expense-claims/entities/expense-claim.entity';

export interface PolicyViolation {
  ruleId: string;
  ruleName: string;
  message: string;
}

@Injectable()
export class PolicyEngineService {
  constructor(
    @InjectRepository(PolicyRule)
    private rulesRepo: Repository<PolicyRule>,
  ) {}

  async validate(lineItem: Partial<ExpenseLineItem>): Promise<PolicyViolation[]> {
    const violations: PolicyViolation[] = [];
    const rules = await this.rulesRepo.find({ where: { isActive: true } });

    for (const rule of rules) {
      // Amount limit check
      if (rule.ruleType === 'AMOUNT_LIMIT' && rule.category === lineItem.category) {
        if (Number(lineItem.amount) > Number(rule.limitAmount)) {
          violations.push({
            ruleId: rule.id,
            ruleName: rule.name,
            message: `${rule.category} expense of ₹${lineItem.amount} exceeds policy limit of ₹${rule.limitAmount}`,
          });
        }
      }

      // Daily limit check
      if (rule.ruleType === 'DAILY_LIMIT' && rule.category === lineItem.category) {
        if (Number(lineItem.amount) > Number(rule.limitAmount)) {
          violations.push({
            ruleId: rule.id,
            ruleName: rule.name,
            message: `${rule.category} expense of ₹${lineItem.amount}/day exceeds daily limit of ₹${rule.limitAmount}`,
          });
        }
      }

      // Receipt required check
      if (rule.ruleType === 'RECEIPT_REQUIRED') {
        if (Number(lineItem.amount) > Number(rule.limitAmount) && !lineItem.receiptId) {
          violations.push({
            ruleId: rule.id,
            ruleName: rule.name,
            message: `Receipt required for expenses above ₹${rule.limitAmount}. Amount: ₹${lineItem.amount}`,
          });
        }
      }
    }

    return violations;
  }

  async findAll() {
    return this.rulesRepo.find({ order: { createdAt: 'DESC' } });
  }

  async create(dto: Partial<PolicyRule>) {
    const rule = this.rulesRepo.create(dto);
    return this.rulesRepo.save(rule);
  }

  async update(id: string, dto: Partial<PolicyRule>) {
    await this.rulesRepo.update(id, dto);
    return this.rulesRepo.findOneByOrFail({ id });
  }

  async toggleActive(id: string, isActive: boolean) {
    await this.rulesRepo.update(id, { isActive });
    return this.rulesRepo.findOneByOrFail({ id });
  }
}
