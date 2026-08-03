import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const configFileNameObj = {
  development: 'dev',
  test: 'test',
  production: 'prod',
};

const env = process.env.NODE_ENV || 'development';

export default () => {
  const configName = configFileNameObj[env];
  if (!configName) {
    throw new Error(`无效的 NODE_ENV: ${env}，支持 development/test/production`);
  }
  return yaml.load(readFileSync(join(__dirname, `./${configName}.yml`), 'utf8')) as Record<string, any>;
};
