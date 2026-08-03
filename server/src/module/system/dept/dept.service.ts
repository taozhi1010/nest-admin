import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ResultData } from 'src/common/utils/result';
import { SysDeptEntity } from './entities/dept.entity';
import { CreateDeptDto, UpdateDeptDto, ListDeptDto } from './dto/index';
import { ListToTree } from 'src/common/utils/index';
import { CacheEnum, DataScopeEnum } from 'src/common/enum/index';
import { Cacheable, CacheEvict } from 'src/common/decorators/redis.decorator';

@Injectable()
export class DeptService {
  private readonly logger = new Logger(DeptService.name);

  constructor(
    @InjectRepository(SysDeptEntity)
    private readonly sysDeptEntityRep: Repository<SysDeptEntity>,
  ) {}

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async create(createDeptDto: CreateDeptDto) {
    if (createDeptDto.parentId) {
      const parent = await this.sysDeptEntityRep.findOne({
        where: {
          deptId: createDeptDto.parentId,
          delFlag: '0',
        },
        select: ['ancestors'],
      });
      if (!parent) {
        return ResultData.fail(500, '父级部门不存在');
      }
      const ancestors = parent.ancestors ? `${parent.ancestors},${createDeptDto.parentId}` : `${createDeptDto.parentId}`;
      Object.assign(createDeptDto, { ancestors: ancestors });
    }
    await this.sysDeptEntityRep.save(createDeptDto);
    return ResultData.ok();
  }

  async findAll(query: ListDeptDto) {
    const entity = this.sysDeptEntityRep.createQueryBuilder('entity');
    entity.where('entity.delFlag = :delFlag', { delFlag: '0' });

    if (query.deptName) {
      entity.andWhere('entity.deptName LIKE :deptName', { deptName: `%${query.deptName}%` });
    }
    if (query.status) {
      entity.andWhere('entity.status = :status', { status: query.status });
    }
    const res = await entity.getMany();
    return ResultData.ok(res);
  }

  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'findOne:{0}')
  async findOne(deptId: number) {
    const data = await this.sysDeptEntityRep.findOne({
      where: {
        deptId: deptId,
        delFlag: '0',
      },
    });
    return ResultData.ok(data);
  }

  /**
   * 根据数据权限范围和部门ID查询部门ID列表。
   * @param deptId 部门ID，表示需要查询的部门。
   * @param dataScope 数据权限范围，决定查询的部门范围。
   * @returns 返回一个部门ID数组，根据数据权限范围决定返回的部门ID集合。
   */
  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'findDeptIdsByDataScope:{0}-{1}')
  async findDeptIdsByDataScope(deptId: number, dataScope: DataScopeEnum) {
    try {
      // 创建部门实体的查询构建器
      const entity = this.sysDeptEntityRep.createQueryBuilder('dept');
      // 筛选出删除标志为未删除的部门
      entity.where('dept.delFlag = :delFlag', { delFlag: '0' });

      // 根据不同的数据权限范围添加不同的查询条件
      if (dataScope === DataScopeEnum.DATA_SCOPE_DEPT) {
        // 如果是本部门数据权限，则只查询指定部门
        this.addQueryForDeptDataScope(entity, deptId);
      } else if (dataScope === DataScopeEnum.DATA_SCOPE_DEPT_AND_CHILD) {
        // 如果是本部门及子部门数据权限，则查询指定部门及其所有子部门
        this.addQueryForDeptAndChildDataScope(entity, deptId);
      } else if (dataScope === DataScopeEnum.DATA_SCOPE_SELF) {
        // 如果是仅本人数据权限，则不查询任何部门，直接返回空数组
        return [];
      }
      // 执行查询并获取结果
      const list = await entity.getMany();
      // 将查询结果映射为部门ID数组后返回
      return list.map((item) => item.deptId);
    } catch (error) {
      // 保留原始错误堆栈，便于排查
      this.logger.error(`查询部门ID失败: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 添加查询条件以适应本部门数据权限范围。
   * @param queryBuilder 查询构建器实例
   * @param deptId 部门ID
   */
  private addQueryForDeptDataScope(queryBuilder: SelectQueryBuilder<any>, deptId: number) {
    queryBuilder.andWhere('dept.deptId = :deptId', { deptId: deptId });
  }

  /**
   * 添加查询条件以适应本部门及子部门数据权限范围。
   * @param queryBuilder 查询构建器实例
   * @param deptId 部门ID
   */
  private addQueryForDeptAndChildDataScope(queryBuilder: SelectQueryBuilder<any>, deptId: number) {
    // 使用 FIND_IN_SET 精确匹配 ancestors 中的 deptId，避免 LIKE '%1%' 匹配到 10/11/21 等
    // ancestors 格式为 "0,100,101" 逗号分隔的父级链
    queryBuilder.andWhere('FIND_IN_SET(:deptId, dept.ancestors) > 0', { deptId: deptId }).orWhere('dept.deptId = :deptId', { deptId: deptId });
  }

  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'findListExclude')
  async findListExclude(id: number) {
    // 排除指定部门及其所有子部门（ancestors 中包含 id 的记录），
    // 用于编辑部门时避免将自己或子部门设为父级造成循环引用
    const data = await this.sysDeptEntityRep
      .createQueryBuilder('dept')
      .where('dept.delFlag = :delFlag', { delFlag: '0' })
      .andWhere('dept.deptId != :id', { id })
      .andWhere('(FIND_IN_SET(:id, dept.ancestors) = 0 OR dept.ancestors IS NULL)', { id })
      .getMany();
    return ResultData.ok(data);
  }

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async update(updateDeptDto: UpdateDeptDto) {
    if (updateDeptDto.parentId && updateDeptDto.parentId !== 0) {
      const parent = await this.sysDeptEntityRep.findOne({
        where: {
          deptId: updateDeptDto.parentId,
          delFlag: '0',
        },
        select: ['ancestors'],
      });
      if (!parent) {
        return ResultData.fail(500, '父级部门不存在');
      }
      const ancestors = parent.ancestors ? `${parent.ancestors},${updateDeptDto.parentId}` : `${updateDeptDto.parentId}`;
      Object.assign(updateDeptDto, { ancestors: ancestors });
    }
    await this.sysDeptEntityRep.update({ deptId: updateDeptDto.deptId }, updateDeptDto);
    return ResultData.ok();
  }

  @CacheEvict(CacheEnum.SYS_DEPT_KEY, '*')
  async remove(deptId: number) {
    // 检查是否存在子部门，避免软删除后形成孤儿数据
    const childCount = await this.sysDeptEntityRep.count({
      where: { parentId: deptId, delFlag: '0' },
    });
    if (childCount > 0) {
      return ResultData.fail(500, '存在子部门，不允许删除');
    }
    const data = await this.sysDeptEntityRep.update(
      { deptId: deptId },
      {
        delFlag: '1',
      },
    );
    return ResultData.ok(data);
  }

  /**
   * 部门树
   * @returns
   */
  @Cacheable(CacheEnum.SYS_DEPT_KEY, 'deptTree')
  async deptTree() {
    const res = await this.sysDeptEntityRep.find({
      where: {
        delFlag: '0',
      },
    });
    const tree = ListToTree(
      res,
      (m) => m.deptId,
      (m) => m.deptName,
    );
    return tree;
  }
}
