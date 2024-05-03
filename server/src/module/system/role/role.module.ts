import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { SysRoleEntity } from './entities/role.entity';
import { SysRoleWithMenuEntity } from './entities/role-width-menu.entity';
import { SysRoleWithDeptEntity } from './entities/role-width-dept.entity';
import { SysDeptEntity } from '../dept/entities/dept.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SysRoleEntity, SysRoleWithMenuEntity, SysRoleWithDeptEntity, SysDeptEntity])],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
