import type { NotificationItem } from '@vben/layouts';

import { computed, ref, watch } from 'vue';

import { useAppConfig } from '@vben/hooks';
import { SvgMessageUrl } from '@vben/icons';
import { $t } from '@vben/locales';
import { useAccessStore, useUserStore } from '@vben/stores';

import { useEventSource } from '@vueuse/core';
import { notification } from 'ant-design-vue';
import dayjs from 'dayjs';
import { defineStore } from 'pinia';

const { apiURL, clientId, sseEnable } = useAppConfig(
  import.meta.env,
  import.meta.env.PROD,
);

export const useNotifyStore = defineStore(
  'app-notify',
  () => {
    /**
     * return才会被持久化 存储全部消息
     */
    const notificationList = ref<NotificationItem[]>([]);

    const userStore = useUserStore();
    const userId = computed(() => {
      return userStore.userInfo?.userId || '0';
    });

    const notifications = computed(() => {
      return notificationList.value.filter(
        (item) => item.userId === userId.value,
      );
    });

    /**
     * 开始监听sse消息
     */
    function startListeningMessage() {
      /**
       * 未开启 不监听
       */
      if (!sseEnable) {
        return;
      }
      const accessStore = useAccessStore();
      const token = accessStore.accessToken;

      const sseAddr = `${apiURL}/resource/sse?clientid=${clientId}&Authorization=Bearer ${token}`;

      const { data } = useEventSource(sseAddr, [], {
        autoReconnect: {
          delay: 1000,
          onFailed() {
            console.error('sse重连失败.');
          },
          retries: 3,
        },
      });

      watch(data, (message) => {
        if (!message) return;
        console.log(`接收到消息: ${message}`);

        notification.success({
          description: message,
          duration: 3,
          message: $t('component.notice.received'),
        });

        notificationList.value.unshift({
          // avatar: `https://api.multiavatar.com/${random(0, 10_000)}.png`, 随机头像
          avatar: SvgMessageUrl,
          date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          isRead: false,
          message,
          title: $t('component.notice.title'),
          userId: userId.value,
        });

        // 需要手动置空 vue3在值相同时不会触发watch
        data.value = null;
      });
    }

    /**
     * 设置全部已读
     */
    function setAllRead() {
      notificationList.value
        .filter((item) => item.userId === userId.value)
        .forEach((item) => {
          item.isRead = true;
        });
    }

    /**
     * 设置单条消息已读
     * @param item 通知
     */
    function setRead(item: NotificationItem) {
      !item.isRead && (item.isRead = true);
    }

    /**
     * 清空全部消息
     */
    function clearAllMessage() {
      notificationList.value = notificationList.value.filter(
        (item) => item.userId !== userId.value,
      );
    }

    /**
     * 只需要空实现即可
     * 否则会在退出登录清空所有
     */
    function $reset() {
      // notificationList.value = [];
    }
    /**
     * 显示小圆点
     */
    const showDot = computed(() =>
      notificationList.value
        .filter((item) => item.userId === userId.value)
        .some((item) => !item.isRead),
    );

    return {
      $reset,
      clearAllMessage,
      notificationList,
      notifications,
      setAllRead,
      setRead,
      showDot,
      startListeningMessage,
    };
  },
  {
    persist: {
      pick: ['notificationList'],
    },
  },
);
