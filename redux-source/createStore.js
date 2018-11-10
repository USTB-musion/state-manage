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
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(
        'Actions must be plain objects. ' +
          'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
          'Have you misspelled a constant?'
      )
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.')
    }

    try {
      isDispatching = true
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }

    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }

    return action
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    currentReducer = nextReducer
    dispatch({ type: ActionTypes.REPLACE })
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */
  function observable() {
    const outerSubscribe = subscribe
    return {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer) {
        if (typeof observer !== 'object' || observer === null) {
          throw new TypeError('Expected the observer to be an object.')
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
