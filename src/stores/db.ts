import Dexie, { type Table } from 'dexie';
import type { NetworkRequest } from './requestStore';

export interface SavedRequest extends NetworkRequest {
  collectionId?: string;
  name?: string;
  savedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  createdAt: number;
}

export class APIInspectorDB extends Dexie {
  savedRequests!: Table<SavedRequest, string>;
  collections!: Table<Collection, string>;

  constructor() {
    super('APIInspectorDB');
    this.version(1).stores({
      savedRequests: 'id, collectionId, method, url, savedAt',
      collections: 'id, name, createdAt'
    });
  }
}

export const db = new APIInspectorDB();
