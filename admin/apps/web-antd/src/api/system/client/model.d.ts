export interface Client {
  id: number;
  clientId: string;
  clientKey: string;
  clientSecret: string;
  grantTypeList: string[];
  grantType: string;
  deviceType: string;
  activeTimeout: number;
  timeout: number;
  status: string;
}
