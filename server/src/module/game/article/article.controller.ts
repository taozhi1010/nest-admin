import { Controller, Get, Post, Body, Put, Param, Query, Delete, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { GameArticleService } from './article.service';
import { CreateGameAricleDto, UpdateGameAricleDto, ListGameAricleDto, DetailGameDto } from './dto/index';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';

@ApiTags('游戏文章')
@Controller('game/article')
export class GameArticleController {
  constructor(private readonly GameArticleService: GameArticleService) {}

  @ApiOperation({
    summary: '游戏文章-创建',
  })
  @ApiBody({
    type: CreateGameAricleDto,
    required: true,
  })
  @RequirePermission('system:Game:add')
  @Post()
  @HttpCode(200)
  create(@Body() createGameAricleDto: CreateGameAricleDto) {
    return this.GameArticleService.create(createGameAricleDto);
  }

  @ApiOperation({
    summary: '游戏文章-游客-列表',
  })
  // @RequirePermission('system:Game:list')
  @Get('/guest/list')
  findGuestAll(@Query() query: ListGameAricleDto) {
    return this.GameArticleService.findAll(query);
  }

  @ApiOperation({
    summary: '游戏文章-详情',
  })
  @Get('/guest/detail')
  findGuestOne(@Query() query: DetailGameDto) {
    const { gameId } = query;
    return this.GameArticleService.findOne(+gameId);
  }

  @ApiOperation({
    summary: '游戏文章-管理员-列表',
  })
  @RequirePermission('system:Game:list')
  @Get('/list')
  findAll(@Query() query: ListGameAricleDto) {
    return this.GameArticleService.findAll(query);
  }

  @ApiOperation({
    summary: '游戏文章-详情',
  })
  @RequirePermission('system:Game:query')
  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('id', id);
    return this.GameArticleService.findOne(+id);
  }

  @ApiOperation({
    summary: '游戏文章-更新',
  })
  @ApiBody({
    type: UpdateGameAricleDto,
    required: true,
  })
  @RequirePermission('system:Game:edit')
  @Put()
  update(@Body() updateGameAricleDto: UpdateGameAricleDto) {
    return this.GameArticleService.update(updateGameAricleDto);
  }

  @ApiOperation({
    summary: '游戏文章-删除',
  })
  @RequirePermission('system:Game:remove')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.GameArticleService.remove(+id);
  }
}
