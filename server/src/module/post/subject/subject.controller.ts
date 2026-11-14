import { Controller, Get, Post, Body, Put, Param, Query, Delete, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { PostSubjectService } from './subject.service';
import { CreatePostSubjectDto, UpdatePostSubjectDto, ListPostSubjectDto } from './dto/index';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { NotRequireAuth, User, UserDto } from 'src/module/system/user/user.decorator';

@ApiTags('专栏管理')
@Controller('post/subject')
export class PostSubjectController {
  constructor(private readonly postSubjectService: PostSubjectService) {}

  @ApiOperation({ summary: '专栏-创建' })
  @ApiBody({ type: CreatePostSubjectDto, required: true })
  @RequirePermission('post:subject:add')
  @Post()
  @HttpCode(200)
  create(@Body() createDto: CreatePostSubjectDto, @User() user: UserDto) {
    return this.postSubjectService.create(createDto, user);
  }

  /**
   * 查询专栏列表（游客可访问，仅返回已发布专栏）
   */
  @ApiOperation({ summary: '专栏-游客-列表' })
  @NotRequireAuth()
  @Get('/guest/list')
  findGuestAll(@Query() query: ListPostSubjectDto) {
    return this.postSubjectService.findGuestAll(query);
  }

  /**
   * 查询专栏详情（游客可访问，仅返回已发布专栏）
   */
  @ApiOperation({ summary: '专栏-游客-详情' })
  @NotRequireAuth()
  @Get('/guest/detail')
  findGuestOne(@Query('id') id: number) {
    return this.postSubjectService.findGuestOne(id);
  }

  @ApiOperation({ summary: '专栏-列表' })
  @RequirePermission('post:subject:list')
  @Get('/list')
  findAll(@Query() query: ListPostSubjectDto) {
    return this.postSubjectService.findAll(query);
  }

  @ApiOperation({ summary: '专栏-详情' })
  @RequirePermission('post:subject:query')
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.postSubjectService.findOne(id);
  }

  @ApiOperation({ summary: '专栏-更新' })
  @ApiBody({ type: UpdatePostSubjectDto, required: true })
  @RequirePermission('post:subject:edit')
  @Put()
  update(@Body() updateDto: UpdatePostSubjectDto) {
    return this.postSubjectService.update(updateDto);
  }

  @ApiOperation({ summary: '专栏-删除' })
  @RequirePermission('post:subject:remove')
  @Delete(':ids')
  remove(@Param('ids') ids: string) {
    const idList = ids.split(',').map((id) => +id);
    return this.postSubjectService.remove(idList);
  }
}
