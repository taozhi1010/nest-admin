import { Controller, Get, Post, Body, Put, Param, Query, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto, ListRoleDto, ChangeStatusDto } from './dto/index';

@ApiTags('角色管理')
@Controller('system/role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({
    summary: '角色管理-创建',
  })
  @ApiBody({
    type: CreateRoleDto,
    required: true,
  })
  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @ApiOperation({
    summary: '角色管理-列表',
  })
  @ApiBody({
    type: ListRoleDto,
    required: true,
  })
  @Get('/list')
  findAll(@Query() query: ListRoleDto) {
    return this.roleService.findAll(query);
  }

  @ApiOperation({
    summary: '角色管理-部门树',
  })
  @Get('/deptTree/:id')
  deptTree(@Param('id') id: string) {
    return this.roleService.deptTree(+id);
  }

  @ApiOperation({
    summary: '角色管理-详情',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @ApiOperation({
    summary: '角色管理-修改',
  })
  @ApiBody({
    type: UpdateRoleDto,
    required: true,
  })
  @Put()
  update(@Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(updateRoleDto);
  }

  @ApiOperation({
    summary: '角色管理-数据权限修改',
  })
  @ApiBody({
    type: UpdateRoleDto,
    required: true,
  })
  @Put('/dataScope')
  dataScope(@Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.dataScope(updateRoleDto);
  }

  @ApiOperation({
    summary: '角色管理-停用角色',
  })
  @ApiBody({
    type: ChangeStatusDto,
    required: true,
  })
  @Put('/changeStatus')
  changeStatus(@Body() changeStatusDto: ChangeStatusDto) {
    return this.roleService.changeStatus(changeStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') ids: string) {
    const menuIds = ids.split(',').map((id) => +id);
    return this.roleService.remove(menuIds);
  }
}
