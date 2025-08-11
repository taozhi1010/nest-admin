import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SysRoleWithMenuEntity } from '../role/entities/role-width-menu.entity'
import { SysMenuEntity } from './entities/menu.entity'
import { MenuController } from './menu.controller'
import { MenuService } from './menu.service'

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SysMenuEntity, SysRoleWithMenuEntity])],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
