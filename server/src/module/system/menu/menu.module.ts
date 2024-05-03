import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { SysMenuEntity } from './entities/menu.entity';
import { SysRoleWithMenuEntity } from '../role/entities/role-width-menu.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SysMenuEntity, SysRoleWithMenuEntity])],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
