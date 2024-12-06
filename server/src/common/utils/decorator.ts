import { get } from 'lodash';

function getArgs(func) {
  const funcString = func.toString();
  return funcString.slice(funcString.indexOf('(') + 1, funcString.indexOf(')')).match(/([^\s,]+)/g);
}

const stringFormat = (str: string, callback: (key: string) => string): string => {
  return str.replace(/\{([^}]+)\}/g, (word, key) => callback(key));
};

export function paramsKeyFormat(func: () => any, formatKey: string, args: any[]) {
  const originMethodArgs = getArgs(func);

  const paramsMap = {};

  originMethodArgs?.forEach((arg, index) => {
    paramsMap[arg] = args[index];
  });

  let isNotGet = false;
  const key = stringFormat(formatKey, (key) => {
    const str = get(paramsMap, key);
    if (!str) isNotGet = true;
    return str;
  });

  if (isNotGet) {
    return null;
  }

  return key;
}

export function paramsKeyGetObj(func: () => any, formatKey: string | undefined, args: any[]): any {
  const originMethodArgs = getArgs(func);

  const paramsMap = {};

  originMethodArgs?.forEach((arg, index) => {
    paramsMap[arg] = args[index];
  });

  const obj = get(paramsMap, formatKey);

  if (typeof obj === 'object') return obj;

  if (args[0] && typeof args[0] === 'object') return args[0];

  return null;
}
