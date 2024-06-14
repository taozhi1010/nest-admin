import { Controller, Get, Post, Body, Patch, Param, Query, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { NoticeService } from './notice.service';
import { CreateNoticeDto, UpdateNoticeDto, ListNoticeDto } from './dto/index';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';

@ApiTags('通知公告')
@Controller('system/notice')
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @ApiOperation({
    summary: '通知公告-创建',
  })
  @ApiBody({
    type: CreateNoticeDto,
  })
  @RequirePermission('system:notice:add')
  @Post()
  create(@Body() createConfigDto: CreateNoticeDto) {
    return this.noticeService.create(createConfigDto);
  }

  @ApiOperation({
    summary: '通知公告-列表',
  })
  @ApiBody({
    type: ListNoticeDto,
    required: true,
  })
  @RequirePermission('system:notice:query')
  @Get('/list')
  findAll(@Query() query: ListNoticeDto) {
    return this.noticeService.findAll(query);
  }

  @ApiOperation({
    summary: '通知公告-详情',
  })
  @RequirePermission('system:notice:query')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.noticeService.findOne(+id);
  }

  @ApiOperation({
    summary: '通知公告-更新',
  })
  @RequirePermission('system:notice:edit')
  @Put()
  update(@Body() updateNoticeDto: UpdateNoticeDto) {
    return this.noticeService.update(updateNoticeDto);
  }

  @ApiOperation({
    summary: '通知公告-删除',
  })
  @RequirePermission('system:notice:remove')
  @Delete(':id')
  remove(@Param('id') ids: string) {
    const noticeIds = ids.split(',').map((id) => +id);
    return this.noticeService.remove(noticeIds);
  }
}
