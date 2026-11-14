import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SWAGGER_HTML = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Nest-Admin API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      html { box-sizing: border-box; overflow-y: scroll; }
      *, *:before, *:after { box-sizing: inherit; }
      body { margin: 0; background: #fafafa; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: '/openapi.json',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout',
          persistAuthorization: true
        });
      };
    </script>
  </body>
</html>
`;

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
      disable-telemetry="true"
    ></redoc>
    <script type="module" src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  </body>
</html>
`;

export function setupApiDocs(app: INestApplication, prefix = '', themeColor = '#1890ff'): void {
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
  const openApiJsonPath = join(process.cwd(), 'openApi.json');
  writeFileSync(openApiJsonPath, JSON.stringify(document, null, 2));

  app.use('/openapi.json', (req, res) => {
    res.sendFile(openApiJsonPath);
  });

  app.use(`${prefix}/swagger-ui`, (req, res) => {
    res.type('html').send(SWAGGER_HTML);
  });

  app.use(`${prefix}/swagger-ui/`, (req, res) => {
    res.type('html').send(SWAGGER_HTML);
  });

  app.use(`${prefix}/docs`, (req, res) => {
    res.type('html').send(REDOC_HTML(themeColor));
  });
}
