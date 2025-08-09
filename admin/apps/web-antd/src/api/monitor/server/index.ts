import { requestClient } from '#/api/request';

enum Api {
	ServerInfo = '/monitor/server',
}

/**
 * 获取服务器信息
 * @returns 
 */

export function getServerInfo() {
	return requestClient.get<any>(Api.ServerInfo);
} 