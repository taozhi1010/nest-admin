import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const configFileNameObj = {
  development: 'dev',
  production: 'prod',
};

export const getEnv = () => {
  const env = process.env.NODE_ENV || 'production';
  return configFileNameObj[env];
};

export default () => {
  const env = getEnv();
  const url = `./env/${env}.yml`;
  const fileConfig = yaml.load(readFileSync(join(__dirname, `${url}`), 'utf8')) as Record<string, any>;

  return {
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
  };
};
