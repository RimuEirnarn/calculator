

class IOSystem {
  /** @type {string} */
  #element_selector;

  /** @type {Element} */
  #element

  /** @type {string} */
  #mode

  /** @type {number} */
  #pointer;

  /**
   * 
   * @param {string} element 
   * @param {string} mode 
   */
  constructor(element, mode) {
    this.#element_selector = element
    this.#element = document.querySelector(element)
    if (this.#element == null) throw new Error("Invalid element selector")
    this.#mode = mode
    this.#pointer = 0
    this._validateMode()
  }

  _validateMode() {
    const validModes = new Set(['r', 'w', 'rw', 'wr']);
    if (!validModes.has(this.#mode)) {
      throw new Error(`Invalid mode '${this.#mode}'. Use 'r', 'w', or 'rw'`);
    }
  }

  readable() {
    return this.#mode.includes('r')
  }

  writable() {
    return this.#mode.includes('w')
  }

  /**
   * 
   * @returns {string}
   */
  #fetch() {
    if ('value' in this.#element)
      return this.#element.value
    return this.#element.textContent
  }

  /**
   * 
   * @param {string} value 
   * @returns 
   */
  #set(value) {
    if ('value' in this.#element) {
      this.#element.value = value
      return
    }
    this.#element.textContent = value
  }

  /**
   * Read this element content
   * @returns {string | null}
   */
  read() {
    if (!this.readable()) throw new Error("Cannot read in write-only element");
    return this.#fetch()
  }

  /**
   * Write to IO element
   * @param {string} data
   * @returns {number}
   */
  write(data) {
    if (!this.writable()) throw new Error("Cannot write in read-only element");
    if (typeof data !== 'string') data = data.toString()
    const content = this.#fetch()
    const before = content.slice(0, this.#pointer)
    const after = content.slice(this.#pointer + data.length)
    const updated = before + data + after
    this.#set(updated)
    this.#pointer += data.length
  }

  /**
   * truncate data until n
   * @param {number} n 
   */
  truncate(n) {
    if (!this.writable()) throw new Error("Cannot truncate in read-only element")
    const truncated = this.#fetch().slice(0, n)
    this.#set(truncated)
    if (this.#pointer > n) this.#pointer = n;
  }

  clear() {
    if (!this.writable()) throw new ("Cannot clear in read-only element")
    this.#set('')
    this.#pointer = 0
  }

  /**
   * Which position in the element we're in?
   */
  tell() {
    return this.#pointer
  }

  /**
   * Tell where our pointer will go
   * @param {number} n 
   */
  seek(n) {
    if (typeof n !== 'number' || n < 0) throw new Error("Position must be positive number")
    this.#pointer = n
  }
}

export { IOSystem }