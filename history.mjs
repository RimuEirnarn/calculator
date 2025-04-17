/**
 * History entry
 * @typedef {Object} CalcHistory
 * 
 * @prop {string[]} expr
 * @prop {string} result
 */

/**
 * All correctly evaluated expression (called with '=' action) will be stored here
 * @type {CalcHistory[]}
 */
const HISTORY = []

export { HISTORY }