import { Express } from 'express';

export interface IStorageService {
	saveFile: (
		targetPath: string,
		newFileName: string,
		file: Express.Multer.File
	) => Promise<{
		fileName: string;
		url: string;
	}>;

	checkExists: (targetFile: string) => Promise<boolean>;

	deleteFile: (targetFile: string) => Promise<void>;

	uploadChunk: (chunkPath: string, file: Express.Multer.File) => Promise<void>;

	mergeChunks: (sourceDir: string, targetFile: string, uploadId: string) => Promise<void>;

	uploadLargeFile: (
		sourceFile: string,
		targetFile: string
	) => Promise<{
		fileName: string;
		url: string;
	}>;
}
