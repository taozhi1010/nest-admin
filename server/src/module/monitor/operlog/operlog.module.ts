import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysOperlogEntity } from './entities/operlog.entity';
import { OperlogController } from './operlog.controller';
import { OperlogInterceptor } from './operlog.interceptor';
import { OperlogService } from './operlog.service';
import { SysOperlogSubscriber } from './operlog.subscriber';

@Global()
@Module({
	imports: [TypeOrmModule.forFeature([SysOperlogEntity])],
	controllers: [OperlogController],
	providers: [OperlogService, OperlogInterceptor, SysOperlogSubscriber],
	exports: [OperlogService, OperlogInterceptor],
})
export class OperlogModule {}
