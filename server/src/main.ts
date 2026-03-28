import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { mw as requestIpMw } from 'request-ip';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { HttpExceptionsFilter } from 'src/common/filters/http-exceptions-filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { writeFileSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true, // 开启跨域访问
  });
  const config = app.get(ConfigService);
  // 设置访问频率
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 1000, // 限制15分钟内最多只能访问1000次
    }),
  );
  // 设置 api 访问前缀
  const prefix = config.get<string>('app.prefix');

  const rootPath = process.cwd();
  const baseDirPath = join(rootPath, config.get('app.file.location'));
  app.useStaticAssets(baseDirPath, {
    prefix: '/profile/',
    maxAge: 86400000 * 365,
  });

  app.setGlobalPrefix(prefix);
  // 全局验证
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new HttpExceptionsFilter());

  // web 安全，防常见漏洞
  // 注意：开发环境如果开启 nest static module 需要将 crossOriginResourcePolicy 设置为 false 否则静态资源 跨域不可访问
  app.use(
    helmet({
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`, 'cdn.redoc.ly', 'fonts.googleapis.com'],
          fontSrc: [`'self'`, 'fonts.gstatic.com', 'cdn.redoc.ly'],
          scriptSrc: [`'self'`, `'unsafe-inline'`, 'cdn.redoc.ly'],
          imgSrc: [`'self'`, 'data:', 'cdn.redoc.ly'],
        },
      },
    }),
  );

  const swaggerOptions = new DocumentBuilder()
    .setTitle('Nest-Admin')
    .setDescription('Nest-Admin 接口文档')
    .setVersion('2.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, swaggerOptions);

  // 保存 OpenAPI 规范文件
  const openApiJsonPath = join(process.cwd(), 'openApi.json');
  writeFileSync(openApiJsonPath, JSON.stringify(document, null, 2));

  // Swagger UI - 用于交互式调试
  SwaggerModule.setup(`${prefix}/swagger-ui`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Nest-Admin API Docs',
  });

  // 提供 OpenAPI JSON 文件访问（供 Apifox 导入）
  app.use('/openapi.json', (req, res) => {
    res.sendFile(openApiJsonPath);
  });

  // Redoc - 用于文档阅读（更美观、更清晰）
  app.use(`${prefix}/docs`, (req, res) => {
    res.send(`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <title>Nest-Admin API 文档</title>
    <style>
      body { margin: 0; padding: 0; }
      redoc { display: block; }
    </style>
  </head>
  <body>
    <redoc 
      spec-url="/openapi.json"
      theme='{"colors": {"primary": {"main": "#1890ff"}}}'
      hide-hostname="true"
      required-props-first="true"
      expand-responses="200,400,401,403,404,500"
    ></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"> </script>
  </body>
</html>
    `);
  });

  // 获取真实 ip
  app.use(requestIpMw({ attributeName: 'ip' }));
  //服务端口
  const port = config.get<number>('app.port') || 8080;
  await app.listen(port);

  console.log(
    `\n========================================`,
    `\n✅ Nest-Admin 服务启动成功`,
    `\n========================================`,
    `\n📍 服务地址：http://localhost:${port}${prefix}/`,
    `\n📖 Swagger UI: http://localhost:${port}${prefix}/swagger-ui/`,
    `\n📚 Redoc 文档：http://localhost:${port}${prefix}/docs`,
    `\n🔧 Apifox 导入：http://localhost:${port}/openapi.json`,
    `\n========================================\n`,
  );
}
bootstrap();
