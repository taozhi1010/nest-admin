import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import configuration from './config/index';
import { join } from 'node:path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { MainModule } from './module/main/main.module';
import { UploadModule } from './module/upload/upload.module';
import { SystemModule } from './module/system/system.module';
import { CommonModule } from './module/common/common.module';
import { MonitorModule } from './module/monitor/monitor.module';

@Global()
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'frontend'),
      serveRoot: '/',
      exclude: ['/api/*', '/prod-api/*'],
      renderPath: '{*splat}',
      serveStaticOptions: {
        index: 'index.html', // 默认索引文件（访问根路径时自动返回 index.html）
        fallthrough: true, // 关键：静态资源未匹配时，将请求传递给 NestJS 路由（而非 404）
        dotfiles: 'ignore', // 忽略隐藏文件（如 .git）
        extensions: ['html', 'js', 'css'], // 支持的静态资源后缀
      },
    }),
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
          type: 'mysql',
          entities: [`${__dirname}/**/*.entity{.ts,.js}`],
          autoLoadEntities: true,
          timezone: '+08:00',
          ...config.get('db.mysql'),
        } as TypeOrmModuleOptions;
      },
    }),

    MainModule,
    UploadModule,
    CommonModule,
    SystemModule,
    MonitorModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule { }
