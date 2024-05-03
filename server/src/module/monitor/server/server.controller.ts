import { Controller, Get } from '@nestjs/common';
import { ServerService } from './server.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SchemaExample } from 'src/common/apiResponse/index';
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
    schema: {
      example: SchemaExample.monitor.server.get,
    },
  })
  @Get()
  getInfo() {
    return this.serverService.getInfo();
  }
}
