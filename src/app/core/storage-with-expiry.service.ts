import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageWithExpiryService {
  setItem(key: string, value: any, ttlMs: number): void {
    const now = new Date();

    const item = {
      value: value,
      expiry: now.getTime() + ttlMs,
    };

    localStorage.setItem(key, JSON.stringify(item));
  }

  getItem(key: string): any | null {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);

      const now = new Date();

      if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }      
      return item.value;
    } catch (e) {
      console.warn('Failed to parse localStorage item', e);
      return null;
    }
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
