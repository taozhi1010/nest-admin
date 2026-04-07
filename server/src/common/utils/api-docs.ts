import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Redoc HTML 模板
 */
const REDOC_HTML = (themeColor = '#1890ff') => `
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
      theme='{"colors": {"primary": {"main": "${themeColor}"}}}'
      hide-hostname="true"
      required-props-first="true"
      expand-responses="200,400,401,403,404,500"
    ></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"> </script>
  </body>
</html>
`;

/**
 * 初始化 API 文档（Swagger UI + Redoc）
 * @param app NestJS 应用实例
 * @param prefix API 前缀
 * @param themeColor Redoc 主题色
 */
export function setupApiDocs(app: INestApplication, prefix = '', themeColor = '#1890ff'): void {
  // 创建 Swagger 文档配置
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

  // 保存 OpenAPI JSON 文件
  const openApiJsonPath = join(process.cwd(), 'openApi.json');
  writeFileSync(openApiJsonPath, JSON.stringify(document, null, 2));

  // 设置 Swagger UI（交互式调试）
  SwaggerModule.setup(`${prefix}/swagger-ui`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Nest-Admin API Docs',
  });

  // 提供 OpenAPI JSON 访问（供 Apifox 导入）
  app.use('/openapi.json', (req, res) => {
    res.sendFile(openApiJsonPath);
  });

  // 设置 Redoc 文档（文档阅读）
  app.use(`${prefix}/docs`, (req, res) => {
    res.send(REDOC_HTML(themeColor));
  });
}
