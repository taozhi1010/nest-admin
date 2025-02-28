import * as svgCaptcha from 'svg-captcha';

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

export function createMath() {
  return svgCaptcha.createMathExpr({
    ...options,
    mathMin: 1,
    mathMax: 50,
    mathOperator: '+',
  });
}

export function createText() {
  return svgCaptcha.create(options);
}
