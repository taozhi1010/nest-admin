import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const configFileNameObj = {
  development: 'dev',
  test: 'test',
  production: 'prod',
};

const env = process.env.NODE_ENV;

export default () => {
  return yaml.load(readFileSync(join(__dirname, `./env/${configFileNameObj[env]}.yml`), 'utf8')) as Record<string, any>;
};
