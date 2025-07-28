import * as Lodash from 'lodash';
export const controllerTem = (options) => {
  const { BusinessName, businessName, functionName, moduleName, primaryKey } = options;
  const serviceName = `${Lodash.upperFirst(BusinessName)}Service`;
  const serviceInstance = `${businessName}Service`;
  return `
import { Controller, Get, Post, Put, Body, Query, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { ${serviceName} } from './${businessName}.service';
import { Create${Lodash.upperFirst(BusinessName)}Dto, Base${Lodash.upperFirst(BusinessName)}Dto, Update${Lodash.upperFirst(BusinessName)}Dto, Query${Lodash.upperFirst(
    BusinessName,
  )}Dto, List${Lodash.upperFirst(BusinessName)}Dto } from './dto/${businessName}.dto';
import { ApiDataResponse } from 'src/common/decorators/apiDataResponse.decorator';

@ApiTags('${functionName}')
@Controller('${moduleName}/${businessName}')
export class ${Lodash.upperFirst(BusinessName)}Controller {
  constructor(private readonly ${serviceInstance}: ${serviceName}) {}

  @ApiOperation({ summary: '${functionName}-创建' })
  @ApiDataResponse(Base${Lodash.upperFirst(BusinessName)}Dto)
  @RequirePermission('${moduleName}:${businessName}:add')
  @Post()
  create(@Body() body: Create${Lodash.upperFirst(BusinessName)}Dto) {
    return this.${serviceInstance}.create(body);
  }

  @ApiOperation({ summary: '${functionName}-列表' })
  @ApiDataResponse(List${Lodash.upperFirst(BusinessName)}Dto, true, true)
  @RequirePermission('${moduleName}:${businessName}:list')
  @Get('list')
  findAll(@Query() query: Query${Lodash.upperFirst(BusinessName)}Dto) {
    return this.${serviceInstance}.findAll(query);
  }

  @ApiOperation({ summary: '${functionName}-详情' })
  @ApiDataResponse(Base${Lodash.upperFirst(BusinessName)}Dto)
  @RequirePermission('${moduleName}:${businessName}:query')
  @Get(':${primaryKey}')
  findOne(@Param('${primaryKey}') ${primaryKey}: string) {
    return this.${serviceInstance}.findOne(${primaryKey});
  }

  @ApiOperation({ summary: '${functionName}-修改' })
  @ApiDataResponse()
  @RequirePermission('${moduleName}:${businessName}:edit')
  @Put()
  update(@Body() body: Update${Lodash.upperFirst(BusinessName)}Dto) {
    return this.${serviceInstance}.update(body);
  }

  @ApiOperation({ summary: '${functionName}-删除' })
  @ApiDataResponse()
  @RequirePermission('${moduleName}:${businessName}:remove')
  @Delete(':${primaryKey}')
  remove(@Param('${primaryKey}') ${primaryKey}: string) {
    const ${primaryKey}s = ${primaryKey}.split(',').map((${primaryKey}) => +${primaryKey});
    return this.${serviceInstance}.remove(${primaryKey}s);
  }
}`;
};
