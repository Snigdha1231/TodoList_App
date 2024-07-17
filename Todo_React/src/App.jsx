import { useEffect, useState } from "react";
import Search from "./components/Search";
import TodoList from "./components/TodoList";
import Filter from "./components/Filter";
import axios from "axios";

function App() {
  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [errors, setErrors] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/todos/")
      .then(res => {
        setTodos(res.data);
        setFilteredTodos(res.data);
      })
      .catch(err => setErrors(err.message));
  }, []);

  useEffect(() => {
    filterTodo(filterStatus);
  }, [todos, filterStatus]);

  // add todo function
  const addTodo = (data) => {
    const newId = todos.length > 0 ? parseInt(todos[todos.length - 1].id) + 1 : 0;
    const newTodo = { ...data, id: newId, status: "Active", completed: false };
    const originalTodos = [...todos];
    setTodos([...todos, newTodo]);

    axios.post("http://127.0.0.1:8000/todos/", newTodo)
      .then(res => setTodos([...originalTodos, res.data]))
      .catch(err => {
        setErrors(err.message);
        setTodos(originalTodos);
      });
  };

  // delete function
  const delTodo = (id) => {
    const originalTodos = [...todos];
    const updatedTodos = todos.filter(todo => todo.id !== id);
    setTodos(updatedTodos);

    axios.delete(`http://127.0.0.1:8000/todos/${id}`)
      .catch(err => {
        setErrors(err.message);
        setTodos(originalTodos);
      });
  };

  // update function
  const updateTodo = (e, id, text, todo) => {
    e.preventDefault();
    const updatedTodo = { ...todo, task: text };
    const updatedTodos = todos.map(t => t.id === id ? updatedTodo : t);
    setTodos(updatedTodos);

    axios.patch(`http://127.0.0.1:8000/todos/${id}`, updatedTodo)
      .catch(err => {
        setErrors(err.message);
        setTodos(todos);  // Rollback to previous state on error
      });
  };

  // complete function
  const completeTodo = (e, id, todo) => {
    const updatedTodo = { ...todo, completed: e.target.checked };
    const updatedTodos = todos.map(t => t.id === id ? updatedTodo : t);
    setTodos(updatedTodos);

    axios.patch(`http://127.0.0.1:8000/todos/${id}`, updatedTodo)
      .catch(err => {
        setErrors(err.message);
        setTodos(todos);  // Rollback to previous state on error
      });
  };

  const filterTodo = (status) => {
    setFilterStatus(status);
    if (status === "All") {
      setFilteredTodos(todos);
    } else {
      setFilteredTodos(todos.filter(todo => (status === "Completed" ? todo.completed : !todo.completed)));
    }
  };

  return (
    <div className="todo-container">
      {errors && <p>{errors}</p>}
      <Search addTodo={addTodo} />
      <Filter filter_todo={filterTodo} />
      <TodoList todos={filteredTodos} delTodo={delTodo} update_todo={updateTodo} complete_todo={completeTodo} />
    </div>
  );
}

export default App;
