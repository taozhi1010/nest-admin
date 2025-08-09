<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## build

```bash
pnpm build
ncc build ./dist/main.js -o dist_ncc --external pg-cloudflare
```

## build docker

```bash
# 构建Docker镜像，默认平台为linux/amd64
docker build -t nest-app:latest .

docker save nest-app -o nest-app.tar

# 指定平台构建Docker镜像（例如ARM64架构）
docker build --build-arg PLATFORM=linux/arm64 -t nest-app:latest .

# 使用docker-compose启动所有服务（包含应用、PostgreSQL和Redis）
docker-compose up -d

# 只构建并启动应用服务
docker-compose up -d app

# 查看日志
docker-compose logs -f

docker compose -f ./docker-compose.yml down -v
docker compose -f ./docker-compose.yml up -d

# 使用ARM64 Dockerfile构建镜像
docker build -f Dockerfile.arm64 -t nest-app:arm64 .

# 或者使用buildx进行跨平台构建
docker buildx build --platform linux/arm64 -f Dockerfile.arm64 -t nest-app:arm64 .
```

```
node scripts/generate-license.js generate "test" "2025-08-17" "basic"
```

```
docker buildx build --platform linux/arm64 -f Dockerfile.arm64 -t nest-app:arm64 .

docker save nest-app:arm64 -o nest-app.tar

docker load -i nest-app.tar

docker run -d \
  --name nest-app \
  --restart unless-stopped \
  -p 8180:8180 \
  -e NODE_ENV=production \
  -e POSTGRES_DB=nest \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -v $(pwd)/pg_data:/var/lib/postgresql/data \
  -v $(pwd)/ormlogs.log:/app/ormlogs.log \
  -v $(pwd)/config.yml:/app/config.yml \
  -v $(pwd)/frontend:/app/frontend \
  nest-app:arm64
```
