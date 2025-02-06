import { evaluate, isNumeric } from "./shunting_yard.mjs";

const base = document.querySelector('.operation')

const IGNORE_SPACE = ['.']
const NO_FOLLOW = ['0', '00']
const STACK = []

const ACTIONS = {
  '0.': () => {
    if (!base) return;
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
    if (!base) return;
    console.log(STACK)
    if (STACK.length != 0) {
      const evaluate_to = evaluate(STACK, true)
      STACK.length = 0
      base.innerText = evaluate_to
      STACK.push(evaluate_to.toString())
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

  '+': () => push('+'),
  '-': () => push('-'),
  '*': () => push('*'),
  '/': () => push('/'),
  '%': () => push('%'),
  'clear': () => {
    STACK.length = 0
    if (base)
      base.innerText = ""
  },
  'clear-env': () => {
    STACK.length = 0
    if (base)
      base.innerText = ""
  }
}


/**
 * push to operation el
 * @param {string} text 
 */
function push(text) {
  if (!base) {
    console.error("Base element (.operation) doesn't exists")
    return
  }
  console.debug(STACK)
  if (IGNORE_SPACE.includes(text) || (isNumeric(text) && isNumeric(STACK.at(-1)))) {
    const prev = STACK.pop()
    base.innerText += text
    STACK.push(prev + text)
    return
  }

  if (NO_FOLLOW.includes(STACK.at(-1)) && isNumeric(text))
    return;
  if (STACK.at(-1)) {
    if (STACK.at(-1).includes('.') && isNumeric(text)) {
      const prev = STACK.pop()
      STACK.push(prev + text)
      base.innerText += prev + text
      return;
    }
  }
  base.innerText += text + ' '
  STACK.push(text)
  console.debug(STACK)
}

function capture_data() {
  document.querySelectorAll('[data-capture]').forEach(el => {
    const val = el.getAttribute('data-id') || ''
    el.addEventListener('click', () => {
      console.log(`'${val}' is clicked`)
      if (val in ACTIONS)
        ACTIONS[val](el)
    })
    console.log('Logging for this:', val)
  })
  console.log('capturing events')
}

function main() {
  capture_data()
}

main()