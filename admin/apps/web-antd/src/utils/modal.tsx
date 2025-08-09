import type { ModalFuncProps } from 'ant-design-vue';
import type { Rule } from 'ant-design-vue/es/form';

import { reactive } from 'vue';

import { Alert, Form, Input, Modal } from 'ant-design-vue';
import { isFunction } from 'lodash-es';

export interface ConfirmModalProps extends Omit<ModalFuncProps, 'visible'> {
  confirmText?: string;
  placeholder?: string;
  onValidated?: () => Promise<void>;
}

export function confirmDeleteModal(props: ConfirmModalProps) {
  const placeholder = props.placeholder || `输入'确认删除'`;
  const confirmText = props.confirmText || '确认删除';

  const formValue = reactive({
    content: '',
  });
  const rulesRef = reactive<{ [key: string]: Rule[] }>({
    content: [
      {
        message: '校验不通过',
        required: true,
        trigger: 'change',
        validator(_, value) {
          if (value !== confirmText) {
            return Promise.reject(new Error('校验不通过'));
          }
          return Promise.resolve();
        },
      },
    ],
  });
  const useForm = Form.useForm;
  const { validate, validateInfos } = useForm(formValue, rulesRef);

  Modal.confirm({
    ...props,
    centered: true,
    content: (
      <div class="flex flex-col gap-[8px]">
        <Alert message={'确认删除后将无法恢复，请谨慎操作！'} type="error" />
        <Form layout="vertical" model={formValue}>
          <Form.Item {...validateInfos.content}>
            <Input
              placeholder={placeholder}
              v-model:value={formValue.content}
            />
          </Form.Item>
        </Form>
      </div>
    ),
    okButtonProps: { danger: true, type: 'primary' },
    onOk: async () => {
      await validate();
      isFunction(props.onValidated) && props.onValidated();
    },
    title: '提示',
    type: 'warning',
  });
}
