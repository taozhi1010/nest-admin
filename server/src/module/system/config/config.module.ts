import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { SysConfigEntity } from './entities/config.entity';
@Module({
  imports: [TypeOrmModule.forFeature([SysConfigEntity])],
  controllers: [ConfigController],
  providers: [ConfigService],
})
export class SysConfigModule {}
