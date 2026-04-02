import { Repository, In, Not } from 'typeorm';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/module/common/redis/redis.service';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { GetNowDate, GenerateUUID, Uniq, createExcelTemplate } from 'src/common/utils/index';
import { ExportTable } from 'src/common/utils/export';
import * as ExcelJS from 'exceljs';

import { CacheEnum, DelFlagEnum, StatusEnum, DataScopeEnum } from 'src/common/enum/index';
import { LOGIN_TOKEN_EXPIRESIN, SYS_USER_TYPE } from 'src/common/constant/index';
import { ResultData } from 'src/common/utils/result';
import { CreateUserDto, UpdateUserDto, ListUserDto, ChangeStatusDto, ResetPwdDto, AllocatedListDto, UpdateProfileDto, UpdatePwdDto, ImportUserDto } from './dto/index';
import { RegisterDto, LoginDto } from '../../main/dto/index';
import { AuthUserCancelDto, AuthUserCancelAllDto, AuthUserSelectAllDto } from '../role/dto/index';

import { UserEntity } from './entities/sys-user.entity';
import { SysUserWithPostEntity } from './entities/user-width-post.entity';
import { SysUserWithRoleEntity } from './entities/user-width-role.entity';
import { SysPostEntity } from '../post/entities/post.entity';
import { SysDeptEntity } from '../dept/entities/dept.entity';
import { RoleService } from '../role/role.service';
import { DeptService } from '../dept/dept.service';

import { ConfigService } from '../config/config.service';
import { SysRoleEntity } from '../role/entities/role.entity';
import { SysMenuEntity } from '../menu/entities/menu.entity';
import { UserType } from './dto/user';
import { UserDto } from './user.decorator';
import { ClientInfoDto } from 'src/common/decorators/common.decorator';
import { Cacheable, CacheEvict } from 'src/common/decorators/redis.decorator';
import { Captcha } from 'src/common/decorators/captcha.decorator';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(SysDeptEntity)
    private readonly sysDeptEntityRep: Repository<SysDeptEntity>,
    @InjectRepository(SysPostEntity)
    private readonly sysPostEntityRep: Repository<SysPostEntity>,
    @InjectRepository(SysUserWithPostEntity)
    private readonly sysUserWithPostEntityRep: Repository<SysUserWithPostEntity>,
    @InjectRepository(SysUserWithRoleEntity)
    private readonly sysUserWithRoleEntityRep: Repository<SysUserWithRoleEntity>,
    private readonly roleService: RoleService,
    private readonly deptService: DeptService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}
  /**
   * 后台创建用户
   * @param createUserDto
   * @returns
   */
  async create(createUserDto: CreateUserDto) {
    const salt = bcrypt.genSaltSync(10);
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hashSync(createUserDto.password, salt);
    }

    const res = await this.userRepo.save({ ...createUserDto, userType: SYS_USER_TYPE.CUSTOM });
    const postEntity = this.sysUserWithPostEntityRep.createQueryBuilder('postEntity');
    const postValues = createUserDto.postIds.map((id) => {
      return {
        userId: res.userId,
        postId: id,
      };
    });
    postEntity.insert().values(postValues).execute();

    const roleEntity = this.sysUserWithRoleEntityRep.createQueryBuilder('roleEntity');
    const roleValues = createUserDto.roleIds.map((id) => {
      return {
        userId: res.userId,
        roleId: id,
      };
    });
    roleEntity.insert().values(roleValues).execute();

    return ResultData.ok();
  }

  /**
   * 用户列表
   * @param query
   * @returns
   */
  async findAll(query: ListUserDto, user: UserType['user']) {
    const entity = this.userRepo.createQueryBuilder('user');
    entity.where('user.delFlag = :delFlag', { delFlag: '0' });

    //数据权限过滤
    if (user) {
      const roles = user.roles;
      const deptIds = [];
      let dataScopeAll = false;
      let dataScopeSelf = false;
      for (let index = 0; index < roles.length; index++) {
        const role = roles[index];
        if (role.dataScope === DataScopeEnum.DATA_SCOPE_ALL) {
          dataScopeAll = true;
          break;
        } else if (role.dataScope === DataScopeEnum.DATA_SCOPE_CUSTOM) {
          const roleWithDeptIds = await this.roleService.findRoleWithDeptIds(role.roleId);
          deptIds.push(...roleWithDeptIds);
        } else if (role.dataScope === DataScopeEnum.DATA_SCOPE_DEPT || role.dataScope === DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD) {
          const dataScopeWidthDeptIds = await this.deptService.findDeptIdsByDataScope(user.deptId, role.dataScope);
          deptIds.push(...dataScopeWidthDeptIds);
        } else if (role.dataScope === DataScopeEnum.DATA_SCOPE_SELF) {
          dataScopeSelf = true;
        }
      }

      if (!dataScopeAll) {
        if (deptIds.length > 0) {
          entity.where('user.deptId IN (:...deptIds)', { deptIds: deptIds });
        } else if (dataScopeSelf) {
          entity.where('user.userId = :userId', { userId: user.userId });
        }
      }
    }

    if (query.deptId) {
      const deptIds = await this.deptService.findDeptIdsByDataScope(+query.deptId, DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD);
      entity.andWhere('user.deptId IN (:...deptIds)', { deptIds: deptIds });
    }

    if (query.userName) {
      entity.andWhere(`user.userName LIKE "%${query.userName}%"`);
    }

    if (query.phonenumber) {
      entity.andWhere(`user.phonenumber LIKE "%${query.phonenumber}%"`);
    }

    if (query.status) {
      entity.andWhere('user.status = :status', { status: query.status });
    }

    if (query.params?.beginTime && query.params?.endTime) {
      entity.andWhere('user.createTime BETWEEN :start AND :end', { start: query.params.beginTime, end: query.params.endTime });
    }

    if (query.pageSize && query.pageNum) {
      entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    }
    //联查部门详情
    entity.leftJoinAndMapOne('user.dept', SysDeptEntity, 'dept', 'dept.deptId = user.deptId');

    const [list, total] = await entity.getManyAndCount();

    return ResultData.ok({
      list,
      total,
    });
  }

  /**
   * 用户角色+岗位信息
   * @returns
   */
  async findPostAndRoleAll() {
    const posts = await this.sysPostEntityRep.find({
      where: {
        delFlag: '0',
      },
    });
    const roles = await this.roleService.findRoles({
      where: {
        delFlag: '0',
      },
    });

    return ResultData.ok({
      posts,
      roles,
    });
  }

  @Cacheable(CacheEnum.SYS_USER_KEY, '{userId}')
  async findOne(userId: number) {
    const data = await this.userRepo.findOne({
      where: {
        delFlag: '0',
        userId: userId,
      },
    });

    const dept = await this.sysDeptEntityRep.findOne({
      where: {
        delFlag: '0',
        deptId: data.deptId,
      },
    });
    data['dept'] = dept;

    const postList = await this.sysUserWithPostEntityRep.find({
      where: {
        userId: userId,
      },
    });
    const postIds = postList.map((item) => item.postId);
    const allPosts = await this.sysPostEntityRep.find({
      where: {
        delFlag: '0',
      },
    });

    const roleIds = await this.getRoleIds([userId]);
    const allRoles = await this.roleService.findRoles({
      where: {
        delFlag: '0',
      },
    });

    data['roles'] = allRoles.filter((item) => roleIds.includes(item.roleId));

    return ResultData.ok({
      data,
      postIds,
      posts: allPosts,
      roles: allRoles,
      roleIds,
    });
  }

  /**
   * 更新用户
   * @param updateUserDto
   * @returns
   */
  @CacheEvict(CacheEnum.SYS_USER_KEY, '{updateUserDto.userId}')
  async update(updateUserDto: UpdateUserDto, userId: number) {
    //不能修改超级管理员
    if (updateUserDto.userId === 1) throw new BadRequestException('非法操作！');

    //过滤掉设置超级管理员角色
    if (updateUserDto.roleIds && Array.isArray(updateUserDto.roleIds)) {
      updateUserDto.roleIds = updateUserDto.roleIds.filter((v) => v !== 1);
    }

    //当前用户不能修改自己的状态
    if (updateUserDto.userId === userId) {
      delete updateUserDto.status;
    }

    if (updateUserDto?.postIds !== undefined) {
      //用户已有岗位，先删除所有关联岗位
      const hasPostId = await this.sysUserWithPostEntityRep.findOne({
        where: {
          userId: updateUserDto.userId,
        },
        select: ['postId'],
      });

      if (hasPostId) {
        await this.sysUserWithPostEntityRep.delete({
          userId: updateUserDto.userId,
        });
      }
      // 只有当 postIds 不为空时才插入新记录
      if (updateUserDto.postIds && updateUserDto.postIds.length > 0) {
        const postEntity = this.sysUserWithPostEntityRep.createQueryBuilder('postEntity');
        const postValues = updateUserDto.postIds.map((id) => {
          return {
            userId: updateUserDto.userId,
            postId: id,
          };
        });
        postEntity.insert().values(postValues).execute();
      }
    }

    if (updateUserDto?.roleIds !== undefined) {
      //用户已有角色，先删除所有关联角色
      const hasRoletId = await this.sysUserWithRoleEntityRep.findOne({
        where: {
          userId: updateUserDto.userId,
        },
        select: ['roleId'],
      });
      if (hasRoletId) {
        await this.sysUserWithRoleEntityRep.delete({
          userId: updateUserDto.userId,
        });
      }
      // 只有当 roleIds 不为空时才插入新记录
      if (updateUserDto.roleIds && updateUserDto.roleIds.length > 0) {
        const roleEntity = this.sysUserWithRoleEntityRep.createQueryBuilder('roleEntity');
        const roleValues = updateUserDto.roleIds.map((id) => {
          return {
            userId: updateUserDto.userId,
            roleId: id,
          };
        });
        roleEntity.insert().values(roleValues).execute();
      }
    }

    delete updateUserDto.password;
    delete (updateUserDto as any).dept;
    delete (updateUserDto as any).roles;
    delete (updateUserDto as any).roleIds;
    delete (updateUserDto as any).postIds;

    //更新用户信息
    const data = await this.userRepo.update({ userId: updateUserDto.userId }, updateUserDto);
    return ResultData.ok(data);
  }

  @CacheEvict(CacheEnum.SYS_USER_KEY, '{userId}')
  clearCacheByUserId(userId: number) {
    return userId;
  }

  /**
   * 登陆
   */
  @Captcha('user')
  async login(user: LoginDto, clientInfo: ClientInfoDto) {
    const data = await this.userRepo.findOne({
      where: {
        userName: user.username,
      },
      select: ['userId', 'password'],
    });
    this.clearCacheByUserId(data.userId);

    if (!(data && bcrypt.compareSync(user.password, data.password))) {
      return ResultData.fail(500, `帐号或密码错误`);
    }

    const userData = await this.getUserinfo(data.userId);

    if (userData.delFlag === DelFlagEnum.DELETE) {
      return ResultData.fail(500, `您已被禁用，如需正常使用请联系管理员`);
    }
    if (userData.status === StatusEnum.STOP) {
      return ResultData.fail(500, `您已被停用，如需正常使用请联系管理员`);
    }

    /**
     * 更新用户登录信息
     */
    const loginDate = new Date();
    await this.userRepo.update(
      {
        userId: data.userId,
      },
      {
        loginDate: loginDate,
        loginIp: clientInfo.ipaddr,
      },
    );

    const uuid = GenerateUUID();
    const token = this.createToken({ uuid: uuid, userId: userData.userId });
    const permissions = await this.getUserPermissions(userData.userId);
    const deptData = await this.sysDeptEntityRep.findOne({
      where: {
        deptId: userData.deptId,
      },
      select: ['deptName'],
    });

    /**
     * 设置公司名称
     */
    userData['deptName'] = deptData.deptName || '';
    const roles = userData.roles.map((item) => item.roleKey);

    const userInfo = {
      browser: clientInfo.browser,
      ipaddr: clientInfo.ipaddr,
      loginLocation: clientInfo.loginLocation,
      loginTime: loginDate,
      os: clientInfo.os,
      permissions: permissions,
      roles: roles,
      token: uuid,
      user: userData,
      userId: userData.userId,
      username: userData.userName,
      deptId: userData.deptId,
    };

    await this.updateRedisToken(uuid, userInfo);

    return ResultData.ok(
      {
        token,
      },
      '登录成功',
    );
  }

  /**
   * 更新redis中用户权限和角色信息
   */
  async updateRedisUserRolesAndPermissions(uuid: string, userId: number) {
    const userData = await this.getUserinfo(userId);

    const permissions = await this.getUserPermissions(userId);
    const roles = userData.roles.map((item) => item.roleKey);

    await this.updateRedisToken(uuid, {
      permissions: permissions,
      roles: roles,
    });
  }

  /**
   * 更新redis中的元数据
   * @param token
   * @param metaData
   */
  async updateRedisToken(token: string, metaData: Partial<UserType>) {
    const oldMetaData = await this.redisService.get(`${CacheEnum.LOGIN_TOKEN_KEY}${token}`);

    let newMetaData = metaData;
    if (oldMetaData) {
      newMetaData = Object.assign(oldMetaData, metaData);
    }

    await this.redisService.set(`${CacheEnum.LOGIN_TOKEN_KEY}${token}`, newMetaData, LOGIN_TOKEN_EXPIRESIN);
  }

  /**
   * 获取角色Id列表
   * @param userId
   * @returns
   */
  async getRoleIds(userIds: Array<number>) {
    const roleList = await this.sysUserWithRoleEntityRep.find({
      where: {
        userId: In(userIds),
      },
      select: ['roleId'],
    });
    const roleIds = roleList.map((item) => item.roleId);
    return Uniq(roleIds);
  }

  /**
   * 获取权限列表
   * @param userId
   * @returns
   */
  async getUserPermissions(userId: number) {
    // 超级管理员 - 根据角色赋予 权限
    // if (userId === 1) {
    //   return ['*:*:*'];
    // }
    const roleIds = await this.getRoleIds([userId]);
    const list = await this.roleService.getPermissionsByRoleIds(roleIds);
    const permissions = Uniq(list.map((item: SysMenuEntity) => item.perms)).filter((item) => {
      return item;
    });
    return permissions;
  }

  /**
   * 获取用户信息
   */
  async getUserinfo(userId: number): Promise<{ dept: SysDeptEntity; roles: Array<SysRoleEntity>; posts: Array<SysPostEntity> } & UserEntity> {
    const entity = this.userRepo.createQueryBuilder('user');
    entity.where({
      userId: userId,
      delFlag: DelFlagEnum.NORMAL,
    });
    //联查部门详情
    entity.leftJoinAndMapOne('user.dept', SysDeptEntity, 'dept', 'dept.deptId = user.deptId');
    const roleIds = await this.getRoleIds([userId]);

    const roles = await this.roleService.findRoles({
      where: {
        delFlag: '0',
        roleId: In(roleIds),
      },
    });

    const postIds = (
      await this.sysUserWithPostEntityRep.find({
        where: {
          userId: userId,
        },
        select: ['postId'],
      })
    ).map((item) => item.postId);

    const posts = await this.sysPostEntityRep.find({
      where: {
        delFlag: '0',
        postId: In(postIds),
      },
    });

    const data = await entity.getOne();

    const result = {
      ...data,
      roles,
      posts,
      dept: (data as any).dept,
    };

    return result;
  }

  /**
   * 注册
   */
  async register(user: RegisterDto) {
    const loginDate = GetNowDate();
    const checkUserNameUnique = await this.userRepo.findOne({
      where: {
        userName: user.username,
      },
      select: ['userName'],
    });
    if (checkUserNameUnique) {
      return ResultData.fail(500, `保存用户'${user.username}'失败，注册账号已存在`);
    }
    user['userName'] = user.username;
    user['nickName'] = user.username;
    await this.userRepo.save({ ...user, loginDate });
    return ResultData.ok();
  }

  /**
   * 从数据声明生成令牌
   *
   * @param payload 数据声明
   * @return 令牌
   */
  createToken(payload: { uuid: string; userId: number }): string {
    const accessToken = this.jwtService.sign(payload);
    return accessToken;
  }

  /**
   * 从令牌中获取数据声明
   *
   * @param token 令牌
   * @return 数据声明
   */
  parseToken(token: string) {
    try {
      if (!token) return null;
      const payload = this.jwtService.verify(token.replace('Bearer ', ''));
      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * 重置密码
   * @param body
   * @returns
   */
  @CacheEvict(CacheEnum.SYS_USER_KEY, '{body.userId}')
  async resetPwd(body: ResetPwdDto) {
    if (body.userId === 1) {
      return ResultData.fail(500, '系统用户不能重置密码');
    }
    if (body.password) {
      body.password = await bcrypt.hashSync(body.password, bcrypt.genSaltSync(10));
    }
    await this.userRepo.update(
      {
        userId: body.userId,
      },
      {
        password: body.password,
      },
    );
    return ResultData.ok();
  }

  /**
   * 批量删除用户
   * @param ids
   * @returns
   */
  async remove(ids: number[]) {
    // 忽略系统角色的删除
    const data = await this.userRepo.update(
      { userId: In(ids), userType: Not(SYS_USER_TYPE.SYS) },
      {
        delFlag: '1',
      },
    );
    return ResultData.ok(data);
  }

  /**
   * 角色详情
   * @param id
   * @returns
   */
  async authRole(userId: number) {
    const allRoles = await this.roleService.findRoles({
      where: {
        delFlag: '0',
      },
    });

    const user = await this.userRepo.findOne({
      where: {
        delFlag: '0',
        userId: userId,
      },
    });

    const dept = await this.sysDeptEntityRep.findOne({
      where: {
        delFlag: '0',
        deptId: user.deptId,
      },
    });
    user['dept'] = dept;

    const roleIds = await this.getRoleIds([userId]);
    //TODO flag用来给前端表格标记选中状态，后续优化
    user['roles'] = allRoles.filter((item) => {
      if (roleIds.includes(item.roleId)) {
        item['flag'] = true;
        return true;
      } else {
        return true;
      }
    });

    return ResultData.ok({
      roles: allRoles,
      user,
    });
  }

  /**
   * 更新用户角色信息
   * @param query
   * @returns
   */
  async updateAuthRole(query) {
    const roleIds = query.roleIds.split(',');
    if (roleIds?.length > 0) {
      //用户已有角色,先删除所有关联角色
      const hasRoletId = await this.sysUserWithRoleEntityRep.findOne({
        where: {
          userId: query.userId,
        },
        select: ['roleId'],
      });
      if (hasRoletId) {
        await this.sysUserWithRoleEntityRep.delete({
          userId: query.userId,
        });
      }
      const roleEntity = this.sysUserWithRoleEntityRep.createQueryBuilder('roleEntity');
      const roleValues = roleIds.map((id) => {
        return {
          userId: query.userId,
          roleId: id,
        };
      });
      roleEntity.insert().values(roleValues).execute();
    }
    return ResultData.ok();
  }

  /**
   * 修改用户状态
   * @param changeStatusDto
   * @returns
   */
  @CacheEvict(CacheEnum.SYS_USER_KEY, '{changeStatusDto.userId}')
  async changeStatus(changeStatusDto: ChangeStatusDto) {
    const userData = await this.userRepo.findOne({
      where: {
        userId: changeStatusDto.userId,
      },
      select: ['userType'],
    });
    if (userData.userType === SYS_USER_TYPE.SYS) {
      return ResultData.fail(500, '系统角色不可停用');
    }

    const res = await this.userRepo.update(
      { userId: changeStatusDto.userId },
      {
        status: changeStatusDto.status,
      },
    );
    return ResultData.ok(res);
  }

  /**
   * 部门树
   * @returns
   */
  async deptTree() {
    const tree = await this.deptService.deptTree();
    return ResultData.ok(tree);
  }

  /**
   * 获取角色已分配用户
   * @param query
   * @returns
   */
  async allocatedList(query: AllocatedListDto) {
    const roleWidthRoleList = await this.sysUserWithRoleEntityRep.find({
      where: {
        roleId: +query.roleId,
      },
      select: ['userId'],
    });
    if (roleWidthRoleList.length === 0) {
      return ResultData.ok({
        list: [],
        total: 0,
      });
    }
    const userIds = roleWidthRoleList.map((item) => item.userId);
    const entity = this.userRepo.createQueryBuilder('user');
    entity.where('user.delFlag = :delFlag', { delFlag: '0' });
    entity.andWhere('user.status = :status', { status: '0' });
    entity.andWhere('user.userId IN (:...userIds)', { userIds: userIds });
    if (query.userName) {
      entity.andWhere(`user.userName LIKE "%${query.userName}%"`);
    }

    if (query.phonenumber) {
      entity.andWhere(`user.phonenumber LIKE "%${query.phonenumber}%"`);
    }
    entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    //联查部门详情
    entity.leftJoinAndMapOne('user.dept', SysDeptEntity, 'dept', 'dept.deptId = user.deptId');
    const [list, total] = await entity.getManyAndCount();
    return ResultData.ok({
      list,
      total,
    });
  }

  /**
   * 获取角色未分配用户
   * @param query
   * @returns
   */
  async unallocatedList(query: AllocatedListDto) {
    const roleWidthRoleList = await this.sysUserWithRoleEntityRep.find({
      where: {
        roleId: +query.roleId,
      },
      select: ['userId'],
    });

    const userIds = roleWidthRoleList.map((item) => item.userId);
    const entity = this.userRepo.createQueryBuilder('user');
    entity.where('user.delFlag = :delFlag', { delFlag: '0' });
    entity.andWhere('user.status = :status', { status: '0' });
    entity.andWhere({
      userId: Not(In(userIds)),
    });
    if (query.userName) {
      entity.andWhere(`user.userName LIKE "%${query.userName}%"`);
    }

    if (query.phonenumber) {
      entity.andWhere(`user.phonenumber LIKE "%${query.phonenumber}%"`);
    }
    entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
    //联查部门详情
    entity.leftJoinAndMapOne('user.dept', SysDeptEntity, 'dept', 'dept.deptId = user.deptId');
    const [list, total] = await entity.getManyAndCount();
    return ResultData.ok({
      list,
      total,
    });
  }

  /**
   * 用户解绑角色
   * @param data
   * @returns
   */
  async authUserCancel(data: AuthUserCancelDto) {
    await this.sysUserWithRoleEntityRep.delete({
      userId: data.userId,
      roleId: data.roleId,
    });
    return ResultData.ok();
  }

  /**
   * 用户批量解绑角色
   * @param data
   * @returns
   */
  async authUserCancelAll(data: AuthUserCancelAllDto) {
    const userIds = data.userIds.split(',').map((id) => +id);
    await this.sysUserWithRoleEntityRep.delete({
      userId: In(userIds),
      roleId: +data.roleId,
    });
    return ResultData.ok();
  }

  /**
   * 用户批量绑定角色
   * @param data
   * @returns
   */
  async authUserSelectAll(data: AuthUserSelectAllDto) {
    const userIds = data.userIds.split(',');
    const entitys = userIds.map((userId) => {
      const sysDeptEntityEntity = new SysUserWithRoleEntity();
      return Object.assign(sysDeptEntityEntity, {
        userId: userId,
        roleId: +data.roleId,
      });
    });
    await this.sysUserWithRoleEntityRep.save(entitys);
    return ResultData.ok();
  }

  /**
   * 个人中心-用户信息
   * @param user
   * @returns
   */
  async profile(user) {
    return ResultData.ok(user);
  }

  /**
   * 个人中心 - 用户信息
   * @param user
   * @returns
   */
  async updateProfile(user: UserType, updateProfileDto: UpdateProfileDto) {
    // 只允许更新允许的字段
    const allowedFields = {
      nickName: updateProfileDto.nickName,
      email: updateProfileDto.email,
      phonenumber: updateProfileDto.phonenumber,
      sex: updateProfileDto.sex,
      avatar: updateProfileDto.avatar,
    };

    await this.userRepo.update({ userId: user.user.userId }, allowedFields);

    // 更新 Redis 中的用户信息
    const userData = await this.redisService.get(`${CacheEnum.LOGIN_TOKEN_KEY}${user.token}`);
    if (userData) {
      userData.user = Object.assign(userData.user, allowedFields);
      await this.redisService.set(`${CacheEnum.LOGIN_TOKEN_KEY}${user.token}`, userData);
    }

    return ResultData.ok();
  }

  /**
   * 个人中心 - 更新用户头像
   * @param userId 用户 ID
   * @param avatarUrl 头像 URL
   * @param token 当前用户的 token（可选）
   */
  async updateUserAvatar(userId: number, avatarUrl: string, token?: string) {
    console.log('🔵 [updateUserAvatar] 开始更新头像:', { userId, avatarUrl, token });

    try {
      // 方式 2: 使用 queryRunner 显式事务
      const queryRunner = this.userRepo.manager.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // 查询用户
        const user = await queryRunner.manager.findOne(UserEntity, { where: { userId } });
        if (!user) {
          throw new Error(`用户 ${userId} 不存在`);
        }

        console.log('🔵 [updateUserAvatar] 更新前头像:', user.avatar);

        // 修改头像
        user.avatar = avatarUrl;

        // 保存
        await queryRunner.manager.save(user);
        console.log('🔵 [updateUserAvatar] 已保存到事务');

        // 提交事务
        await queryRunner.commitTransaction();
        console.log('✅ [updateUserAvatar] 事务已提交');

        // 再次查询确认（直接查数据库）
        const verifyUser = await this.userRepo.findOne({ where: { userId } });
        console.log('🔵 [updateUserAvatar] 最终验证 - 头像:', verifyUser.avatar);
      } catch (error) {
        // 回滚事务
        await queryRunner.rollbackTransaction();
        console.error('❌ [updateUserAvatar] 事务回滚:', error);
        throw error;
      } finally {
        await queryRunner.release();
      }

      console.log('✅ [updateUserAvatar] 数据库更新成功');

      // 更新 Redis 中的用户信息 - 只更新当前 token 对应的数据
      if (token) {
        const cacheKey = `${CacheEnum.LOGIN_TOKEN_KEY}${token}`;
        const userData = await this.redisService.get(cacheKey);

        if (userData && userData.user?.userId === userId) {
          console.log('🔵 [updateUserAvatar] 找到匹配 token，更新前 avatar:', userData.user.avatar);
          userData.user.avatar = avatarUrl;

          const setResult = await this.redisService.set(cacheKey, userData);
          console.log('🔵 [updateUserAvatar] Redis set 结果:', setResult);

          // 验证是否真的更新了
          const verifyData = await this.redisService.get(cacheKey);
          console.log('🔵 [updateUserAvatar] Redis 验证 - avatar:', verifyData?.user?.avatar);

          console.log('🔵 [updateUserAvatar] Redis 缓存已更新');
        } else {
          console.warn('⚠️ [updateUserAvatar] 未找到匹配的 token 数据');
        }
      }

      console.log('✅ [updateUserAvatar] 完成');
    } catch (error) {
      console.error('❌ [updateUserAvatar] 更新失败:', error);
      throw error;
    }
  }

  /**
   * 个人中心-修改密码
   * @param user
   * @param updatePwdDto
   * @returns
   */
  async updatePwd(user: UserType, updatePwdDto: UpdatePwdDto) {
    if (updatePwdDto.oldPassword === updatePwdDto.newPassword) {
      return ResultData.fail(500, '新密码不能与旧密码相同');
    }
    if (bcrypt.compareSync(user.user.password, updatePwdDto.oldPassword)) {
      return ResultData.fail(500, '修改密码失败，旧密码错误');
    }

    const password = await bcrypt.hashSync(updatePwdDto.newPassword, bcrypt.genSaltSync(10));
    await this.userRepo.update({ userId: user.user.userId }, { password: password });
    return ResultData.ok();
  }

  /**
   * 导出用户信息数据为 xlsx
   * @param res
   */
  async export(res: Response, body: ListUserDto, user: UserType['user']) {
    delete body.pageNum;
    delete body.pageSize;
    const list = await this.findAll(body, user);
    const options = {
      sheetName: '用户数据',
      data: list.data.list,
      header: [
        { title: '用户序号', dataIndex: 'userId' },
        { title: '用户账号', dataIndex: 'userName' },
        { title: '用户昵称', dataIndex: 'nickName' },
        { title: '用户邮箱', dataIndex: 'email' },
        { title: '手机号码', dataIndex: 'phonenumber' },
        { title: '用户性别', dataIndex: 'sex' },
        { title: '账号状态', dataIndex: 'status' },
        { title: '最后登录 IP', dataIndex: 'loginIp' },
        { title: '最后登录时间', dataIndex: 'loginDate', width: 20 },
        { title: '部门', dataIndex: 'dept.deptName' },
        { title: '部门负责人', dataIndex: 'dept.leader' },
      ],
    };
    ExportTable(options, res);
  }

  /**
   * 从 Excel 导入用户数据
   * @param file - Excel 文件
   * @param updateSupport - 是否更新已存在的用户数据（true:更新，false:跳过）
   * @param user - 当前操作用户
   * @returns 导入结果
   */
  async importData(file: Express.Multer.File, updateSupport: boolean, user: UserDto) {
    try {
      // 读取 Excel 文件
      const workbook = new ExcelJS.Workbook();
      // @ts-expect-error - 处理 Multer Buffer 类型兼容性问题
      await workbook.xlsx.load(file.buffer);

      const worksheet = workbook.getWorksheet(1); // 获取第一个工作表

      if (!worksheet || worksheet.rowCount < 2) {
        return ResultData.fail(500, 'Excel 文件为空或格式不正确');
      }

      // 定义表头映射（第一行为表头）
      const headerMapping: Record<number, string> = {};
      const expectedHeaders: Record<string, string> = {
        用户账号: 'userName',
        用户昵称: 'nickName',
        '部门 ID': 'deptId',
        部门名称: 'deptName',
        用户邮箱: 'email',
        手机号码: 'phonenumber',
        性别: 'sex',
        帐号状态: 'status',
        备注: 'remark',
      };

      // 解析表头
      worksheet.getRow(1).eachCell((cell, colNumber) => {
        const header = cell.value?.toString()?.trim();
        if (header && expectedHeaders[header]) {
          headerMapping[colNumber] = expectedHeaders[header];
        }
      });

      // 验证必要字段是否存在
      if (!headerMapping || Object.keys(headerMapping).length === 0) {
        return ResultData.fail(500, 'Excel 表头格式不正确，请检查是否包含必要的列');
      }

      const successData: any[] = [];
      const errorData: any[] = [];
      const salt = bcrypt.genSaltSync(10);
      const defaultPassword = await bcrypt.hashSync('123456', salt); // 默认密码

      // 从第二行开始解析数据
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const userData: any = {};
        const rowErrors: string[] = []; // 收集当前行的所有错误

        // 根据表头映射解析每列数据
        row.eachCell((cell, colNumber) => {
          const key = headerMapping[colNumber];
          if (key) {
            let value = cell.value?.toString()?.trim();

            // 处理空值
            if (!value || value === '') {
              if (key === 'userName' || key === 'nickName') {
                // 必填字段
                value = null;
                rowErrors.push(`${key === 'userName' ? '用户账号' : '用户昵称'}不能为空`);
              } else {
                value = undefined;
              }
            }

            // 特殊字段处理
            if (key === 'deptId' && value) {
              const deptId = parseInt(value);
              if (isNaN(deptId)) {
                rowErrors.push(`部门 ID 格式不正确（应为数字）：${value}`);
              } else {
                userData.deptId = deptId;
              }
            } else if (key === 'sex' && value) {
              // 性别转换：男->0, 女->1, 未知->2
              if (['男', '女', '未知'].includes(value)) {
                userData.sex = value === '男' ? '0' : value === '女' ? '1' : '2';
              } else {
                rowErrors.push(`性别格式不正确（应为：男/女/未知）：${value}`);
              }
            } else if (key === 'status' && value) {
              // 状态转换：正常->0, 停用->1
              if (['正常', '停用'].includes(value)) {
                userData.status = value === '正常' ? '0' : value === '停用' ? '1' : '0';
              } else {
                rowErrors.push(`帐号状态格式不正确（应为：正常/停用）：${value}`);
              }
            } else if (key === 'email' && value) {
              // 邮箱格式验证
              const emailRegex = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
              if (!emailRegex.test(value)) {
                rowErrors.push(`邮箱格式不正确：${value}`);
              } else {
                userData[key] = value;
              }
            } else if (key === 'phonenumber' && value) {
              // 手机号格式验证（简单验证 11 位数字）
              const phoneRegex = /^1[3-9]\d{9}$/;
              if (!phoneRegex.test(value)) {
                rowErrors.push(`手机号码格式不正确（应为 11 位数字）：${value}`);
              } else {
                userData[key] = value;
              }
            } else if (key === 'userName' || key === 'nickName') {
              userData[key] = value;
            } else {
              userData[key] = value;
            }
          }
        });

        // 跳过空行（整行都为空）
        if (!userData.userName && !userData.nickName && rowErrors.length === 0) {
          continue;
        }

        // 如果有字段错误，直接记录错误
        if (rowErrors.length > 0) {
          errorData.push({
            row: rowNumber,
            data: userData,
            error: rowErrors.join('；'),
          });
          continue;
        }

        // 必填字段验证（再次检查）
        if (!userData.userName || !userData.nickName) {
          const missingFields = [];
          if (!userData.userName) missingFields.push('用户账号');
          if (!userData.nickName) missingFields.push('用户昵称');
          errorData.push({
            row: rowNumber,
            data: userData,
            error: `缺少必填字段：${missingFields.join('、')}`,
          });
          continue;
        }

        try {
          // 检查用户账号是否已存在
          const existUser = await this.userRepo.findOne({
            where: { userName: userData.userName },
          });

          if (existUser) {
            if (updateSupport) {
              // 更新已有用户
              await this.userRepo.update(
                { userId: existUser.userId },
                {
                  ...userData,
                  userType: SYS_USER_TYPE.CUSTOM,
                  updateBy: user.username,
                  updateTime: new Date(),
                },
              );
              successData.push({
                row: rowNumber,
                data: userData,
                message: '更新成功',
              });
            } else {
              // 不更新，跳过
              errorData.push({
                row: rowNumber,
                data: userData,
                error: `用户账号 ${userData.userName} 已存在（如要更新请设置 updateSupport=1）`,
              });
            }
          } else {
            // 创建新用户
            const newUser = await this.userRepo.save({
              ...userData,
              password: defaultPassword, // 使用默认密码
              userType: SYS_USER_TYPE.CUSTOM,
              createBy: user.username,
              createTime: new Date(),
              delFlag: DelFlagEnum.NORMAL,
              status: userData.status || '0', // 默认正常
              sex: userData.sex || '0', // 默认男
            });

            successData.push({
              row: rowNumber,
              data: userData,
              message: '导入成功',
            });
          }
        } catch (error) {
          errorData.push({
            row: rowNumber,
            data: userData,
            error: `数据库操作失败：${error.message}`,
          });
        }
      }

      // 返回导入结果
      const result = {
        success: successData.length,
        error: errorData.length,
        total: successData.length + errorData.length,
        // 成功行号列表
        successRowNums: successData.map((item) => item.row),
        // 失败行号列表
        errorRowNums: errorData.map((item) => item.row),
        details: {
          successData,
          errorData,
        },
      };

      // 无论是否有错误，都返回 200 状态码
      if (errorData.length > 0) {
        return ResultData.ok(result, `导入完成，成功 ${successData.length} 条，失败 ${errorData.length} 条`);
      }

      return ResultData.ok(result, `导入成功，共 ${successData.length} 条记录`);
    } catch (error) {
      return ResultData.fail(500, `导入失败：${error.message}`);
    }
  }

  /**
   * 下载用户导入模板
   * @param res
   */
  async downloadTemplate(res: Response): Promise<void> {
    const config = {
      sheetName: '用户数据',
      fileName: '用户导入模板.xlsx',
      columns: [
        { header: '用户账号', key: 'userName', width: 20, required: true },
        { header: '用户昵称', key: 'nickName', width: 20, required: true },
        { header: '部门 ID', key: 'deptId', width: 15 },
        { header: '用户邮箱', key: 'email', width: 25 },
        { header: '手机号码', key: 'phonenumber', width: 15 },
        { header: '性别', key: 'sex', width: 10, validation: ['男', '女', '未知'] },
        { header: '帐号状态', key: 'status', width: 15, validation: ['正常', '停用'] },
        { header: '备注', key: 'remark', width: 30 },
      ],
      exampleData: {
        userName: 'zhangsan',
        nickName: '张三',
        deptId: 100,
        email: 'zhangsan@example.com',
        phonenumber: '13800138000',
        sex: '男',
        status: '正常',
        remark: '示例数据，请删除后填写实际数据',
      },
    };

    await createExcelTemplate(res, config);
  }
}
