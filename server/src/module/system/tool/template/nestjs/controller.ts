import * as Lodash from 'lodash';
export const controllerTem = (options) => {
  const { BusinessName, businessName, functionName, moduleName } = options;
  const serviceName = `${Lodash.upperFirst(BusinessName)}Service`;
  const serviceInstance = `${businessName}Service`;
  return `
import { Controller, Get, Post, Put, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { ${serviceName} } from './${businessName}.service';
import { Create${Lodash.upperFirst(BusinessName)}Dto, Update${Lodash.upperFirst(BusinessName)}Dto, List${Lodash.upperFirst(BusinessName)}Dto } from './dto/${businessName}.dto';

@Controller('${businessName}')
export class ${Lodash.upperFirst(BusinessName)}Controller {
constructor(private readonly ${serviceInstance}: ${serviceName}) {}
    @ApiOperation({
        summary: '${functionName}-创建',
    })
    @RequirePermission('${moduleName}:${businessName}:add')
    @Post()
    create(@Body() create${Lodash.upperFirst(BusinessName)}Dto: Create${Lodash.upperFirst(BusinessName)}Dto) {
        return this.${serviceInstance}.create(create${Lodash.upperFirst(BusinessName)}Dto);
    }\n
    @ApiOperation({
        summary: '${functionName}-列表',
    })
    @RequirePermission('${moduleName}:${businessName}:list')
    @Get()
    findAll(@Body() list${Lodash.upperFirst(BusinessName)}Dto: List${Lodash.upperFirst(BusinessName)}Dto) {
        return this.${serviceInstance}.findAll(list${Lodash.upperFirst(BusinessName)}Dto);
    }\n
    @ApiOperation({
        summary: '${functionName}-详情',
    })
    @RequirePermission('${moduleName}:${businessName}:query')
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.${serviceInstance}.findOne(+id);
    }\n
    @ApiOperation({
        summary: '${functionName}-修改',
    })
    @RequirePermission('${moduleName}:${businessName}:edit')
    @Put()
    update(@Body() update${Lodash.upperFirst(BusinessName)}Dto: Update${Lodash.upperFirst(BusinessName)}Dto) {
        return this.${serviceInstance}.update(update${Lodash.upperFirst(BusinessName)}Dto);
    }\n
    @ApiOperation({
        summary: '${functionName}-删除',
    })
    @RequirePermission('${moduleName}:${businessName}:remove')
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.${serviceInstance}.remove(+id);
    }
}`;
};
