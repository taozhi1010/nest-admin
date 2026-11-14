/**
 * 用户信息管理
 * 管理用户登录状态、个人信息、角色和权限等认证相关数据
 */
import { defineStore } from 'pinia'
import { login, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { getUserAvatar } from '@/utils/image'
import useDictStore from '@/store/modules/dict'

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
    // 接口失败不阻塞本地清理：token 过期或网络异常时也要保证登出成功
    async logOut(): Promise<void> {
      try {
        await logout(this.token)
      } catch (error) {
        console.warn('[用户] 登出接口失败，仍执行本地清理:', error)
      } finally {
        // 清空字典缓存（内存 + localStorage），避免共用设备上残留上个用户的会话数据
        useDictStore().cleanDict()
        this.token = ''
        this.roles = []
        this.permissions = []
        removeToken()
      }
    }
  }
})

export default useUserStore
