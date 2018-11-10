/**
 * 实际执行起来是这样子：
 * compose(f, g, h)(...args) => f(g(h(...args)))
 *
 * @param {...Function} funcs 多个函数，用逗号隔开
 * @returns {Function} 函数
 */

export default function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}
