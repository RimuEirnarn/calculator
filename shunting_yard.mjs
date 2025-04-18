class ValueError extends Error { }

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

const OPERATORS_PRECEDENCE = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '%': 2,
  '^': 3
}

const OPERATORS = ['+', '/', '^', '-', '*']

function get(val, def = undefined) {
  if (val in OPERATORS_PRECEDENCE)
    return OPERATORS_PRECEDENCE[val];
  if (def == undefined)
    throw new Error('default is undefined')
  return def
}

const RIGHT_ASSOCIATIVE = ['^']

/**
 * Expression
 * @param {string[] | string} expr 
 */
function process(expr) {
  console.debug('processing...')
  const stack = []
  const output = []
  let last_was_num = false
  const expr_ = typeof expr == 'string' ? expr_.split(' ') : expr
  expr_.forEach((val, index) => {
    if (isNumeric(val)) {
      output.push(val)
      last_was_num = true
      return
    }

    if (val == '%') {
      if (last_was_num && (index == expr_.length || !isNumeric((expr_.at(index + 1))))) {
        output.push('%p') // Percentage
        return
      }
      stack.push('%')
      return
    }

    if (val in OPERATORS_PRECEDENCE) {
      while (stack.length != 0 && stack[-1] != '(' && get(stack.at(-1), 0) > OPERATORS_PRECEDENCE[val] || get(stack.at(-1), 0) == OPERATORS_PRECEDENCE[val] && !(val in RIGHT_ASSOCIATIVE))
        output.push(stack.pop())
      stack.push(val)
      last_was_num = false
      return
    }
    if (val == '(') {
      stack.push(val)
      last_was_num = false
      return
    }

    if (val == ')') {
      while (stack.length != 0 && stack.at(-1) != '(')
        output.push(stack.pop())
      stack.pop()
      last_was_num = false
      return
    }
  });

  while (stack.length != 0)
    output.push(stack.pop())

  return output.join(' ')
}

/**
 * Evaluate current format execution
 * @param {string | string[]} expression 
 * @param {boolean} [require_process=false] 
 * @returns 
 */
function evaluate(expression, require_process = false) {
  console.debug("evaluating")
  const stack = []
  const _base = (typeof expression == 'string' ? expression.split(' ') : expression)
  const tokens = require_process ? process(_base).split(' ') : _base
  console.debug(tokens)

  tokens.forEach(token => {
    if (isNumeric(token)) {
      stack.push(Number(token));
      return
    }

    if (OPERATORS.includes(token)) {
      if (stack.length < 2)
        throw new ValueError(`Invalid length: Expected stack to be 2, not ${stack.length}`)
      const b = stack.pop()
      const a = stack.pop()
      let result;
      if (token == '+') result = a + b
      if (token == '-') result = a - b
      if (token == '*') result = a * b
      if (token == '/') result = a / b
      if (token == '^') result = a ** b
      stack.push(result)
      return
    }

    if (token == '%') {
      if (stack.length == 0)
        throw new ValueError("Invalid expression; Stack length in inconsistent")
      const b = stack.pop()
      const a = stack.pop()
      stack.push(a % b)
      return
    }

    if (token == '%p') {
      if (stack.length < 1) throw new Error("Invalid expression");
      let a = stack.pop();
      if (stack.length < 1) throw new Error("Percent must apply to a number");
      let base = stack.pop();
      stack.push(base, base * (a / 100));  // Apply percentage correctly
      return
    }

    console.error('Invalid token:', token)
    return
  });

  if (stack.length != 1) {
    console.error(stack)
    throw new Error("Invalid postfix expression")
  }
  return stack[0]
}

export { evaluate, isNumeric }