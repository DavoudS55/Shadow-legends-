/* =========================================================
   SHADOW LEGENDS
   Frontend Tournament System
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const CUSTOMS_KEY = "shadow_legends_customs_v2";
const REGISTRATIONS_KEY = "shadow_legends_registrations_v2";


/* =========================================================
   ELEMENTS
========================================================= */

const liveContainer = document.getElementById("liveCustoms");
const upcomingContainer = document.getElementById("upcomingCustoms");

const liveCount = document.getElementById("liveCount");
const upcomingCount = document.getElementById("upcomingCount");

const registerModal = document.getElementById("registerModal");
const successModal = document.getElementById("successModal");
const detailsModal = document.getElementById("detailsModal");

const registrationForm = document.getElementById("registrationForm");

const customIdInput = document.getElementById("customId");
const registerTitle = document.getElementById("registerTitle");

const telegramInput = document.getElementById("telegram");
const gameIdInput = document.getElementById("gameId");
const roleInput = document.getElementById("role");
const rankInput = document.getElementById("rank");

const starsGroup = document.getElementById("starsGroup");
const starsInput = document.getElementById("stars");

const formError = document.getElementById("formError");

const successText = document.getElementById("successText");

const detailsTitle = document.getElementById("detailsTitle");
const detailsStatus = document.getElementById("detailsStatus");
const detailsPlayers = document.getElementById("detailsPlayers");
const detailsStart = document.getElementById("detailsStart");
const detailsRegistration = document.getElementById("detailsRegistration");


/* =========================================================
   DEMO CUSTOMS
   These are only for testing.
   Later they can come from Supabase.
========================================================= */

function createDemoCustoms() {

    const now = new Date();

    const liveStart = new Date(
        now.getTime() + 90 * 60 * 1000
    );

    const liveRegistration = new Date(
        now.getTime() - 30 * 60 * 1000
    );

    const upcomingStart = new Date(
        now.getTime() + 5 * 60 * 60 * 1000
    );

    const upcomingRegistration = new Date(
        now.getTime() + 90 * 60 * 1000
    );

    const tomorrow = new Date(
        now.getTime() + 24 * 60 * 60 * 1000
    );

    const tomorrowRegistration = new Date(
        now.getTime() + 20 * 60 * 60 * 1000
    );


    return [

        {
            id: "custom-001",
            title: "Shadow Custom #001",
            playerLimit: 10,

            startTime: liveStart.toISOString(),
            registrationStart: liveRegistration.toISOString(),

            type: "live"
        },

        {
            id: "custom-002",
            title: "Shadow Custom #002",
            playerLimit: 10,

            startTime: upcomingStart.toISOString(),
            registrationStart: upcomingRegistration.toISOString(),

            type: "upcoming"
        },

        {
            id: "custom-003",
            title: "Shadow Custom #003",
            playerLimit: 10,

            startTime: tomorrow.toISOString(),
            registrationStart: tomorrowRegistration.toISOString(),

            type: "upcoming"
        }

    ];
}


/* =========================================================
   LOAD DATA
========================================================= */

function loadCustoms() {

    const saved = localStorage.getItem(CUSTOMS_KEY);

    if (saved) {

        try {

            return JSON.parse(saved);

        } catch (error) {

            console.error("Invalid custom data");

        }

    }

    const demo = createDemoCustoms();

    localStorage.setItem(
        CUSTOMS_KEY,
        JSON.stringify(demo)
    );

    return demo;
}


function loadRegistrations() {

    const saved = localStorage.getItem(
        REGISTRATIONS_KEY
    );

    if (!saved) {
        return [];
    }

    try {

        return JSON.parse(saved);

    } catch (error) {

        return [];

    }
}


function saveRegistrations(data) {

    localStorage.setItem(
        REGISTRATIONS_KEY,
        JSON.stringify(data)
    );
}


/* =========================================================
   GLOBAL DATA
========================================================= */

let customs = loadCustoms();

let registrations = loadRegistrations();


/* =========================================================
   TIME HELPERS
========================================================= */

function hasRegistrationStarted(custom) {

    return Date.now() >=
        new Date(custom.registrationStart).getTime();

}


function hasMatchStarted(custom) {

    return Date.now() >=
        new Date(custom.startTime).getTime();

}


function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric"
        }
    );
}


function formatTime(dateString) {

    const date = new Date(dateString);

    return date.toLocaleTimeString(
        undefined,
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


function formatDateTime(dateString) {

    return `${formatDate(dateString)} · ${formatTime(dateString)}`;

}


/* =========================================================
   REGISTRATION HELPERS
========================================================= */

function getCustomRegistrations(customId) {

    return registrations.filter(
        registration =>
            registration.customId === customId
    );

}


function getPlayerCount(customId) {

    return getCustomRegistrations(customId).length;

}


function isFull(custom) {

    return getPlayerCount(custom.id)
        >= custom.playerLimit;

}


function getPlayerRegistration(customId) {

    return registrations.find(
        registration =>
            registration.customId === customId
    );

}


/* =========================================================
   RENDER
========================================================= */

function render() {

    customs = customs.filter(
        custom => !hasMatchStarted(custom) || custom.type === "live"
    );

    renderLive();

    renderUpcoming();

}


function renderLive() {

    const live = customs.filter(
        custom =>
            custom.type === "live" &&
            !hasMatchStarted(custom)
    );

    liveContainer.innerHTML = "";

    liveCount.textContent = live.length;


    if (live.length === 0) {

        liveContainer.innerHTML = `
            <div class="empty-state">
                No live customs
            </div>
        `;

        return;
    }


    live.forEach(custom => {

        liveContainer.appendChild(
            createCustomCard(custom, "live")
        );

    });

}


function renderUpcoming() {

    const upcoming = customs.filter(
        custom =>
            custom.type === "upcoming"
    );

    upcomingContainer.innerHTML = "";

    upcomingCount.textContent = upcoming.length;


    if (upcoming.length === 0) {

        upcomingContainer.innerHTML = `
            <div class="empty-state">
                No upcoming customs
            </div>
        `;

        return;
    }


    upcoming.forEach(custom => {

        upcomingContainer.appendChild(
            createCustomCard(custom, "upcoming")
        );

    });

}


/* =========================================================
   CREATE CARD
========================================================= */

function createCustomCard(custom, type) {

    const card = document.createElement("article");

    card.className = "custom-card";


    const count = getPlayerCount(custom.id);

    const full = count >= custom.playerLimit;

    const registrationOpen =
        hasRegistrationStarted(custom);


    let buttonHTML = "";


    /*
       UPCOMING CUSTOM
       Register button stays hidden
       until registrationStart.
    */

    if (full) {

        buttonHTML = `
            <button
                class="register-button"
                disabled
            >
                CAPACITY FULL
            </button>
        `;

    }

    else if (registrationOpen) {

        buttonHTML = `
            <button
                class="register-button"
                data-register="${custom.id}"
            >
                REGISTER
            </button>
        `;

    }

    else {

        buttonHTML = `
            <button
                class="details-button"
                data-details="${custom.id}"
            >
                DETAILS
            </button>
        `;

    }


    let registrationInfo = "";


    if (!registrationOpen) {

        registrationInfo = `
            <div class="registration-time">
                Registration opens at
                <span>
                    ${formatDateTime(custom.registrationStart)}
                </span>
            </div>
        `;

    }

    else {

        registrationInfo = `
            <div class="registration-time">
                Registration is open
            </div>
        `;

    }


    card.innerHTML = `

        <div class="card-top">

            <div class="status ${type}">
                <span class="status-dot"></span>

                ${type === "live" ? "LIVE" : "UPCOMING"}
            </div>

            <button
                class="details-button"
                data-details="${custom.id}"
            >
                DETAILS
            </button>

        </div>


        <h3 class="custom-title">
            ${escapeHTML(custom.title)}
        </h3>


        <div class="custom-meta">

            <div class="meta-item">

                <span class="meta-label">
                    Match Start
                </span>

                <span class="meta-value">
                    ${formatDateTime(custom.startTime)}
                </span>

            </div>


            <div class="meta-item">

                <span class="meta-label">
                    Players
                </span>

                <span class="meta-value">
                    ${count} / ${custom.playerLimit}
                </span>

            </div>

        </div>


        ${registrationInfo}


        <div class="card-bottom">

            <div class="capacity">
                <strong>${count}</strong>
                /
                ${custom.playerLimit}
                players
            </div>

            ${buttonHTML}

        </div>

    `;


    /*
       Register
    */

    const registerButton =
        card.querySelector(
            "[data-register]"
        );

    if (registerButton) {

        registerButton.addEventListener(
            "click",
            () => openRegistration(custom)
        );

    }


    /*
       Details
    */

    const detailsButton =
        card.querySelector(
            "[data-details]"
        );

    if (detailsButton) {

        detailsButton.addEventListener(
            "click",
            () => openDetails(custom)
        );

    }


    return card;

}


/* =========================================================
   OPEN REGISTRATION
========================================================= */

function openRegistration(custom) {

    if (!hasRegistrationStarted(custom)) {
        return;
    }

    if (isFull(custom)) {
        return;
    }


    const existing =
        getPlayerRegistration(custom.id);


    if (existing) {

        alert(
            "You are already registered for this custom."
        );

        return;

    }


    customIdInput.value = custom.id;

    registerTitle.textContent = custom.title;

    registrationForm.reset();

    customIdInput.value = custom.id;

    formError.textContent = "";

    starsGroup.classList.remove("visible");

    registerModal.classList.add("active");

}


/* =========================================================
   CLOSE MODALS
========================================================= */

function closeModal(modal) {

    modal.classList.remove("active");

}


document
    .getElementById("closeRegister")
    .addEventListener(
        "click",
        () => closeModal(registerModal)
    );


document
    .getElementById("closeSuccess")
    .addEventListener(
        "click",
        () => closeModal(successModal)
    );


document
    .getElementById("closeDetails")
    .addEventListener(
        "click",
        () => closeModal(detailsModal)
    );


/*
   Click outside modal
*/

[
    registerModal,
    successModal,
    detailsModal
].forEach(modal => {

    modal.addEventListener(
        "click",
        event => {

            if (event.target === modal) {
                closeModal(modal);
            }

        }
    );

});


/* =========================================================
   RANK / STARS
========================================================= */

rankInput.addEventListener(
    "change",
    updateStarsVisibility
);


function updateStarsVisibility() {

    const ranksWithStars = [

        "Mythic",
        "Mythical Honor",
        "Mythical Glory",
        "Mythical Immortal"

    ];


    if (
        ranksWithStars.includes(
            rankInput.value
        )
    ) {

        starsGroup.classList.add("visible");

        starsInput.required = true;

    }

    else {

        starsGroup.classList.remove("visible");

        starsInput.required = false;

        starsInput.value = "";

    }

}


/* =========================================================
   GAME ID
========================================================= */

gameIdInput.addEventListener(
    "input",
    () => {

        gameIdInput.value =
            gameIdInput.value
                .replace(/\D/g, "")
                .slice(0, 10);

    }
);


/* =========================================================
   FORM SUBMIT
========================================================= */

registrationForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        formError.textContent = "";


        const customId =
            customIdInput.value;

        const custom =
            customs.find(
                item => item.id === customId
            );


        if (!custom) {

            formError.textContent =
                "Custom not found.";

            return;

        }


        /*
           Check registration time
        */

        if (!hasRegistrationStarted(custom)) {

            formError.textContent =
                "Registration has not opened yet.";

            return;

        }


        /*
           Capacity
        */

        if (isFull(custom)) {

            formError.textContent =
                "This custom is full.";

            return;

        }


        /*
           Telegram
        */

        const telegram =
            telegramInput.value.trim();


        if (!/^@[A-Za-z0-9_]{3,32}$/.test(telegram)) {

            formError.textContent =
                "Enter a valid Telegram ID starting with @.";

            return;

        }


        /*
           Game ID
        */

        const gameId =
            gameIdInput.value.trim();


        if (!/^\d{10}$/.test(gameId)) {

            formError.textContent =
                "Game ID must contain exactly 10 digits.";

            return;

        }


        /*
           Role
        */

        if (!roleInput.value) {

            formError.textContent =
                "Please select a role.";

            return;

        }


        /*
           Rank
        */

        if (!rankInput.value) {

            formError.textContent =
                "Please select your highest rank.";

            return;

        }


        /*
           Stars
        */

        const ranksWithStars = [

            "Mythic",
            "Mythical Honor",
            "Mythical Glory",
            "Mythical Immortal"

        ];


        let stars = null;


        if (
            ranksWithStars.includes(
                rankInput.value
            )
        ) {

            stars =
                Number(starsInput.value);


            if (
                !Number.isInteger(stars) ||
                stars < 0
            ) {

                formError.textContent =
                    "Enter a valid number of stars.";

                return;

            }

        }


        /*
           Duplicate Game ID
        */

        const duplicateGameId =
            registrations.some(
                registration =>
                    registration.customId === customId &&
                    registration.gameId === gameId
            );


        if (duplicateGameId) {

            formError.textContent =
                "This Game ID is already registered.";

            return;

        }


        /*
           Duplicate Telegram
        */

        const duplicateTelegram =
            registrations.some(
                registration =>
                    registration.customId === customId &&
                    registration.telegram.toLowerCase()
                    === telegram.toLowerCase()
            );


        if (duplicateTelegram) {

            formError.textContent =
                "This Telegram ID is already registered.";

            return;

        }


        /*
           Save registration
        */

        const registration = {

            id:
                "reg-" +
                Date.now(),

            customId,

            telegram,

            gameId,

            role: roleInput.value,

            rank: rankInput.value,

            stars,

            createdAt:
                new Date().toISOString()

        };


        registrations.push(registration);

        saveRegistrations(registrations);


        /*
           Close registration modal
        */

        closeModal(registerModal);


        /*
           Success
        */

        successText.textContent =
            `${custom.title} · Game ID ${gameId}`;

        successModal.classList.add("active");


        render();

    }
);


/* =========================================================
   CANCEL REGISTRATION
========================================================= */

document
    .getElementById("cancelRegistration")
    .addEventListener(
        "click",
        () => {

            const customId =
                customIdInput.value;

            /*
               In this demo we use the most
               recently registered player.
            */

            const registration =
                registrations
                    .filter(
                        item =>
                            item.customId === customId
                    )
                    .at(-1);


            if (!registration) {

                closeModal(successModal);

                return;

            }


            const confirmed =
                confirm(
                    "Cancel your registration?"
                );


            if (!confirmed) {
                return;
            }


            registrations =
                registrations.filter(
                    item =>
                        item.id !== registration.id
                );


            saveRegistrations(registrations);


            closeModal(successModal);

            render();

            alert(
                "Registration cancelled."
            );

        }
    );


/* =========================================================
   DETAILS
========================================================= */

function openDetails(custom) {

    const count =
        getPlayerCount(custom.id);


    detailsTitle.textContent =
        custom.title;


    detailsStatus.textContent =
        custom.type === "live"
            ? "LIVE"
            : "UPCOMING";


    detailsPlayers.textContent =
        `${count} / ${custom.playerLimit}`;


    detailsStart.textContent =
        formatDateTime(custom.startTime);


    if (hasRegistrationStarted(custom)) {

        detailsRegistration.textContent =
            "OPEN";

    }

    else {

        detailsRegistration.textContent =
            formatDateTime(
                custom.registrationStart
            );

    }


    detailsModal.classList.add("active");

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;

}


/* =========================================================
   AUTOMATIC STATUS UPDATE
========================================================= */

/*
   Re-render every 5 seconds.

   This means if an Upcoming custom reaches
   its registrationStart time, the REGISTER
   button appears automatically.
*/

setInterval(
    render,
    5000
);


/* =========================================================
   INITIAL RENDER
========================================================= */

render();
