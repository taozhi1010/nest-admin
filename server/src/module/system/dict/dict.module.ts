import { Module, Global } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DictController } from './dict.controller'
import { DictService } from './dict.service'
import { SysDictDataEntity } from './entities/dict.data.entity'
import { SysDictTypeEntity } from './entities/dict.type.entity'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SysDictTypeEntity, SysDictDataEntity])],
  controllers: [DictController],
  providers: [DictService],
  exports: [DictService],
})
export class DictModule { }
