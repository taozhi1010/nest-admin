import { mitt } from '@vben/utils';

type Events = {
  updateProfile: void;
};

export const emitter = mitt<Events>();
