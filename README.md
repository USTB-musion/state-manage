# state-manage
flux,vuex,redux,mobx,rxjs....

### 写在前面
前端技术的发展日新月异，vue,react，angular等的兴起，为我们带来了新的开发体验。但随着技术的革新，以及前端页面复杂度的提升，对应有localStorage，eventBus，vuex，redux，mobx，rxjs等数据存储和管理的方案，所以觉得研究状态管理还是很有必要的。所以最近花了一些时间研究一下这方面的知识。在分析的过程当中可能有自己理解出偏差或者大家有理解不一样的地方，欢迎大家评论或私信我。

> 本文将从以下几部分进行总结：

1. 数据驱动视图
2. 组件间数据通信和eventBus
3. 单项数据流(vuex && redux)
4. 更好用的mobx
5. 实现一个超简易版的redux和react-redux

### 数据驱动视图
现在前端最火的react和vue，使用的设计思路都是数据驱动视图，即UI = f(state),当页面发生变化的时候，无须关心DOM的变化，只需关心state的变化即可。state映射到UI这个过程交给框架来处理。为了解决性能上的问题，Virtual DOM产生了。有了Virtual DOM之后，数据驱动视图可以简单地分为四个步骤：
- 数据变化，生成新的Virtual DOM
- 通过diff算法比对新的Virtual DOM和旧的Virtual DOM的异同
- 生成新旧对象的差异(patch)
- 遍历差异对象并更新DOM

有了react和vue之后，state => UI这一过程有了很好的实践，但反过来呢，**如何在UI中合理地修改state中成为了一个新的问题**。为此，Facebook提出了flux思想。具体可以参考阮一峰这一篇文章[Flux 架构入门教程](http://www.ruanyifeng.com/blog/2016/01/flux.html)。简单地说，Flux 是一种架构思想，它认为以前的MVC框架存在一些问题，于是打算用一个新的思维来管理数据流转。

### 组件间数据通信和eventBus
数据可以简单地分为两个部分，跨组件的数据和组件内的数据。组件内的数据大多数是和UI相关的，比如说单选框是否被勾选，按钮是否被点击。这些可以称为组件内状态数据。在react中，有一个概念叫做木偶组件，它里边存储的数据就是组件内状态数据。其实在市面上的很多UI组件库如element，ant design提供的都是木偶组件。另外一种数据就是跨组件的数据，比如父组件唤起子组件关闭，一旦面临着跨组件的交互，我们面临的问题就开始变得复杂了。这时候就需要一个机制来处理父子和兄弟组件通信。父组件对子组件就是props的传递，子组件对父组件react的处理方式就是父组件传递给子组件一个处理函数，由子组件调用，这样数据就由函数参数传给来父组件。vue的处理方式就是子组件通过$emit一个函数将数据由函数参数传给父组件由父组件接收调用。

eventBus则为中央通信，provide是一个对象或返回一个对象的函数。该对象包含可注入其子孙的属性：
<img src="https://user-gold-cdn.xitu.io/2018/10/26/166b11136b217df6?w=837&h=793&f=jpeg&s=92582" width="600">

inject 选项可以是：一个字符串数组，或一个对象。然后通过inject注入的值作为数据入口：
<img src="https://user-gold-cdn.xitu.io/2018/10/26/166b113de7c11f5b?w=592&h=575&f=jpeg&s=58405" width="600">

但对于多个视图需要依赖于统一状态或者来自于不同视图的行为需要变更同一状态。单单依赖于组件间的通信就显得有些鸡肋了。

### 单项数据流(vuex && redux)
下面用一张图来分别介绍以下redux和react的数据流是怎样的：
<img src="https://user-gold-cdn.xitu.io/2018/10/27/166b11ffe35e76a6" width="600">

Redux的数据具体是如何流动的，简单来就是说每个事件会发送一个action，action通过dispatch触发reducer，直接依据旧的state生成一个新state替代最顶层的store里面原有的state。

Redux强调三大基本原则：
- 唯一数据源
- 保持状态只读
- 数据改变只能通过纯函数完成

以todo-list为例，代码托管在github上：[Github](https://github.com/USTB-musion/state-manage)

**唯一数据源：**
唯一数据源指的是应用的状态数据应该只存储在唯一的一个Store上。todo-list应用的Store状态树大概是这样子:
```
{
    todos: [
        {
            text: 'First todo',
            completed: false,
            id: 0
        },
        {
            text: 'Second todo',
            completed: false,
            id: 1
        }
    ],
    filter: 'all'
}
```

**保持状态可读：**
要修改Store的状态，必须要通过派发一个action对象完成。根据UI=render(state),要驱动用户界面渲染，就要改变应用的状态，但是改变状态的方法不是去修改状态上的值，而是创建一个新的状态对象返回给Redux，由Redux完成新的状态的组装。

**数据改变只能通过纯函数完成：**
reducer必须要是一个纯函数，每个reducer函数格式如下：reducer(state, action):
```
import {ADD_TODO, TOGGLE_TODO, REMOVE_TODO}from './actionTypes.js';

export default (state = [], action) => {
  switch(action.type) {
    case ADD_TODO: {
      return [
        {
          id: action.id,
          text: action.text,
          completed: false
        },
        ...state
      ]
    }
    case TOGGLE_TODO: {
      return state.map((todoItem) => {
        if (todoItem.id === action.id) {
           return {...todoItem, completed: !todoItem.completed};
        } else {
          return todoItem;
        }
      })
    }
    case REMOVE_TODO: {
      return state.filter((todoItem) => {
        return todoItem.id !== action.id;
      })
    }
    default: {
      return state;
    }
  }
}
```

下面用官网的一张图来介绍以下vuex：

![](https://user-gold-cdn.xitu.io/2018/10/27/166b13844fda406d?w=701&h=551&f=png&s=8112)

vuex可以说是专门为vue设计的状态管理工具。和 Redux 中使用不可变数据来表示 state 不同，Vuex 中没有 reducer 来生成全新的 state 来替换旧的 state，Vuex 中的 state 是可以被修改的。这么做的原因和 Vue 的运行机制有关系，Vue 基于 ES5 中的 getter/setter 来实现视图和数据的双向绑定，因此 Vuex 中 state 的变更可以通过 setter 通知到视图中对应的指令来实现视图更新。

Vuex 中的 state 是可修改的，而修改 state 的方式不是通过 actions，而是通过 mutations。更改 Vuex 的 store 中的状态的唯一方法是提交 mutation。

vuex的数据流简单地说为：
- 在视图中触发 action，并根据实际情况传入需要的参数
- 在 action 中触发所需的 mutation，在 mutation 函数中改变 state
- 通过 getter/setter 实现的双向绑定会自动更新对应的视图

### 更好用的mobx
MobX 是通过透明的函数响应式编程(transparently applying functional reactive programming - TFRP)使得状态管理变得简单和可扩展。以下为mobx的流程图：

<img src="https://user-gold-cdn.xitu.io/2018/10/27/166b144698ad5c39?w=1407&h=483&f=png&s=79147" width="600">

mobx和redux相对比，就有点差别了，如果说redux是体现函数式编程，mobx则更多体现面向对象的特点。
mobx由几个要点：
- Observable。它的 state 是可被观察的，无论是基本数据类型还是引用数据类型，都可以使用 MobX 的 (@)observable 来转变为 observable value。源
- Reactions。它包含不同的概念，基于被观察数据的更新导致某个计算值（computed values），或者是发送网络请求以及更新视图等，都属于响应的范畴，这也是响应式编程（Reactive Programming）在 JavaScript 中的一个应用。
- Actions。它相当于所有响应的源头，例如用户在视图上的操作，或是某个网络请求的响应导致的被观察数据的变更。

### 实现一个简易版的redux和react-redux
> 简单实现redux的createStore，dispatch，subscribe, reducer, getState方法
```js
function createStore (reducer) {
  let state = null
  const listeners = []
  const subscribe = (listener) => listeners.push(listener) // 观察者模式实现监控数据变化
  const getState = () => state
  const dispatch = (action) => { //用于修改数据
    state = reducer(state, action) // reducer接受state和action
    listeners.forEach((listener) => listener())
  }
  dispatch({}) // 初始化 state
  return { getState, dispatch, subscribe } // 暴露出三个方法
}
```
> 简单实现react-redux的Provider，connect，mapStateToProps, mapDispatchToProps方法
**实现Provider方法：**
```
export class Provider extends Component {
  static propTypes = {
    store: PropTypes.object,
    children: PropTypes.any
  }

  static childContextTypes = {
    store: PropTypes.object
  }

  getChildContext () {
    return {
      store: this.props.store
    }
  }

  render () {
    return (
      <div>{this.props.children}</div>
    )
  }
}
```

这样就能用
```
<Provider store={store}>
    
</Provider>
```
包裹根组件了。

**实现connect方法,约定传入mapStateToProps和mapDispatchToprops：**

```
export const connect = (mapStateToProps, mapDispatchToProps) => (WrappedComponent) => {
  class Connect extends Component {
    static contextTypes = {
      store: PropTypes.object
    }

    constructor () {
      super()
      this.state = {
        allProps: {}
      }
    }

    componentWillMount () {
      const { store } = this.context
      this._updateProps()
      store.subscribe(() => this._updateProps())
    }

    _updateProps () {
      const { store } = this.context
      let stateProps = mapStateToProps
        ? mapStateToProps(store.getState(), this.props)
        : {} // 防止 mapStateToProps 没有传入
      let dispatchProps = mapDispatchToProps
        ? mapDispatchToProps(store.dispatch, this.props)
        : {} // 防止 mapDispatchToProps 没有传入
      this.setState({
        allProps: {
          ...stateProps,
          ...dispatchProps,
          ...this.props
        }
      })
    }

    render () {
      return <WrappedComponent {...this.state.allProps} />
    }
  }
  return Connect
}
```

### 总结
如果项目技术栈是基于vue的话，状态管理用vuex无疑是更好的选择。但如果技术栈是基于react，在redux和mobx的选择之间就仁者见仁，智者见智了。选择mobx的原因可能是没有redux那么多的流程，改变一个状态得去好几个文件里找代码。还有就是学习成本少，可能看下文档就能上手了。但缺点就是过于自由，提供的约定非常少，做大型项目就有点鸡肋了。但redux给开发者添加了许多限制，但就是这些限制，做大型项目时就不容易写乱。

### 参考文章
[vuex中文文档](https://vuex.vuejs.org/zh/)

[redux中文文档](http://www.redux.org.cn/docs/introduction/ThreePrinciples.html)

[浅谈前端状态管理（上）](https://zhuanlan.zhihu.com/p/25800767)

[前端状态管理请三思](https://zhuanlan.zhihu.com/p/30739948)

[前端数据管理与前端框架选择](https://www.zhihu.com/lives/896780923079639040)



