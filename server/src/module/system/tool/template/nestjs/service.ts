import * as Lodash from 'lodash';
export const serviceTem = (options) => {
  const { BusinessName, primaryKey, businessName } = options;
  return `
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ResultData } from 'src/common/utils/result';
import { Create${Lodash.upperFirst(BusinessName)}Dto,Update${Lodash.upperFirst(BusinessName)}Dto,List${Lodash.upperFirst(BusinessName)}Dto } from './dto/${businessName}.dto';
import { ${Lodash.upperFirst(BusinessName)}Entity } from './entities/${businessName}.entity';

@Injectable()
export class ${Lodash.upperFirst(BusinessName)}Service {
constructor(
    @InjectRepository(${Lodash.upperFirst(BusinessName)}Entity)
    private readonly ${businessName}EntityRep: Repository<${Lodash.upperFirst(BusinessName)}Entity>,
) {}
    async create(create${Lodash.upperFirst(BusinessName)}Dto: Create${Lodash.upperFirst(BusinessName)}Dto) {
        const res = await this.${businessName}EntityRep.save(create${Lodash.upperFirst(BusinessName)}Dto);
        return ResultData.ok(res);
    }

    async findAll(query :List${Lodash.upperFirst(BusinessName)}Dto ) {
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

    async update(update${Lodash.upperFirst(BusinessName)}Dto: Update${Lodash.upperFirst(BusinessName)}Dto) {
        const res = await this.${businessName}EntityRep.update({  ${primaryKey}: update${Lodash.upperFirst(BusinessName)}Dto.${primaryKey} }, update${Lodash.upperFirst(BusinessName)}Dto);
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
}`;
};
