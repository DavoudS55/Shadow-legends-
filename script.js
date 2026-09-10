/* ==========================================
   SHADOW LEGENDS
   ========================================== */


/*
    Temporary local database.

    In the next step this will be replaced
    with Supabase.
*/

const CUSTOM_STORAGE_KEY = "shadow_legends_customs";
const REGISTRATION_STORAGE_KEY = "shadow_legends_registrations";


/* ==========================================
   DEFAULT CUSTOMS
   ========================================== */

const defaultCustoms = [

    {
        id: "custom-001",
        title: "Nightfall Custom",
        players: 10,
        startTime: "21:00",
        registrationStart: "18:00",
        type: "live",
        registrations: []
    },

    {
        id: "custom-002",
        title: "Midnight Clash",
        players: 10,
        startTime: "23:00",
        registrationStart: "20:00",
        type: "live",
        registrations: []
    },

    {
        id: "custom-003",
        title: "After Dark",
        players: 10,
        startTime: "21:00",
        registrationStart: "18:00",
        type: "upcoming",
        date: "September 11",
        registrations: []
    },

    {
        id: "custom-004",
        title: "Royal Rumble",
        players: 10,
        startTime: "22:00",
        registrationStart: "19:00",
        type: "upcoming",
        date: "September 12",
        registrations: []
    }

];


/* ==========================================
   LOAD DATA
   ========================================== */

function loadCustoms() {

    const saved =
        localStorage.getItem(CUSTOM_STORAGE_KEY);

    if (!saved) {

        localStorage.setItem(
            CUSTOM_STORAGE_KEY,
            JSON.stringify(defaultCustoms)
        );

        return defaultCustoms;
    }

    try {

        return JSON.parse(saved);

    } catch {

        return defaultCustoms;
    }
}


function loadRegistrations() {

    const saved =
        localStorage.getItem(REGISTRATION_STORAGE_KEY);

    if (!saved) {
        return [];
    }

    try {

        return JSON.parse(saved);

    } catch {

        return [];
    }
}


let customs = loadCustoms();
let registrations = loadRegistrations();


/* ==========================================
   SAVE
   ========================================== */

function saveData() {

    localStorage.setItem(
        CUSTOM_STORAGE_KEY,
        JSON.stringify(customs)
    );

    localStorage.setItem(
        REGISTRATION_STORAGE_KEY,
        JSON.stringify(registrations)
    );
}


/* ==========================================
   RENDER CUSTOMS
   ========================================== */

function renderCustoms() {

    const liveContainer =
        document.getElementById("liveCustoms");

    const upcomingContainer =
        document.getElementById("upcomingCustoms");


    liveContainer.innerHTML = "";
    upcomingContainer.innerHTML = "";


    const live =
        customs.filter(custom => custom.type === "live");

    const upcoming =
        customs.filter(custom => custom.type === "upcoming");


    if (live.length === 0) {

        liveContainer.innerHTML =
            `<div class="empty">No live customs.</div>`;

    } else {

        live.forEach(custom => {

            liveContainer.appendChild(
                createCustomCard(custom)
            );

        });

    }


    if (upcoming.length === 0) {

        upcomingContainer.innerHTML =
            `<div class="empty">No upcoming customs.</div>`;

    } else {

        upcoming.forEach(custom => {

            upcomingContainer.appendChild(
                createCustomCard(custom)
            );

        });

    }

}


/* ==========================================
   CREATE CARD
   ========================================== */

function createCustomCard(custom) {

    const registered =
        registrations.filter(
            registration =>
                registration.customId === custom.id
        );


    const currentPlayers =
        registered.length;


    const capacity =
        Number(custom.players);


    const full =
        currentPlayers >= capacity;


    const percentage =
        capacity > 0
            ? Math.min(
                (currentPlayers / capacity) * 100,
                100
            )
            : 0;


    const card =
        document.createElement("article");

    card.className = "custom-card";


    card.innerHTML = `

        <div class="custom-top">

            <span class="status ${full ? "full" : "open"}">
                ${full ? "CAPACITY FULL" : "REGISTRATION OPEN"}
            </span>

            <span class="custom-id">
                ${custom.id.replace("custom-", "#")}
            </span>

        </div>


        <h3>
            ${escapeHTML(custom.title)}
        </h3>


        <div class="card-data">

            <div class="data-item">
                <span>PLAYERS</span>
                <strong>
                    ${currentPlayers} / ${capacity}
                </strong>
            </div>

            <div class="data-item">
                <span>START TIME</span>
                <strong>
                    ${escapeHTML(custom.startTime)}
                </strong>
            </div>

        </div>


        <div class="capacity">

            <div class="capacity-info">

                <span>Capacity</span>

                <span>
                    ${full
                        ? "Full"
                        : `${capacity - currentPlayers} spots left`
                    }
                </span>

            </div>

            <div class="progress">

                <div
                    class="progress-bar"
                    style="width: ${percentage}%"
                ></div>

            </div>

        </div>


        <div class="card-actions">

            <button
                class="card-button"
                data-details="${custom.id}"
            >
                Details
            </button>

            <button
                class="card-button primary ${full ? "disabled" : ""}"
                data-register="${custom.id}"
                ${full ? "disabled" : ""}
            >
                ${full ? "Capacity Full" : "Register"}
            </button>

        </div>

    `;


    card
        .querySelector("[data-details]")
        .addEventListener("click", () => {

            openDetails(custom);

        });


    const registerButton =
        card.querySelector("[data-register]");


    if (!full) {

        registerButton.addEventListener(
            "click",
            () => openRegistration(custom)
        );

    }


    return card;
}


/* ==========================================
   REGISTRATION
   ========================================== */

const registrationOverlay =
    document.getElementById("registrationOverlay");

const registrationForm =
    document.getElementById("registrationForm");


function openRegistration(custom) {

    const registered =
        registrations.filter(
            registration =>
                registration.customId === custom.id
        );


    if (registered.length >= Number(custom.players)) {

        renderCustoms();

        return;
    }


    document.getElementById("customId").value =
        custom.id;

    document.getElementById("registrationTitle")
        .textContent =
        custom.title;


    registrationForm.reset();

    document.getElementById("customId").value =
        custom.id;


    document.getElementById("starsGroup")
        .classList.add("hidden");


    document.getElementById("formError")
        .textContent = "";


    registrationOverlay.classList.add("active");

    document.body.style.overflow = "hidden";
}


function closeRegistration() {

    registrationOverlay.classList.remove("active");

    document.body.style.overflow = "";
}


document.getElementById("closeRegistration")
    .addEventListener(
        "click",
        closeRegistration
    );


/* ==========================================
   TELEGRAM VALIDATION
   ========================================== */

function validateTelegram(value) {

    return /^@[A-Za-z0-9_]{3,32}$/.test(value);
}


/* ==========================================
   GAME ID VALIDATION
   ========================================== */

function validateGameId(value) {

    return /^\d{10}$/.test(value);
}


/* ==========================================
   GAME ID INPUT
   ========================================== */

document.getElementById("gameId")
    .addEventListener("input", function () {

        this.value =
            this.value.replace(/\D/g, "")
                .slice(0, 10);

    });


/* ==========================================
   RANK / STARS
   ========================================== */

const rankSelect =
    document.getElementById("rank");

rankSelect.addEventListener(
    "change",
    function () {

        const mythicRanks = [
            "Mythic",
            "Mythical Honor",
            "Mythical Glory",
            "Mythical Immortal"
        ];


        const starsGroup =
            document.getElementById("starsGroup");


        const stars =
            document.getElementById("stars");


        if (mythicRanks.includes(this.value)) {

            starsGroup.classList.remove("hidden");

            stars.required = true;

        } else {

            starsGroup.classList.add("hidden");

            stars.required = false;

            stars.value = "";
        }

    }
);


/* ==========================================
   SUBMIT REGISTRATION
   ========================================== */

registrationForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const error =
            document.getElementById("formError");


        error.textContent = "";


        const customId =
            document.getElementById("customId").value;


        const telegram =
            document.getElementById("telegram")
                .value
                .trim();


        const gameId =
            document.getElementById("gameId")
                .value
                .trim();


        const role =
            document.getElementById("role").value;


        const rank =
            document.getElementById("rank").value;


        const stars =
            document.getElementById("stars")
                .value
                .trim();


        /* Telegram */

        if (!validateTelegram(telegram)) {

            error.textContent =
                "Telegram ID must start with @.";

            return;
        }


        /* Game ID */

        if (!validateGameId(gameId)) {

            error.textContent =
                "Game ID must contain exactly 10 digits.";

            return;
        }


        /* Role */

        if (!role) {

            error.textContent =
                "Please select a role.";

            return;
        }


        /* Rank */

        if (!rank) {

            error.textContent =
                "Please select your highest rank.";

            return;
        }


        /* Stars */

        const mythicRanks = [
            "Mythic",
            "Mythical Honor",
            "Mythical Glory",
            "Mythical Immortal"
        ];


        if (
            mythicRanks.includes(rank) &&
            (!stars || !/^\d+$/.test(stars))
        ) {

            error.textContent =
                "Please enter the number of stars.";

            return;
        }


        /* Find custom */

        const custom =
            customs.find(
                item => item.id === customId
            );


        if (!custom) {

            error.textContent =
                "This custom could not be found.";

            return;
        }


        /* Check capacity */

        const currentRegistrations =
            registrations.filter(
                item =>
                    item.customId === customId
            );


        if (
            currentRegistrations.length >=
            Number(custom.players)
        ) {

            error.textContent =
                "Capacity Full.";

            renderCustoms();

            return;
        }


        /* Duplicate Game ID */

        const duplicateGameId =
            registrations.some(
                item =>
                    item.customId === customId &&
                    item.gameId === gameId
            );


        if (duplicateGameId) {

            error.textContent =
                "This Game ID is already registered.";

            return;
        }


        /* Duplicate Telegram */

        const duplicateTelegram =
            registrations.some(
                item =>
                    item.customId === customId &&
                    item.telegram.toLowerCase() ===
                    telegram.toLowerCase()
            );


        if (duplicateTelegram) {

            error.textContent =
                "This Telegram ID is already registered.";

            return;
        }


        /* Create registration */

        const registration = {

            id:
                "reg-" +
                Date.now(),

            customId,

            telegram,

            gameId,

            role,

            rank,

            stars:
                mythicRanks.includes(rank)
                    ? Number(stars)
                    : null,

            createdAt:
                new Date().toISOString()

        };


        registrations.push(registration);

        saveData();


        closeRegistration();

        renderCustoms();

        openSuccess();

    }
);


/* ==========================================
   SUCCESS
   ========================================== */

const successOverlay =
    document.getElementById("successOverlay");


function openSuccess() {

    successOverlay.classList.add("active");

    document.body.style.overflow = "hidden";
}


function closeSuccess() {

    successOverlay.classList.remove("active");

    document.body.style.overflow = "";
}


document.getElementById("successClose")
    .addEventListener(
        "click",
        closeSuccess
    );


/* ==========================================
   DETAILS
   ========================================== */

const detailsOverlay =
    document.getElementById("detailsOverlay");


let selectedDetailsCustom = null;


function openDetails(custom) {

    selectedDetailsCustom = custom;


    const registered =
        registrations.filter(
            item =>
                item.customId === custom.id
        );


    const full =
        registered.length >= Number(custom.players);


    document.getElementById("detailsTitle")
        .textContent =
        custom.title;


    document.getElementById("detailsTime")
        .textContent =
        custom.startTime;


    document.getElementById("detailsPlayers")
        .textContent =
        `${registered.length} / ${custom.players}`;


    document.getElementById("detailsStatus")
        .textContent =
        full
            ? "Capacity Full"
            : "Registration Open";


    const button =
        document.getElementById("detailsRegister");


    if (full) {

        button.disabled = true;

        button.textContent =
            "Capacity Full";

        button.classList.remove("primary");

    } else {

        button.disabled = false;

        button.textContent =
            "Register";

    }


    detailsOverlay.classList.add("active");

    document.body.style.overflow = "hidden";
}


function closeDetails() {

    detailsOverlay.classList.remove("active");

    document.body.style.overflow = "";
}


document.getElementById("closeDetails")
    .addEventListener(
        "click",
        closeDetails
    );


document.getElementById("detailsRegister")
    .addEventListener(
        "click",
        function () {

            if (!selectedDetailsCustom) {
                return;
            }


            const custom =
                selectedDetailsCustom;


            closeDetails();

            openRegistration(custom);

        }
    );


/* ==========================================
   CANCEL REGISTRATION
   ========================================== */

/*
    Double click the logo to open the
    cancellation window during testing.

    This will later be replaced by the
    player's registration management system.
*/

document.querySelector(".logo")
    .addEventListener(
        "dblclick",
        function () {

            document.getElementById(
                "cancelOverlay"
            ).classList.add("active");

            document.body.style.overflow = "hidden";

        }
    );


document.getElementById("closeCancel")
    .addEventListener(
        "click",
        function () {

            document.getElementById(
                "cancelOverlay"
            ).classList.remove("active");

            document.body.style.overflow = "";

        }
    );


document.getElementById("confirmCancel")
    .addEventListener(
        "click",
        function () {

            const telegram =
                document.getElementById(
                    "cancelTelegram"
                ).value.trim();


            const error =
                document.getElementById(
                    "cancelError"
                );


            error.textContent = "";


            if (!validateTelegram(telegram)) {

                error.textContent =
                    "Enter a valid Telegram ID.";

                return;
            }


            const index =
                registrations.findIndex(
                    registration =>
                        registration.telegram.toLowerCase() ===
                        telegram.toLowerCase()
                );


            if (index === -1) {

                error.textContent =
                    "No registration was found.";

                return;
            }


            registrations.splice(index, 1);

            saveData();

            renderCustoms();


            document.getElementById(
                "cancelOverlay"
            ).classList.remove("active");


            document.body.style.overflow = "";

        }
    );


/* ==========================================
   ESCAPE
   ========================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {
            return;
        }

        closeRegistration();
        closeDetails();
        closeSuccess();

    }
);


/* ==========================================
   HTML ESCAPE
   ========================================== */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ==========================================
   INITIALIZE
   ========================================== */

renderCustoms();
