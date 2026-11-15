import { Repository, In, Not, DataSource } from 'typeorm';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/module/common/redis/redis.service';
import * as bcrypt from 'bcryptjs';
import { GetNowDate, GenerateUUID, Uniq } from 'src/common/utils/index';

import { CacheEnum, DelFlagEnum, StatusEnum, DataScopeEnum } from 'src/common/enum/index';
import { LOGIN_TOKEN_EXPIRESIN, REGISTER_IP_LIMIT, REGISTER_RATE_EXPIRESIN, SYS_USER_TYPE } from 'src/common/constant/index';
import { ResultData } from 'src/common/utils/result';
import { CreateUserDto, UpdateUserDto, ListUserDto, ChangeStatusDto, ResetPwdDto, AllocatedListDto, UpdateProfileDto, UpdatePwdDto } from './dto/index';
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
import { MailService } from 'src/module/common/mail/mail.service';
import { SysRoleEntity } from '../role/entities/role.entity';
import { SysMenuEntity } from '../menu/entities/menu.entity';
import { UserType } from './dto/user';
import { UserDto } from './user.decorator';
import { ClientInfoDto } from 'src/common/decorators/common.decorator';
import { Cacheable, CacheEvict } from 'src/common/decorators/redis.decorator';
import { Captcha } from 'src/common/decorators/captcha.decorator';
import { recordLoginFailure, clearLoginFailure } from 'src/common/utils/login-captcha';

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
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}
  /**
   * 后台创建用户
   * @param createUserDto
   * @returns
   */
  async create(createUserDto: CreateUserDto) {
    // 检查用户账号是否已存在
    const existUser = await this.userRepo.findOne({
      where: {
        userName: createUserDto.userName,
        delFlag: '0',
      },
      select: ['userId', 'userName'],
    });

    if (existUser) {
      throw new BadRequestException(`新增用户'${createUserDto.userName}'失败，登录账号已存在`);
    }

    const salt = bcrypt.genSaltSync(10);
    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hashSync(createUserDto.password, salt);
    }

    let res;
    try {
      // 用户与岗位/角色关联写入打包为事务，任一步失败整体回滚
      res = await this.dataSource.transaction(async (manager) => {
        const user = await manager.save(UserEntity, { ...createUserDto, userType: SYS_USER_TYPE.CUSTOM });
        if (createUserDto.postIds?.length) {
          await manager.insert(SysUserWithPostEntity, createUserDto.postIds.map((id) => ({ userId: user.userId, postId: id })));
        }
        if (createUserDto.roleIds?.length) {
          await manager.insert(SysUserWithRoleEntity, createUserDto.roleIds.map((id) => ({ userId: user.userId, roleId: id })));
        }
        return user;
      });
    } catch (error) {
      // 并发新增撞车时前置查重拦不住，靠 user_name 唯一索引兜底（ER_DUP_ENTRY）
      if (error?.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException(`新增用户'${createUserDto.userName}'失败，登录账号已存在`);
      }
      throw error;
    }

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

    // 岗位/角色关联的"先删后插"与用户信息更新打包为事务，任一步失败整体回滚
    // （原实现散装多表写入且插入漏 await，中断时会留下删了旧关联但没插新关联的半成品）
    const data = await this.dataSource.transaction(async (manager) => {
      if (updateUserDto?.postIds !== undefined) {
        //用户已有岗位，先删除所有关联岗位
        await manager.delete(SysUserWithPostEntity, {
          userId: updateUserDto.userId,
        });
        // 只有当 postIds 不为空时才插入新记录
        if (updateUserDto.postIds && updateUserDto.postIds.length > 0) {
          await manager.insert(
            SysUserWithPostEntity,
            updateUserDto.postIds.map((id) => ({ userId: updateUserDto.userId, postId: id })),
          );
        }
      }

      if (updateUserDto?.roleIds !== undefined) {
        //用户已有角色，先删除所有关联角色
        await manager.delete(SysUserWithRoleEntity, {
          userId: updateUserDto.userId,
        });
        // 只有当 roleIds 不为空时才插入新记录
        if (updateUserDto.roleIds && updateUserDto.roleIds.length > 0) {
          await manager.insert(
            SysUserWithRoleEntity,
            updateUserDto.roleIds.map((id) => ({ userId: updateUserDto.userId, roleId: id })),
          );
        }
      }

      const dto = { ...updateUserDto };
      delete dto.password;
      delete (dto as any).dept;
      delete (dto as any).roles;
      delete (dto as any).roleIds;
      delete (dto as any).postIds;

      //更新用户信息
      return await manager.update(UserEntity, { userId: updateUserDto.userId }, dto);
    });
    return ResultData.ok(data);
  }

  @CacheEvict(CacheEnum.SYS_USER_KEY, '{userId}')
  clearCacheByUserId(userId: number) {
    return userId;
  }

  /**
   * 清除用户菜单缓存
   * @param userId
   */
  async clearUserMenuCache(userId: number) {
    const cacheKey = `${CacheEnum.SYS_MENU_KEY}${userId}`;
    await this.redisService.del(cacheKey);
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

    if (!(data && bcrypt.compareSync(user.password, data.password))) {
      // 累计密码错误次数，达到阈值后下次登录需要验证码
      await recordLoginFailure(this.redisService, user.username);
      return ResultData.fail(500, `账号或密码错误`);
    }

    await clearLoginFailure(this.redisService, user.username);
    this.clearCacheByUserId(data.userId);

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
  async register(user: RegisterDto, ipaddr: string) {
    // 注册验证：已配置邮件服务走邮箱验证码，否则走图片验证码
    const verifyFail = await this.validateRegisterVerification(user);
    if (verifyFail) return verifyFail;
    const loginDate = GetNowDate();
    // IP 注册频率限制：同一 IP 每小时最多 REGISTER_IP_LIMIT 次（含验证码失败的尝试）
    const rateCount = await this.redisService.incr(CacheEnum.REGISTER_RATE_KEY + ipaddr, REGISTER_RATE_EXPIRESIN);
    if (rateCount > REGISTER_IP_LIMIT) {
      return ResultData.fail(429, '注册过于频繁，请稍后再试');
    }
    const checkUserNameUnique = await this.userRepo.findOne({
      where: {
        userName: user.username,
      },
      select: ['userName'],
    });
    if (checkUserNameUnique) {
      return ResultData.fail(500, `保存用户'${user.username}'失败，注册账号已存在`);
    }
    // 邮箱占用查重（sys_user.email 无唯一索引，应用层兜底；未填邮箱时跳过）
    if (user.email) {
      const checkEmailUnique = await this.userRepo.findOne({
        where: {
          email: user.email,
        },
        select: ['userId'],
      });
      if (checkEmailUnique) {
        return ResultData.fail(500, '该邮箱已被其他账号使用');
      }
    }
    user['userName'] = user.username;
    user['nickName'] = user.username;
    user['password'] = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    try {
      await this.userRepo.save({ ...user, userType: SYS_USER_TYPE.CUSTOM, loginDate });
    } catch (error) {
      // 并发注册撞车时前置查重拦不住，靠 user_name 唯一索引兜底（ER_DUP_ENTRY）
      if (error?.code === 'ER_DUP_ENTRY') {
        return ResultData.fail(500, `保存用户'${user.username}'失败，注册账号已存在`);
      }
      throw error;
    }
    // 邮箱验证码一次性使用，注册成功后才作废（失败可凭原码重试）
    if (user.email) {
      await this.redisService.del(CacheEnum.EMAIL_CODE_KEY + user.email);
    }
    return ResultData.ok();
  }

  /**
   * 注册验证方式校验：
   * - 已配置邮件服务（邮箱验证码注册开启）→ 校验邮箱验证码；验证通过不删码，注册失败可凭原码重试
   * - 未配置 → 图片验证码（原 @Captcha('user','always') 行为）
   * @returns null 表示校验通过，否则返回失败的 ResultData
   */
  private async validateRegisterVerification(user: RegisterDto): Promise<ResultData | null> {
    if (this.mailService.isEnabled()) {
      if (!user.email) return ResultData.fail(500, '请输入邮箱');
      if (!user.emailCode) return ResultData.fail(500, '请输入邮箱验证码');
      const code = await this.redisService.get(CacheEnum.EMAIL_CODE_KEY + user.email);
      if (!code) return ResultData.fail(500, '邮箱验证码已过期，请重新获取');
      if (String(code) !== String(user.emailCode)) return ResultData.fail(500, '邮箱验证码错误');
      return null;
    }
    if (!user.code) return ResultData.fail(500, '请输入验证码');
    const code = await this.redisService.get(CacheEnum.CAPTCHA_CODE_KEY + user.uuid);
    if (!code) return ResultData.fail(500, '验证码已过期');
    if (String(code) !== String(user.code)) return ResultData.fail(500, '验证码错误');
    // 图片验证码一次性使用，校验通过后立即作废
    await this.redisService.del(CacheEnum.CAPTCHA_CODE_KEY + user.uuid);
    return null;
  }

  /**
   * 检查账号是否已被注册（注册页实时校验用，注册提交时后端仍会兜底校验）
   */
  async checkUsername(username: string) {
    const exist = await this.userRepo.findOne({
      where: { userName: username },
      select: ['userId'],
    });
    return ResultData.ok({ exists: !!exist });
  }

  /**
   * 检查邮箱是否已被其他账号使用（注册发码实时校验用，注册提交时后端仍会兜底校验）
   */
  async checkEmailRegistered(email: string) {
    const exist = await this.userRepo.findOne({
      where: { email },
      select: ['userId'],
    });
    return ResultData.ok({ exists: !!exist });
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
   * 踢掉指定用户的全部在线会话
   * 删除/停用/重置密码后必须调用：身份验证只查 Redis 会话快照、不回查用户表，不踢则已登录会话在过期前持续有效
   * @param userIds
   */
  private async kickUserSessions(userIds: number[]) {
    if (!userIds?.length) return;
    const keys = await this.redisService.keys(`${CacheEnum.LOGIN_TOKEN_KEY}*`);
    if (!keys.length) return;
    const sessions = await this.redisService.mget(keys);
    const delKeys = keys.filter((key, index) => userIds.includes(sessions[index]?.userId));
    if (delKeys.length) {
      await this.redisService.del(delKeys);
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
    // 重置密码后立即踢掉全部在线会话，确保旧凭据即刻失效
    await this.kickUserSessions([body.userId]);
    return ResultData.ok();
  }

  /**
   * 批量删除用户
   * @param ids
   * @returns
   */
  async remove(ids: number[]) {
    // 忽略系统用户的删除
    const targets = await this.userRepo.find({
      where: {
        userId: In(ids),
        userType: Not(SYS_USER_TYPE.SYS),
      },
      select: ['userId'],
    });
    let data = null;
    if (targets.length) {
      data = await this.userRepo.update(
        { userId: In(targets.map((t) => t.userId)) },
        {
          delFlag: '1',
        },
      );
      // 被删用户的在线会话立即失效，避免已登录会话继续操作
      await this.kickUserSessions(targets.map((t) => t.userId));
    }
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
      // 角色关联"先删后插"打包为事务，任一步失败整体回滚
      await this.dataSource.transaction(async (manager) => {
        //用户已有角色,先删除所有关联角色
        await manager.delete(SysUserWithRoleEntity, {
          userId: query.userId,
        });
        await manager.insert(
          SysUserWithRoleEntity,
          roleIds.map((id) => ({ userId: query.userId, roleId: id })),
        );
      });
    }

    // 清除用户菜单缓存
    await this.clearUserMenuCache(query.userId);

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
    // 停用用户的在线会话立即失效（启用无需处理）
    if (changeStatusDto.status === StatusEnum.STOP) {
      await this.kickUserSessions([changeStatusDto.userId]);
    }
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

        // 修改头像
        user.avatar = avatarUrl;

        // 保存
        await queryRunner.manager.save(user);

        // 提交事务
        await queryRunner.commitTransaction();

        // 再次查询确认（直接查数据库）
        const verifyUser = await this.userRepo.findOne({ where: { userId } });
      } catch (error) {
        // 回滚事务
        await queryRunner.rollbackTransaction();
        console.error('❌ [updateUserAvatar] 事务回滚:', error);
        throw error;
      } finally {
        await queryRunner.release();
      }

      // 更新 Redis 中的用户信息 - 只更新当前 token 对应的数据
      if (token) {
        const cacheKey = `${CacheEnum.LOGIN_TOKEN_KEY}${token}`;
        const userData = await this.redisService.get(cacheKey);

        if (userData && userData.user?.userId === userId) {
          userData.user.avatar = avatarUrl;

          const setResult = await this.redisService.set(cacheKey, userData);

          // 验证是否真的更新了
          const verifyData = await this.redisService.get(cacheKey);
        } else {
          console.warn('⚠️ [updateUserAvatar] 未找到匹配的 token 数据');
        }
      }
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

}
