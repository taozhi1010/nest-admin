import { resolveMx } from 'node:dns'
import { createConnection } from 'node:net'
import { connect } from 'node:tls'
import { DKIMSign } from 'dkim-signer'
import mailcomposer from 'mailcomposer'

const CRLF = '\r\n'

function dummy() {}
export default function Sendmail(options?: Record<string, any>) {
  options = options || {}
  const logger = options.logger
    || (options.silent && {
      debug: dummy,
      info: dummy,
      warn: dummy,
      error: dummy,
    }) || {
    debug: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
  }
  const dkimPrivateKey = (options.dkim || {}).privateKey
  const dkimKeySelector = (options.dkim || {}).keySelector || 'dkim'
  const devPort = options.devPort || -1
  const devHost = options.devHost || 'localhost'
  const smtpPort = options.smtpPort || 25
  const smtpHost = options.smtpHost || -1
  const rejectUnauthorized = options.rejectUnauthorized
  const autoEHLO = options.autoEHLO

  /*
   *   邮件服务返回代码含义 Mail service return code Meaning
   *   500   格式错误，命令不可识别（此错误也包括命令行过长）format error, command unrecognized (This error also includes command line too long)
   *   501   参数格式错误 parameter format error
   *   502   命令不可实现 command can not be achieved
   *   503   错误的命令序列 Bad sequence of commands
   *   504   命令参数不可实现 command parameter can not be achieved
   *   211   系统状态或系统帮助响应 System status, or system help response
   *   214   帮助信息 help
   *   220   服务就绪 Services Ready
   *   221   服务关闭传输信道 Service closing transmission channel
   *   421   服务未就绪，关闭传输信道（当必须关闭时，此应答可以作为对任何命令的响应）service is not ready to close the transmission channel (when it is necessary to close, this response may be in response to any command)
   *   250   要求的邮件操作完成 requested mail action completed
   *   251   用户非本地，将转发向 non-local users will be forwarded to
   *   450   要求的邮件操作未完成，邮箱不可用（例如，邮箱忙）Mail the required operation 450 unfinished, mailbox unavailable (for example, mailbox busy)
   *   550   要求的邮件操作未完成，邮箱不可用（例如，邮箱未找到，或不可访问）Mail action not completed the required 550 mailbox unavailable (eg, mailbox not found, no access)
   *   451   放弃要求的操作；处理过程中出错 waiver operation; processing error
   *   551   用户非本地，请尝试 non-local user, please try
   *   452   系统存储不足，要求的操作未执行 Less than 452 storage system, requiring action not taken
   *   552   过量的存储分配，要求的操作未执行 excess storage allocation requires action not taken
   *   553   邮箱名不可用，要求的操作未执行（例如邮箱格式错误） mailbox name is not available, that the requested operation is not performed (for example, mailbox format error)
   *   354   开始邮件输入，以.结束 Start Mail input to. End
   *   554   操作失败  The operation failed
   *   535   用户验证失败 User authentication failed
   *   235   用户验证成功 user authentication is successful
   *   334   等待用户输入验证信息 waits for the user to enter authentication information
   */

  function getHost(email) {
    const m = /[^@]+@([\w\-.]+)/.exec(email)
    return m && m[1]
  }

  function groupRecipients(recipients) {
    const groups = {}
    let host
    const recipients_length = recipients.length
    for (let i = 0; i < recipients_length; i++) {
      host = getHost(recipients[i])
      ;(groups[host] || (groups[host] = [])).push(recipients[i])
    }
    return groups
  }

  /**
   * connect to domain by Mx record
   */
  function connectMx(domain, callback) {
    if (devPort === -1) {
      // not in development mode -> search the MX
      resolveMx(domain, (err, data) => {
        if (err) {
          return callback(err)
        }

        data.sort((a, b) => {
          return a.priority > b.priority ? 1 : -1
        })
        logger.debug('mx resolved: ', data)

        if (!data || data.length === 0) {
          return callback(new Error(`can not resolve Mx of <${domain}>`))
        }
        if (smtpHost !== -1)
          data.push({ exchange: smtpHost, priority: 0 })

        function tryConnect(i) {
          if (i >= data.length)
            return callback(new Error('can not connect to any SMTP server'))

          const sock = createConnection(smtpPort, data[i].exchange)

          sock.on('error', (err) => {
            logger.error('Error on connectMx for: ', data[i], err)
            tryConnect(++i)
          })

          sock.on('connect', () => {
            logger.debug('MX connection created: ', data[i].exchange)
            sock.removeAllListeners('error')
            callback(null, sock)
          })
        }

        tryConnect(0)
      })
    }
    else {
      // development mode -> connect to the specified devPort on devHost
      const sock = createConnection(devPort, devHost)

      sock.on('error', (err) => {
        callback(new Error(`Error on connectMx (development) for "${devHost}:${devPort}": ${err}`))
      })

      sock.on('connect', () => {
        logger.debug(`MX (development) connection created: ${devHost}:${devPort}`)
        sock.removeAllListeners('error')
        callback(null, sock)
      })
    }
  }

  function sendToSMTP(domain, srcHost, from, recipients, body, cb) {
    const callback = typeof cb === 'function' ? cb : function () {}
    connectMx(domain, (err, sock) => {
      if (err) {
        logger.error('error on connectMx', err.stack)
        return callback(err)
      }

      function w(s) {
        logger.debug(`send ${domain}>${s}`)
        sock.write(s + CRLF)
      }

      sock.setEncoding('utf8')

      sock.on('data', (chunk) => {
        data += chunk
        parts = data.split(CRLF)
        const parts_length = parts.length - 1
        for (let i = 0, len = parts_length; i < len; i++) {
          onLine(parts[i])
        }
        data = parts[parts.length - 1]
      })

      sock.on('error', (err) => {
        logger.error(`fail to connect ${domain}`)
        callback(err)
      })

      let data = ''
      let step = 0
      let loginStep = 0
      const queue = []
      const login = []
      let parts
      let cmd
      let upgraded: string | boolean = false

      /*
       if(mail.user && mail.pass){
         queue.push('AUTH LOGIN');
         login.push(new Buffer(mail.user).toString("base64"));
         login.push(new Buffer(mail.pass).toString("base64"));
       }
       */

      queue.push(`MAIL FROM:<${from}>`)
      const recipients_length = recipients.length
      for (let i = 0; i < recipients_length; i++) {
        queue.push(`RCPT TO:<${recipients[i]}>`)
      }
      queue.push('DATA')
      queue.push('QUIT')
      queue.push('')

      function response(code, message) {
        switch (code) {
          case 220:
            //*   220   on server ready
            //*   220   服务就绪
            if (upgraded === 'in-progress') {
              sock.removeAllListeners('data')

              const original = sock
              original.pause()

              const opts = {
                socket: sock,
                host: sock._host,
                rejectUnauthorized,
              }

              sock = connect(opts, () => {
                sock.on('data', (chunk) => {
                  data += chunk
                  parts = data.split(CRLF)
                  const parts_length = parts.length - 1
                  for (let i = 0, len = parts_length; i < len; i++) {
                    onLine(parts[i])
                  }
                  data = parts[parts.length - 1]
                })

                sock.removeAllListeners('close')
                sock.removeAllListeners('end')
              })

              sock.on('error', (err) => {
                logger.error('Error on connectMx for: ', err)
              })

              original.resume()
              upgraded = true
              w(`EHLO ${srcHost}`)
              break
            }
            else {
              if (/\besmtp\b/i.test(message) || autoEHLO) {
                // TODO:  determin AUTH type; auth login, auth crm-md5, auth plain
                cmd = 'EHLO'
              }
              else {
                upgraded = true
                cmd = 'HELO'
              }
              w(`${cmd} ${srcHost}`)
              break
            }

          case 221: // bye
            sock.end()
            callback(null, message)
            break
          case 235: // verify ok
          case 250: // operation OK
            if (upgraded != true) {
              if (/\bSTARTTLS\b/i.test(message)) {
                w('STARTTLS')
                upgraded = 'in-progress'
              }
              else {
                upgraded = true
              }

              break
            }

          // eslint-disable-next-line no-fallthrough
          case 251: // foward
            if (step === queue.length - 1) {
              logger.info('OK:', code, message)
              callback(null, message)
            }
            w(queue[step])
            step++
            break
          case 354: // start input end with . (dot)
            logger.info('sending mail', body)
            w(body)
            w('')
            w('.')
            break

          case 334: // input login
            w(login[loginStep])
            loginStep++
            break

          default:
            if (code >= 400) {
              logger.warn('SMTP responds error code', code)
              callback(new Error(`SMTP code:${code} message:${message}`))
              sock.end()
            }
        }
      }

      let message = ''

      function onLine(line) {
        logger.debug(`recv ${domain}>${line}`)

        message += line + CRLF

        if (line[3] === ' ') {
          // 250-information dash is not complete.
          // 250 OK. space is complete.
          const lineNumber = Number.parseInt(line.substr(0, 3))
          response(lineNumber, message)
          message = ''
        }
      }
    })
  }

  function getAddress(address) {
    return address.replace(/^.+</, '').replace(/>\s*$/, '').trim()
  }

  function getAddresses(addresses) {
    const results = []
    if (!Array.isArray(addresses)) {
      addresses = addresses.split(',')
    }

    const addresses_length = addresses.length
    for (let i = 0; i < addresses_length; i++) {
      results.push(getAddress(addresses[i]))
    }
    return results
  }

  /**
   * sendmail directly
   *
   * @param mail {object}
   *             from
   *             to
   *             cc
   *             bcc
   *             replyTo
   *             returnTo
   *             subject
   *             type         default 'text/plain', 'text/html'
   *             charset      default 'utf-8'
   *             encoding     default 'base64'
   *             id           default timestamp+from
   *             headers      object
   *             content
   *             attachments
   *               [{
   *                 type
   *                 filename
   *                 content
   *               }].
   *
   * @param callback function(err, domain).
   *
   */
  function sendmail(mail, callback) {
    const mailMe = mailcomposer(mail)
    let recipients = []
    let groups: Record<string, string[]> = {}
    if (mail.to) {
      recipients = recipients.concat(getAddresses(mail.to))
    }

    if (mail.cc) {
      recipients = recipients.concat(getAddresses(mail.cc))
    }

    if (mail.bcc) {
      recipients = recipients.concat(getAddresses(mail.bcc))
    }

    groups = groupRecipients(recipients)

    const from = getAddress(mail.from)
    const srcHost = getHost(from)

    mailMe.build((err, message) => {
      if (err) {
        logger.error('Error on creating message : ', err)
        callback(err, null)
        return
      }
      if (dkimPrivateKey) {
        const signature = DKIMSign(message, {
          privateKey: dkimPrivateKey,
          keySelector: dkimKeySelector,
          domainName: srcHost,
        })
        message = `${signature}\r\n${message}`
      }
      for (const domain in groups) {
        sendToSMTP(domain, srcHost, from, groups[domain], message, callback)
      }
    })
  }
  return sendmail
}
