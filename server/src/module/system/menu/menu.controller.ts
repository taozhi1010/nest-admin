import { Controller, Get, Post, Body, Query, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, ListDeptDto } from './dto/index';
@ApiTags('菜单管理')
@Controller('system/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @ApiOperation({
    summary: '菜单管理-创建',
  })
  @ApiBody({
    type: CreateMenuDto,
    required: true,
  })
  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @ApiOperation({
    summary: '菜单管理-列表',
  })
  @Get('/list')
  findAll(@Query() query: ListDeptDto) {
    return this.menuService.findAll(query);
  }

  @ApiOperation({
    summary: '菜单管理-树表',
  })
  @Get('/treeselect')
  treeSelect() {
    return this.menuService.treeSelect();
  }

  @ApiOperation({
    summary: '菜单管理-角色-树表',
  })
  @Get('/roleMenuTreeselect/:id')
  roleMenuTreeselect(@Param('id') id: string) {
    return this.menuService.roleMenuTreeselect(+id);
  }

  @ApiOperation({
    summary: '菜单管理-详情',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(+id);
  }

  @ApiOperation({
    summary: '菜单管理-修改',
  })
  @ApiBody({
    type: UpdateMenuDto,
    required: true,
  })
  @Put()
  update(@Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(updateMenuDto);
  }

  @ApiOperation({
    summary: '菜单管理-删除',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuService.remove(+id);
  }
}
