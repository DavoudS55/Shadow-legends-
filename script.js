/*
  SHADOW LEGENDS

  IMPORTANT:
  This frontend does NOT contain an admin password.

  For production:
  connect Supabase Auth here.
*/


const CUSTOMS_KEY = "shadow_legends_customs_v3";
const REGISTRATIONS_KEY = "shadow_legends_registrations_v3";


// --------------------------------------------------
// ELEMENTS
// --------------------------------------------------

const liveCustoms = document.getElementById("liveCustoms");
const upcomingCustoms = document.getElementById("upcomingCustoms");

const registerModal = document.getElementById("registerModal");
const detailsModal = document.getElementById("detailsModal");
const successModal = document.getElementById("successModal");
const adminLoginModal = document.getElementById("adminLoginModal");
const adminScreen = document.getElementById("adminScreen");

const registrationForm = document.getElementById("registrationForm");
const adminLoginForm = document.getElementById("adminLoginForm");
const customForm = document.getElementById("customForm");

const rankSelect = document.getElementById("rank");
const starsContainer = document.getElementById("starsContainer");


// --------------------------------------------------
// STORAGE
// --------------------------------------------------

function getCustoms() {
  return JSON.parse(localStorage.getItem(CUSTOMS_KEY) || "[]");
}

function saveCustoms(customs) {
  localStorage.setItem(CUSTOMS_KEY, JSON.stringify(customs));
}

function getRegistrations() {
  return JSON.parse(localStorage.getItem(REGISTRATIONS_KEY) || "[]");
}

function saveRegistrations(registrations) {
  localStorage.setItem(
    REGISTRATIONS_KEY,
    JSON.stringify(registrations)
  );
}


// --------------------------------------------------
// DEMO DATA
// --------------------------------------------------

function createDemoData() {

  if (getCustoms().length) return;

  const now = new Date();

  const liveStart = new Date(now.getTime() - 60 * 60 * 1000);
  const liveMatch = new Date(now.getTime() + 60 * 60 * 1000);

  const upcomingStart = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const upcomingMatch = new Date(now.getTime() + 4 * 60 * 60 * 1000);

  const customs = [

    {
      id: crypto.randomUUID(),
      title: "Shadow Legends #01",
      capacity: 10,
      registrationStart: liveStart.toISOString(),
      matchStart: liveMatch.toISOString(),
      roomId: "",
      roomPassword: ""
    },

    {
      id: crypto.randomUUID(),
      title: "Shadow Legends #02",
      capacity: 10,
      registrationStart: upcomingStart.toISOString(),
      matchStart: upcomingMatch.toISOString(),
      roomId: "",
      roomPassword: ""
    }

  ];

  saveCustoms(customs);
}


// --------------------------------------------------
// STATUS
// --------------------------------------------------

function getCustomStatus(custom) {

  const now = new Date();
  const registrationStart = new Date(custom.registrationStart);
  const matchStart = new Date(custom.matchStart);

  if (now >= matchStart) {
    return "live";
  }

  if (now >= registrationStart) {
    return "registering";
  }

  return "upcoming";
}


// --------------------------------------------------
// FORMAT DATE
// --------------------------------------------------

function formatDate(date) {

  return new Date(date).toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short"
    }
  );
}


// --------------------------------------------------
// RENDER MAIN SITE
// --------------------------------------------------

function renderSite() {

  const customs = getCustoms();
  const registrations = getRegistrations();

  liveCustoms.innerHTML = "";
  upcomingCustoms.innerHTML = "";

  customs.forEach(custom => {

    const players = registrations.filter(
      r => r.customId === custom.id
    );

    const status = getCustomStatus(custom);

    if (status === "live" || status === "registering") {

      liveCustoms.insertAdjacentHTML(
        "beforeend",
        createCustomCard(custom, players.length, status)
      );

    } else {

      upcomingCustoms.insertAdjacentHTML(
        "beforeend",
        createCustomCard(custom, players.length, status)
      );

    }

  });

  if (!liveCustoms.children.length) {
    liveCustoms.innerHTML = emptyCard("No live customs right now.");
  }

  if (!upcomingCustoms.children.length) {
    upcomingCustoms.innerHTML = emptyCard("No upcoming customs.");
  }
}


function emptyCard(text) {

  return `
    <div class="custom-card">
      <div class="muted">${text}</div>
    </div>
  `;
}


// --------------------------------------------------
// CUSTOM CARD
// --------------------------------------------------

function createCustomCard(custom, playerCount, status) {

  const full = playerCount >= custom.capacity;

  const canRegister =
    status === "live" &&
    !full;

  let button = "";

  if (canRegister) {

    button = `
      <button
        class="primary-btn"
        onclick="openRegister('${custom.id}')"
      >
        REGISTER
      </button>
    `;

  } else if (full) {

    button = `
      <button class="primary-btn" disabled>
        CAPACITY FULL
      </button>
    `;

  } else {

    button = `
      <button class="primary-btn" disabled>
        REGISTRATION CLOSED
      </button>
    `;

  }


  return `
    <article class="custom-card">

      <div class="custom-top">

        <div class="custom-title">
          ${escapeHtml(custom.title)}
        </div>

        <div class="custom-status">
          ${status === "live" ? "LIVE" : "UPCOMING"}
        </div>

      </div>

      <div class="capacity">

        <div class="capacity-text">
          <span>PLAYERS</span>
          <span>${playerCount} / ${custom.capacity}</span>
        </div>

        <div class="capacity-bar">
          <div
            class="capacity-fill"
            style="width:${Math.min(
              100,
              playerCount / custom.capacity * 100
            )}%"
          ></div>
        </div>

      </div>

      <div class="card-actions">

        ${button}

        <!-- ONLY ONE DETAILS BUTTON -->
        <button
          class="secondary-btn"
          onclick="openDetails('${custom.id}')"
        >
          DETAILS
        </button>

      </div>

    </article>
  `;
}


// --------------------------------------------------
// REGISTER
// --------------------------------------------------

window.openRegister = function(customId) {

  const custom = getCustoms().find(
    c => c.id === customId
  );

  if (!custom) return;

  const registrations = getRegistrations();

  const count = registrations.filter(
    r => r.customId === customId
  ).length;

  if (count >= custom.capacity) {
    alert("This custom is full.");
    return;
  }

  document.getElementById(
    "registrationCustomId"
  ).value = customId;

  document.getElementById(
    "registerCustomTitle"
  ).textContent = custom.title;

  registrationForm.reset();

  starsContainer.classList.add("hidden");

  openModal(registerModal);
};


// --------------------------------------------------
// RANK / STARS
// --------------------------------------------------

rankSelect.addEventListener("change", () => {

  const ranksWithStars = [
    "Mythic",
    "Mythical Honor",
    "Mythical Glory",
    "Mythical Immortal"
  ];

  starsContainer.classList.toggle(
    "hidden",
    !ranksWithStars.includes(rankSelect.value)
  );

});


// --------------------------------------------------
// REGISTRATION SUBMIT
// --------------------------------------------------

registrationForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    const customId =
      document.getElementById(
        "registrationCustomId"
      ).value;

    const telegram =
      document.getElementById(
        "telegramId"
      ).value.trim();

    const gameId =
      document.getElementById(
        "gameId"
      ).value.trim();

    const role =
      document.getElementById(
        "role"
      ).value;

    const rank =
      document.getElementById(
        "rank"
      ).value;

    const stars =
      document.getElementById(
        "stars"
      ).value;


    if (!/^@[A-Za-z0-9_]{3,32}$/.test(telegram)) {
      alert("Telegram ID must start with @.");
      return;
    }

    if (!/^\d{10}$/.test(gameId)) {
      alert("Game ID must contain exactly 10 digits.");
      return;
    }


    const registrations = getRegistrations();

    const duplicateGameId =
      registrations.some(
        r =>
          r.customId === customId &&
          r.gameId === gameId
      );

    const duplicateTelegram =
      registrations.some(
        r =>
          r.customId === customId &&
          r.telegram === telegram
      );


    if (duplicateGameId) {
      alert("This Game ID is already registered.");
      return;
    }

    if (duplicateTelegram) {
      alert("This Telegram ID is already registered.");
      return;
    }


    const custom = getCustoms().find(
      c => c.id === customId
    );

    const playerCount =
      registrations.filter(
        r => r.customId === customId
      ).length;

    if (!custom || playerCount >= custom.capacity) {
      alert("Capacity is full.");
      return;
    }


    registrations.push({

      id: crypto.randomUUID(),

      customId,

      telegram,

      gameId,

      role,

      rank,

      stars:
        stars ? Number(stars) : null,

      createdAt:
        new Date().toISOString()

    });


    saveRegistrations(registrations);

    closeModal(registerModal);

    document.getElementById(
      "successText"
    ).textContent =
      `Your registration for ${custom.title} has been completed successfully.`;

    openModal(successModal);

    renderSite();
    renderAdmin();

  }
);


// --------------------------------------------------
// DETAILS
// --------------------------------------------------

window.openDetails = function(customId) {

  const custom = getCustoms().find(
    c => c.id === customId
  );

  if (!custom) return;

  const registrations =
    getRegistrations().filter(
      r => r.customId === customId
    );

  const status =
    getCustomStatus(custom);


  document.getElementById(
    "detailsTitle"
  ).textContent = custom.title;

  document.getElementById(
    "detailsStatus"
  ).textContent =
    status.toUpperCase();

  document.getElementById(
    "detailsPlayers"
  ).textContent =
    `${registrations.length} / ${custom.capacity}`;

  document.getElementById(
    "detailsRegistration"
  ).textContent =
    formatDate(custom.registrationStart);

  document.getElementById(
    "detailsMatch"
  ).textContent =
    formatDate(custom.matchStart);


  openModal(detailsModal);
};


// --------------------------------------------------
// MODALS
// --------------------------------------------------

function openModal(modal) {
  modal.classList.add("active");
}

function closeModal(modal) {
  modal.classList.remove("active");
}

document.querySelectorAll("[data-close]").forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        const id =
          button.dataset.close;

        closeModal(
          document.getElementById(id)
        );

      }
    );

  }
);


document.querySelectorAll(".modal-overlay").forEach(
  overlay => {

    overlay.addEventListener(
      "click",
      event => {

        if (event.target === overlay) {
          closeModal(overlay);
        }

      }
    );

  }
);


// --------------------------------------------------
// ADMIN LOGIN
// --------------------------------------------------

document.getElementById(
  "adminOpenBtn"
).addEventListener(
  "click",
  () => {

    /*
      Production:
      Replace this login with Supabase Auth.

      No password is stored here.
    */

    openModal(adminLoginModal);

  }
);


adminLoginForm.addEventListener(
  "submit",
  async event => {

    event.preventDefault();

    const email =
      document.getElementById(
        "adminEmail"
      ).value.trim();

    const password =
      document.getElementById(
        "adminPassword"
      ).value;


    /*
      TEMPORARY DEMO LOGIN

      This intentionally does NOT contain
      a password.

      Connect Supabase Auth here before
      deploying the admin system publicly.
    */

    document.getElementById(
      "adminLoginError"
    ).textContent =
      "Supabase Auth is required for secure admin login.";

  }
);


// --------------------------------------------------
// ADMIN PANEL
// --------------------------------------------------

function renderAdmin() {

  const customs = getCustoms();
  const registrations = getRegistrations();

  const liveCount =
    customs.filter(
      c => {
        const status = getCustomStatus(c);
        return status === "live" ||
               status === "registering";
      }
    ).length;

  const upcomingCount =
    customs.filter(
      c => getCustomStatus(c) === "upcoming"
    ).length;


  document.getElementById(
    "adminLiveCount"
  ).textContent = liveCount;

  document.getElementById(
    "adminUpcomingCount"
  ).textContent = upcomingCount;

  document.getElementById(
    "adminCustomCount"
  ).textContent = customs.length;

  document.getElementById(
    "adminPlayerCount"
  ).textContent = registrations.length;


  renderAdminCustoms();
  renderAdminPlayers();
}


// --------------------------------------------------
// CREATE / EDIT CUSTOM
// --------------------------------------------------

customForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    const id =
      document.getElementById(
        "customId"
      ).value;

    const custom = {

      id:
        id || crypto.randomUUID(),

      title:
        document.getElementById(
          "customTitle"
        ).value.trim(),

      capacity:
        Number(
          document.getElementById(
            "customCapacity"
          ).value
        ),

      registrationStart:
        new Date(
          document.getElementById(
            "registrationStart"
          ).value
        ).toISOString(),

      matchStart:
        new Date(
          document.getElementById(
            "matchStart"
          ).value
        ).toISOString(),

      roomId:
        document.getElementById(
          "roomId"
        ).value.trim(),

      roomPassword:
        document.getElementById(
          "roomPassword"
        ).value.trim()

    };


    let customs = getCustoms();

    if (id) {

      customs =
        customs.map(
          c => c.id === id
            ? custom
            : c
        );

    } else {

      customs.push(custom);

    }


    saveCustoms(customs);

    resetCustomEditor();

    renderSite();
    renderAdmin();

  }
);


// --------------------------------------------------
// ADMIN CUSTOM LIST
// --------------------------------------------------

function renderAdminCustoms() {

  const container =
    document.getElementById(
      "adminCustomList"
    );

  const customs = getCustoms();

  if (!customs.length) {

    container.innerHTML =
      `<p class="muted">No customs created.</p>`;

    return;

  }


  container.innerHTML =
    customs.map(
      custom => {

        const players =
          getRegistrations().filter(
            r => r.customId === custom.id
          ).length;

        return `

          <div class="admin-row">

            <div>
              <div class="admin-row-title">
                ${escapeHtml(custom.title)}
              </div>

              <div class="admin-row-meta">
                Match: ${formatDate(custom.matchStart)}
              </div>
            </div>

            <div class="muted">
              ${players} / ${custom.capacity}
            </div>

            <div class="muted">
              ${getCustomStatus(custom).toUpperCase()}
            </div>

            <div class="admin-actions">

              <button
                class="small-btn"
                onclick="editCustom('${custom.id}')"
              >
                EDIT
              </button>

              <button
                class="small-btn delete-btn"
                onclick="deleteCustom('${custom.id}')"
              >
                DELETE
              </button>

            </div>

          </div>

        `;

      }
    ).join("");

}


// --------------------------------------------------
// EDIT
// --------------------------------------------------

window.editCustom = function(id) {

  const custom =
    getCustoms().find(
      c => c.id === id
    );

  if (!custom) return;


  document.getElementById(
    "customId"
  ).value = custom.id;

  document.getElementById(
    "customTitle"
  ).value = custom.title;

  document.getElementById(
    "customCapacity"
  ).value = custom.capacity;

  document.getElementById(
    "registrationStart"
  ).value =
    toLocalInput(custom.registrationStart);

  document.getElementById(
    "matchStart"
  ).value =
    toLocalInput(custom.matchStart);

  document.getElementById(
    "roomId"
  ).value = custom.roomId || "";

  document.getElementById(
    "roomPassword"
  ).value =
    custom.roomPassword || "";


  document.getElementById(
    "editorTitle"
  ).textContent = "Edit Custom";

  document.querySelector(
    ".admin-submit"
  ).textContent = "SAVE CHANGES";

  document.getElementById(
    "cancelEditBtn"
  ).classList.remove("hidden");

};


// --------------------------------------------------
// DELETE
// --------------------------------------------------

window.deleteCustom = function(id) {

  const custom =
    getCustoms().find(
      c => c.id === id
    );

  if (!custom) return;


  const confirmed =
    confirm(
      `Delete "${custom.title}"?`
    );

  if (!confirmed) return;


  saveCustoms(
    getCustoms().filter(
      c => c.id !== id
    )
  );

  saveRegistrations(
    getRegistrations().filter(
      r => r.customId !== id
    )
  );


  renderSite();
  renderAdmin();

};


// --------------------------------------------------
// RESET EDITOR
// --------------------------------------------------

document.getElementById(
  "cancelEditBtn"
).addEventListener(
  "click",
  resetCustomEditor
);


function resetCustomEditor() {

  customForm.reset();

  document.getElementById(
    "customId"
  ).value = "";

  document.getElementById(
    "editorTitle"
  ).textContent =
    "Create Custom";

  document.querySelector(
    ".admin-submit"
  ).textContent =
    "CREATE CUSTOM";

  document.getElementById(
    "cancelEditBtn"
  ).classList.add("hidden");

}


// --------------------------------------------------
// ADMIN PLAYERS
// --------------------------------------------------

function renderAdminPlayers() {

  const container =
    document.getElementById(
      "adminPlayerList"
    );

  const registrations =
    getRegistrations();

  const customs =
    getCustoms();


  if (!registrations.length) {

    container.innerHTML =
      `<p class="muted">No players registered.</p>`;

    return;

  }


  container.innerHTML =
    registrations.map(
      player => {

        const custom =
          customs.find(
            c => c.id === player.customId
          );

        return `

          <div class="player-row">

            <div>
              <strong>
                ${escapeHtml(player.telegram)}
              </strong>
              <div class="muted">
                ${escapeHtml(player.gameId)}
              </div>
            </div>

            <div>
              ${escapeHtml(player.role)}
            </div>

            <div>
              ${escapeHtml(player.rank)}
            </div>

            <div>
              ${player.stars ?? "-"}
            </div>

            <div>
              <button
                class="small-btn delete-btn"
                onclick="deletePlayer('${player.id}')"
              >
                REMOVE
              </button>
            </div>

          </div>

          <div class="muted" style="padding-bottom:10px;">
            ${custom ? escapeHtml(custom.title) : "Deleted Custom"}
          </div>

        `;

      }
    ).join("");

}


// --------------------------------------------------
// DELETE PLAYER
// --------------------------------------------------

window.deletePlayer = function(id) {

  if (!confirm("Remove this player?")) {
    return;
  }

  saveRegistrations(
    getRegistrations().filter(
      r => r.id !== id
    )
  );

  renderSite();
  renderAdmin();

};


// --------------------------------------------------
// LOGOUT
// --------------------------------------------------

document.getElementById(
  "logoutBtn"
).addEventListener(
  "click",
  () => {

    adminScreen.classList.remove("active");

  }
);


// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function toLocalInput(iso) {

  const date = new Date(iso);

  const offset =
    date.getTimezoneOffset();

  const local =
    new Date(
      date.getTime() - offset * 60000
    );

  return local
    .toISOString()
    .slice(0, 16);

}


function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// --------------------------------------------------
// START
// --------------------------------------------------

createDemoData();

renderSite();
renderAdmin();


// Update automatically
setInterval(
  () => {
    renderSite();
    renderAdmin();
  },
  5000
);
