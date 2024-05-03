import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { SysMenuEntity } from './entities/menu.entity';
import { SysRoleWithMenuEntity } from '../role/entities/role-width-menu.entity';
import { CreateMenuDto, UpdateMenuDto } from './dto/index';
import { ListToTree } from 'src/common/utils/index';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(SysMenuEntity)
    private readonly sysMenuEntityRep: Repository<SysMenuEntity>,
    @InjectRepository(SysRoleWithMenuEntity)
    private readonly sysRoleWithMenuEntityRep: Repository<SysRoleWithMenuEntity>,
  ) {}

  async create(createMenuDto: CreateMenuDto) {
    const res = await this.sysMenuEntityRep.save(createMenuDto);
    return ResultData.ok(res);
  }

  async findAll() {
    const res = await this.sysMenuEntityRep.find({
      where: {
        delFlag: '0',
      },
    });
    return ResultData.ok(res);
  }

  async treeSelect() {
    const res = await this.sysMenuEntityRep.find({
      where: {
        delFlag: '0',
      },
    });
    const tree = ListToTree(
      res,
      (m) => m.menuId,
      (m) => m.menuName,
    );
    return ResultData.ok(tree);
  }

  async roleMenuTreeselect(id: number) {
    const res = await this.sysMenuEntityRep.find({
      where: {
        delFlag: '0',
      },
    });
    const tree = ListToTree(
      res,
      (m) => m.menuId,
      (m) => m.menuName,
    );
    const menuIds = await this.sysRoleWithMenuEntityRep.find({
      where: { roleId: id },
      select: ['menuId'],
    });
    const checkedKeys = menuIds.map((item) => {
      return item.menuId;
    });
    return ResultData.ok({
      menus: tree,
      checkedKeys: checkedKeys,
    });
  }

  async findOne(id: number) {
    const res = await this.sysMenuEntityRep.findOne({
      where: {
        delFlag: '0',
        menuId: id,
      },
    });
    return ResultData.ok(res);
  }

  async update(updateMenuDto: UpdateMenuDto) {
    const res = await this.sysMenuEntityRep.update({ menuId: updateMenuDto.menuId }, updateMenuDto);
    return ResultData.ok(res);
  }

  async remove(id: number) {
    const data = await this.sysMenuEntityRep.update(
      { menuId: id },
      {
        delFlag: '1',
      },
    );
    return ResultData.ok(data);
  }

  async findMany(where: FindManyOptions<SysMenuEntity>) {
    return await this.sysMenuEntityRep.find(where);
  }
}
