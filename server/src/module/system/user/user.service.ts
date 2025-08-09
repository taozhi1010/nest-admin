import { Captcha } from '@decorators/captcha.decorator';
import { ClientInfoDto } from '@decorators/common.decorator';
import { Cacheable, CacheEvict } from '@decorators/redis.decorator';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from '@node-rs/bcrypt';
import { Response } from 'express';
import { LOGIN_TOKEN_EXPIRESIN, SYS_USER_TYPE } from 'src/common/constant/index';
import { CacheEnum, DataScopeEnum, DelFlagEnum, StatusEnum } from 'src/common/enum/index';

import { ExportTable } from 'src/common/utils/export';
import { GenerateUUID, GetNowDate, Uniq } from 'src/common/utils/index';
import { ResultData } from 'src/common/utils/result';
import { RedisService } from 'src/module/common/redis/redis.service';
import { In, Not, Repository } from 'typeorm';

import { LoginDto, RegisterDto } from '../../main/dto/index';
import { ConfigService } from '../config/config.service';
import { DeptService } from '../dept/dept.service';
import { SysDeptEntity } from '../dept/entities/dept.entity';
import { SysMenuEntity } from '../menu/entities/menu.entity';
import { SysPostEntity } from '../post/entities/post.entity';
import { AuthUserCancelAllDto, AuthUserCancelDto, AuthUserSelectAllDto } from '../role/dto/index';

import { SysRoleEntity } from '../role/entities/role.entity';
import { RoleService } from '../role/role.service';
import {
	AllocatedListDto,
	ChangeStatusDto,
	CreateUserDto,
	ListUserDto,
	ResetPwdDto,
	UpdateProfileDto,
	UpdatePwdDto,
	UpdateUserDto,
} from './dto/index';
import { UserType } from './dto/user';
import { UserEntity } from './entities/sys-user.entity';
import { SysUserWithPostEntity } from './entities/user-width-post.entity';
import { SysUserWithRoleEntity } from './entities/user-width-role.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity) private readonly userRepo: Repository<UserEntity>,
		@InjectRepository(SysDeptEntity) private readonly sysDeptEntityRep: Repository<SysDeptEntity>,
		@InjectRepository(SysPostEntity) private readonly sysPostEntityRep: Repository<SysPostEntity>,
		@InjectRepository(SysUserWithPostEntity)
		private readonly sysUserWithPostEntityRep: Repository<SysUserWithPostEntity>,
		@InjectRepository(SysUserWithRoleEntity)
		private readonly sysUserWithRoleEntityRep: Repository<SysUserWithRoleEntity>,
		private readonly roleService: RoleService,
		private readonly deptService: DeptService,
		private readonly jwtService: JwtService,
		private readonly redisService: RedisService,
		private readonly configService: ConfigService
	) {}

	/**
	 * 后台创建用户
	 * @param createUserDto
	 * @returns
	 */
	async create(createUserDto: CreateUserDto) {
		const salt = Number.parseFloat(bcrypt.genSaltSync(10));
		if (createUserDto.password) {
			createUserDto.password = await bcrypt.hashSync(createUserDto.password, salt);
		}

		const res = await this.userRepo.save({
			...createUserDto,
			userType: SYS_USER_TYPE.CUSTOM,
		});
		const postEntity = this.sysUserWithPostEntityRep.createQueryBuilder('postEntity');
		const postValues = createUserDto.postIds.map(id => {
			return {
				userId: res.userId,
				postId: id,
			};
		});
		postEntity.insert().values(postValues).execute();

		const roleEntity = this.sysUserWithRoleEntityRep.createQueryBuilder('roleEntity');
		const roleValues = createUserDto.roleIds.map(id => {
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

		// 数据权限过滤
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
				} else if (
					role.dataScope === DataScopeEnum.DATA_SCOPE_DEPT ||
					role.dataScope === DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD
				) {
					const dataScopeWidthDeptIds = await this.deptService.findDeptIdsByDataScope(
						user.deptId,
						role.dataScope
					);
					deptIds.push(...dataScopeWidthDeptIds);
				} else if (role.dataScope === DataScopeEnum.DATA_SCOPE_SELF) {
					dataScopeSelf = true;
				}
			}

			if (!dataScopeAll) {
				if (deptIds.length > 0) {
					entity.where('user.deptId IN (:...deptIds)', { deptIds });
				} else if (dataScopeSelf) {
					entity.where('user.userId = :userId', { userId: user.userId });
				}
			}
		}

		if (query.deptId) {
			const deptIds = await this.deptService.findDeptIdsByDataScope(
				+query.deptId,
				DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD
			);
			entity.andWhere('user.deptId IN (:...deptIds)', { deptIds });
		}

		if (query.username) {
			entity.andWhere(`user.username LIKE "%${query.username}%"`);
		}

		if (query.phonenumber) {
			entity.andWhere(`user.phonenumber LIKE "%${query.phonenumber}%"`);
		}

		if (query.status) {
			entity.andWhere('user.status = :status', { status: query.status });
		}

		if (query.params?.beginTime && query.params?.endTime) {
			entity.andWhere('user.createTime BETWEEN :start AND :end', {
				start: query.params.beginTime,
				end: query.params.endTime,
			});
		}

		if (query.pageSize && query.pageNum) {
			entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
		}
		// 联查部门详情
		entity.leftJoinAndMapOne('user.dept', SysDeptEntity, 'dept', 'dept.deptId = user.deptId');

		const [rows, total] = await entity.getManyAndCount();

		return ResultData.rows({ rows, total });
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
				userId,
			},
		});

		const dept = await this.sysDeptEntityRep.findOne({
			where: {
				delFlag: '0',
				deptId: data.deptId,
			},
		});

		const postList = await this.sysUserWithPostEntityRep.find({
			where: {
				userId,
			},
		});
		const postIds = postList.map(item => item.postId);
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

		const roles = allRoles.filter(item => roleIds.includes(item.roleId));

		return ResultData.ok({
			user: { ...data, dept, roles },
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
	@CacheEvict(CacheEnum.SYS_USER_KEY, '{userId}')
	async update(updateUserDto: UpdateUserDto, userId: number) {
		// 不能修改超级管理员
		if (updateUserDto.userId === 1) {
			throw new BadRequestException('非法操作！');
		}

		// 过滤掉设置超级管理员角色
		updateUserDto.roleIds = updateUserDto.roleIds.filter(v => v !== 1);

		// 当前用户不能修改自己的状态
		if (updateUserDto.userId === userId) {
			delete updateUserDto.status;
		}

		if (updateUserDto?.postIds?.length > 0) {
			// 用户已有岗位,先删除所有关联岗位
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
			const postEntity = this.sysUserWithPostEntityRep.createQueryBuilder('postEntity');
			const postValues = updateUserDto.postIds.map(id => {
				return {
					userId: updateUserDto.userId,
					postId: id,
				};
			});
			postEntity.insert().values(postValues).execute();
		}

		if (updateUserDto?.roleIds?.length > 0) {
			// 用户已有角色,先删除所有关联角色
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
			const roleEntity = this.sysUserWithRoleEntityRep.createQueryBuilder('roleEntity');
			const roleValues = updateUserDto.roleIds.map(id => {
				return {
					userId: updateUserDto.userId,
					roleId: id,
				};
			});
			roleEntity.insert().values(roleValues).execute();
		}

		delete updateUserDto.password;
		delete (updateUserDto as any).dept;
		delete (updateUserDto as any).roles;
		delete (updateUserDto as any).roleIds;
		delete (updateUserDto as any).postIds;

		// 更新用户信息
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
				username: user.username,
			},
			select: ['userId', 'password'],
		});
		this.clearCacheByUserId(data.userId);

		if (!(data && bcrypt.compareSync(user.password, data.password))) {
			throw ResultData.fail(500, `帐号或密码错误`);
		}

		const userData = await this.getUserinfo(data.userId);

		if (userData.delFlag === DelFlagEnum.DELETE) {
			throw ResultData.fail(500, `您已被禁用，如需正常使用请联系管理员`);
		}
		if (userData.status === StatusEnum.STOP) {
			throw ResultData.fail(500, `您已被停用，如需正常使用请联系管理员`);
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
				loginDate,
				loginIp: clientInfo.ipaddr,
			}
		);

		const uuid = GenerateUUID();
		const token = this.createToken({ uuid, userId: userData.userId });
		const permissions = await this.getUserPermissions(userData.userId);
		// const deptData = await this.sysDeptEntityRep.findOne({
		//   where: {
		//     deptId: userData.deptId,
		//   },
		//   select: ['deptName'],
		// })

		const roles = userData.roles.map(item => item.roleKey);

		const userInfo = {
			browser: clientInfo.browser,
			ipaddr: clientInfo.ipaddr,
			loginLocation: clientInfo.loginLocation,
			loginTime: loginDate,
			os: clientInfo.os,
			permissions,
			roles,
			token: uuid,
			user: userData,
			userId: userData.userId,
			username: userData.username,
			deptId: userData.deptId,
		};

		await this.updateRedisToken(uuid, userInfo);

		return ResultData.ok(
			{
				token,
			},
			'登录成功'
		);
	}

	/**
	 * 更新redis中用户权限和角色信息
	 */
	async updateRedisUserRolesAndPermissions(uuid: string, userId: number) {
		const userData = await this.getUserinfo(userId);

		const permissions = await this.getUserPermissions(userId);
		const roles = userData.roles.map(item => item.roleKey);

		await this.updateRedisToken(uuid, {
			permissions,
			roles,
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

		await this.redisService.set(
			`${CacheEnum.LOGIN_TOKEN_KEY}${token}`,
			newMetaData,
			LOGIN_TOKEN_EXPIRESIN
		);
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
		const roleIds = roleList.map(item => item.roleId);
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
		const permissions = Uniq(list.map((item: SysMenuEntity) => item.perms)).filter(item => {
			return item;
		});
		return permissions;
	}

	/**
	 * 获取用户信息
	 */
	async getUserinfo(userId: number): Promise<
		{
			dept: SysDeptEntity;
			roles: Array<SysRoleEntity>;
			posts: Array<SysPostEntity>;
		} & Partial<UserEntity>
	> {
		const entity = this.userRepo.createQueryBuilder('user');
		entity.where({
			userId,
			delFlag: DelFlagEnum.NORMAL,
		});
		// 联查部门详情
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
					userId,
				},
				select: ['postId'],
			})
		).map(item => item.postId);

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
				username: user.username,
			},
			select: ['username'],
		});
		if (checkUserNameUnique) {
			throw ResultData.fail(500, `保存用户'${user.username}'失败，注册账号已存在`);
		}

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
			if (!token) {
				return null;
			}
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
	async resetPwd(body: ResetPwdDto) {
		if (body.userId === 1) {
			throw ResultData.fail(500, '系统用户不能重置密码');
		}
		if (body.password) {
			body.password = bcrypt.hashSync(body.password, Number.parseFloat(bcrypt.genSaltSync(10)));
		}
		await this.userRepo.update(
			{
				userId: body.userId,
			},
			{
				password: body.password,
			}
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
			}
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
			where: { delFlag: '0' },
		});

		const user = await this.userRepo.findOne({
			where: { delFlag: '0', userId },
		});
		const dept = await this.sysDeptEntityRep.findOne({
			where: {
				delFlag: '0',
				deptId: user.deptId,
			},
		});

		const roleIds = await this.getRoleIds([userId]);

		const roles = allRoles.filter(item => {
			return roleIds.includes(item.roleId);
		});

		const detail = {
			...user,
			dept,
			roles,
		};

		return ResultData.ok({
			roles: allRoles,
			user: detail,
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
			// 用户已有角色,先删除所有关联角色
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
			const roleValues = roleIds.map(id => {
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
	async changeStatus(changeStatusDto: ChangeStatusDto) {
		const userData = await this.userRepo.findOne({
			where: {
				userId: changeStatusDto.userId,
			},
			select: ['userType'],
		});
		if (userData.userType === SYS_USER_TYPE.SYS) {
			throw ResultData.fail(500, '系统角色不可停用');
		}

		const res = await this.userRepo.update(
			{ userId: changeStatusDto.userId },
			{
				status: changeStatusDto.status,
			}
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
		const userIds = roleWidthRoleList.map(item => item.userId);
		const entity = this.userRepo.createQueryBuilder('user');
		entity.where('user.delFlag = :delFlag', { delFlag: '0' });
		entity.andWhere('user.status = :status', { status: '0' });
		entity.andWhere('user.userId IN (:...userIds)', { userIds });
		if (query.username) {
			entity.andWhere(`user.username LIKE "%${query.username}%"`);
		}

		if (query.phonenumber) {
			entity.andWhere(`user.phonenumber LIKE "%${query.phonenumber}%"`);
		}
		entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
		// 联查部门详情
		entity.leftJoinAndMapOne('user.dept', SysDeptEntity, 'dept', 'dept.deptId = user.deptId');
		const [rows, total] = await entity.getManyAndCount();

		return ResultData.rows({ rows, total });
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

		const userIds = roleWidthRoleList.map(item => item.userId);
		const entity = this.userRepo.createQueryBuilder('user');
		entity.where('user.delFlag = :delFlag', { delFlag: '0' });
		entity.andWhere('user.status = :status', { status: '0' });
		entity.andWhere({
			userId: Not(In(userIds)),
		});
		if (query.username) {
			entity.andWhere(`user.username LIKE "%${query.username}%"`);
		}

		if (query.phonenumber) {
			entity.andWhere(`user.phonenumber LIKE "%${query.phonenumber}%"`);
		}
		entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
		// 联查部门详情
		entity.leftJoinAndMapOne('user.dept', SysDeptEntity, 'dept', 'dept.deptId = user.deptId');
		const [rows, total] = await entity.getManyAndCount();

		return ResultData.rows({ rows, total });
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
		const userIds = data.userIds.split(',').map(id => +id);
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
		const entitys = userIds.map(userId => {
			const sysDeptEntityEntity = new SysUserWithRoleEntity();
			return Object.assign(sysDeptEntityEntity, {
				userId,
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
	 * 个人中心-用户信息
	 * @param user
	 * @returns
	 */
	async updateProfile(user: UserType, updateProfileDto: Partial<UpdateProfileDto>) {
		await this.userRepo.update({ userId: user.user.userId }, updateProfileDto);
		const userData = await this.redisService.get(`${CacheEnum.LOGIN_TOKEN_KEY}${user.token}`);
		userData.user = Object.assign(userData.user, updateProfileDto);
		await this.redisService.set(`${CacheEnum.LOGIN_TOKEN_KEY}${user.token}`, userData);
		return ResultData.ok();
	}

	/**
	 * 个人中心-修改密码
	 * @param user
	 * @param updatePwdDto
	 * @returns
	 */
	async updatePwd(user: UserType, updatePwdDto: UpdatePwdDto) {
		if (updatePwdDto.oldPassword === updatePwdDto.newPassword) {
			throw ResultData.fail(500, '新密码不能与旧密码相同');
		}
		if (bcrypt.compareSync(user.user.password, updatePwdDto.oldPassword)) {
			throw ResultData.fail(500, '修改密码失败，旧密码错误');
		}

		const password = bcrypt.hashSync(
			updatePwdDto.newPassword,
			Number.parseFloat(bcrypt.genSaltSync(10))
		);
		await this.userRepo.update({ userId: user.user.userId }, { password });
		return ResultData.ok();
	}

	/**
	 * 导出用户信息数据为xlsx
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
				{ title: '登录名称', dataIndex: 'username' },
				{ title: '用户昵称', dataIndex: 'nickName' },
				{ title: '用户邮箱', dataIndex: 'email' },
				{ title: '手机号码', dataIndex: 'phonenumber' },
				{ title: '用户性别', dataIndex: 'sex' },
				{ title: '账号状态', dataIndex: 'status' },
				{ title: '最后登录IP', dataIndex: 'loginIp' },
				{ title: '最后登录时间', dataIndex: 'loginDate', width: 20 },
				{ title: '部门', dataIndex: 'dept.deptName' },
				{ title: '部门负责人', dataIndex: 'dept.leader' },
			],
		};
		ExportTable(options, res);
	}
}
