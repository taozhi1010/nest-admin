import { decode, encode } from '@xobj/core';

export const blobJSONTransformer = {
  to: (value) => (value ? Buffer.from(encode(value)) : undefined),
  from: (value: Buffer) => {
    if (value?.length) return decode(new Uint8Array(value).buffer);
    return null;
  },
};
