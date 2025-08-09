import path, { join } from 'node:path';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { LicenseModule } from 'src/common/license/license.module';
import { RolesGuard } from './common/guards/roles.guard';
import configuration from './config/index';
import { CommonModule } from './module/common/common.module';
import { MainModule } from './module/main/main.module';
import { MonitorModule } from './module/monitor/monitor.module';
import { SystemModule } from './module/system/system.module';

import { UploadModule } from './module/upload/upload.module';

@Global()
@Module({
	imports: [
		ServeStaticModule.forRoot({
			rootPath: join(process.cwd(), 'frontend'),
			renderPath: '*',
		}),
		EventEmitterModule.forRoot(),
		// 配置模块
		ConfigModule.forRoot({
			cache: true,
			load: [configuration],
			isGlobal: true,
		}),
		// 数据库
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				return {
					type: 'postgres',
					entities: [path.join(__dirname, '**/*.entity{.ts,.js}')],
					autoLoadEntities: true,
					keepConnectionAlive: true,
					timezone: '+08:00',
					...config.get('db.postgres'),
				} as TypeOrmModuleOptions;
			},
		}),

		CommonModule,
		LicenseModule,
		MainModule,
		UploadModule,

		SystemModule,
		MonitorModule,
	],
	providers: [
		{ provide: APP_GUARD, useClass: JwtAuthGuard },
		{ provide: APP_GUARD, useClass: RolesGuard },
		{ provide: APP_GUARD, useClass: PermissionGuard },
	],
})
export class AppModule {}
