import { Controller, Get, Post, Body, Query, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, ListDeptDto } from './dto/index';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';

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
  @RequirePermission('system:menu:add')
  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menuService.create(createMenuDto);
  }

  @ApiOperation({
    summary: '菜单管理-列表',
  })
  @RequirePermission('system:menu:query')
  @Get('/list')
  findAll(@Query() query: ListDeptDto) {
    return this.menuService.findAll(query);
  }

  @ApiOperation({
    summary: '菜单管理-树表',
  })
  @RequirePermission('system:menu:query')
  @Get('/treeselect')
  treeSelect() {
    return this.menuService.treeSelect();
  }

  @ApiOperation({
    summary: '菜单管理-角色-树表',
  })
  @RequirePermission('system:menu:query')
  @Get('/roleMenuTreeselect/:menuId')
  roleMenuTreeselect(@Param('menuId') menuId: string) {
    return this.menuService.roleMenuTreeselect(+menuId);
  }

  @ApiOperation({
    summary: '菜单管理-详情',
  })
  @RequirePermission('system:menu:query')
  @Get(':menuId')
  findOne(@Param('menuId') menuId: string) {
    return this.menuService.findOne(+menuId);
  }

  @ApiOperation({
    summary: '菜单管理-修改',
  })
  @ApiBody({
    type: UpdateMenuDto,
    required: true,
  })
  @RequirePermission('system:menu:edit')
  @Put()
  update(@Body() updateMenuDto: UpdateMenuDto) {
    return this.menuService.update(updateMenuDto);
  }

  @ApiOperation({
    summary: '菜单管理-删除',
  })
  @RequirePermission('system:menu:remove')
  @Delete(':menuId')
  remove(@Param('menuId') menuId: string) {
    return this.menuService.remove(+menuId);
  }
}
