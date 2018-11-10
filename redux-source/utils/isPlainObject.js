/**
 * 用来判断是否是指定的对象
 * 即只能通过{}和new Object创建
 * 
 * 用来判断传给reducer的action对象是一个plain object，方便reducer进行处理，不用处理其他的情况(如promise/class/function等)
 * 也方便对状态进行记录或者回溯 
 */
export default function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false

  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}
