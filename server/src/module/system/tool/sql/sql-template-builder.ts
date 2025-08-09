import { DATABASE_CONFIG, DatabaseType } from './database-config';

export interface SqlTemplate {
	sql: string;
	params: any[];
}

export class SqlTemplateBuilder {
	constructor(private dbType: DatabaseType) {}

	private get config() {
		return DATABASE_CONFIG[this.dbType];
	}

	/**
	 * 构建获取表列表的SQL
	 */
	buildGetTablesQuery(
		filters?: { tableName?: string; tableComment?: string },
		pagination?: { pageNum: number; pageSize: number }
	): { sql: string; countSql: string; params: any[] } {
		const params: any[] = [];
		let paramIndex = 1;

		// 基础查询部分
		const baseConditions = this.buildBaseTableConditions();

		// 构建WHERE条件
		const whereConditions: string[] = [];

		if (filters?.tableName) {
			const paramPlaceholder = this.config.paramPlaceholder(paramIndex++);
			whereConditions.push(this.buildTableNameFilter(paramPlaceholder));
			params.push(this.dbType === 'postgres' ? `%${filters.tableName}%` : filters.tableName);
		}

		if (filters?.tableComment) {
			const paramPlaceholder = this.config.paramPlaceholder(paramIndex++);
			whereConditions.push(this.buildTableCommentFilter(paramPlaceholder));
			params.push(this.dbType === 'postgres' ? `%${filters.tableComment}%` : filters.tableComment);
		}

		const whereClause = whereConditions.length > 0 ? ` AND ${whereConditions.join(' AND ')}` : '';

		// 构建主查询
		const selectFields = this.buildTableSelectFields();
		const fromClause = this.buildTableFromClause();
		const orderClause = this.buildTableOrderClause();
		const paginationClause = pagination
			? ` ${this.config.pagination(pagination.pageNum, pagination.pageSize)}`
			: '';

		const sql = `
      SELECT ${selectFields}
      ${fromClause}
      ${baseConditions}${whereClause}
      ${orderClause}${paginationClause}
    `.trim();

		// 构建计数查询
		const countSql = `
      SELECT COUNT(*) AS total
      ${fromClause}
      ${baseConditions}${whereClause}
    `.trim();

		return { sql, countSql, params };
	}

	/**
	 * 构建根据表名获取表信息的SQL
	 */
	buildGetTablesByNamesQuery(tableNames: string[]): SqlTemplate {
		const placeholders = tableNames
			.map((_, index) => this.config.paramPlaceholder(index + 1))
			.join(', ');

		const selectFields = this.buildTableSelectFields();
		const fromClause = this.buildTableFromClause();
		const baseConditions = this.buildBaseTableConditions();

		const sql = `
      SELECT ${selectFields}
      ${fromClause}
      ${baseConditions}
      AND ${this.getTableNameField()} IN (${placeholders})
    `.trim();

		return { sql, params: tableNames };
	}

	/**
	 * 构建获取表字段信息的SQL
	 */
	buildGetTableColumnsQuery(tableName: string): SqlTemplate {
		if (this.dbType === 'mysql') {
			return this.buildMySQLColumnsQuery(tableName);
		} else {
			return this.buildPostgreSQLColumnsQuery(tableName);
		}
	}

	private buildMySQLColumnsQuery(tableName: string): SqlTemplate {
		const sql = `
      SELECT 
        column_name AS columnName,
        (CASE WHEN (is_nullable = 'no' AND column_key != 'PRI') THEN '1' ELSE '0' END) AS isRequired,
        (CASE WHEN column_key = 'PRI' THEN '1' ELSE '0' END) AS isPk,
        ordinal_position AS sort, 
        ${this.config.columnCommentField} AS columnComment, 
        (CASE WHEN ${this.config.isAutoIncrement} THEN '1' ELSE '0' END) AS isIncrement, 
        ${this.config.columnTypeExtract} AS columnType
      FROM information_schema.columns 
      WHERE table_schema = ${this.config.getCurrentSchema}
      AND table_name = ?
      ORDER BY ordinal_position
    `.trim();

		return { sql, params: [tableName] };
	}

	private buildPostgreSQLColumnsQuery(tableName: string): SqlTemplate {
		const sql = `
      SELECT 
        c.column_name AS "columnName",
        (CASE WHEN (c.is_nullable = 'NO' AND NOT EXISTS (
          SELECT 1 FROM information_schema.key_column_usage k 
          WHERE k.table_schema = c.table_schema 
          AND k.table_name = c.table_name 
          AND k.column_name = c.column_name
          AND k.constraint_name IN (
            SELECT constraint_name FROM information_schema.table_constraints tc
            WHERE tc.table_schema = k.table_schema 
            AND tc.table_name = k.table_name 
            AND tc.constraint_type = 'PRIMARY KEY'
          )
        )) THEN '1' ELSE '0' END) AS "isRequired",
        (CASE WHEN EXISTS (
          SELECT 1 FROM information_schema.key_column_usage k 
          WHERE k.table_schema = c.table_schema 
          AND k.table_name = c.table_name 
          AND k.column_name = c.column_name
          AND k.constraint_name IN (
            SELECT constraint_name FROM information_schema.table_constraints tc
            WHERE tc.table_schema = k.table_schema 
            AND tc.table_name = k.table_name 
            AND tc.constraint_type = 'PRIMARY KEY'
          )
        ) THEN '1' ELSE '0' END) AS "isPk",
        c.ordinal_position AS "sort",
        ${this.config.columnCommentField} AS "columnComment",
        (CASE WHEN ${this.config.isAutoIncrement} THEN '1' ELSE '0' END) AS "isIncrement",
        c.${this.config.columnTypeExtract} AS "columnType"
      FROM information_schema.columns c
      LEFT JOIN pg_catalog.pg_description d ON d.objoid = (
        SELECT cl.oid FROM pg_catalog.pg_class cl 
        WHERE cl.relname = c.table_name AND cl.relnamespace = (
          SELECT n.oid FROM pg_catalog.pg_namespace n WHERE n.nspname = c.table_schema
        )
      ) AND d.objsubid = c.ordinal_position
      WHERE c.table_schema = ${this.config.getCurrentSchema}
      AND c.table_name = $1
      ORDER BY c.ordinal_position
    `.trim();

		return { sql, params: [tableName] };
	}

	private buildBaseTableConditions(): string {
		const schemaCondition = `table_schema = ${this.config.getCurrentSchema}`;
		const excludeConditions = [
			"table_name NOT LIKE 'qrtz_%'",
			"table_name NOT LIKE 'gen_%'",
			"table_name NOT IN (SELECT table_name FROM gen_table WHERE del_flag = '0')",
		];

		if (this.dbType === 'postgres') {
			excludeConditions.unshift("table_type = 'BASE TABLE'");
		}

		return `WHERE ${schemaCondition} AND ${excludeConditions.join(' AND ')}`;
	}

	private buildTableSelectFields(): string {
		const tableName = this.getTableNameField();
		const tableComment = this.config.tableCommentField;
		const createTime = this.config.createTimeField;
		const updateTime = this.config.updateTimeField;

		if (this.dbType === 'postgres') {
			// PostgreSQL 需要使用双引号来保持别名的大小写
			return `
        ${tableName} AS "tableName",
        ${tableComment} AS "tableComment",
        ${createTime} AS "createTime",
        ${updateTime} AS "updateTime"
      `.trim();
		} else {
			return `
        ${tableName} AS tableName,
        ${tableComment} AS tableComment,
        ${createTime} AS createTime,
        ${updateTime} AS updateTime
      `.trim();
		}
	}

	private buildTableFromClause(): string {
		if (this.dbType === 'mysql') {
			return 'FROM information_schema.tables';
		} else {
			return `
        FROM information_schema.tables t
        LEFT JOIN pg_catalog.pg_description d ON d.objoid = (
          SELECT c.oid FROM pg_catalog.pg_class c 
          WHERE c.relname = t.table_name AND c.relnamespace = (
            SELECT n.oid FROM pg_catalog.pg_namespace n WHERE n.nspname = t.table_schema
          )
        ) AND d.objsubid = 0
      `.trim();
		}
	}

	private buildTableOrderClause(): string {
		if (this.dbType === 'mysql') {
			return 'ORDER BY create_time DESC, update_time DESC';
		} else {
			return 'ORDER BY table_name';
		}
	}

	private buildTableNameFilter(paramPlaceholder: string): string {
		const tableNameField = this.getTableNameField();
		if (this.dbType === 'mysql') {
			return this.config.like(tableNameField, paramPlaceholder);
		} else {
			return `${tableNameField} LIKE ${paramPlaceholder}`;
		}
	}

	private buildTableCommentFilter(paramPlaceholder: string): string {
		const tableCommentField = this.config.tableCommentField;
		if (this.dbType === 'mysql') {
			return this.config.like(tableCommentField, paramPlaceholder);
		} else {
			return `${tableCommentField} LIKE ${paramPlaceholder}`;
		}
	}

	private getTableNameField(): string {
		return this.dbType === 'postgres' ? 't.table_name' : 'table_name';
	}
}
