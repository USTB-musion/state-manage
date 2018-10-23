import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'
import Header from './Header'
import Content from './Content'
import './index.css'

function createStore(reducer) {
  let state = null
  const listeners = []
  const subscribe = (listener) => listeners.push(listener)
  const getState = () => state
  const dispatch = (action) => {
    state = reducer(state, action)
    listeners.forEach((listener) => listener())
  }
  dispatch({})
  return { getState, dispatch, subscribe}
}

const themeReducer = (state, action) => {
  if (!state) return {
    themeColor: 'red'
  }
  switch (action.type) {
    case 'CHANGE_COLOR':
      return { ...state, themeColor: action.themeColor}
    default:  
      return state
  }
}

const store = createStore(themeReducer)

class Index extends Component {

  static childContextTypes = {
    store: PropTypes.object
  }

  getChildContext() {
    return { store }
  }

  render () {
    return (
      <div>
        <Header />
        <Content />
      </div>
    )
  }
}

ReactDOM.render(
  <Index />,
  document.getElementById('root')
)

// function createStore (state, stateChanger) {
//   const listeners = []
//   const subscribe = (listener) => listeners.push(listener)
//   const getState = () => state
//   const dispatch = (action) => {
//     state = stateChanger(state, action) // 覆盖原对象
//     listeners.forEach((listener) => listener())
//   }
//   return { getState, dispatch, subscribe }
// }

// function renderApp (newAppState, oldAppState = {}) { // 防止 oldAppState 没有传入，所以加了默认参数 oldAppState = {}
//   if (newAppState === oldAppState) return // 数据没有变化就不渲染了
//   console.log('render app...')
//   renderTitle(newAppState.title, oldAppState.title)
//   renderContent(newAppState.content, oldAppState.content)
// }

// function renderTitle (newTitle, oldTitle = {}) {
//   if (newTitle === oldTitle) return // 数据没有变化就不渲染了
//   console.log('render title...')
//   const titleDOM = document.getElementById('title')
//   titleDOM.innerHTML = newTitle.text
//   titleDOM.style.color = newTitle.color
// }

// function renderContent (newContent, oldContent = {}) {
//   if (newContent === oldContent) return // 数据没有变化就不渲染了
//   console.log('render content...')
//   const contentDOM = document.getElementById('content')
//   contentDOM.innerHTML = newContent.text
//   contentDOM.style.color = newContent.color
// }

// let appState = {
//   title: {
//     text: 'React.js 小书',
//     color: 'red',
//   },
//   content: {
//     text: 'React.js 小书内容',
//     color: 'blue'
//   }
// }

// function stateChanger (state, action) {
//   switch (action.type) {
//     case 'UPDATE_TITLE_TEXT':
//       return { // 构建新的对象并且返回
//         ...state,
//         title: {
//           ...state.title,
//           text: action.text
//         }
//       }
//     case 'UPDATE_TITLE_COLOR':
//       return { // 构建新的对象并且返回
//         ...state,
//         title: {
//           ...state.title,
//           color: action.color
//         }
//       }
//     default:
//       return state // 没有修改，返回原来的对象
//   }
// }

// const store = createStore(appState, stateChanger)
// let oldState = store.getState() // 缓存旧的 state
// store.subscribe(() => {
//   const newState = store.getState() // 数据可能变化，获取新的 state
//   renderApp(newState, oldState) // 把新旧的 state 传进去渲染
//   oldState = newState // 渲染完以后，新的 newState 变成了旧的 oldState，等待下一次数据变化重新渲染
// })

// renderApp(store.getState()) // 首次渲染页面
// store.dispatch({ type: 'UPDATE_TITLE_TEXT', text: '《React.js 小书00》' }) // 修改标题文本
// store.dispatch({ type: 'UPDATE_TITLE_COLOR', color: 'blue' }) // 修改标题颜色