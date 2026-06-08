import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TravelRequestModule } from './modules/travel-request/travel-request.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { ExpenseClaimsModule } from './modules/expense-claims/expense-claims.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { PolicyEngineModule } from './modules/policy-engine/policy-engine.module';
import { ReimbursementModule } from './modules/reimbursement/reimbursement.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'tems_user'),
        password: config.get('DB_PASSWORD', 'tems_password'),
        database: config.get('DB_NAME', 'tems_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: config.get('DB_LOGGING') === 'true',
      }),
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    TravelRequestModule,
    ApprovalsModule,
    ExpenseClaimsModule,
    DocumentsModule,
    PolicyEngineModule,
    ReimbursementModule,
    NotificationsModule,
    ReportsModule,
    AuditLogsModule,
    DashboardModule,
  ],
})
export class AppModule {}
