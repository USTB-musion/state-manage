### redux源码分析

> Redux 暴露出来五个 API，分别是：

- createStore(reducer, [initialState])
- combineReducers(reducers)
- applyMiddleware(...middlewares)
- bindActionCreators(actionCreators, dispatch)
- compose(...functions)


> 通过createStore生成的store 暴露出来四个 API，分别是：

- getState()
- dispatch(action)
- subscribe(listener)
- replaceReducer(nextReducer)