import createStore from './createStore'
import combineReducers from './combineReducers'
import bindActionCreators from './bindActionCreators'
import applyMiddleware from './applyMiddleware'
import compose from './compose'
import warning from './utils/warning'
import __DO_NOT_USE__ActionTypes from './utils/actionTypes'

/*
 * 验证redux在生产环境下是否被压缩
 * 默认情况下isCrushed.name === 'isCrushed',如果压缩了则不相等
 */
function isCrushed() {}

if (
  process.env.NODE_ENV !== 'production' &&
  typeof isCrushed.name === 'string' &&
  isCrushed.name !== 'isCrushed'
) {
  warning(
    'You are currently using minified code outside of NODE_ENV === "production". ' +
      'This means that you are running a slower development build of Redux. ' +
      'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' +
      'or setting mode to production in webpack (https://webpack.js.org/concepts/mode/) ' +
      'to ensure you have the correct code for your production build.'
  )
}

export {
  createStore, // 创建redux store来放所有的state
  combineReducers, // 将拆分的reducer组合起来 
  bindActionCreators, // 把action creators转成拥有同名keys的对象，使用时可以直接调用
  applyMiddleware, // 使用自定义的middleware来扩展redux
  compose, // 从右到左组合多个函数，函数式编程
  __DO_NOT_USE__ActionTypes // redux的私有属性，不要在自己的项目中使用这些属性
}
