import * as Lodash from 'lodash';
export const moduleTem = (options) => {
  const { BusinessName, businessName } = options;

  return `
import { Module } from '@nestjs/common';
import { ${Lodash.upperFirst(BusinessName)}Service } from './${businessName}.service';
import { ${Lodash.upperFirst(BusinessName)}Controller } from './${businessName}.controller';
    
@Module({
  controllers: [${Lodash.upperFirst(BusinessName)}Controller],
  providers: [${Lodash.upperFirst(BusinessName)}Service],
})
export class ${Lodash.upperFirst(BusinessName)}Module {}
    `;
};
