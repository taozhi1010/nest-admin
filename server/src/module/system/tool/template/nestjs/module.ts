export const moduleTem = (options)=>{
    const {BusinessName,businessName} = options

    return `
    import { Module } from '@nestjs/common';
    import { ${BusinessName}Service } from './${businessName}.service';
    import { ${BusinessName}Controller } from './${businessName}.controller';
    
    @Module({
      controllers: [${BusinessName}Controller],
      providers: [${BusinessName}Service],
    })
    export class ${BusinessName}Module {}
    `
}


