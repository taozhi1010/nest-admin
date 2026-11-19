import request from '@/composables/useRequest';

// 登录方法
export function login(username, password, code, uuid) {
  const data = {
    username,
    password,
    code,
    uuid
  };
  return request({
    url: '/login',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  });
}

// 获取用户详细信息
export function getInfo() {
  return request({
    url: '/getInfo',
    method: 'get'
  });
}

// 退出方法
export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  });
}

// 注册方法
export function register(data) {
  return request({
    url: '/register',
    headers: {
      isToken: false
    },
    method: 'post',
    data: data
  });
}

// 检查账号是否已被注册
export function checkUsername(username) {
  return request({
    url: '/register/check',
    headers: {
      isToken: false
    },
    method: 'get',
    params: { username }
  });
}

// 获取注册页配置（是否开启邮箱验证码注册）
export function getRegisterConfig() {
  return request({
    url: '/register/config',
    headers: {
      isToken: false
    },
    method: 'get'
  });
}

// 发送注册邮箱验证码
export function sendEmailCode(email) {
  return request({
    url: '/register/emailCode',
    headers: {
      isToken: false
    },
    method: 'post',
    data: { email }
  });
}

// 获取验证码
export function getCodeImg(username, type) {
  return request({
    url: '/captchaImage',
    headers: {
      isToken: false
    },
    method: 'get',
    params: { username, type },
    timeout: 20000
  });
}
