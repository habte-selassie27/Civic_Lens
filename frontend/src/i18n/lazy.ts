/**
 * Lazy copy maps.
 *
 * Domain copy maps (`STATUS_LABEL`, `REASON_LABEL`, ...) are consumed as plain
 * object properties in ~40 places. If they held English strings, switching
 * language would leave every one of those call sites stale. If they held keys,
 * the call sites would need a resolver call each.
 *
 * A Proxy resolves the key at ACCESS time instead, so `STATUS_LABEL[row.status]`
 * keeps its exact current syntax and still follows the active locale — including
 * in ordinary functions and tests, where there is no React render to trigger.
 */

import { t } from "./store";

/** `Object.hasOwn` semantics: the prototype chain must not look like a key. */
const has = (keys: object, prop: PropertyKey): boolean =>
  Object.prototype.hasOwnProperty.call(keys, prop);

export function lazyMap<K extends string>(keys: Record<K, string>): Record<K, string> {
  return new Proxy({} as Record<K, string>, {
    get(_target, prop) {
      if (typeof prop !== "string" || !has(keys, prop)) return undefined;
      return t(keys[prop as K]);
    },
    has(_target, prop) {
      return has(keys, prop);
    },
    // Needed so Object.values()/Object.entries()/spread see the real keys —
    // the copy-guard test enumerates these maps.
    ownKeys() {
      return Object.keys(keys);
    },
    getOwnPropertyDescriptor(_target, prop) {
      if (typeof prop !== "string" || !has(keys, prop)) return undefined;
      return {
        value: t(keys[prop as K]),
        enumerable: true,
        configurable: true,
        writable: false,
      };
    },
  });
}
