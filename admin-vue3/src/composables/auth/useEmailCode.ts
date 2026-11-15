import { sendEmailCode } from '@/api/login';

/** 发码冷却时间（秒），与服务端 EMAIL_SEND_COOLDOWN 对齐 */
const SEND_COOLDOWN_SECONDS = 60;
/** 冷却时间戳在 localStorage 的 key 前缀（按邮箱区分），页面刷新后倒计时不重置 */
const SENT_AT_PREFIX = 'email_code_sent_at:';

/**
 * 发送注册邮箱验证码（前端第一道发码拦截）
 * sending：请求进行中；countdown：冷却倒计时（秒），>0 时按钮禁用
 * handleSend：成功返回 true 并开始冷却持久化；失败返回 false 不落时间戳（错误提示由请求拦截器统一展示）
 * syncCountdown：按邮箱恢复剩余冷却，页面刷新/重开标签页后调用
 */
export function useEmailCode() {
  const sending = ref(false);
  const countdown = ref(0);
  let timer: ReturnType<typeof setInterval> | null = null;

  const getRemainSeconds = (email: string): number => {
    if (!email) return 0;
    const sentAt = Number(localStorage.getItem(SENT_AT_PREFIX + email)) || 0;
    if (!sentAt) return 0;
    return Math.max(0, SEND_COOLDOWN_SECONDS - Math.floor((Date.now() - sentAt) / 1000));
  };

  const startTimer = () => {
    if (timer) return;
    timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0 && timer) {
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  };

  const startCountdown = (email: string) => {
    localStorage.setItem(SENT_AT_PREFIX + email, String(Date.now()));
    countdown.value = SEND_COOLDOWN_SECONDS;
    startTimer();
  };

  const syncCountdown = (email: string) => {
    if (timer) return; // 本页已处于倒计时，沿用即可
    countdown.value = getRemainSeconds(email);
    if (countdown.value > 0) startTimer();
  };

  const handleSend = async (email: string): Promise<boolean> => {
    if (sending.value || countdown.value > 0) return false;
    sending.value = true;
    try {
      await sendEmailCode(email);
      ElMessage.success('验证码已发送，请查收邮件');
      startCountdown(email);
      return true;
    } catch {
      // 发送失败不落时间戳：后端同样不占冷却，用户可立即重试
      return false;
    } finally {
      sending.value = false;
    }
  };

  onUnmounted(() => {
    if (timer) clearInterval(timer);
  });

  return { sending, countdown, handleSend, syncCountdown };
}
