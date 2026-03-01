/**
 * store.js — thin localStorage wrapper
 *
 * Usage:
 *   import store from './store.js';
 *   store.set('myKey', { foo: 'bar' });
 *   store.get('myKey');          // { foo: 'bar' }
 *   store.remove('myKey');
 */

const store = {
  /**
   * Read a value. Returns null if missing or unparseable.
   * @param {string} key
   * @returns {any}
   */
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? null : JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Write any JSON-serialisable value.
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('store.set failed:', e);
    }
  },

  /**
   * Delete a key.
   * @param {string} key
   */
  remove(key) {
    localStorage.removeItem(key);
  },
};

export default store;
