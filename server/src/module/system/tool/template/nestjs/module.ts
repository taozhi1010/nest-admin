import * as Lodash from 'lodash';
export const moduleTem = (options) => {
  const { BusinessName, businessName } = options;

  return `
import { Global, Module } from '@nestjs/common';
import { ${Lodash.upperFirst(BusinessName)}Service } from './${businessName}.service';
import { ${Lodash.upperFirst(BusinessName)}Controller } from './${businessName}.controller';
import { ${Lodash.upperFirst(BusinessName)}Entity } from './entities/${businessName}.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([${Lodash.upperFirst(BusinessName)}Entity])],
  controllers: [${Lodash.upperFirst(BusinessName)}Controller],
  providers: [${Lodash.upperFirst(BusinessName)}Service],
  exports: [${Lodash.upperFirst(BusinessName)}Service],
})
export class ${Lodash.upperFirst(BusinessName)}Module {}
    `;
};
