(function () {
  const STORAGE_KEY = "todos";

  const addForm = document.getElementById("add-form");
  const newTodoInput = document.getElementById("new-todo-input");
  const todoList = document.getElementById("todo-list");
  const emptyState = document.getElementById("empty-state");
  const itemsLeft = document.getElementById("items-left");
  const filtersEl = document.getElementById("filters");
  const clearCompletedBtn = document.getElementById("clear-completed");

  let todos = loadTodos();
  let filter = "all";

  function loadTodos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function getFilteredTodos() {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }

  function render() {
    const filtered = getFilteredTodos();
    todoList.innerHTML = "";

    filtered.forEach((todo) => {
      const li = document.createElement("li");
      li.className = "todo-item" + (todo.completed ? " completed" : "");
      li.dataset.id = todo.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.addEventListener("change", () => toggleTodo(todo.id));

      const label = document.createElement("span");
      label.className = "label";
      label.textContent = todo.text;
      label.title = "ダブルクリックで編集";
      label.addEventListener("dblclick", () => startEdit(li, todo));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "×";
      deleteBtn.setAttribute("aria-label", "削除");
      deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

      li.appendChild(checkbox);
      li.appendChild(label);
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });

    emptyState.hidden = filtered.length !== 0;

    const remaining = todos.filter((t) => !t.completed).length;
    itemsLeft.textContent = `${remaining} 件残り`;

    saveTodos();
  }

  function startEdit(li, todo) {
    const label = li.querySelector(".label");
    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-input";
    input.value = todo.text;
    input.maxLength = 200;

    li.replaceChild(input, label);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    let finished = false;
    const finish = (commit) => {
      if (finished) return;
      finished = true;
      if (commit) {
        const text = input.value.trim();
        if (text === "") {
          deleteTodo(todo.id);
          return;
        }
        todo.text = text;
      }
      render();
    };

    input.addEventListener("blur", () => finish(true));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        finish(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        finish(false);
      }
    });
  }

  function addTodo(text) {
    todos.unshift({ id: makeId(), text, completed: false });
    render();
  }

  function toggleTodo(id) {
    const todo = todos.find((t) => t.id === id);
    if (todo) todo.completed = !todo.completed;
    render();
  }

  function deleteTodo(id) {
    todos = todos.filter((t) => t.id !== id);
    render();
  }

  function clearCompleted() {
    todos = todos.filter((t) => !t.completed);
    render();
  }

  function setFilter(newFilter) {
    filter = newFilter;
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });
    render();
  }

  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = newTodoInput.value.trim();
    if (text === "") return;
    addTodo(text);
    newTodoInput.value = "";
    newTodoInput.focus();
  });

  filtersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    setFilter(btn.dataset.filter);
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);

  render();
})();
