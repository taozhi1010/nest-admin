import { Controller, Get } from '@nestjs/common';
import { ServerService } from './server.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
@ApiTags('系统监控-服务监控')
@Controller('monitor/server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}
  @ApiOperation({
    summary: '在线用户-列表',
  })
  @Get()
  getInfo() {
    return this.serverService.getInfo();
  }
}
