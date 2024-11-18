import { Module, Global } from '@nestjs/common';
import { CacheModule } from './cache/cache.module';
import { LoginlogModule } from './loginlog/loginlog.module';
import { OnlineModule } from './online/online.module';
import { OperlogModule } from './operlog/operlog.module';
import { ServerModule } from './server/server.module';

@Global()
@Module({
  imports: [
    CacheModule, // redis 缓存
    LoginlogModule,
    OnlineModule,
    OperlogModule,
    ServerModule,
  ],
})
export class MonitorModule {}
