import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MonitorLoginlogEntity } from './entities/loginlog.entity'
import { LoginlogController } from './loginlog.controller'
import { LoginlogService } from './loginlog.service'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([MonitorLoginlogEntity])],
  controllers: [LoginlogController],
  providers: [LoginlogService],
  exports: [LoginlogService],
})
export class LoginlogModule {}
