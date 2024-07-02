export const controllerTem = (options) => {
    const { BusinessName, businessName,functionName ,moduleName} = options;
    const serviceName = `${BusinessName}Service`;
    const serviceInstance = `${businessName}Service`;

    return `
    import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
    import { ${serviceName} } from './${businessName}.service';
    import { Create${BusinessName}Dto,Update${BusinessName}Dto } from './dto/${businessName}.dto';

    @Controller('${businessName}')
    export class ${BusinessName}Controller {
        constructor(private readonly ${serviceInstance}: ${serviceName}) {}
        @ApiOperation({
            summary: '${functionName}-创建',
        })
        @RequirePermission('${moduleName}:${businessName}:add')
        @Post()
        create(@Body() create${BusinessName}Dto: Create${BusinessName}Dto) {
            return this.${serviceInstance}.create(create${BusinessName}Dto);
        }
        @ApiOperation({
            summary: '${functionName}-列表',
        })
        @RequirePermission('${moduleName}:${businessName}:query')
        @Get()
        findAll() {
            return this.${serviceInstance}.findAll();
        }
        @ApiOperation({
            summary: '${functionName}-详情',
        })
        @RequirePermission('${moduleName}:${businessName}:query')
        @Get(':id')
        findOne(@Param('id') id: string) {
            return this.${serviceInstance}.findOne(+id);
        }
        @ApiOperation({
            summary: '${functionName}-修改',
        })
        @RequirePermission('${moduleName}:${businessName}:edit')
        @Put()
        update(@Body() update${BusinessName}Dto: Update${BusinessName}Dto) {
            return this.${serviceInstance}.update(update${BusinessName}Dto);
        }
        @ApiOperation({
            summary: '${functionName}-删除',
        })
        @RequirePermission('${moduleName}:${businessName}:remove')
        @Delete(':id')
        remove(@Param('id') id: string) {
            return this.${serviceInstance}.remove(+id);
        }
    }
    `;
};