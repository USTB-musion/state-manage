import $$observable from 'symbol-observable'

import ActionTypes from './utils/actionTypes'
import isPlainObject from './utils/isPlainObject'

// createStore会生成一个store，用来维护一个全局的store
export default function createStore(reducer, preloadedState, enhancer) {
  if (
    // 对传入的参数校验，不合适则报错
    (typeof preloadedState === 'function' && typeof enhancer === 'function') ||
    (typeof enhancer === 'function' && typeof arguments[3] === 'function')
  ) {
    throw new Error(
      'It looks like you are passing several store enhancers to ' +
        'createStore(). This is not supported. Instead, compose them ' +
        'together to a single function'
    )
  }

  // 只传入reducer和enhancer的情况
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }

  // 如果enhancer存在且是函数，则调用enhancer(createStore)(reducer, preloadedState)，并终止函数的执行
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }

    // 返回调用enhancer强化之后的store
    return enhancer(createStore)(reducer, preloadedState)
  }

  // 对传入的reducer做校验
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  // 存储当前的reducer
  let currentReducer = reducer
  // 存储当前的状态
  let currentState = preloadedState
  // 声明当前的监听函数列表为空数组
  let currentListeners = []
  // 存储下一个监听函数列表,nextListeners和currentListners指向同一个引用
  let nextListeners = currentListeners
  // 是否正在“dispatch”分发事件
  let isDispatching = false

  // 根据当前监听函数列表生成下一个监听函数列表的引用
  function ensureCanMutateNextListeners() { 
    if (nextListeners === currentListeners) {
      // 通过数组的slice方法将currentListeners复制给nextListeners
      nextListeners = currentListeners.slice()
    }
  }

  /**
   * getState方法会返回最新的state tree
   */
  function getState() {
    if (isDispatching) {
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentState
  }

  /**
   * 添加一个listener监听函数，当dispatch被调用的时候，这时state已经发生了一些变化
   * 你可以在listener函数调用getState()获取当前的state
   *
   * 你可以在listener改变的时候调用dispatch，但有一些注意事项：
   *
   * 1.subscriptions（订阅器）在每次dispatch之前都会保存一份快照
   * 当你正在调用监听器(listener)的时候订阅(subscribe)或者取消订阅（unsubscribe），
   * 对当前的dispatch()不会有任何影响。但对于下一次的dispatch(),无论嵌套与否，都会使用订阅列表里最近一次的快照。
   * 
   * 2.listener监听函数不应该监听所有state的变化，在嵌套的dispatch()导致多处的state发生多次的变化，
   * 我们应该保证所有的监听函数都注册在dispatch之前

   * @param {Function} listener 要监听的函数
   * @returns {Function} 一个可以移除监听的函数
   */
  function subscribe(listener) {
    // 如果listener不是函数类型会抛出异常
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.')
    }

    // 如果正在“dispatch”分发事件会报错
    if (isDispatching) {
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
          'If you would like to be notified after the store has been updated, subscribe from a ' +
          'component and invoke store.getState() in the callback to access the latest state. ' +
          'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.'
      )
    }

    // 标记有订阅的listener
    let isSubscribed = true

    // 保存一份快照
    ensureCanMutateNextListeners()
    // 添加一个订阅函数
    nextListeners.push(listener)

    // 返回一个取消订阅函数
    return function unsubscribe() {
      // 如果没有订阅一个listener，return；
      if (!isSubscribed) {
        return
      }

      if (isDispatching) {
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
            'See https://redux.js.org/api-reference/store#subscribe(listener) for more details.'
        )
      }

      // 标记还没有订阅的listener
      isSubscribed = false

      // 保存一份订阅快照
      ensureCanMutateNextListeners()
      // 找到当前的listener
      const index = nextListeners.indexOf(listener)
      // 移除当前的listener
      nextListeners.splice(index, 1)
    }
  }

  /**
   * dispatch一个action，这是唯一的一种方式去触发state的改变
   *
   * @param {Object} action 一个plain对象，对象当中必须要有type属性
   *
   * @returns {Object} 返回dispatch的action
   * 
   * 注意：如果你自定义中间件(middleware)，它可能包装'dispatch()'返回其他一些东西，如Promise
   */
  function dispatch(action) {
    // action是plain object，否则会报错
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
          'Use custom middleware for async actions.'
      )
    }

    // action的type如果是undefined，则抛出错误
    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
          'Have you misspelled a constant?'
      )
    }

    // reducer在处理的时候不能dispatch action
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      // 标记dispatch正在运行
      isDispatching = true
      // 执行当前的reducer函数返回新的state
      currentState = currentReducer(currentState, action)
    } finally {
      // finally 标记dispatch没有在运行
      isDispatching = false
    }

    // 将所有的监听函数赋值给listeners
    const listeners = (currentListeners = nextListeners)

    // 遍历执行每一个监听函数
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }

  /**
   * replaceReducer是替换当前的reducer的函数
   * 
   * 使用replaceRuducer的几种场景：
   * 1.当你程序需要代码分割的时候
   * 2.当你要动态地加载不同的reducer的时候
   * 3.当你需要实现一个实时reloading机制的时候
   *
   * @param {Function} nextReducer store需要使用的下一个reducer
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    //
    currentReducer = nextReducer
    dispatch({ type: ActionTypes.REPLACE })
  }

  /**
   * 这个API只能redux内部使用到。在测试用例中有使用到
   * @returns {observable} 状态改变时返回最小的observable
   * 如果你想知道更多信息，可以看observable提议：
   * https://github.com/tc39/proposal-observable
   */
  function observable() {
    const outerSubscribe = subscribe
    return {
      subscribe(observer) {
        // 判断observer是一个对象
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError('Expected the observer to be an object.')
        }

        // 获取观察者的状态
        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        // 返回一个取消订阅的方法
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      // 对象的私有属性
      [$$observable]() {
        return this
      }
    }
  }

  // reducer返回他们的初始状态
  // 初始化store里的state tree
  dispatch({ type: ActionTypes.INIT })

  // 返回store暴露出来的接口
  return {
    dispatch, // 唯一一个可以改变state的函数
    subscribe, // 订阅一个状态改变后，要触发的监听函数
    getState, // 获取store里的state
    replaceReducer, // Redux热加载的时候替换Reducer
    [$$observable]: observable // 对象的私有属性，供内部使用
  }
}
