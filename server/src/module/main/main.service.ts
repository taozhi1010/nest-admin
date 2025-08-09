import { ClientInfoDto } from '@decorators/common.decorator';
import { Injectable } from '@nestjs/common';
import { ResultData, SUCCESS_CODE } from 'src/common/utils/result';
import { AxiosService } from 'src/module/common/axios/axios.service';
import { LoginlogService } from '../monitor/loginlog/loginlog.service';
import { MenuService } from '../system/menu/menu.service';
import { UserService } from '../system/user/user.service';
import { LoginDto, RegisterDto } from './dto/index';

@Injectable()
export class MainService {
	constructor(
		private readonly userService: UserService,
		private readonly loginlogService: LoginlogService,
		private readonly axiosService: AxiosService,
		private readonly menuService: MenuService
	) {}

	/**
	 * 登陆
	 * @param user
	 * @returns
	 */
	async login(user: LoginDto, clientInfo: ClientInfoDto) {
		const loginLog = {
			...clientInfo,
			username: user.username,
			status: '0',
			message: '',
		};
		const loginRes = await this.userService.login(user, loginLog);
		loginLog.status = loginRes.code === SUCCESS_CODE ? '0' : '1';
		loginLog.message = loginRes.message;
		this.loginlogService.create(loginLog);
		return loginRes;
	}

	/**
	 * 退出登陆
	 * @param clientInfo
	 */
	async logout(clientInfo: ClientInfoDto) {
		const loginLog = {
			...clientInfo,
			status: '0',
			message: '退出成功',
		};
		this.loginlogService.create(loginLog);
		return ResultData.ok();
	}

	/**
	 * 注册
	 * @param user
	 * @returns
	 */
	async register(user: RegisterDto) {
		return await this.userService.register(user);
	}

	/**
	 * 登陆记录
	 */
	loginRecord() {}

	/**
	 * 获取路由菜单
	 */
	async getRouters(userId: number) {
		const menus = await this.menuService.getMenuListByUserId(userId);
		return ResultData.ok(menus);
	}
}
