import { DataSource } from 'typeorm';
import { DatabaseType } from './database-config';
import { SqlTemplateBuilder } from './sql-template-builder';

export { DatabaseType } from './database-config';

export class SqlQueryManager {
	private sqlBuilder: SqlTemplateBuilder;
	private dbType: DatabaseType;

	constructor(private dataSource: DataSource) {
		this.dbType = this.getDatabaseType();
		this.sqlBuilder = new SqlTemplateBuilder(this.dbType);
	}

	private getDatabaseType(): DatabaseType {
		const dbType = this.dataSource.options.type;
		switch (dbType) {
			case 'mysql':
			case 'mariadb':
				return 'mysql';
			case 'postgres':
				return 'postgres';
			default:
				return 'mysql'; // 默认为 MySQL
		}
	}

	/**
	 * 查询数据库表列表
	 */
	async getTables(
		filters?: { tableName?: string; tableComment?: string },
		pagination?: { pageNum: number; pageSize: number }
	) {
		const { sql, countSql, params } = this.sqlBuilder.buildGetTablesQuery(filters, pagination);

		const [rows, countResult] = await Promise.all([
			this.dataSource.query(sql, params),
			this.dataSource.query(countSql, params),
		]);

		const total = Number(countResult[0]?.total || 0);

		return { rows, total };
	}

	/**
	 * 根据表名批量获取表信息
	 */
	async getTablesByNames(tableNames: string[]) {
		if (!tableNames.length) return [];

		const { sql, params } = this.sqlBuilder.buildGetTablesByNamesQuery(tableNames);
		return this.dataSource.query(sql, params);
	}

	/**
	 * 获取表字段信息
	 */
	async getTableColumns(tableName: string) {
		if (!tableName) return [];

		const { sql, params } = this.sqlBuilder.buildGetTableColumnsQuery(tableName);
		return this.dataSource.query(sql, params);
	}

	/**
	 * 获取当前数据库类型
	 */
	getCurrentDatabaseType(): DatabaseType {
		return this.dbType;
	}
}
