import { randomString, HistoryEntries } from "./history.mjs";
import { IOSystem } from "./iosystem.mjs";
import { evaluate, functions, isNumeric, process } from "./shunting_yard.mjs";
import { createContextMenu, createContextMenuBySchema, createResultDiv, setupContextMenu } from "./contextmanager.mjs";

const IGNORE_SPACE = ['.']
const NO_FOLLOW = ['0', '00']
/** @type {string[]} */
const STACK = []
const INPUT_BUFFER = "#input-buffer"
const OUTPUT_BUFFER = "#output-buffer"
const INPUT_PREVENT = ['Enter', 'Backspace', '/']
const history_selector = "#history"
const history = new HistoryEntries()

history.register_push((x) => {
  const hist = document.querySelector(history_selector)
  if (!hist) {
    console.warn("DOM for history is not found")
    return
  }
  const rendered = createResultDiv(x, (e) => {
    system.stdin.clear()
    system.stdin.write(x.stdin)
    STACK.length = 0
    STACK.push(...x.expr)
    system.stdout.clear()
    system.stdout.write(x.result)
  })
  hist.appendChild(rendered)
})

const system = {
  _stdout: null,
  _stdin: null,

  /**
   * @returns {IOSystem}
   */
  get stdout() {
    if (!this._stdout) {
      this._stdout = new IOSystem(OUTPUT_BUFFER, 'wr')
    }
    return this._stdout
  },

  /**
   * @returns {IOSystem}
   */
  get stdin() {
    if (!this._stdin) {
      this._stdin = new IOSystem(INPUT_BUFFER, 'wr')
    }
    return this._stdin
  }
}

/**
 * Actions control
 */
const ACTIONS = {
  '0.': () => {
    console.debug(STACK.at(-1), STACK.at(-1)[-1])
    if (STACK.at(-1) == '.') return;
    if (STACK.at(-1)[-1] == '.') return;
    if (!isNumeric(STACK.at(-1))) {
      push('0.')
      return
    }
    push('.')
  },
  '=': () => {
    console.debug("Current Stack:", STACK)
    if (STACK.length != 0) {
      try {
        const evaluate_to = evaluate(STACK, true)
        history.push({id: randomString(16), expr: [...STACK], stdin: system.stdin.read(), result: evaluate_to})
        STACK.length = 0
        system.stdin.clear()
        system.stdin.write(evaluate_to)
        STACK.push(evaluate_to.toString())
      } catch (err) {
        system.stdout.clear()
        system.stdout.write('Error!')
        console.error(err)
      }
    }
  },
  'trace': () => {
    if (STACK.length == 0) return;
    try {
      const evaluate_to = evaluate(STACK, true)
      system.stdout.clear()
      system.stdout.write(evaluate_to)
    } catch (err) {
      console.error(err)
      console.debug(":3")
    }
  },
  '00': () => push('00'),
  '0': () => push('0'),
  '1': () => push('1'),
  '2': () => push('2'),
  '3': () => push('3'),
  '4': () => push('4'),
  '5': () => push('5'),
  '6': () => push('6'),
  '7': () => push('7'),
  '8': () => push('8'),
  '9': () => push('9'),

  '(': () => push('('),
  ')': () => push(')'),

  '+': () => push('+'),
  '-': () => push('-'),
  '*': () => push('*'),
  '/': () => push('/'),
  '%': () => push('%'),
  '^': () => push('^'),
  'sqrt': () => push('sqrt'),
  '3.14': () => push(Math.PI.toString()),
  'clear': () => {
    STACK.length = 0
    system.stdin.clear()
    system.stdout.clear()
  },
  'clear-one': () => {
    const prev = STACK.pop()
    if (prev?.length >= 2)
      STACK.push(prev.slice(0, -1))
    // if (base)
    //   base.innerText = base.innerText.slice(0, -1)
    system.stdin.truncate(system.stdin.read().slice(0, -1).length)
    system.stdout.clear()
    ACTIONS.trace()
  },
}

/**
 * @type {Object.<string, (element: HTMLElement, menu: HTMLElement, id: string, container: HTMLElement) => void>}
 */
const CTX_ACTIONS = {
  'sqrt': (element, menu, id, container) => {
    
  }
}

const CTX_SCHEMA = {
  'sqrt': (() => {
    const obj = []
    for (const key in functions) {
      if (Object.prototype.hasOwnProperty.call(functions, key)) {
        obj.push({content: key, classes: 'menu-btn', id: `functions/${key}`, fn: () => push(key)})
      }
    }
    return obj
  })()
}

ACTIONS['c'] = ACTIONS.clear
ACTIONS['.'] = ACTIONS['0.']

/**
 * push to operation el
 * @param {string} text 
 */
function push(text) {

  console.debug("Current Stack:", STACK)
  if (isNumeric(text) && STACK.at(-1) == '-' && (STACK.at(-2) == undefined || STACK.at(-2) == '(')) {
    const prev = STACK.pop()
    system.stdin.write(text)
    STACK.push(prev + text)
    ACTIONS.trace()
    return;
  }

  if (IGNORE_SPACE.includes(text) || (isNumeric(text) && isNumeric(STACK.at(-1)))) {
    const prev = STACK.pop()
    // base.innerText += text
    system.stdin.write(text)
    STACK.push(prev + text)
    ACTIONS.trace()
    return
  }

  if (NO_FOLLOW.includes(STACK.at(-1)) && isNumeric(text))
    return;
  if (STACK.at(-1)) {
    if (STACK.at(-1).includes('.') && isNumeric(text)) {
      const prev = STACK.pop()
      STACK.push(prev + text)
      // base.innerText += prev + text
      system.stdin.write(prev + text)
      ACTIONS.trace()
      return;
    }
  }
  // base.innerText += text + ' '
  system.stdin.write(text)
  STACK.push(text)
  ACTIONS.trace()
  console.debug(STACK)
}

function capture_data() {
  document.querySelectorAll('[data-capture]').forEach(el => {
    const val = el.getAttribute('data-id') || el.innerText || ''
    el.addEventListener('click', () => {
      console.debug(`'${val}' is clicked`)
      if (val in ACTIONS)
        ACTIONS[val](el)
    })
    console.debug('Logging for this:', val)
  })
  console.debug('capturing events')
}

function init_context_actions() {
  document.querySelectorAll('[data-capture][data-context-menu]').forEach(element => {
    const val = element.getAttribute('data-id') || element.innerText || ""

    if (val in CTX_SCHEMA)
      console.debug(val, CTX_SCHEMA[val])
      createContextMenuBySchema(element, CTX_SCHEMA[val], `menu/${val}`)
  })
}

function initiate_keyinput() {
  document.addEventListener('keydown', (event) => {
    if (event.key in ACTIONS) {
      ACTIONS[event.key]()
    }

    if (event.key == 'Enter') {
      ACTIONS['=']()
    }

    if (event.key == "Backspace") {
      ACTIONS['clear-one']()
    }

    if (INPUT_PREVENT.includes(event.key))
      event.preventDefault()
  })
}

function pywebview_init() {
  if (!window.pywebview) return;

  document.querySelector(".pywebview-drag-region").classList.add('pywebview')
}

function main() {
  init_context_actions()
  capture_data()
  initiate_keyinput()
  pywebview_init()
  window.system = system
  window.evaluate = evaluate
  window.process = process
}

document.addEventListener('DOMContentLoaded', main)