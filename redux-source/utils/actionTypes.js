/**
 * 这些是Redux使用的私有action types
 * 如果actions匹配不上，返回current state
 * 如果current state没有定义，返回initial state
 * 不要在自己的项目中使用这些action types
 */

const randomString = () =>
  Math.random()
    .toString(36)
    .substring(7)
    .split('')
    .join('.')

const ActionTypes = {
  INIT: `@@redux/INIT${randomString()}`,
  REPLACE: `@@redux/REPLACE${randomString()}`,
  PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
}

export default ActionTypes
