import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisClientOptions } from '@liaoliaots/nestjs-redis';
import configuration from './config/index';
import { HttpModule } from '@nestjs/axios';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { RolesGuard } from './common/guards/roles.guard';

import { AuthModule } from './module/system/auth/auth.module';
import { UserModule } from './module/system/user/user.module';
import { ToolModule } from './module/system/tool/tool.module';
import { DeptModule } from './module/system/dept/dept.module';
import { DictModule } from './module/system/dict/dict.module';
import { MenuModule } from './module/system/menu/menu.module';
import { RoleModule } from './module/system/role/role.module';
import { PostModule } from './module/system/post/post.module';
import { SysConfigModule } from './module/system/config/config.module';
import { NoticeModule } from './module/system/notice/notice.module';
import { MainModule } from './module/main/main.module';
import { RedisModule } from './module/redis/redis.module';
import { CacheModule } from './module/monitor/cache/cache.module';
import { LoginlogModule } from './module/monitor/loginlog/loginlog.module';
import { OperlogModule } from './module/monitor/operlog/operlog.module';
import { AxiosModule } from './module/axios/axios.module';
import { OnlineModule } from './module/monitor/online/online.module';
import { ServerModule } from './module/monitor/server/server.module';
import { UploadModule } from './module/upload/upload.module';

@Global()
@Module({
  imports: [
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
          keepConnectionAlive: true,
          timezone: '+08:00',
          ...config.get('db.mysql'),
        } as TypeOrmModuleOptions;
      },
    }),
    // redis
    RedisModule.forRootAsync(
      {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
          return {
            closeClient: true,
            readyLog: true,
            errorLog: true,
            config: config.get<RedisClientOptions>('redis'),
          };
        },
      },
      true,
    ),
    HttpModule,
    AuthModule,
    UserModule,
    ToolModule,
    DeptModule,
    DictModule,
    MenuModule,
    RoleModule,
    PostModule,
    SysConfigModule,
    NoticeModule,
    MainModule,
    CacheModule,
    LoginlogModule,
    OperlogModule,
    AxiosModule,
    OnlineModule,
    ServerModule,
    UploadModule,
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
export class AppModule {}
