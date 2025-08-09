import { mitt } from '@vben/utils';

/**
 * dictType: string
 */
type Events = {
  rowClick: string;
};

export const emitter = mitt<Events>();
