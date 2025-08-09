import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermission } from 'src/common/decorators/require-premission.decorator';
import { NotRequireAuth } from '../user/user.decorator';
import { SeedService } from './seed.service';

@ApiTags('种子数据管理')
@Controller('system/seed')
export class SeedController {
	constructor(private readonly seedService: SeedService) {}

	@Post('init')
	@RequirePermission('system:seed:init')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: '手动初始化种子数据' })
	async initSeedData() {
		return await this.seedService.manualInitSeedData();
	}

	@Post('reset')
	// @RequirePermission('system:seed:reset')
	@NotRequireAuth()
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: '强制重置数据库并重新初始化' })
	async resetDatabase() {
		return await this.seedService.forceResetDatabase();
	}
}
