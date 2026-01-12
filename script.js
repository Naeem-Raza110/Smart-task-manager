const addBtn = document.getElementById("add-task-btn");
const titleInput = document.getElementById("task-title");
const descInput = document.getElementById("task-desc");
const dateInput = document.getElementById("task-date");
const taskList = document.getElementById("task-list");
const searchInput = document.getElementById("search-task");
const sortSelect = document.getElementById("sort-task");
const filterBtns = document.querySelectorAll(".filter-btn");

let tasks = [];
let editTaskId = null;

/* ---------- LocalStorage ---------- */
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  const data = localStorage.getItem("tasks");
  if (data) {
    tasks = JSON.parse(data);
  }
}


/* ---------- Render Tasks ---------- */
function renderTasks() {
  let filteredTasks = [...tasks];

  const activeFilter = document.querySelector(".filter-btn.bg-gradient-to-r");
  if (activeFilter && activeFilter.dataset.status !== "all") {
    filteredTasks = filteredTasks.filter(
      (t) => t.status === activeFilter.dataset.status
    );
  }

  const search = searchInput.value.toLowerCase();
  if (search) {
    filteredTasks = filteredTasks.filter((t) =>
      t.title.toLowerCase().includes(search)
    );
  }

  switch (sortSelect.value) {
    case "latest":
      filteredTasks.sort((a, b) => b.id - a.id);
      break;
    case "oldest":
      filteredTasks.sort((a, b) => a.id - b.id);
      break;
    case "date":
      filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case "az":
      filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "za":
      filteredTasks.sort((a, b) => b.title.localeCompare(a.title));
      break;
  }

  taskList.innerHTML = "";

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    li.className = "flex justify-between items-start p-4 bg-white/10 rounded-2xl";

    li.innerHTML = `
      <div>
        <p class="text-white font-semibold text-lg ${
          task.status === "completed" ? "line-through text-white/50" : ""
        }">${task.title}</p>
        <p class="text-white/70 text-sm">${task.desc}</p>
        <span class="text-xs text-white/60">Due: ${task.date}</span>
      </div>
      <div class="flex gap-2">
        <button class="edit-btn cursor-pointer bg-gradient-to-r from-cyan-400 to-blue-400  rounded-xl text-white font-medium px-3 py-1">Edit</button>
        <button class="delete-btn cursor-pointer bg-gradient-to-r from-red-400 to-blue-500 rounded-xl text-white font-medium px-3 py-1">Delete</button>
        <button class="complete-btn cursor-pointer bg-gradient-to-r from-green-400 to-blue-500 rounded-xl text-white font-medium px-3 py-1">
          ${task.status === "completed" ? "Undo" : "Done"}
        </button>
      </div>
    `;

    taskList.appendChild(li);
  });
}

/* ---------- Add / Update ---------- */
addBtn.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();
  const date = dateInput.value;

  if (!title || !desc || !date) {
    alert("Please fill all fields!");
    return;
  }

  if (editTaskId) {
    const task = tasks.find((t) => t.id === editTaskId);
    task.title = title;
    task.desc = desc;
    task.date = date;

    editTaskId = null;
    addBtn.textContent = "Add Task";
  } else {
    tasks.push({
      id: Date.now(),
      title,
      desc,
      date,
      status: "pending",
    });
  }

  saveTasks();
  titleInput.value = "";
  descInput.value = "";
  dateInput.value = "";

  renderTasks();
});

/* ---------- Task Actions ---------- */
taskList.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  const id = Number(li.dataset.id);
  const task = tasks.find((t) => t.id === id);

  if (e.target.classList.contains("delete-btn")) {
    tasks = tasks.filter((t) => t.id !== id);
  }

  if (e.target.classList.contains("edit-btn")) {
    titleInput.value = task.title;
    descInput.value = task.desc;
    dateInput.value = task.date;

    editTaskId = id;
    addBtn.textContent = "Update Task";
  }

  if (e.target.classList.contains("complete-btn")) {
    task.status = task.status === "pending" ? "completed" : "pending";
  }

  saveTasks();
  renderTasks();
});

/* ---------- Search / Sort / Filter ---------- */
searchInput.addEventListener("input", renderTasks);
sortSelect.addEventListener("change", renderTasks);

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("bg-gradient-to-r"));
    btn.classList.add("bg-gradient-to-r");
    renderTasks();
  });
});

/* ---------- Init ---------- */
loadTasks();
renderTasks();
