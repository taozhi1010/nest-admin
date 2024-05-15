import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, In } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { SysMenuEntity } from './entities/menu.entity';
import { SysRoleWithMenuEntity } from '../role/entities/role-width-menu.entity';
import { CreateMenuDto, UpdateMenuDto } from './dto/index';
import { ListToTree, Uniq } from 'src/common/utils/index';
import { UserService } from '../user/user.service';
@Injectable()
export class MenuService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
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

  async roleMenuTreeselect(id: number): Promise<any> {
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

  /**
   * 菜单列表转树形结构
   * @param arr
   */
  async menuListToTree(arr) {
    const kData = {}; // 以id做key的对象 暂时储存数据
    const lData = []; // 最终的数据 arr
    arr.forEach((m) => {
      m = {
        ...m,
        id: m.menuId,
        parentId: +m.parentId,
      };
      kData[m.id] = {
        ...m,
        id: m.id,
        parentId: m.parentId,
      };
      if (m.parentId === 0) {
        lData.push(kData[m.id]);
      } else {
        kData[m.parentId] = kData[m.parentId] || {};
        kData[m.parentId].children = kData[m.parentId].children || [];
        kData[m.parentId].children.push(kData[m.id]);
      }
    });
    return lData;
  }

  /**
   * 格式化菜单数据
   * @param arr
   * @param getId
   * @returns
   */
  formatTreeNodeBuildMenus(menus: any[]): any[] {
    return menus.map((menu) => {
      // 复制当前节点，避免直接修改原始节点
      const formattedNode: any = {};
      formattedNode.name = menu.path.replace(/^\w/, (c) => c.toUpperCase());
      formattedNode.path = menu.path;
      formattedNode.hidden = menu.visible === '1';
      // 转换当前节点的名称为大写
      switch (menu.menuType) {
        case 'M': //目录
          formattedNode.alwaysShow = menu.children && menu.children.length > 1;
          formattedNode.component = 'Layout';
          formattedNode.redirect = 'noRedirect';
          formattedNode.meta = {
            icon: menu.icon,
            noCache: menu.isCache === 1,
            title: menu.menuName,
            link: menu.isFrame === 0 ? menu.path : null,
          };
          formattedNode.name = menu.path.replace(/^\w/, (c) => c.toUpperCase());
          formattedNode.path = menu.isFrame === 0 ? menu.path : '/' + menu.path;
          formattedNode.children = menu.children;
          break;
        case 'C': //菜单
          if (menu.query) {
            formattedNode.query = menu.query;
          }
          formattedNode.component = menu.component;
          formattedNode.meta = {
            title: menu.menuName,
            icon: menu.icon,
            noCache: menu.isCache === 1,
            link: menu.isFrame === 0 ? menu.path : null,
          };
          break;
        case 'F': //按钮
          break;
        default:
          break;
      }

      // 如果节点有子节点，递归处理它们
      if (formattedNode.children) {
        formattedNode.children = this.formatTreeNodeBuildMenus(formattedNode.children);
      }
      return formattedNode;
    });
  }

  /**
   * 根据用户ID查询菜单
   *
   * @param userId 用户ID
   * @return 菜单列表
   */
  async getMenuListByUserId(userId: number) {
    let menuWidthRoleList = [];
    const roleIds = await this.userService.getRoleIds([userId]);
    if (roleIds.includes('1')) {
      // 超管roleId=1，所有菜单权限
      menuWidthRoleList = await this.sysMenuEntityRep.find({
        where: {
          delFlag: '0',
          status: '0',
        },
        select: ['menuId'],
      });
    } else {
      // 查询角色绑定的菜单
      menuWidthRoleList = await this.sysRoleWithMenuEntityRep.find({
        where: { roleId: In(roleIds) },
        select: ['menuId'],
      });
    }
    // 菜单Id去重
    const menuIds = Uniq(menuWidthRoleList.map((item) => item.menuId));
    // 菜单列表
    const menuIdList = await this.sysMenuEntityRep.find({
      where: {
        delFlag: '0',
        status: '0',
        menuId: In(menuIds),
      },
    });
    // 构建前端需要的菜单树
    const menuProtoTree = await this.menuListToTree(menuIdList);
    const menuTree = this.formatTreeNodeBuildMenus(menuProtoTree);
    return menuTree;
  }
}
