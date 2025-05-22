



document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem('loggedIn') !== 'true') {
    window.location.href = 'login.html';
}

  
  const toggleBtn = document.getElementById("toggleSidebar");
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded");
  });

  // ✅ Mobile menu toggle
  document.getElementById("toggleSidebarMobile").addEventListener("click", () => {
    document.body.classList.toggle("sidebar-open");
  });

  document.querySelector(".dropdown-btn").addEventListener("click", function () {
    this.parentElement.classList.toggle("active");
  });

  const table = document.querySelector(".data-table");
  const tableBody = document.getElementById("userTableBody");
  const searchInput = document.getElementById("tableSearch");
  const paginationContainer = document.getElementById("pagination");

  let allUsers = [];
  let filteredUsers = [];
  let currentPage = 1;
  const rowsPerPage = 5;
  let currentSortColumn = null;
  let sortAscending = true;

  fetch("users.json")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load user data.");
      return response.json();
    })
    .then((data) => {
      allUsers = data;
      filteredUsers = [...allUsers];
      updateTable();
      updateSummaryCards();
    })
    .catch((error) => {
      console.error("Error:", error.message);
      showError("sorry it seems your village people are active, please try again later.");
    });

  function updateSummaryCards() {
    const total = allUsers.length;
    const active = allUsers.filter((u) => u.status === "Active").length;
    const pending = allUsers.filter((u) => u.status === "Pending").length;
    const inactive = allUsers.filter((u) => u.status === "Inactive").length;

    document.getElementById("totalUsers").textContent = total;
    document.getElementById("activeUsers").textContent = active;
    document.getElementById("pendingUsers").textContent = pending;
    document.getElementById("inactiveUsers").textContent = inactive;
  }

  function updateTable() {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const rows = filteredUsers.slice(start, end);

    tableBody.innerHTML = "";
    rows.forEach(user => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.XP}</td>
        <td>${user.status}</td>
        <td><button class="view-btn" data-id="${user.id}">View</button></td>
      `;
      tableBody.appendChild(row);
    });

    attachViewButtons();
    updatePagination();
  }

  function attachViewButtons() {
    document.querySelectorAll(".view-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const userId = parseInt(button.getAttribute("data-id"));
        const user = allUsers.find(u => u.id === userId);
        if (user) {
          document.getElementById("modalName").textContent = user.name;
          document.getElementById("modalEmail").textContent = user.email;
          document.getElementById("modalXP").textContent = user.XP;
          document.getElementById("modalStatus").textContent = user.status;
          document.getElementById("userModal").style.display = "block";
        }
      });
    });
  }

  document.querySelector(".close-button").addEventListener("click", () => {
    document.getElementById("userModal").style.display = "none";
  });

  window.addEventListener("click", (e) => {
    const modal = document.getElementById("userModal");
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  function updatePagination() {
    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
    paginationContainer.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.classList.toggle("active", i === currentPage);
      btn.addEventListener("click", () => {
        currentPage = i;
        updateTable();
      });
      paginationContainer.appendChild(btn);
    }
  }

  searchInput.addEventListener("input", function () {
    const value = searchInput.value.toLowerCase();
    filteredUsers = allUsers.filter(user =>
      Object.values(user).some(val =>
        String(val).toLowerCase().includes(value)
      )
    );
    currentPage = 1;
    updateTable();
  });

  table.querySelectorAll("th").forEach((header, columnIndex) => {
    header.addEventListener("click", () => {
      const keys = ["id", "name", "email", "XP", "status"];
      const key = keys[columnIndex];

      if (currentSortColumn === key) {
        sortAscending = !sortAscending;
      } else {
        sortAscending = true;
        currentSortColumn = key;
      }

      filteredUsers.sort((a, b) => {
        const aVal = String(a[key]).toLowerCase();
        const bVal = String(b[key]).toLowerCase();
        return sortAscending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });

      currentPage = 1;
      updateTable();
    });
  });

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      localStorage.removeItem('loggedIn');
      window.location.href = 'login.html';
    });
  }
});

function exportTableToCSV(filename) {
  const rows = document.querySelectorAll("table tr");
  let csv = [];

  rows.forEach(row => {
    const cols = row.querySelectorAll("td, th");
    const rowData = Array.from(cols).map(col => `"${col.textContent}"`);
    csv.push(rowData.join(","));
  });

  const csvBlob = new Blob([csv.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(csvBlob);

  const a = document.createElement("a");
  a.setAttribute("href", url);
  a.setAttribute("download", filename);
  a.click();
}

document.getElementById("exportBtn").addEventListener("click", function () {
  exportTableToCSV("sophia-tech-users.csv");
});

document.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "e") {
    e.preventDefault();
    exportTableToCSV("sophia-tech-users.csv");
  }
});

function showError(message) {
  const table = document.getElementById("userTableBody");
  table.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">${message}</td></tr>`;
}

// Toggle sidebar visibility using a single state class
document.querySelectorAll('#toggleSidebar, #toggleSidebarMain, #toggleSidebarMobile').forEach(button => {
    button.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-collapsed');
    });
});

console.log("Dashboard loaded.");

