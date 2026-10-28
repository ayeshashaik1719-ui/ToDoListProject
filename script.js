const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const message = document.getElementById("message");
const totalCount = document.getElementById("total-count");
const pendingCount = document.getElementById("pending-count");
const completedCount = document.getElementById("completed-count");
const clearCompletedButton = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter");

let tasks = [];
let currentFilter = "all";

// Load saved tasks from this browser.
try {
  const saved = JSON.parse(localStorage.getItem("todoTasks") || "[]");
  if (Array.isArray(saved)) {
    tasks = saved.filter(task =>
      task && typeof task.id === "string" &&
      typeof task.text === "string" &&
      typeof task.completed === "boolean"
    );
  }
} catch {
  tasks = [];
}

function saveTasks() {
  try {
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
    message.textContent = "";
  } catch {
    message.textContent = "Unable to save tasks in this browser.";
  }
}

function updateCounts() {
  totalCount.textContent = tasks.length;
  pendingCount.textContent = tasks.filter(task => !task.completed).length;
  completedCount.textContent = tasks.filter(task => task.completed).length;
}

function renderTasks() {
  taskList.replaceChildren();
  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "pending") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  emptyState.hidden = visibleTasks.length > 0;
  taskList.hidden = visibleTasks.length === 0;

  const heading = emptyState.querySelector("h2");
  const description = emptyState.querySelector("p");
  if (tasks.length === 0) {
    heading.textContent = "No tasks yet!";
    description.textContent = "Add your first task to get started.";
  } else {
    heading.textContent = "No matching tasks";
    description.textContent = "Try another filter to see your tasks.";
  }

  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = "task-item";
    if (task.completed) item.classList.add("completed");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task completed");
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "action-btn";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => {
      const updated = prompt("Edit your task:", task.text);
      if (updated === null) return;
      if (!updated.trim()) {
        message.textContent = "Task cannot be empty.";
        return;
      }
      task.text = updated.trim();
      saveTasks();
      renderTasks();
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-btn delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      if (!confirm("Are you sure you want to delete this task?")) return;
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    actions.append(editButton, deleteButton);
    item.append(checkbox, text, actions);
    taskList.append(item);
  });

  updateCounts();
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) {
    message.textContent = "Please enter a task.";
    return;
  }

  tasks.push({
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()),
    text,
    completed: false
  });

  currentFilter = "all";
  filterButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "all");
  });
  taskInput.value = "";
  saveTasks();
  renderTasks();
  taskInput.focus();
});

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(item => item.classList.toggle("active", item === button));
    renderTasks();
  });
});

clearCompletedButton.addEventListener("click", () => {
  if (!tasks.some(task => task.completed)) {
    message.textContent = "No completed tasks to clear.";
    return;
  }
  if (!confirm("Delete all completed tasks?")) return;
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
