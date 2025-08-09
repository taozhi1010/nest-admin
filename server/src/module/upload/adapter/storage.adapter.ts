import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IStorageService } from '../interface/storage.interface';
import { CosStorageService } from '../service/cos-storage.service';
import { LocalStorageService } from '../service/local-storage.service';

export type StorageType = 'local' | 'cos';

@Injectable()
export class StorageAdapter {
	private storageMap: Map<StorageType, IStorageService>;

	constructor(
		private config: ConfigService,
		private localStorageService: LocalStorageService,
		private cosStorageService: CosStorageService
	) {
		this.storageMap = new Map();
		this.storageMap.set('local', localStorageService);
		this.storageMap.set('cos', cosStorageService);
	}

	getStorage(type?: StorageType): IStorageService {
		const storageType = type || (this.config.get('extends.file.isLocal') ? 'local' : 'cos');
		const storage = this.storageMap.get(storageType);

		if (!storage) {
			throw new Error(`Storage type ${storageType} not supported`);
		}

		return storage;
	}

	// 注册新的存储服务
	registerStorage(type: string, storage: IStorageService) {
		this.storageMap.set(type as StorageType, storage);
	}
}
