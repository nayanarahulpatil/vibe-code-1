import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyEngineService } from './policy-engine.service';
import { PolicyRule } from './entities/policy-rule.entity';
import { PolicyRulesController } from './policy-rules.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyRule])],
  providers: [PolicyEngineService],
  controllers: [PolicyRulesController],
  exports: [PolicyEngineService],
})
export class PolicyEngineModule {}
