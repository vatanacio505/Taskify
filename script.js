/* GLOBAL VARIABLES */
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

const totalEl = document.getElementById("total");
const completedEl = document.getElementById("completed");
const deletedEl = document.getElementById("deleted");
const editedEl = document.getElementById("edited");

const sortAscBtn = document.getElementById("sortAsc");
const sortDescBtn = document.getElementById("sortDesc"); // NEW descending button
const resetSortBtn = document.getElementById("resetSort");
const deleteSelectedBtn = document.getElementById("deleteSelected");
const themeBtn = document.getElementById("themeBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let deletedCount = 0;
let editedCount = 0;

/* EVENT LISTENERS */
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => { if (e.key === "Enter") addTask(); });
themeBtn.addEventListener("click", () => { document.body.classList.toggle("dark"); });

sortAscBtn.addEventListener("click", () => sortTasks("asc"));
sortDescBtn.addEventListener("click", () => sortTasks("desc")); // NEW
resetSortBtn.addEventListener("click", () => resetSort());

deleteSelectedBtn.addEventListener("click", deleteSelectedTasks);
document.addEventListener("keydown", e => { if (e.key === "Delete") deleteSelectedTasks(); });

/* FUNCTIONS */

// Add Task
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return alert("Task cannot be empty!");
  if (tasks.some(t => t.text.toLowerCase() === text.toLowerCase())) return alert("Duplicate task not allowed!");

  const task = { text, completed: false, id: Date.now(), order: tasks.length };
  tasks.push(task);
  saveTasks();
  renderTasks();
  taskInput.value = "";
}

// Render Tasks
function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.setAttribute("draggable", true);
    if (task.completed) li.classList.add("completed");

    // Checkbox for selection only
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => {
      li.classList.toggle("selected", checkbox.checked);
    });

    // Task text
    const span = document.createElement("span");
    span.textContent = task.text;
    span.className = "task-text";
    span.addEventListener("dblclick", () => editTask(task, span));

    // Buttons
    const btns = document.createElement("div");
    btns.className = "buttons";

    const completeBtn = document.createElement("button");
    completeBtn.textContent = "✔";
    completeBtn.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖";
    deleteBtn.addEventListener("click", () => {
      if (confirm(`Delete task: "${task.text}"?`)) {
        tasks = tasks.filter(t => t.id !== task.id);
        deletedCount++;
        saveTasks();
        renderTasks();
      }
    });

    btns.appendChild(completeBtn);
    btns.appendChild(deleteBtn);

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(btns);

    // Drag-and-drop events
    li.addEventListener("dragstart", e => {
      e.dataTransfer.setData("id", task.id);
    });
    li.addEventListener("dragover", e => e.preventDefault());
    li.addEventListener("drop", e => {
      const draggedId = e.dataTransfer.getData("id");
      reorderTasks(draggedId, task.id);
    });

    taskList.appendChild(li);
  });

  updateStats();
}

// Edit Task
function editTask(task, span) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = task.text;
  span.replaceWith(input);
  input.focus();

  const saveEdit = () => {
    const newText = input.value.trim();
    if (!newText) return alert("Task cannot be empty!");
    if (tasks.some(t => t.text.toLowerCase() === newText.toLowerCase() && t.id !== task.id)) {
      return alert("Duplicate task is not allowed!");
    }
    task.text = newText;
    editedCount++;
    saveTasks();
    renderTasks();
  };

  input.addEventListener("keypress", e => { if (e.key === "Enter") saveEdit(); });
  input.addEventListener("blur", saveEdit);
}

// Delete Selected Tasks
function deleteSelectedTasks() {
  const selected = tasks.filter((_, i) => taskList.children[i].classList.contains("selected"));
  if (selected.length === 0) return;

  if (confirm(`Delete ${selected.length} selected tasks?`)) {
    tasks = tasks.filter((_, i) => !taskList.children[i].classList.contains("selected"));
    deletedCount += selected.length;
    saveTasks();
    renderTasks();
  }
}

// Sort Tasks (A–Z or Z–A)
function sortTasks(order) {
  if (order === "asc") {
    tasks.sort((a, b) => a.text.localeCompare(b.text));
  } else if (order === "desc") {
    tasks.sort((a, b) => b.text.localeCompare(a.text));
  }
  renderTasks();
}

// Reset Sort (restore original order)
function resetSort() {
  tasks.sort((a, b) => a.order - b.order);
  renderTasks();
}

// Reorder Tasks (Drag-and-Drop)
function reorderTasks(draggedId, targetId) {
  const draggedIndex = tasks.findIndex(t => t.id == draggedId);
  const targetIndex = tasks.findIndex(t => t.id == targetId);
  const [draggedTask] = tasks.splice(draggedIndex, 1);
  tasks.splice(targetIndex, 0, draggedTask);
  saveTasks();
  renderTasks();
}

// Update Stats
function updateStats() {
  totalEl.textContent = tasks.length;
  completedEl.textContent = tasks.filter(t => t.completed).length;
  deletedEl.textContent = deletedCount;
  editedEl.textContent = editedCount;
}

// Save to Local Storage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function sortTasks(order) {
  if (tasks.length === 0) {
    alert("No tasks to sort!");
    return;
  }
  if (order === "asc") {
    tasks.sort((a, b) => a.text.localeCompare(b.text));
  } else if (order === "desc") {
    tasks.sort((a, b) => b.text.localeCompare(a.text));
  }
  renderTasks();
}

const errorMsg = document.getElementById("errorMsg");

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = "block";
  setTimeout(() => {
    errorMsg.style.display = "none"; 
  }, 3000);
}

// Sort Tasks
function sortTasks(order) {
  if (tasks.length === 0) {
    showError("No tasks to sort!");
    return;
  }
  if (order === "asc") {
    tasks.sort((a, b) => a.text.localeCompare(b.text));
  } else if (order === "desc") {
    tasks.sort((a, b) => b.text.localeCompare(a.text));
  }
  renderTasks();
}

// Reset Sort
function resetSort() {
  if (tasks.length === 0) {
    showError("No tasks to reset!");
    return;
  }
  tasks.sort((a, b) => a.order - b.order);
  renderTasks();
}

// Delete Selected
function deleteSelectedTasks() {
  if (tasks.length === 0) {
    showError("No tasks to delete!");
    return;
  }
  const selected = tasks.filter((_, i) => taskList.children[i].classList.contains("selected"));
  if (selected.length === 0) {
    showError("No tasks selected!");
    return;
  }
  if (confirm(`Delete ${selected.length} selected tasks?`)) {
    tasks = tasks.filter((_, i) => !taskList.children[i].classList.contains("selected"));
    deletedCount += selected.length;
    saveTasks();
    renderTasks();
  }
}


// Initial Render
renderTasks();