import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SysDeptEntity } from '../dept/entities/dept.entity';
import { SysPostEntity } from '../post/entities/post.entity';
import { SysRoleEntity } from '../role/entities/role.entity';
import { UserEntity } from './entities/sys-user.entity';
import { SysUserWithPostEntity } from './entities/user-width-post.entity';
import { SysUserWithRoleEntity } from './entities/user-width-role.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Global()
@Module({
	imports: [
		TypeOrmModule.forFeature([
			UserEntity,
			SysDeptEntity,
			SysRoleEntity,
			SysPostEntity,
			SysUserWithPostEntity,
			SysUserWithRoleEntity,
		]),
		JwtModule.registerAsync({
			imports: [ConfigModule],
			useFactory: async (config: ConfigService) => ({
				secret: config.get('jwt.secretkey'),
			}),
			inject: [ConfigService],
		}),
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
