import * as svgCaptcha from 'svg-captcha';
import { ConfigObject } from 'svg-captcha';

// svg-captcha 的默认导出（createCaptcha 函数）经 TS importStar 互操作后不可调用，
// 且 d.ts 未声明调用签名，此处直接 require 原始导出；返回值即 SVG 字符串
// eslint-disable-next-line @typescript-eslint/no-var-requires
const createCaptcha = require('svg-captcha') as (text: string, options?: ConfigObject) => string;

const options = {
  // 验证码字符集，可以是字母、数字或者组合
  charPreset: '0123456789QWERTYUIOPSDFGHJKLAZXCVBNMzxcvbnmasdfghjklqwertyuiop',
  // 验证码长度
  size: 4,
  // 验证码字体大小
  fontSize: 60,
  // 验证码图像宽度
  width: 100,
  // 验证码图像高度
  height: 40,
  // 干扰线的数量
  noise: 2,
  // 验证码背景颜色
  background: '#ffffff',
  // 验证码文字颜色
  // color: "#33ccff",
  // 验证码文字倾斜度
  rotate: 15,
  // 验证码字符间距
  letterSpacing: 0,
  // 验证码噪点的颜色
  noiseColor: '#000000',
  // 验证码噪点的透明度
  opacity: 0.1,
  // 验证码噪点的密度
  pointSize: 1,
  // 验证码噪点的样式，可以是 'circle' 或 'line'
  pointStyle: 'circle',
  // 验证码噪点的半径
  pointRadius: 2,
  // 验证码噪点的位置，可以是 'random' 或 'top' 或 'left' 或 'right' 或 'bottom'
  pointPosition: 'random',
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createMath() {
  // 自行生成算式而非用 createMathExpr：库的减法会出现负数答案，这里保证结果恒为非负
  // 加法任意组合；减法保证被减数不小于减数
  const left = randomInt(1, 50);
  const usePlus = Math.random() < 0.5;
  const right = usePlus ? randomInt(1, 50) : randomInt(1, left);
  const equation = usePlus ? `${left}+${right}` : `${left}-${right}`;
  const text = String(usePlus ? left + right : left - right);
  return { text, data: createCaptcha(equation, options) };
}

export function createText() {
  return svgCaptcha.create(options);
}
