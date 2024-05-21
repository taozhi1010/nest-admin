import { Injectable } from '@nestjs/common';
import { ResultData } from 'src/common/utils/result';
import os, { networkInterfaces } from 'os';
import path from 'path';
import * as nodeDiskInfo from 'node-disk-info';

@Injectable()
export class ServerService {
  async getInfo() {
    // 获取CPU信息
    const cpu = this.getCpuInfo();
    const mem = this.getMemInfo();
    const sys = {
      computerName: os.hostname(),
      computerIp: this.getServerIP(),
      userDir: path.resolve(__dirname, '..', '..', '..', '..'),
      osName: os.platform(),
      osArch: os.arch(),
    };
    const sysFiles = await this.getDiskStatus();
    const data = {
      cpu,
      mem,
      sys,
      sysFiles,
    };
    return ResultData.ok(data);
  }

  async getDiskStatus() {
    const disks = await nodeDiskInfo.getDiskInfoSync();
    const sysFiles = disks.map((disk: any) => {
      return {
        dirName: disk._mounted,
        typeName: disk._filesystem,
        total: this.bytesToGB(disk._blocks) + 'GB',
        used: this.bytesToGB(disk._used) + 'GB',
        free: this.bytesToGB(disk._available) + 'GB',
        usage: ((disk._used / disk._blocks || 0) * 100).toFixed(2),
      };
    });
    return sysFiles;
  }

  // 获取服务器IP地址
  getServerIP() {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        // 选择外部可访问的IPv4地址
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  }

  getCpuInfo() {
    const cpus = os.cpus();
    const cpuInfo = cpus.reduce(
      (info: any, cpu) => {
        info.cpuNum += 1;
        info.user += cpu.times.user;
        info.sys += cpu.times.sys;
        info.idle += cpu.times.idle;
        info.total += cpu.times.user + cpu.times.sys + cpu.times.idle;
        return info;
      },
      { user: 0, sys: 0, idle: 0, total: 0, cpuNum: 0 },
    );
    const cpu = {
      cpuNum: cpuInfo.cpuNum,
      total: cpuInfo.total,
      sys: ((cpuInfo.sys / cpuInfo.total) * 100).toFixed(2),
      used: ((cpuInfo.user / cpuInfo.total) * 100).toFixed(2),
      wait: 0.0,
      free: ((cpuInfo.idle / cpuInfo.total) * 100).toFixed(2),
    };
    return cpu;
  }

  getMemInfo() {
    // 获取总内存
    const totalMemory = os.totalmem();
    // 获取空闲内存
    const freeMemory = os.freemem();
    // 已用内存 = 总内存 - 空闲内存
    const usedMemory = totalMemory - freeMemory;
    // 使用率 = 1 - 空闲内存 / 总内存
    const memoryUsagePercentage = (((totalMemory - freeMemory) / totalMemory) * 100).toFixed(2);
    const mem = {
      total: this.bytesToGB(totalMemory),
      used: this.bytesToGB(usedMemory),
      free: this.bytesToGB(freeMemory),
      usage: memoryUsagePercentage,
    };
    return mem;
  }

  /**
   * 将字节转换为GB。
   * @param bytes {number} 要转换的字节数。
   * @returns {string} 返回转换后的GB数，保留两位小数。
   */
  bytesToGB(bytes) {
    // 计算字节到GB的转换率
    const gb = bytes / (1024 * 1024 * 1024);
    // 将结果四舍五入到小数点后两位
    return gb.toFixed(2);
  }
}
