import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { ResultData } from 'src/common/utils/result';
import { AxiosService } from 'src/module/common/axios/axios.service';
import { IsNull, Not, Repository } from 'typeorm';

import { CreateOperlogDto } from './dto/create-operlog.dto';
import { UpdateOperlogDto } from './dto/update-operlog.dto';
import { SysOperlogEntity } from './entities/operlog.entity';

@Injectable({ scope: Scope.REQUEST })
export class OperlogService {
	constructor(
		@Inject(REQUEST)
		private readonly request: Request & { user: any },
		@InjectRepository(SysOperlogEntity)
		private readonly sysOperlogEntityRep: Repository<SysOperlogEntity>,
		private readonly axiosService: AxiosService
	) {}

	create(createOperlogDto: CreateOperlogDto) {
		return 'This action adds a new operlog';
	}

	async findAll(query: any) {
		const entity = this.sysOperlogEntityRep.createQueryBuilder('entity');

		if (query.pageSize && query.pageNum) {
			entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
		}

		const orderMap = {
			descending: 'DESC',
			ascending: 'ASC',
		};

		if (query.orderByColumn && query.isAsc) {
			entity.orderBy(`entity.${query.orderByColumn}`, orderMap[query.isAsc]);
		}

		const [rows, total] = await entity.getManyAndCount();

		return ResultData.rows({ rows, total });
	}

	async removeAll() {
		await this.sysOperlogEntityRep.delete({ operId: Not(IsNull()) });
		return ResultData.ok();
	}

	findOne(id: number) {
		return `This action returns a #${id} operlog`;
	}

	update(id: number, updateOperlogDto: UpdateOperlogDto) {
		return `This action updates a #${id} operlog`;
	}

	remove(id: number) {
		return `This action removes a #${id} operlog`;
	}

	/**
	 * @description: 录入日志
	 */
	async logAction({
		resultData,
		costTime,
		title,
		handlerName,
		errorMsg,
		status = '0',
		businessType,
	}: {
		resultData?: any;
		costTime: number;
		title: string;
		handlerName: string;
		errorMsg?: string;
		status?: string;
		businessType: number;
	}) {
		const { originalUrl, method, ip, body, query } = this.request;
		const { user } = this.request.user;
		const operLocation = await this.axiosService.getIpAddress(ip);

		const params = {
			title,
			method: handlerName,
			operName: user.nickName,
			deptName: user.deptName,
			operUrl: originalUrl,
			requestMethod: method.toUpperCase(),
			operIp: ip,
			costTime,
			operLocation,
			operParam: JSON.stringify({ ...body, ...query }),
			jsonResult: JSON.stringify(resultData),
			errorMsg,
			status,

			businessType,
			operatorType: '1',
			operTime: new Date(),
		};

		await this.sysOperlogEntityRep.save(params);
	}

	/**
	 * @description: 录入扩展日志
	 */
	async logExtendedAction(
		logItem: {
			classMethod: string;
			classMethodTitle: string;
			handleCostTime: number;
			handleResult?: any;
			handleErrorMsg?: any;
			module?: string;
		},
		isLogBody = true
	) {
		const { originalUrl, method, headers, ip, body, query, user } = this.request;

		const userAgent = headers['user-agent'];

		const newBody = { ...body };

		if (newBody.password) {
			newBody.password = '******';
		}

		if (newBody.newPassword) {
			newBody.newPassword = '******';
		}

		// 将扩展日志格式转换为标准的操作日志格式
		const params = {
			title: logItem.classMethodTitle || logItem.classMethod,
			method: logItem.classMethod,
			operName: user?.user?.nickName || user?.user?.username || body?.username,
			deptName: user?.user?.deptName || '',
			operUrl: originalUrl,
			requestMethod: method.toUpperCase(),
			operIp: ip,
			costTime: logItem.handleCostTime,
			operLocation: '', // 可以后续补充地理位置信息
			operParam: isLogBody ? JSON.stringify({ body: newBody, query }) : JSON.stringify({ query }),
			jsonResult: isLogBody && logItem.handleResult ? JSON.stringify(logItem.handleResult) : '',
			errorMsg: logItem.handleErrorMsg ? JSON.stringify(logItem.handleErrorMsg) : '',
			status: logItem.handleErrorMsg ? '1' : '0',
			businessType: 0, // 默认为其他操作
			operatorType: '1',
			operTime: new Date(),
		};

		await this.sysOperlogEntityRep.save(params);
	}
}
