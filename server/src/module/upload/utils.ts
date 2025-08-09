import { BadRequestException } from '@nestjs/common';
import iconv from 'iconv-lite';
import Mime from 'mime-types';

export function getExt(file: Express.Multer.File): string {
	const originalname = iconv.decode(Buffer.from(file.originalname, 'binary'), 'utf8');
	const mimetype = Mime.lookup(originalname) || file.mimetype;
	if (!mimetype) throw new BadRequestException('文件类型不支持');
	return Mime.extension(mimetype) || '';
}
