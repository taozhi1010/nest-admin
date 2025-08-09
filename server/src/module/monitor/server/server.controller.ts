import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ServerService } from './server.service';

@ApiTags('系统监控-服务监控')
@Controller('monitor/server')
export class ServerController {
	constructor(private readonly serverService: ServerService) {}
	@ApiOperation({
		summary: '在线用户-列表',
	})
	@ApiResponse({
		status: 200,
		description: '返回成功',
		schema: {},
	})
	@Get()
	getInfo() {
		return this.serverService.getInfo();
	}
}
