import { mitt } from '@vben/utils';

type Events = {
  to: number;
};

export const emitter = mitt<Events>();

/**
 * 跳转到指定步骤
 * @param step 步骤
 */
export function toCurrentStep(step: number) {
  emitter.emit('to', step);
}
