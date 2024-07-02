

export const serviceTem = (options)=>{
    const { BusinessName,primaryKey,businessName } = options;
    return `
    import { Injectable } from '@nestjs/common';
    import { ResultData } from 'src/common/utils/result';
    import { Create${BusinessName}Dto,Create${BusinessName}Dto,List${BusinessName}Dto } from './dto/${businessName}.dto';
    import { ${BusinessName}Entity } from './entities/${businessName}.entity';
    @Injectable()
    export class ${BusinessName}Service {
        constructor(
            @InjectRepository(${BusinessName}Entity)
            private readonly ${businessName}EntityRep: Repository<${BusinessName}Entity>,
          ) {}
        async create(create${BusinessName}Dto: Create${BusinessName}Dto) {
            const res = await this.${businessName}EntityRep.save(create${BusinessName}Dto);
            return ResultData.ok(res);
        }
        async findAll(query :List${BusinessName}Dto ) {
            const entity = this.${businessName}EntityRep.createQueryBuilder('entity');
            entity.where('entity.delFlag = :delFlag', { delFlag: '0' });
            entity.skip(query.pageSize * (query.pageNum - 1)).take(query.pageSize);
            const [list, total] = await entity.getManyAndCount();
        
            return ResultData.ok({
              list,
              total,
            });
        }
        async findOne(id: number) {
            const res = await this.${businessName}EntityRep.findOne({
                where: {
                  delFlag: '0',
                  ${primaryKey}: id,
                },
              });
              return ResultData.ok(res);
        }
        async update(update${BusinessName}Dto: Update${BusinessName}Dto) {
            const res = await this.${businessName}EntityRep.update({  ${primaryKey}: update${BusinessName}Dto.${primaryKey} }, update${BusinessName}Dto);
            return ResultData.ok(res);
        }
        async remove(id: number) {
            const data = await this.${businessName}EntityRep.update(
                { ${primaryKey}: id },
                {
                  delFlag: '1',
                },
              );
              return ResultData.ok(data);
        }
    `
}
