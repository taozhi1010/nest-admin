import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import * as Joi from 'joi';

const configFileNameObj = {
  development: 'dev',
  production: 'prod',
  test: 'test',
};

// boot 校验：JWT 密钥所有环境必填非空（prod 由部署环境变量 JWT_SECRETKEY 注入，本地从 dev.example.yml 复制后填写）
const configSchema = Joi.object({
  jwt: Joi.object({
    secretkey: Joi.string().trim().min(1).required(),
  }).unknown(true),
}).unknown(true);

export const getEnv = () => {
  const env = process.env.NODE_ENV || 'production';
  const fileName = configFileNameObj[env];
  if (!fileName) {
    throw new Error(`未知的 NODE_ENV '${env}'，可选值：development / production / test`);
  }
  return fileName;
};

export default () => {
  const env = getEnv();
  const url = `./env/${env}.yml`;
  let fileConfig: Record<string, any>;
  try {
    fileConfig = yaml.load(readFileSync(join(__dirname, `${url}`), 'utf8')) as Record<string, any>;
  } catch (error) {
    // NODE_ENV=test 时从 test.example.yml 复制一份 test.yml 填好本地值即可
    throw new Error(`配置文件加载失败（${url}）：${error?.message ?? error}`);
  }

  const config = {
    ...fileConfig,
    app: {
      ...fileConfig.app,
      port: Number(process.env.SERVER_PORT || fileConfig.app?.port || 8080),
    },
    db: {
      ...fileConfig.db,
      mysql: {
        ...fileConfig.db?.mysql,
        host: process.env.MYSQL_HOST || fileConfig.db?.mysql?.host,
        port: Number(process.env.MYSQL_PORT || fileConfig.db?.mysql?.port || 3306),
        username: process.env.MYSQL_USERNAME || fileConfig.db?.mysql?.username,
        password: process.env.MYSQL_PASSWORD || fileConfig.db?.mysql?.password,
        database: process.env.MYSQL_DATABASE || fileConfig.db?.mysql?.database,
      },
    },
    redis: {
      ...fileConfig.redis,
      host: process.env.REDIS_HOST || fileConfig.redis?.host,
      port: Number(process.env.REDIS_PORT || fileConfig.redis?.port || 6379),
      password: process.env.REDIS_PASSWORD || fileConfig.redis?.password,
      db: Number(process.env.REDIS_DB || fileConfig.redis?.db || 0),
    },
    rustfs: {
      ...fileConfig.rustfs,
      endPoint: process.env.RUSTFS_ENDPOINT || fileConfig.rustfs?.endPoint,
      port: Number(process.env.RUSTFS_PORT || fileConfig.rustfs?.port || 9000),
      accessKey: process.env.RUSTFS_ACCESS_KEY || fileConfig.rustfs?.accessKey,
      secretKey: process.env.RUSTFS_SECRET_KEY || fileConfig.rustfs?.secretKey,
      bucket: process.env.RUSTFS_BUCKET || fileConfig.rustfs?.bucket,
    },
    jwt: {
      ...fileConfig.jwt,
      secretkey: process.env.JWT_SECRETKEY || fileConfig.jwt?.secretkey,
    },
    mail: {
      ...fileConfig.mail,
      // 布尔项用 ?? 链：yml 里显式写 false 不能被兜底值覆盖成 true
      enabled: String(process.env.MAIL_ENABLED ?? fileConfig.mail?.enabled ?? false) === 'true',
      host: process.env.MAIL_HOST || fileConfig.mail?.host || '',
      port: Number(process.env.MAIL_PORT || fileConfig.mail?.port || 465),
      secure: String(process.env.MAIL_SECURE ?? fileConfig.mail?.secure ?? true) === 'true',
      user: process.env.MAIL_USER || fileConfig.mail?.user || '',
      pass: process.env.MAIL_PASS || fileConfig.mail?.pass || '',
      from: process.env.MAIL_FROM || fileConfig.mail?.from || '',
    },
  };

  // 必填项缺失直接 fail fast，禁止空密钥静默启动
  const { error } = configSchema.validate(config, { abortEarly: false });
  if (error) {
    throw new Error(`配置校验失败，服务拒绝启动：${error.details.map((d) => `${d.path.join('.')}: ${d.message}`).join('; ')}`);
  }

  return config;
};
