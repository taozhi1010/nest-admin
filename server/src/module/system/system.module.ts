import { Global, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SysConfigModule } from './config/config.module';
import { DeptModule } from './dept/dept.module';
import { DictModule } from './dict/dict.module';
import { MenuModule } from './menu/menu.module';
import { NoticeModule } from './notice/notice.module';
import { PostModule } from './post/post.module';
import { RoleModule } from './role/role.module';
import { SeedModule } from './seed/seed.module';
import { SSEModule } from './sse/sse.module';
import { ToolModule } from './tool/tool.module';
import { UserModule } from './user/user.module';

@Global()
@Module({
	imports: [
		AuthModule,
		SysConfigModule, // 系统配置
		DeptModule,
		DictModule,
		MenuModule,
		NoticeModule,
		PostModule,
		RoleModule,
		ToolModule,
		UserModule,
		SeedModule,

		SSEModule,
	],
})
export class SystemModule {}
