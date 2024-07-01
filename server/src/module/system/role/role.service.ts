import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindManyOptions } from 'typeorm';
import { Response } from 'express';
import { ResultData } from 'src/common/utils/result';
import { ListToTree } from 'src/common/utils/index';
import { ExportTable } from 'src/common/utils/export';

import { DataScopeEnum } from 'src/common/enum/index';
import { SysRoleEntity } from './entities/role.entity';
import { SysRoleWithMenuEntity } from './entities/role-width-menu.entity';
import { SysRoleWithDeptEntity } from './entities/role-width-dept.entity';
import { SysDeptEntity } from '../dept/entities/dept.entity';
import { MenuService } from '../menu/menu.service';
import { CreateRoleDto, UpdateRoleDto, ListRoleDto, ChangeStatusDto } from './dto/index';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(SysRoleEntity)
    private readonly sysRoleEntityRep: Repository<SysRoleEntity>,
    @InjectRepository(SysRoleWithMenuEntity)
    private readonly sysRoleWithMenuEntityRep: Repository<SysRoleWithMenuEntity>,
    @InjectRepository(SysRoleWithDeptEntity)
    private readonly sysRoleWithDeptEntityRep: Repository<SysRoleWithDeptEntity>,
    @InjectRepository(SysDeptEntity)
    private readonly sysDeptEntityRep: Repository<SysDeptEntity>,
    private readonly menuService: MenuService,
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    const res = await this.sysRoleEntityRep.save(createRoleDto);
    const entity = this.sysRoleWithMenuEntityRep.createQueryBuilder('entity');
    const values = createRoleDto.menuIds.map((id) => {
      return {
        roleId: res.roleId,
        menuId: id,
      };
    });
    entity.insert().values(values).execute();
    return ResultData.ok(res);
  }

  async findAll(query: ListRoleDto) {
    const entity = this.sysRoleEntityRep.createQueryBuilder('entity');
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' });

    if (query.roleName) {
      entity.andWhere(`entity.roleName LIKE "%${query.roleName}%"`);
    }

    if (query.roleKey) {
      entity.andWhere(`entity.roleKey LIKE "%${query.roleKey}%"`);
    }

    if (query.roleId) {
      entity.andWhere('entity.roleId = :roleId', { roleId: query.roleId });
    }

    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }

    if (query.params?.beginTime && query.params?.endTime) {
      entity.andWhere('entity.createTime BETWEEN :start AND :end', { start: query.params.beginTime, end: query.params.endTime });
    }

    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    }
    const [list, total] = await entity.getManyAndCount();

    return ResultData.ok({
      list,
      total,
    });
  }

  async findOne(roleId: number) {
    const res = await this.sysRoleEntityRep.findOne({
      where: {
        roleId: roleId,
        delFlag: '0',
      },
    });
    return ResultData.ok(res);
  }

  async update(updateRoleDto: UpdateRoleDto) {
    const hasId = await this.sysRoleWithMenuEntityRep.findOne({
      where: {
        roleId: updateRoleDto.roleId,
      },
      select: ['roleId'],
    });

    //角色已关联菜单
    if (hasId) {
      await this.sysRoleWithMenuEntityRep.delete({
        roleId: updateRoleDto.roleId,
      });
    }

    //TODO 后续改造为事务
    const entity = this.sysRoleWithMenuEntityRep.createQueryBuilder('entity');
    const values = updateRoleDto.menuIds.map((id) => {
      return {
        roleId: updateRoleDto.roleId,
        menuId: id,
      };
    });

    delete (updateRoleDto as any).menuIds;
    entity.insert().values(values).execute();
    const res = await this.sysRoleEntityRep.update({ roleId: updateRoleDto.roleId }, updateRoleDto);
    return ResultData.ok(res);
  }

  async dataScope(updateRoleDto: UpdateRoleDto) {
    const hasId = await this.sysRoleWithDeptEntityRep.findOne({
      where: {
        roleId: updateRoleDto.roleId,
      },
      select: ['roleId'],
    });

    //角色已有权限 或者 非自定义权限 先删除权限关联
    if (hasId || updateRoleDto.dataScope !== DataScopeEnum.DATA_SCOPE_CUSTOM) {
      await this.sysRoleWithDeptEntityRep.delete({
        roleId: updateRoleDto.roleId,
      });
    }

    const entity = this.sysRoleWithDeptEntityRep.createQueryBuilder('entity');
    const values = updateRoleDto.deptIds.map((id) => {
      return {
        roleId: updateRoleDto.roleId,
        deptId: id,
      };
    });
    entity.insert().values(values).execute();

    delete (updateRoleDto as any).deptIds;

    const res = await this.sysRoleEntityRep.update({ roleId: updateRoleDto.roleId }, updateRoleDto);
    return ResultData.ok(res);
  }

  async changeStatus(changeStatusDto: ChangeStatusDto) {
    const res = await this.sysRoleEntityRep.update(
      { roleId: changeStatusDto.roleId },
      {
        status: changeStatusDto.status,
      },
    );
    return ResultData.ok(res);
  }

  async remove(roleIds: number[]) {
    const data = await this.sysRoleEntityRep.update(
      { roleId: In(roleIds) },
      {
        delFlag: '1',
      },
    );
    return ResultData.ok(data);
  }

  async deptTree(roleId: number) {
    const res = await this.sysDeptEntityRep.find({
      where: {
        delFlag: '0',
      },
    });
    const tree = ListToTree(
      res,
      (m) => +m.deptId,
      (m) => m.deptName,
    );
    const deptIds = await this.sysRoleWithDeptEntityRep.find({
      where: { roleId: roleId },
      select: ['deptId'],
    });
    const checkedKeys = deptIds.map((item) => {
      return item.deptId;
    });
    return ResultData.ok({
      depts: tree,
      checkedKeys: checkedKeys,
    });
  }

  async findRoles(where: FindManyOptions<SysRoleEntity>) {
    return await this.sysRoleEntityRep.find(where);
  }
  /**
   * 根据角色获取用户权限列表
   */
  async getPermissionsByRoleIds(roleIds: number[]) {
    const list = await this.sysRoleWithMenuEntityRep.find({
      where: {
        roleId: In(roleIds),
      },
      select: ['menuId'],
    });
    const menuIds = list.map((item) => item.menuId);
    const permission = await this.menuService.findMany({
      where: { delFlag: '0', status: '0', menuId: In(menuIds) },
    });
    return permission;
  }

  /**
   * 根据角色ID异步查找与之关联的部门ID列表。
   *
   * @param roleId - 角色的ID，用于查询与该角色关联的部门。
   * @returns 返回一个Promise，该Promise解析为一个部门ID的数组。
   */
  async findRoleWithDeptIds(roleId: number) {
    // 使用TypeORM的实体仓库查询方法，异步查找与指定角色ID相关联的部门ID。
    const res = await this.sysRoleWithDeptEntityRep.find({
      select: ['deptId'],
      where: {
        roleId: roleId,
      },
    });
    // 将查询结果映射为仅包含部门ID的数组并返回。
    return res.map((item) => item.deptId);
  }

  /**
   * 导出角色管理数据为xlsx
   * @param res
   */
  async export(res: Response, body: ListRoleDto) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAll(body);
    const options = {
      sheetName: '角色数据',
      data: list.data.list,
      header: [
        { title: '角色编号', dataIndex: 'roleId' },
        { title: '角色名称', dataIndex: 'roleName', width: 15 },
        { title: '权限字符', dataIndex: 'roleKey' },
        { title: '显示顺序', dataIndex: 'roleSort' },
        { title: '状态', dataIndex: 'status' },
        { title: '创建时间', dataIndex: 'createTime', width: 15 },
      ],
    };
    ExportTable(options, res);
  }
}
