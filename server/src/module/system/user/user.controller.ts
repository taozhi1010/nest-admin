import { Controller, Get, Post, Body, Put, Param, Query, Res, Delete, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiConsumes, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { Response } from 'express';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { RequireRole } from 'src/common/decorators/require-role.decorator';
import { UploadService } from 'src/module/upload/upload.service';
import { CreateUserDto, UpdateUserDto, ListUserDto, ChangeStatusDto, ResetPwdDto, UpdateProfileDto, UpdatePwdDto } from './dto/index';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResultData } from 'src/common/utils/result';
import { User, UserDto, UserTool, UserToolType } from 'src/module/system/user/user.decorator';
import { BusinessType } from 'src/common/constant/business.constant';
import { Operlog } from 'src/common/decorators/operlog.decorator';

@ApiTags('用户管理')
@Controller('system/user')
@ApiBearerAuth('Authorization')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadService: UploadService,
  ) {}

  @ApiOperation({
    summary: '个人中心-用户信息',
  })
  @RequirePermission('system:user:query')
  @Get('/profile')
  profile(@User() user: UserDto) {
    return ResultData.ok(user.user);
  }

  @ApiOperation({
    summary: '个人中心-修改用户信息',
  })
  @RequirePermission('system:user:edit')
  @Put('/profile')
  @Operlog({ businessType: BusinessType.UPDATE })
  updateProfile(@User() user: UserDto, @Body() updateProfileDto: UpdateProfileDto) {
    return this.userService.updateProfile(user, updateProfileDto);
  }

  @ApiOperation({
    summary: '个人中心-上传用户头像',
  })
  @RequirePermission('system:user:edit')
  @Post('/profile/avatar')
  @UseInterceptors(FileInterceptor('avatarfile'))
  async avatar(@UploadedFile() avatarfile: Express.Multer.File, @User() user: UserDto) {
    const res = await this.uploadService.singleFileUpload(avatarfile);
    return ResultData.ok({ imgUrl: res.fileName });
  }

  @ApiOperation({
    summary: '个人中心-修改密码',
  })
  @RequirePermission('system:user:edit')
  @Operlog({ businessType: BusinessType.UPDATE })
  @Put('/profile/updatePwd')
  updatePwd(@User() user: UserDto, @Body() updatePwdDto: UpdatePwdDto) {
    return this.userService.updatePwd(user, updatePwdDto);
  }

  @ApiOperation({
    summary: '用户-创建',
  })
  @ApiBody({
    type: CreateUserDto,
    required: true,
  })
  @RequirePermission('system:user:add')
  @Post()
  create(@Body() createUserDto: CreateUserDto, @UserTool() { injectCreate }: UserToolType) {
    return this.userService.create(injectCreate(createUserDto));
  }

  @ApiOperation({
    summary: '用户-列表',
  })
  @RequirePermission('system:user:list')
  @Get('list')
  findAll(@Query() query: ListUserDto, @User() user: UserDto) {
    return this.userService.findAll(query, user.user);
  }

  @ApiOperation({
    summary: '用户-部门树',
  })
  @RequirePermission('system:dept:query')
  @Get('deptTree')
  deptTree() {
    return this.userService.deptTree();
  }

  @ApiOperation({
    summary: '用户-角色+岗位',
  })
  @RequirePermission('system:user:add')
  @Get()
  findPostAndRoleAll() {
    return this.userService.findPostAndRoleAll();
  }

  @ApiOperation({
    summary: '用户-分配角色-详情',
  })
  @RequireRole('admin')
  @Get('authRole/:id')
  authRole(@Param('id') id: string) {
    return this.userService.authRole(+id);
  }

  @ApiOperation({
    summary: '用户-角色信息-更新',
  })
  @RequireRole('admin')
  @Put('authRole')
  updateAuthRole(@Query() query) {
    return this.userService.updateAuthRole(query);
  }

  @ApiOperation({
    summary: '用户-详情',
  })
  @RequirePermission('system:user:query')
  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.userService.findOne(+userId);
  }

  @ApiOperation({
    summary: '用户-停用角色',
  })
  @ApiBody({
    type: ChangeStatusDto,
    required: true,
  })
  @RequireRole('admin')
  @Put('changeStatus')
  changeStatus(@Body() changeStatusDto: ChangeStatusDto) {
    return this.userService.changeStatus(changeStatusDto);
  }

  @ApiOperation({
    summary: '用户-更新',
  })
  @ApiBody({
    type: UpdateUserDto,
    required: true,
  })
  @RequirePermission('system:user:edit')
  @Put()
  async update(@Body() updateUserDto: UpdateUserDto, @User() user: UserDto) {
    const activeUserId = user.userId;
    // const uuid = user.token;
    const result = await this.userService.update(updateUserDto, activeUserId);
    // await this.userService.updateRedisUserRolesAndPermissions(uuid, updateUserDto.userId);
    return result;
  }

  @ApiOperation({
    summary: '用户-重置密码',
  })
  @ApiBody({
    type: ResetPwdDto,
    required: true,
  })
  @RequireRole('admin')
  @Put('resetPwd')
  resetPwd(@Body() body: ResetPwdDto) {
    return this.userService.resetPwd(body);
  }

  @ApiOperation({
    summary: '用户-删除',
  })
  @RequireRole('admin')
  @Delete(':id')
  remove(@Param('id') ids: string) {
    const menuIds = ids.split(',').map((id) => +id);
    return this.userService.remove(menuIds);
  }

  @ApiOperation({ summary: '导出用户信息数据为xlsx' })
  @RequirePermission('system:user:export')
  @Post('/export')
  async export(@Res() res: Response, @Body() body: ListUserDto, @User() user: UserDto): Promise<void> {
    return this.userService.export(res, body, user.user);
  }
}
