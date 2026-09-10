const ROLE_LIMIT = 2;

const roles = [
  "EXP Lane",
  "Jungle",
  "Mid Lane",
  "Gold Lane",
  "Roam"
];

let players = JSON.parse(
  localStorage.getItem("shadowLegendsPlayers") || "[]"
);

let selectedRole = null;

const roleCards = document.querySelectorAll(".role-card");
const selectedRoleText = document.getElementById("selectedRole");
const form = document.getElementById("registrationForm");
const playersList = document.getElementById("playersList");
const totalPlayers = document.getElementById("totalPlayers");

function getRoleCount(role) {
  return players.filter(player => player.role === role).length;
}

function updateRoles() {
  roleCards.forEach(card => {

    const role = card.dataset.role;
    const count = getRoleCount(role);

    const countElement = card.querySelector(".role-count");
    const bar = card.querySelector(".role-bar i");

    countElement.textContent = count;

    const percentage = (count / ROLE_LIMIT) * 100;
    bar.style.width = percentage + "%";

    card.classList.toggle("full", count >= ROLE_LIMIT);

    if (count >= ROLE_LIMIT) {
      card.dataset.full = "true";
    } else {
      card.dataset.full = "false";
    }
  });
}

function selectRole(card) {

  const role = card.dataset.role;
  const count = getRoleCount(role);

  if (count >= ROLE_LIMIT) {
    showToast("This role is already full.");
    return;
  }

  roleCards.forEach(c => c.classList.remove("selected"));

  card.classList.add("selected");

  selectedRole = role;

  selectedRoleText.textContent = role.toUpperCase();
}

roleCards.forEach(card => {
  card.addEventListener("click", () => {
    selectRole(card);
  });
});

form.addEventListener("submit", function(event) {

  event.preventDefault();

  const nickname =
    document.getElementById("nickname").value.trim();

  const mlbbId =
    document.getElementById("mlbbId").value.trim();

  const serverId =
    document.getElementById("serverId").value.trim();

  const contact =
    document.getElementById("contact").value.trim();

  if (!selectedRole) {
    showToast("Please select a role first.");
    return;
  }

  if (getRoleCount(selectedRole) >= ROLE_LIMIT) {
    showToast("This role is already full.");
    updateRoles();
    return;
  }

  const duplicate = players.some(
    player => player.mlbbId === mlbbId
  );

  if (duplicate) {
    showToast("This MLBB ID is already registered.");
    return;
  }

  const player = {
    id: Date.now(),
    nickname,
    mlbbId,
    serverId,
    contact,
    role: selectedRole,
    status: "Approved",
    createdAt: new Date().toISOString()
  };

  players.push(player);

  localStorage.setItem(
    "shadowLegendsPlayers",
    JSON.stringify(players)
  );

  form.reset();

  selectedRole = null;

  roleCards.forEach(card =>
    card.classList.remove("selected")
  );

  selectedRoleText.textContent = "NO ROLE SELECTED";

  updateRoles();
  renderPlayers();

  showToast(
    `${nickname} joined as ${player.role}.`
  );

  document
    .getElementById("players")
    .scrollIntoView({
      behavior: "smooth"
    });
});

function renderPlayers() {

  totalPlayers.textContent = players.length;

  if (players.length === 0) {

    playersList.innerHTML = `
      <div class="empty-state">
        <span>✦</span>
        <p>No players registered yet.</p>
        <small>Be the first legend.</small>
      </div>
    `;

    return;
  }

  playersList.innerHTML = "";

  players.forEach((player, index) => {

    const row = document.createElement("div");

    row.className = "player-row";

    row.innerHTML = `
      <div>
        <span style="color:#6e6578;margin-right:8px">
          #${String(index + 1).padStart(2, "0")}
        </span>
        <span class="player-name">
          ${escapeHTML(player.nickname)}
        </span>
      </div>

      <span>${escapeHTML(player.mlbbId)}</span>

      <span>${escapeHTML(player.serverId)}</span>

      <span>
        <span class="role-tag">
          ${escapeHTML(player.role)}
        </span>
      </span>

      <span class="approved">
        ● ${escapeHTML(player.status)}
      </span>
    `;

    playersList.appendChild(row);
  });
}

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

let toastTimer;

function showToast(message) {

  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");

  toastText.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

updateRoles();
renderPlayers();
