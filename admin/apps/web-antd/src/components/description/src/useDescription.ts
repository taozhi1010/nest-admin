import type {
  DescInstance,
  DescriptionProps,
  UseDescReturnType,
} from './typing';

import { getCurrentInstance, ref, unref } from 'vue';

export function useDescription(
  props?: Partial<DescriptionProps>,
): UseDescReturnType {
  if (!getCurrentInstance()) {
    throw new Error(
      'useDescription() can only be used inside setup() or functional components!',
    );
  }
  const desc = ref<DescInstance | null>(null);
  const loaded = ref(false);

  function register(instance: DescInstance) {
    // if (unref(loaded) && import.meta.env.PROD) {
    //   return;
    // }
    desc.value = instance;
    props && instance.setDescProps(props);
    loaded.value = true;
  }

  const methods: DescInstance = {
    setDescProps: (
      descProps: Partial<DescriptionProps>,
      delay = false,
    ): void => {
      if (!delay) {
        unref(desc)?.setDescProps(descProps);
        return;
      }
      // 奇怪的问题 在modal中需要setTimeout才会生效
      setTimeout(() => unref(desc)?.setDescProps(descProps));
    },
  };

  return [register, methods];
}
