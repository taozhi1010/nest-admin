import { RequirePermission } from '@decorators';
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeptService } from './dept.service';
import { CreateDeptDto, ListDeptDto, UpdateDeptDto } from './dto/index';

@ApiTags('部门管理')
@Controller('system/dept')
export class DeptController {
	constructor(private readonly deptService: DeptService) {}

	@ApiOperation({
		summary: '部门管理-创建',
	})
	@ApiBody({
		type: CreateDeptDto,
		required: true,
	})
	@RequirePermission('system:dept:add')
	@Post()
	@HttpCode(200)
	create(@Body() createDeptDto: CreateDeptDto) {
		return this.deptService.create(createDeptDto);
	}

	@ApiOperation({
		summary: '部门管理-列表',
	})
	@RequirePermission('system:dept:list')
	@Get('/list')
	findAll(@Query() query: ListDeptDto) {
		return this.deptService.findAll(query);
	}

	@ApiOperation({
		summary: '部门管理-详情',
	})
	@RequirePermission('system:dept:query')
	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.deptService.findOne(+id);
	}

	@ApiOperation({
		summary: '部门管理-黑名单',
	})
	@RequirePermission('system:dept:query')
	@Get('/list/exclude/:id')
	findListExclude(@Param('id') id: string) {
		return this.deptService.findListExclude(+id);
	}

	@ApiOperation({
		summary: '部门管理-更新',
	})
	@ApiBody({
		type: UpdateDeptDto,
		required: true,
	})
	@RequirePermission('system:dept:edit')
	@Put()
	update(@Body() updateDeptDto: UpdateDeptDto) {
		return this.deptService.update(updateDeptDto);
	}

	@ApiOperation({
		summary: '部门管理-删除',
	})
	@RequirePermission('system:dept:remove')
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.deptService.remove(+id);
	}
}
