import { decode, encode } from '@xobj/core';
import dayjs from 'dayjs';

export const blobJSONTransformer = {
	to: value => (value ? Buffer.from(encode(value)) : undefined),
	from: (value: Buffer) => {
		if (value?.length) return decode(new Uint8Array(value).buffer);
		return null;
	},
};

export const stringDateTransformer = {
	to: value => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : undefined),
	from: value => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : undefined),
};
