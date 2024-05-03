import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
import { OnlineService } from './online.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { OnlineListDto } from './dto/index';
@ApiTags('系统监控-在线用户')
@Controller('monitor/online')
export class OnlineController {
  constructor(private readonly onlineService: OnlineService) {}

  @ApiOperation({
    summary: '在线用户-列表',
  })
  @ApiBody({
    type: OnlineListDto,
  })
  @Get('/list')
  findAll(@Query() query) {
    return this.onlineService.findAll(query);
  }

  @ApiOperation({
    summary: '在线用户-强退',
  })
  @Delete('/:token')
  delete(@Param('token') token: string) {
    return this.onlineService.delete(token);
  }
}
