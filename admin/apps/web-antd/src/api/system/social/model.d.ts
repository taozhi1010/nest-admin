export interface SocialInfo {
  id: string;
  userId: number;
  tenantId: string;
  authId: string;
  source: string;
  accessToken: string;
  expireIn: number;
  refreshToken: string;
  openId: string;
  username: string;
  nickName: string;
  email: string;
  avatar: string;
  accessCode?: any;
  unionId?: any;
  scope: string;
  tokenType: string;
  idToken?: any;
  macAlgorithm?: any;
  macKey?: any;
  code?: any;
  oauthToken?: any;
  oauthTokenSecret?: any;
  createTime: string;
}
