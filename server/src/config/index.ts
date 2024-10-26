import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const configFileNameObj = {
  development: 'dev',
  test: 'test',
  production: 'prod',
};

export const getEnv = () => {
  const env = process.env.NODE_ENV || 'production';
  return configFileNameObj[env];
};

export default () => {
  const env = getEnv();
  const url = `./env/${[env]}.yml`;
  return yaml.load(readFileSync(join(__dirname, `${url}`), 'utf8')) as Record<string, any>;
};
