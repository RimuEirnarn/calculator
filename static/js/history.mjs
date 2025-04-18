/**
 * History entry
 * @typedef {Object} CalcHistory
 * 
 * @prop {string} id
 * @prop {string[]} expr
 * @prop {string} stdin
 * @prop {string} result
 */

function randomString(length) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');

  if (!length) {
    length = Math.floor(Math.random() * chars.length);
  }

  var str = '';
  for (var i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

class HistoryEntries {
  /** @type {CalcHistory[]} */
  #arr

  constructor() {
    this.#arr = []
  }


  /** @type {(x: CalcHistory) => void} */
  #push;
  /** @type {(x: CalcHistory) => void} */
  #pop;

  /** @type {(x: CalcHistory[]) => void} */
  #render;
  /**
   * 
   * @param {(x: CalcHistory) => void} fn 
   */
  register_push(fn) {
    this.#push = fn
  }

  /**
   * 
   * @param {(x: CalcHistory) => void} fn 
   */
  register_remove(fn) {
    this.#pop = fn
  }

  /**
   * 
   * @param {(x: CalcHistory[]) => void} fn 
   */
  register_render(fn) {
    this.#render = fn
  }

  /**
   * 
   * @param {CalcHistory} entry 
   */
  push(entry) {
    if (this.#push)
      this.#push(entry)
    this.#arr.push(entry)
  }

  /**
   * Pop last item from array
   * @returns {CalcHistory}
   */
  pop() {
    const entry = this.#arr.pop()
    this.#pop(entry)
    return entry
  }

  /**
   * Removes an entry with the given ID and optionally calls #pop callback
   * @param {string} id The ID of the entry to remove
   */
  remove(id) {
    const index = this.#arr.findIndex(a => a.id === id);
    if (index !== -1) {
      if (this.#pop) {
        this.#pop(this.#arr[index]);
      }
      this.#arr.splice(index, 1);
    }
  }

  /**
   * 
   * @param {(x: CalcHistory) => void} fn 
   */
  forEach(fn) {
    this.#arr.forEach(fn)
  }
}

export { HistoryEntries, randomString}