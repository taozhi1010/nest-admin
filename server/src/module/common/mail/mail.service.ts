import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as dns from 'dns';
import * as net from 'net';
import type { Transporter } from 'nodemailer';

/**
 * 邮件服务：注册邮箱验证码发送
 * SMTP 配置来自 yml 的 mail 段（支持 MAIL_* 环境变量覆盖）
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly configService: ConfigService) {}

  /**
   * 邮箱验证码注册是否已开启：开关打开且 SMTP 必要配置齐全
   */
  isEnabled(): boolean {
    const mail = this.configService.get<any>('mail');
    if (!mail?.enabled) return false;
    return Boolean(mail.host && mail.user && mail.pass);
  }

  /**
   * 发送注册验证码邮件
   * @param to 收件邮箱
   * @param code 验证码
   * @param ttlMinutes 验证码有效期（分钟），用于邮件文案
   */
  async sendVerificationCode(to: string, code: string, ttlMinutes: number): Promise<void> {
    const mail = this.configService.get<any>('mail');
    const transporter = await this.getTransporter();
    const from = mail.from || mail.user;

    await transporter.sendMail({
      from,
      to,
      subject: '注册验证码',
      html: `
        <div style="max-width: 480px; margin: 0 auto; padding: 24px; font-family: 'Microsoft YaHei', Arial, sans-serif; color: #333;">
          <h2 style="margin: 0 0 16px; font-size: 18px;">注册验证码</h2>
          <p style="margin: 0 0 16px;">您好！您正在注册账号，本次验证码为：</p>
          <p style="margin: 0 0 16px;">
            <span style="display: inline-block; padding: 8px 24px; font-size: 24px; font-weight: bold; letter-spacing: 6px; background: #f5f7fa; border-radius: 4px;">${code}</span>
          </p>
          <p style="margin: 0; color: #999; font-size: 13px;">验证码 ${ttlMinutes} 分钟内有效，请勿泄露给他人。如果您没有申请注册，请忽略此邮件。</p>
        </div>
      `,
    });
    this.logger.log(`注册验证码已发送至 ${to}`);
  }

  /**
   * 懒创建 SMTP transport：邮件服务未启用时不建立连接
   * Node 18 不支持 net.connect 的 autoSelectFamily（Happy Eyeballs），而 nodemailer 10
   * 把解析出的 IPv6 排在前面——无全局 IPv6 路由的机器（家用 Windows 常见）直连 v6 会 ENETUNREACH。
   * 因此优先把域名解析成 IPv4 建连，SNI/证书校验仍用原域名；纯 IPv6 环境回退原 host。
   */
  private async getTransporter(): Promise<Transporter> {
    if (this.transporter) return this.transporter;
    const mail = this.configService.get<any>('mail');
    const opts: any = {
      host: mail.host,
      port: Number(mail.port) || 465,
      secure: mail.secure !== false,
      auth: {
        user: mail.user,
        pass: mail.pass,
      },
      connectionTimeout: 10000,
    };
    if (opts.host && !net.isIP(opts.host)) {
      try {
        const v4 = await dns.promises.lookup(opts.host, { family: 4 });
        opts.host = v4.address;
        opts.tls = { servername: mail.host };
      } catch {
        // IPv4 解析失败（如纯 IPv6 环境），保持原 host 由 nodemailer 自行解析
      }
    }
    this.transporter = nodemailer.createTransport(opts);
    return this.transporter;
  }
}
