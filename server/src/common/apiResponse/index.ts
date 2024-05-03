export const SchemaExample = {
  monitor: {
    server: {
      get: {
        code: 200,
        msg: 'ok',
        data: {
          cpu: {
            cpuNum: 8,
            total: 1062538890,
            sys: '6.88',
            used: '12.76',
            wait: 0,
            free: '80.36',
          },
          mem: {
            total: '16.00',
            used: '15.94',
            free: '0.06',
            usage: '99.64',
          },
          sys: {
            computerName: 'MacBook-Pro-4.local',
            computerIp: '127.0.0.1',
            userDir: '/Users/taozhi/Desktop/admin/nest-admin/',
            osName: 'darwin',
            osArch: 'x64',
          },
          sysFiles: [
            {
              dirName: '/',
              typeName: '/dev/disk1s1s1',
              total: '0.91GB',
              used: '0.04GB',
              free: '0.05GB',
              usage: '4.68',
            },
          ],
        },
      },
    },
  },
};
