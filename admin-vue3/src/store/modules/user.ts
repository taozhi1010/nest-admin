import { defineStore } from 'pinia'
import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { getUserAvatar } from '@/utils/image'

interface UserInfo {
  username: string
  password: string
  code: string
  uuid: string
}

interface UserState {
  token: string
  name: string
  avatar: string
  roles: string[]
  permissions: string[]
}

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken() || '',
    name: '',
    avatar: '',
    roles: [],
    permissions: []
  }),
  actions: {
    // 登录
    async login(userInfo: UserInfo): Promise<void> {
      const username = userInfo.username.trim()
      const password = userInfo.password
      const code = userInfo.code
      const uuid = userInfo.uuid
      
      try {
        const res = await login(username, password, code, uuid)
        setToken(res.data.token)
        this.token = res.data.token
      } catch (error) {
        throw error
      }
    },
    
    // 获取用户信息
    async getInfo(): Promise<any> {
      try {
        const res = await getInfo()
        const user = res.user
        const avatar = user.avatar === '' || user.avatar === null ? '' : user.avatar

        if (res.roles && res.roles.length > 0) {
          // 验证返回的roles是否是一个非空数组
          this.roles = res.roles
          this.permissions = res.permissions
        } else {
          this.roles = ['ROLE_DEFAULT']
        }
        this.name = user.userName
        // 使用统一的图片工具方法处理头像
        this.avatar = getUserAvatar(avatar)
        return res
      } catch (error) {
        throw error
      }
    },
    
    // 退出系统
    async logOut(): Promise<void> {
      try {
        await logout(this.token)
        this.token = ''
        this.roles = []
        this.permissions = []
        removeToken()
      } catch (error) {
        throw error
      }
    }
  }
})

export default useUserStore
