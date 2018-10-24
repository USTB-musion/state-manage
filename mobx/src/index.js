import React from "react";
import { render } from "react-dom";
import DevTools from "mobx-react-devtools";

import TodoList from "./components/TodoList";
import TodoListModel from "./models/TodoListModel";
import TodoModel from "./models/TodoModel";

const store = new TodoListModel();

render(
  <div>
    <DevTools />
    <TodoList store={store} />
  </div>,
  document.getElementById("root")
);

store.addTodo("new code");
store.addTodo("write code");
store.todos[0].finished = true;
store.todos[1].finished = true;

setTimeout(() => {
  store.addTodo("musion");
  store.addTodo("001")
}, 1000);

// playing around in the console
window.store = store;
