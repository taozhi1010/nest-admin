import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { mw as requestIpMw } from 'request-ip';
import { AppModule } from 'src/app.module';
import { HttpExceptionsFilter } from 'src/common/filters/http-exceptions-filter';
import { LicenseService } from 'src/common/license/license.service';

async function bootstrap() {
	// 创建临时应用实例用于许可证验证
	const tempApp = await NestFactory.createApplicationContext(AppModule);
	const licenseService = tempApp.get(LicenseService);

	// 验证许可证
	const isLicenseValid = await licenseService.validateLicense();
	if (!isLicenseValid) {
		console.error('❌ 许可证验证失败，服务无法启动');
		console.error('请确保在项目根目录下存在有效的 license 文件');
		console.error('可以使用以下命令生成许可证：');
		console.error(
			'node scripts/generate-license.js generate "your-client-id" "2025-12-31" "basic"'
		);
		await tempApp.close();
		process.exit(1);
	}

	// 关闭临时应用实例
	await tempApp.close();

	console.log('✅ 许可证验证通过，正在启动服务...');

	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		cors: true, // 开启跨域访问
	});
	const config = app.get(ConfigService);
	// 设置访问频率
	app.use(
		rateLimit({
			windowMs: 15 * 60 * 1000, // 15分钟
			max: 1000, // 限制15分钟内最多只能访问1000次
		})
	);
	// 设置 api 访问前缀
	const prefix = config.get<string>('app.prefix');

	app.use(express.json({ limit: '512mb' })); // 设置请求体大小限制
	app.use(express.urlencoded({ limit: '512mb', extended: true })); // 设置表单请求体大小限制

	app.useStaticAssets(join(process.cwd(), './frontend'));

	app.useStaticAssets(join(process.cwd(), './upload'), {
		prefix: '/profile/',
		maxAge: 86400000 * 365,
	});

	app.useStaticAssets(join(process.cwd(), './upload'), {
		prefix: '/files/',
		maxAge: 86400000 * 365,
	});

	app.setGlobalPrefix(prefix);
	// 全局验证
	app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
	app.useGlobalFilters(new HttpExceptionsFilter());

	// web 安全，防常见漏洞
	// 注意： 开发环境如果开启 nest static module 需要将 crossOriginResourcePolicy 设置为 false 否则 静态资源 跨域不可访问
	app.use(
		helmet({
			crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
			crossOriginResourcePolicy: false,
		})
	);

	const swaggerOptions = new DocumentBuilder()
		.setTitle('Nest Admin')
		.setDescription('Nest Admin 接口文档')
		.setVersion('2.0.0')
		.addBearerAuth({
			type: 'apiKey',
			name: 'Authorization',
			in: 'header',
			bearerFormat: 'Bearer',
		})
		.build();
	const document = SwaggerModule.createDocument(app, swaggerOptions);
	// 保存OpenAPI规范文件
	// writeFileSync(join(process.cwd(), 'openApi.json'), JSON.stringify(document, null, 2))

	// 项目依赖当前文档功能，最好不要改变当前地址
	// 生产环境使用 nginx 可以将当前文档地址 屏蔽外部访问
	SwaggerModule.setup(`${prefix}/swagger-ui`, app, document, {
		swaggerOptions: {
			persistAuthorization: true,
		},
		customSiteTitle: 'YunXi-Vue API Docs',
	});

	// 获取真实 ip
	app.use(requestIpMw({ attributeName: 'ip' }));
	// 服务端口
	const port = config.get<number>('app.port') || 8080;
	await app.listen(port, '0.0.0.0');

	// 显示许可证信息
	const finalLicenseService = app.get(LicenseService);
	const licenseInfo = await finalLicenseService.getLicenseInfo();

	console.log(
		`YunXi-Vue 服务启动成功`,
		'\n',
		'服务地址',
		`http://localhost:${port}${prefix}/`,
		'\n',
		'swagger 文档地址',
		`http://localhost:${port}${prefix}/swagger-ui/`
	);

	if (licenseInfo) {
		console.log('\n📋 许可证信息:');
		console.log(`👤 客户端ID: ${licenseInfo.clientId}`);
		console.log(`📅 过期日期: ${licenseInfo.expiryDate}`);
		console.log(`🔧 授权功能: ${licenseInfo.features.join(', ')}`);

		// 计算剩余天数
		const expiryDate = new Date(licenseInfo.expiryDate);
		const currentDate = new Date();
		const remainingDays = Math.ceil(
			(expiryDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
		);

		if (remainingDays > 30) {
			console.log(`⏰ 剩余有效期: ${remainingDays} 天`);
		} else if (remainingDays > 7) {
			console.log(`⚠️  剩余有效期: ${remainingDays} 天 (即将过期)`);
		} else {
			console.log(`🚨 剩余有效期: ${remainingDays} 天 (请及时续期)`);
		}
	}
}
bootstrap();
