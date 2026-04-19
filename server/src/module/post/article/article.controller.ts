import { Controller, Get, Post, Body, Put, Param, Query, Delete, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { PostArticleService } from './article.service';
import { CreatePostArticleDto, UpdatePostArticleDto, ListPostArticleDto, AuditPostArticleDto } from './dto/index';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { User, UserDto } from 'src/module/system/user/user.decorator';

/**
 * 文章控制器
 * 提供文章的RESTful API接口
 */
@ApiTags('文章管理')
@Controller('post/article')
export class PostArticleController {
  constructor(private readonly postArticleService: PostArticleService) {}

  /**
   * 创建文章
   */
  @ApiOperation({ summary: '文章-创建' })
  @ApiBody({ type: CreatePostArticleDto, required: true })
  @RequirePermission('post:article:add')
  @Post()
  @HttpCode(200)
  create(@Body() createDto: CreatePostArticleDto, @User() user: UserDto) {
    return this.postArticleService.create(createDto, user);
  }

  /**
   * 查询文章列表（游客可访问）
   */
  @ApiOperation({ summary: '文章-游客-列表' })
  @Get('/guest/list')
  findGuestAll(@Query() query: ListPostArticleDto) {
    return this.postArticleService.findAll(query);
  }

  /**
   * 查询文章详情（游客可访问）
   */
  @ApiOperation({ summary: '文章-游客-详情' })
  @Get('/guest/detail')
  findGuestOne(@Query('id') id: string) {
    return this.postArticleService.findOne(id);
  }

  /**
   * 查询文章列表（管理员）
   */
  @ApiOperation({ summary: '文章-管理员-列表' })
  @RequirePermission('post:article:list')
  @Get('/list')
  findAll(@Query() query: ListPostArticleDto) {
    return this.postArticleService.findAll(query);
  }

  /**
   * 查询文章详情（管理员）
   */
  @ApiOperation({ summary: '文章-详情' })
  @RequirePermission('post:article:query')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postArticleService.findOne(id);
  }

  /**
   * 更新文章
   */
  @ApiOperation({ summary: '文章-更新' })
  @ApiBody({ type: UpdatePostArticleDto, required: true })
  @RequirePermission('post:article:edit')
  @Put()
  update(@Body() updateDto: UpdatePostArticleDto) {
    return this.postArticleService.update(updateDto);
  }

  /**
   * 删除文章
   */
  @ApiOperation({ summary: '文章-删除' })
  @RequirePermission('post:article:remove')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postArticleService.remove(id);
  }

  /**
   * 提交审核
   */
  @ApiOperation({ summary: '文章-提交审核' })
  @RequirePermission('post:article:submitAudit')
  @Post('/submit-audit/:id')
  submitForAudit(@Param('id') id: string) {
    return this.postArticleService.submitForAudit(id);
  }

  /**
   * 审核文章
   */
  @ApiOperation({ summary: '文章-审核' })
  @ApiBody({ type: AuditPostArticleDto, required: true })
  @RequirePermission('post:article:audit')
  @Post('/audit')
  audit(@Body() auditDto: AuditPostArticleDto) {
    // TODO: 从当前登录用户获取审核人ID
    const auditUserId = 1;
    return this.postArticleService.audit(auditDto, auditUserId);
  }

  /**
   * 发布文章
   */
  @ApiOperation({ summary: '文章-发布' })
  @RequirePermission('post:article:publish')
  @Post('/publish/:id')
  publish(@Param('id') id: string) {
    return this.postArticleService.publish(id);
  }
}
