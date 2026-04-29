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
import { setupApiDocs } from 'src/common/utils/api-docs';
import { createProxyMiddleware } from 'http-proxy-middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true, // 开启跨域访问
  });

  // 配置 CORS 选项
  app.enableCors({
    origin: true, // 允许所有来源（开发环境）
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'istoken'],
    exposedHeaders: ['Content-Disposition'],
    credentials: true, // 允许携带 cookie
    maxAge: 3600, // 预检请求缓存时间
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

  // 判断存储类型，根据类型配置不同的文件访问方式
  const storageType = config.get<string>('app.file.storageType');

  if (storageType === 'minio') {
    // MinIO 代理配置
    const minioDomain = config.get<string>('minio.domain');
    app.use(
      '/profile/',
      createProxyMiddleware({
        target: minioDomain,
        changeOrigin: true,
        pathRewrite: (path, req) => {
          // 将 /profile/avatars/xxx.png 转换为 /avatars/xxx.png
          return path.replace(/^\/profile\//, '/');
        },
      }),
    );
  } else if (storageType === 'rustfs') {
    // RustFS 代理配置
    const rustfsDomain = config.get<string>('rustfs.domain') || `http://${config.get<string>('rustfs.endPoint')}:${config.get<number>('rustfs.port')}`;
    const rustfsBucket = config.get<string>('rustfs.bucket', 'nest-admin');
    app.use(
      '/profile/',
      createProxyMiddleware({
        target: rustfsDomain,
        changeOrigin: true,
        pathRewrite: (path, req) => {
          // 将 /profile/nest-admin/xxx.png 转换为 /nest-admin/xxx.png
          return path.replace(/^\/profile\//, '/');
        },
      }),
    );
  } else {
    // 本地静态资源
    app.useStaticAssets(baseDirPath, {
      prefix: '/profile/',
      maxAge: 0, // 头像等动态资源不缓存，确保实时更新
    });
  }

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
          frameAncestors: [`'self'`, 'http://localhost:*', 'https://localhost:*'], // 允许本地任意端口嵌套
        },
      },
    }),
  );

  // 设置 API 文档（Swagger UI + Redoc）
  setupApiDocs(app, prefix, '#1890ff');

  // 为 Swagger UI 和 Redoc 静态资源添加 CORS 头
  app.use('/swagger-ui*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    next();
  });

  app.use('/docs*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    next();
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
