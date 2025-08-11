import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name)
  private readonly dbType: string

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    // 判断数据库类型
    this.dbType = this.dataSource.options.type as string
    this.logger.log(`当前数据库类型: ${this.dbType}`)
  }

  async onModuleInit() {
    // 在应用启动时初始化种子数据
    await this.initSeedData()
  }

  /**
   * 初始化种子数据
   */
  async initSeedData() {
    try {
      // 检查是否需要初始化数据
      const needInit = await this.checkIfNeedInit()
      if (!needInit) {
        this.logger.log('数据库已初始化，跳过种子数据导入')
        return
      }

      this.logger.log(`开始初始化种子数据 (${this.dbType})`)

      // 创建必要的表结构
      await this.createBaseTables()

      // 执行种子数据插入
      await this.insertSeedData()

      this.logger.log('种子数据初始化完成')
    }
    catch (error) {
      this.logger.error('初始化种子数据失败', error)
      throw error
    }
  }

  /**
   * 检查是否需要初始化数据库
   * 通过检查sys_user表中是否有数据来判断
   */
  private async checkIfNeedInit(): Promise<boolean> {
    try {
      // 检查sys_user表是否存在
      const tableExists = await this.checkTableExists('sys_user')
      if (!tableExists) {
        return true
      }

      // 检查sys_user表中是否有数据
      const userCount = await this.dataSource.query('SELECT COUNT(*) as count FROM sys_user')
      return userCount[0].count === '0' || userCount[0].count === 0
    }
    catch (error) {
      // 如果出错，可能是表不存在，返回true表示需要初始化
      return true
    }
  }

  /**
   * 检查表是否存在
   */
  private async checkTableExists(tableName: string): Promise<boolean> {
    try {
      if (this.dbType === 'postgres') {
        // PostgreSQL检查表是否存在
        const result = await this.dataSource.query(
          `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `,
          [tableName],
        )
        return result[0].exists
      }
      else if (this.dbType === 'mysql') {
        // MySQL检查表是否存在
        const result = await this.dataSource.query(
          `
          SELECT COUNT(*) as count 
          FROM information_schema.tables 
          WHERE table_schema = DATABASE() 
          AND table_name = ?
        `,
          [tableName],
        )
        return result[0].count > 0
      }
      return false
    }
    catch (error) {
      return false
    }
  }

  /**
   * 读取SQL文件内容
   */
  private readSqlFile(dbType: string, module: string): string {
    const sqlPath = join(process.cwd(), 'sql', dbType, `${module}.sql`)
    try {
      return readFileSync(sqlPath, 'utf8')
    }
    catch (error) {
      this.logger.error(`读取SQL文件失败: ${sqlPath}`, error)
      throw new Error(`无法读取SQL文件: ${sqlPath}`)
    }
  }

  /**
   * 读取数据SQL文件内容
   */
  private readDataSqlFile(fileName: string): string {
    // 根据数据库类型选择正确的路径
    const dbType = this.dbType === 'postgres' ? 'postgres' : 'mysql'
    const sqlPath = join(process.cwd(), 'sql', dbType, 'data', `${fileName}.sql`)

    try {
      let sql = readFileSync(sqlPath, 'utf8')

      // 针对PostgreSQL进行SQL语句兼容性转换（现在主要是处理标识符）
      if (this.dbType === 'postgres') {
        sql = this.convertSqlForPostgres(sql)
      }

      return sql
    }
    catch (error) {
      // 尝试备用路径
      const fallbackPath = join(process.cwd(), 'sql', 'data', `${fileName}.sql`)
      try {
        let sql = readFileSync(fallbackPath, 'utf8')
        if (this.dbType === 'postgres') {
          sql = this.convertSqlForPostgres(sql)
        }
        return sql
      }
      catch (fallbackError) {
        throw new Error(`无法读取数据SQL文件: ${fileName}.sql`)
      }
    }
  }

  /**
   * 将SQL语句转换为PostgreSQL兼容格式
   */
  private convertSqlForPostgres(sql: string): string {
    // 处理 MySQL 特有的反引号标识符，转换为PostgreSQL的双引号
    sql = sql.replace(/`([^`]+)`/g, '"$1"')

    // 移除MySQL特有的语句（如果存在）
    sql = sql.replace(/ENGINE\s*=\s*\w+/gi, '')
    sql = sql.replace(/AUTO_INCREMENT/gi, '')
    sql = sql.replace(/DEFAULT\s+CHARSET\s*=\s*\w+/gi, '')

    return sql
  }

  /**
   * 执行SQL语句
   */
  private async executeSqlStatements(sql: string, description: string): Promise<void> {
    try {
      // 直接执行整个SQL文件
      await this.dataSource.query(sql)
    }
    catch (error) {
      this.logger.error(`${description} 执行失败`, error)
      throw error
    }
  }

  /**
   * 创建基本表结构
   */
  private async createBaseTables(): Promise<void> {
    const dbType = this.dbType === 'postgres' ? 'postgres' : 'mysql'

    // 表结构创建顺序
    const tableModules = [
      '01_system_tables',
      '02_monitor_tables',
      '03_config_tables',
      '04_tool_tables',
    ]

    for (const module of tableModules) {
      const sql = this.readSqlFile(dbType, module)
      await this.executeSqlStatements(sql, module)
    }
  }

  /**
   * 插入种子数据
   */
  private async insertSeedData(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 检查表中是否已有数据的通用方法
      const checkAndInsert = async (
        tableName: string,
        dataFileName: string,
        description: string,
      ) => {
        const count = await manager.query(`SELECT COUNT(*) as count FROM ${tableName}`)
        if (count[0].count === '0' || count[0].count === 0) {
          const sql = this.readDataSqlFile(dataFileName)
          await manager.query(sql)
          this.logger.log(`${description} 完成`)
        }
      }

      // 按顺序插入数据
      await checkAndInsert('sys_dept', '01_system_data', '系统基础数据')
      await checkAndInsert('sys_menu', '02_menu_data', '菜单数据')

      // 检查权限按钮数据
      const buttonCount = await manager.query(
        `SELECT COUNT(*) as count FROM sys_menu WHERE menu_type = 'F'`,
      )
      if (buttonCount[0].count === '0' || buttonCount[0].count === 0) {
        const sql = this.readDataSqlFile('03_permission_data')
        await manager.query(sql)
        this.logger.log('权限按钮数据 完成')
      }

      await checkAndInsert('sys_role_menu', '04_role_menu_data', '角色菜单关联数据')
      await checkAndInsert('sys_dict_type', '05_config_data', '配置数据')

      // 检查是否需要插入补充样例数据
      const userCount = await manager.query(
        `SELECT COUNT(*) as count FROM sys_user WHERE user_id > 2`,
      )
      if (userCount[0].count === '0' || userCount[0].count === 0) {
        const sql = this.readDataSqlFile('08_sample_data')
        await manager.query(sql)
        this.logger.log('补充样例数据 完成')
      }
    })
  }

  /**
   * 手动触发种子数据初始化
   */
  async manualInitSeedData() {
    this.logger.log('手动触发种子数据初始化...')
    await this.initSeedData()
    return { message: '种子数据初始化完成' }
  }

  /**
   * 强制重置数据库并重新初始化
   * 警告：此操作会清空所有数据
   */
  async forceResetDatabase() {
    this.logger.warn('强制重置数据库操作被触发，即将清空所有数据...')

    try {
      // 获取所有表名
      let tables: string[] = []

      if (this.dbType === 'postgres') {
        const result = await this.dataSource.query(`
          SELECT tablename FROM pg_tables WHERE schemaname = 'public'
        `)
        tables = result.map(row => row.tablename)
      }
      else if (this.dbType === 'mysql') {
        const result = await this.dataSource.query(`
          SELECT table_name FROM information_schema.tables 
          WHERE table_schema = DATABASE()
        `)
        tables = result.map(row => row.table_name)
      }

      // 开始事务
      await this.dataSource.transaction(async (manager) => {
        // 禁用外键约束
        if (this.dbType === 'postgres') {
          await manager.query('SET session_replication_role = replica;')
        }
        else if (this.dbType === 'mysql') {
          await manager.query('SET FOREIGN_KEY_CHECKS = 0;')
        }

        // 清空所有表
        for (const tableName of tables) {
          try {
            if (this.dbType === 'postgres') {
              await manager.query(`TRUNCATE TABLE "${tableName}" CASCADE;`)
            }
            else if (this.dbType === 'mysql') {
              await manager.query(`TRUNCATE TABLE ${tableName};`)
            }
            this.logger.log(`已清空表: ${tableName}`)
          }
          catch (error) {
            this.logger.error(`清空表 ${tableName} 时出错`, error)
          }
        }

        // 重新启用外键约束
        if (this.dbType === 'postgres') {
          await manager.query('SET session_replication_role = DEFAULT;')
        }
        else if (this.dbType === 'mysql') {
          await manager.query('SET FOREIGN_KEY_CHECKS = 1;')
        }
      })

      // 重新初始化数据
      await this.initSeedData()

      return { message: '数据库已重置并重新初始化' }
    }
    catch (error) {
      this.logger.error('强制重置数据库失败', error)
      throw error
    }
  }
}
