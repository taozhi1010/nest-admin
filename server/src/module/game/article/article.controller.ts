import { Controller, Get, Post, Body, Put, Param, Query, Delete, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { GameArticleService } from './article.service';
import { CreateGameAricleDto, UpdateGameAricleDto, ListGameAricleDto } from './dto/index';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';

@ApiTags('游戏管理')
@Controller('game/article')
export class GameArticleController {
  constructor(private readonly GameArticleService: GameArticleService) {}

  @ApiOperation({
    summary: '游戏管理-创建',
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
    summary: '游戏管理-列表',
  })
  @RequirePermission('system:Game:list')
  @Get('/list')
  findAll(@Query() query: ListGameAricleDto) {
    return this.GameArticleService.findAll(query);
  }

  @ApiOperation({
    summary: '游戏管理-详情',
  })
  @RequirePermission('system:Game:query')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.GameArticleService.findOne(+id);
  }

  @ApiOperation({
    summary: '游戏管理-更新',
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
    summary: '游戏管理-删除',
  })
  @RequirePermission('system:Game:remove')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.GameArticleService.remove(+id);
  }
}
