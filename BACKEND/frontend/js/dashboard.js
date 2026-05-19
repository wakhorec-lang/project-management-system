const API = "/api";
const AUTH_API = "/api/auth";

function getToken() {
  return localStorage.getItem("token");
}

const THEME_KEY = "pmTheme";

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark-theme", theme === "dark");
  const button = document.getElementById("themeToggle");
  if (button) {
    button.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  }
}

function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(saved);
}

function toggleTheme() {
  const current = document.documentElement.classList.contains("dark-theme") ? "dark" : "light";
  const next = current === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

async function createOrUpdateProject() {
  const projectId = document.getElementById("projectId").value;
  const title = document.getElementById("projectTitle").value;
  const description = document.getElementById("projectDescription").value;
  const deadline = document.getElementById("projectDeadline").value;
  const token = getToken();

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  if (!title) {
    alert("Project title is required.");
    return;
  }

  const url = projectId ? `${API}/projects/${projectId}` : `${API}/projects/create`;
  const method = projectId ? "PATCH" : "POST";
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description, deadline }),
  });

  const data = await response.json();
  if (!response.ok) {
    alert(data.message || "Project could not be saved.");
    return;
  }

  alert(data.message || (projectId ? "Project updated." : "Project created."));
  resetProjectForm();
  loadProjects();
}

function resetProjectForm() {
  const projectIdInput = document.getElementById("projectId");
  const titleInput = document.getElementById("projectTitle");
  const descriptionInput = document.getElementById("projectDescription");
  const deadlineInput = document.getElementById("projectDeadline");
  const submitButton = document.getElementById("projectSubmitButton");

  if (projectIdInput) projectIdInput.value = "";
  if (titleInput) titleInput.value = "";
  if (descriptionInput) descriptionInput.value = "";
  if (deadlineInput) deadlineInput.value = "";
  if (submitButton) submitButton.textContent = "Create Project";
}

function renderProjectTable(projects) {
  const tbody = document.querySelector("#projectTable tbody");
  if (!tbody) return;

  if (!Array.isArray(projects) || projects.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No projects available.</td></tr>`;
    return;
  }

  tbody.innerHTML = projects
    .map(
      (project) => `
        <tr>
          <td>${project.title}</td>
          <td>${project.description || "-"}</td>
          <td>${project.deadline || "-"}</td>
          <td>
            <button class="edit-button" onclick="editProject(${project.id})">Edit</button>
            <button class="delete-button" onclick="deleteProject(${project.id})">Delete</button>
          </td>
        </tr>`
    )
    .join("");
}

function editProject(projectId) {
  const project = window.adminProjects?.find((p) => p.id === projectId);
  if (!project) return;

  document.getElementById("projectId").value = project.id;
  document.getElementById("projectTitle").value = project.title;
  document.getElementById("projectDescription").value = project.description || "";
  document.getElementById("projectDeadline").value = project.deadline || "";
  const submitButton = document.getElementById("projectSubmitButton");
  if (submitButton) submitButton.textContent = "Update Project";
  window.location.href = "#createProjectSection";
}

async function deleteProject(projectId) {
  const token = getToken();
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  if (!confirm("Are you sure you want to delete this project?")) {
    return;
  }

  const response = await fetch(`${API}/projects/${projectId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) {
    alert(data.message || "Could not delete project.");
    return;
  }

  alert(data.message || "Project deleted.");
  loadProjects();
}

async function createOrUpdateTask() {
  const taskId = document.getElementById("taskId").value;
  const title = document.getElementById("taskTitle").value;
  const description = document.getElementById("taskDescription").value;
  const deadline = document.getElementById("taskDeadline").value;
  const project_id = document.getElementById("taskProject").value;
  const assigned_to = document.getElementById("taskAssignee").value;
  const priority = document.getElementById("taskPriority").value;
  const token = getToken();

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  if (!title || !project_id) {
    alert("Task title and project are required.");
    return;
  }

  const url = taskId ? `${API}/tasks/${taskId}` : `${API}/tasks/create`;
  const method = taskId ? "PATCH" : "POST";
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description, deadline, assigned_to, project_id, priority }),
  });

  const data = await response.json();
  if (!response.ok) {
    alert(data.message || "Task could not be saved.");
    return;
  }

  alert(data.message || (taskId ? "Task updated." : "Task created."));
  resetTaskForm();
  loadTasks();
}

function resetTaskForm() {
  document.getElementById("taskId").value = "";
  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDescription").value = "";
  document.getElementById("taskDeadline").value = "";
  document.getElementById("taskProject").value = "";
  document.getElementById("taskAssignee").value = "";
  document.getElementById("taskPriority").value = "medium";
  const submitButton = document.getElementById("taskSubmitButton");
  if (submitButton) submitButton.textContent = "Create Task";
}

function editTask(taskId) {
  const task = window.adminTasks?.find((item) => item.id === taskId);
  if (!task) return;

  document.getElementById("taskId").value = task.id;
  document.getElementById("taskTitle").value = task.title;
  document.getElementById("taskDescription").value = task.description || "";
  document.getElementById("taskDeadline").value = task.deadline || "";
  document.getElementById("taskProject").value = task.project_id || "";
  document.getElementById("taskAssignee").value = task.assigned_to || "";
  document.getElementById("taskPriority").value = task.priority || "medium";
  const submitButton = document.getElementById("taskSubmitButton");
  if (submitButton) submitButton.textContent = "Update Task";
  window.location.href = "#createTaskSection";
}

async function deleteTask(taskId) {
  const token = getToken();
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  if (!confirm("Are you sure you want to delete this task?")) {
    return;
  }

  const response = await fetch(`${API}/tasks/${taskId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) {
    alert(data.message || "Could not delete task.");
    return;
  }

  alert(data.message || "Task deleted.");
  loadTasks();
}

async function changeTaskStatus(taskId, status) {
  const token = getToken();
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const response = await fetch(`${API}/tasks/${taskId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  if (!response.ok) {
    alert(data.message || "Task status update failed.");
    return;
  }
  loadTasks();
}

async function loadTasks() {
  const token = getToken();

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const response = await fetch(`${API}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const tasks = await response.json();
  window.adminTasks = tasks;
  const tableBody = document.querySelector("#taskTable tbody");

  if (!Array.isArray(tasks) || tasks.length === 0) {
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="8">No tasks found.</td></tr>`;
    }
    document.getElementById("taskCount").textContent = 0;
    document.getElementById("completedCount").textContent = 0;
    document.getElementById("overdueCount").textContent = 0;
    return;
  }

  const today = new Date();
  let overdueCount = 0;

  const rows = tasks.map((task) => {
    const statusOptions = ["pending", "in progress", "completed"]
      .map((status) => `
        <option value="${status}" ${task.status === status ? "selected" : ""}>
          ${status}
        </option>`)
      .join("");

    const deadlineDate = task.deadline ? new Date(task.deadline) : null;
    const isOverdue = deadlineDate && task.status !== "completed" && deadlineDate < today;
    if (isOverdue) overdueCount += 1;

    return `
      <tr class="${isOverdue ? "overdue-row" : ""}">
        <td>${task.title}</td>
        <td>${task.project_title || "N/A"}</td>
        <td>${task.assignee_name || "Unassigned"}</td>
        <td>${task.deadline || "-"}</td>
        <td>${task.priority || "medium"}</td>
        <td>
          <select onchange="changeTaskStatus(${task.id}, this.value)">
            ${statusOptions}
          </select>
        </td>
        <td>${isOverdue ? "Yes" : "No"}</td>
        <td>
          <button class="edit-button" onclick="editTask(${task.id})">Edit</button>
          <button class="delete-button" onclick="deleteTask(${task.id})">Delete</button>
        </td>
      </tr>
    `;
  }).join("");

  if (tableBody) {
    tableBody.innerHTML = rows;
  }

  document.getElementById("taskCount").textContent = tasks.length;
  document.getElementById("completedCount").textContent = tasks.filter((task) => task.status === "completed").length;
  document.getElementById("overdueCount").textContent = overdueCount;
  renderAnalyticsCharts(tasks);
  renderNotifications(tasks, "notificationList", "notificationCount", "admin");
}

function renderNotifications(tasks, listId, countId, role) {
  const notifications = [];
  const today = new Date();
  const dueSoon = new Date();
  dueSoon.setDate(today.getDate() + 3);

  tasks.forEach((task) => {
    if (!task.deadline || task.status === "completed") return;
    const deadlineDate = new Date(task.deadline);
    const taskLabel = task.title || "Untitled Task";
    if (deadlineDate < today) {
      notifications.push({
        type: "Overdue",
        message: `${taskLabel} is overdue${role === "admin" ? ` (assigned to ${task.assignee_name || "Unassigned"})` : ""}.`,
      });
    } else if (deadlineDate <= dueSoon) {
      notifications.push({
        type: "Due Soon",
        message: `${taskLabel} is due on ${task.deadline}${role === "admin" ? ` (assigned to ${task.assignee_name || "Unassigned"})` : ""}.`,
      });
    }
  });

  const listEl = document.getElementById(listId);
  const countEl = document.getElementById(countId);
  if (!listEl || !countEl) return;

  countEl.textContent = notifications.length;
  if (notifications.length === 0) {
    listEl.innerHTML = "<p>No new notifications.</p>";
    return;
  }

  listEl.innerHTML = notifications
    .map(
      (item) => `
        <div class="notification-item ${item.type === "Overdue" ? "notification-overdue" : "notification-due-soon"}">
          <span class="notification-type">${item.type}</span>
          <p>${item.message}</p>
        </div>`
    )
    .join("");
}

let statusChart;
let priorityChart;

function renderAnalyticsCharts(tasks) {
  const statusCounts = tasks.reduce((acc, task) => {
    const key = task.status || "pending";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const priorityCounts = tasks.reduce((acc, task) => {
    const key = task.priority || "medium";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const statusLabels = ["pending", "in progress", "completed"];
  const statusData = statusLabels.map((label) => statusCounts[label] || 0);
  const priorityLabels = ["low", "medium", "high"];
  const priorityData = priorityLabels.map((label) => priorityCounts[label] || 0);

  const statusContext = document.getElementById("statusChart").getContext("2d");
  const priorityContext = document.getElementById("priorityChart").getContext("2d");

  if (statusChart) {
    statusChart.data.datasets[0].data = statusData;
    statusChart.update();
  } else {
    statusChart = new Chart(statusContext, {
      type: "doughnut",
      data: {
        labels: statusLabels,
        datasets: [{
          data: statusData,
          backgroundColor: ["#2563eb", "#f59e0b", "#10b981"],
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
        },
      },
    });
  }

  if (priorityChart) {
    priorityChart.data.datasets[0].data = priorityData;
    priorityChart.update();
  } else {
    priorityChart = new Chart(priorityContext, {
      type: "bar",
      data: {
        labels: priorityLabels,
        datasets: [{
          label: "Task Count",
          data: priorityData,
          backgroundColor: ["#3b82f6", "#6366f1", "#ef4444"],
        }],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
          },
        },
      },
    });
  }
}

async function loadProjects() {
  const token = getToken();
  if (!token) return;

  const [projectsResponse, membersResponse] = await Promise.all([
    fetch(`${API}/tasks/projects`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    }),
    fetch(`${API}/tasks/members`, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    }),
  ]);

  let projects = [];
  if (projectsResponse.ok) {
    projects = await projectsResponse.json();
    window.adminProjects = projects;
    const projectSelect = document.getElementById("taskProject");
    if (projectSelect) {
      projectSelect.innerHTML = `<option value="">Select Project</option>${projects
        .map((project) => `<option value="${project.id}">${project.title}</option>`)
        .join("")}`;
    }
    renderProjectTable(projects);
  }

  let members = [];
  if (membersResponse.ok) {
    members = await membersResponse.json();
    const assigneeSelect = document.getElementById("taskAssignee");
    if (assigneeSelect) {
      assigneeSelect.innerHTML = `<option value="">Assign To</option>${members
        .map((member) => `<option value="${member.id}">${member.name}</option>`)
        .join("")}`;
    }
  }

  const projectCountEl = document.getElementById("projectCount");
  if (projectCountEl) {
    projectCountEl.textContent = projects.length;
  }
}

async function loadUsers() {
  const token = getToken();
  if (!token) return;

  const response = await fetch(`${AUTH_API}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    return;
  }

  const users = await response.json();
  window.adminUsers = users;
  renderUsers(users);
}

function selectUserRole(userId) {
  const user = window.adminUsers?.find((item) => item.id === userId);
  if (!user) return;

  document.getElementById("selectedUserId").value = user.id;
  document.getElementById("selectedUserInfo").textContent = `Editing ${user.name} (${user.email})`;
  document.getElementById("userRoleSelect").value = user.role;
}

function resetUserForm() {
  document.getElementById("selectedUserId").value = "";
  document.getElementById("selectedUserInfo").textContent = "Select a user to change role";
  document.getElementById("userRoleSelect").value = "member";
}

async function updateUserRole() {
  const token = getToken();
  const userId = document.getElementById("selectedUserId").value;
  const role = document.getElementById("userRoleSelect").value;

  if (!token) {
    window.location.href = "index.html";
    return;
  }

  if (!userId) {
    alert("Please select a user first.");
    return;
  }

  const response = await fetch(`${AUTH_API}/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  const data = await response.json();
  if (!response.ok) {
    alert(data.message || "Could not update user role.");
    return;
  }

  alert(data.message || "User role updated.");
  resetUserForm();
  loadUsers();
}

function renderUsers(users) {
  const tbody = document.querySelector("#userTable tbody");
  if (!tbody) return;

  if (!Array.isArray(users) || users.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No users found.</td></tr>`;
    return;
  }

  tbody.innerHTML = users
    .map(
      (user) => `
        <tr>
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>
            <button class="edit-button" onclick="selectUserRole(${user.id})">Edit Role</button>
            <button class="delete-button" onclick="deleteUser(${user.id})">Delete</button>
          </td>
        </tr>`
    )
    .join(" ");
}

async function deleteUser(userId) {
  const token = getToken();
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  if (!confirm("Delete this user?")) {
    return;
  }

  const response = await fetch(`${AUTH_API}/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) {
    alert(data.message || "Could not delete user.");
    return;
  }

  alert(data.message || "User deleted.");
  loadUsers();
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

window.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  loadProjects();
  loadTasks();
  loadUsers();
});