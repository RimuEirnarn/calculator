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
   * @param {string} id 
   */
  getItem(id) {
    console.log(this.#arr, id)
    return this.#arr.find((x) => x.id == id)
  }

  /**
   * 
   * @param {(x: CalcHistory) => void} fn 
   */
  forEach(fn) {
    this.#arr.forEach(fn)
  }
}

/**
 * LocalStorage-based HistoryEntries
 */
class LocalStorageHistoryEntries extends HistoryEntries {
  /** @type {CalcHistory[]} */
  #arr;

  /** @type {(x: CalcHistory) => void} */
  #push;
  /** @type {(x: CalcHistory) => void} */
  #pop;
  constructor(storageKey) {
    super();
    this.#arr = [];
    this.storageKey = storageKey;
    this.#loadFromStorage();
  }

  #saveToStorage() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.#arr));
  }

  #loadFromStorage() {
    const data = localStorage.getItem(this.storageKey);
    if (data) {
      this.#arr = JSON.parse(data);
    }
  }

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
   * @param {CalcHistory} entry 
   */
  push(entry) {
    if (this.#push)
      this.#push(entry)
    this.#arr.push(entry)
    this.#saveToStorage();
  }

  /**
   * Pop last item from array
   * @returns {CalcHistory}
   */
  pop() {
    const entry = this.#arr.pop()
    this.#pop(entry)
    this.#saveToStorage();
    return entry;
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
   * @param {string} id 
   */
  getItem(id) {
    return this.#arr.find((x) => x.id == id)
  }

  /**
   * 
   * @param {(x: CalcHistory) => void} fn 
   */
  forEach(fn) {
    this.#arr.forEach(fn)
  }
}


const history = new HistoryEntries()
const memory = new LocalStorageHistoryEntries('calcHistory');


export { HistoryEntries, randomString, history, memory }