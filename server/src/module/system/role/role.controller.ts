import { Controller, Get, Post, Body, Put, Param, Query, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRoleDto, ListRoleDto, ChangeStatusDto, AuthUserCancelDto, AuthUserCancelAllDto, AuthUserSelectAllDto } from './dto/index';
import { AllocatedListDto } from '../user/dto/index';

import { UserService } from '../user/user.service';
@ApiTags('角色管理')
@Controller('system/role')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService,
  ) {}

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

  @ApiOperation({
    summary: '角色管理-角色已分配用户列表',
  })
  @ApiBody({
    type: AllocatedListDto,
    required: true,
  })
  @Get('/authUser/allocatedList')
  authUserAllocatedList(@Query() query: AllocatedListDto) {
    return this.userService.allocatedList(query);
  }

  @ApiOperation({
    summary: '角色管理-角色未分配用户列表',
  })
  @ApiBody({
    type: AllocatedListDto,
    required: true,
  })
  @Get('/authUser/unallocatedList')
  authUserUnAllocatedList(@Query() query: AllocatedListDto) {
    return this.userService.unallocatedList(query);
  }

  @ApiOperation({
    summary: '角色管理-解绑角色',
  })
  @ApiBody({
    type: AuthUserCancelDto,
    required: true,
  })
  @Put('/authUser/cancel')
  authUserCancel(@Body() body: AuthUserCancelDto) {
    return this.userService.authUserCancel(body);
  }

  @ApiOperation({
    summary: '角色管理-批量解绑角色',
  })
  @ApiBody({
    type: AuthUserCancelAllDto,
    required: true,
  })
  @Put('/authUser/cancelAll')
  authUserCancelAll(@Body() body: AuthUserCancelAllDto) {
    return this.userService.authUserCancelAll(body);
  }

  @ApiOperation({
    summary: '角色管理-批量绑定角色',
  })
  @ApiBody({
    type: AuthUserSelectAllDto,
    required: true,
  })
  @Put('/authUser/selectAll')
  authUserSelectAll(@Body() body: AuthUserSelectAllDto) {
    return this.userService.authUserSelectAll(body);
  }
}
