import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigController } from './config.controller'
import { ConfigService } from './config.service'
import { SysConfigEntity } from './entities/config.entity'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SysConfigEntity])],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class SysConfigModule {}
