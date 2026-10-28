import {browser} from "$app/environment";
import {writable} from "svelte/store";

export const storageStatus = writable({recovered: false, unavailable: false});
const memory = new Map<string, string | null>();

export function reportSettingsRecovery() {
  if (browser) storageStatus.update(status => (status.recovered ? status : {...status, recovered: true}));
}
function unavailable() {
  storageStatus.update(status => (status.unavailable ? status : {...status, unavailable: true}));
}

/** Keep this tab usable when access is denied or writes exceed the browser quota.
 * Invalid saved data is ignored in memory, never deleted during recovery.
 */
export const settingsStorage = {
  getItem(key: string): string | null {
    if (!browser) return null;
    if (memory.has(key)) return memory.get(key)!;
    try {
      return window.localStorage.getItem(key);
    } catch {
      unavailable();
      return null;
    }
  },
  setItem(key: string, value: string | number | boolean): void {
    if (!browser) return;
    const text = String(value);
    memory.set(key, text);
    try {
      window.localStorage.setItem(key, text);
    } catch {
      unavailable();
    }
  },
  removeItem(key: string): void {
    if (!browser) return;
    memory.set(key, null);
    try {
      window.localStorage.removeItem(key);
    } catch {
      unavailable();
    }
  },
  ignore(key: string): void {
    if (browser) memory.set(key, null);
    reportSettingsRecovery();
  }
};
