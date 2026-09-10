/* =========================================
   SHADOW LEGENDS
   Homepage JavaScript
   ========================================= */


/* Smooth scroll */

function scrollToCustoms() {
    const section = document.getElementById("live");

    if (section) {
        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}


/* =========================================
   CUSTOM MODAL
   ========================================= */

const modal = document.getElementById("customModal");

const modalTitle = document.getElementById("modalTitle");
const modalPlayers = document.getElementById("modalPlayers");
const modalTime = document.getElementById("modalTime");
const modalCapacity = document.getElementById("modalCapacity");
const modalProgress = document.getElementById("modalProgress");


function openCustom(title, currentPlayers, maxPlayers, time) {

    const current = Number(currentPlayers);
    const max = Number(maxPlayers);

    const remaining = Math.max(max - current, 0);

    const percentage =
        max > 0
            ? Math.min((current / max) * 100, 100)
            : 0;


    modalTitle.textContent = title;

    modalPlayers.textContent =
        `${current} / ${max}`;

    modalTime.textContent = time;


    if (remaining === 0) {

        modalCapacity.textContent =
            "Capacity Full";

        modalProgress.style.width = "100%";

    } else {

        modalCapacity.textContent =
            `${remaining} spot${remaining === 1 ? "" : "s"} left`;

        modalProgress.style.width =
            `${percentage}%`;
    }


    modal.classList.add("active");

    document.body.style.overflow = "hidden";
}


function closeCustom() {

    modal.classList.remove("active");

    document.body.style.overflow = "";
}


modal.addEventListener("click", function (event) {

    if (event.target === modal) {
        closeCustom();
    }

});


document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {
        closeCustom();
    }

});


/* =========================================
   REGISTRATION
   ========================================= */

function startRegistration() {

    /*
        This will be connected to the
        registration page/modal in Step 2.
    */

    alert(
        "Registration system will be connected in the next step."
    );
}


/* =========================================
   COUNTDOWN
   ========================================= */

const countdowns =
    document.querySelectorAll(".countdown");


countdowns.forEach(function (element) {

    let remaining =
        Number(element.dataset.time);


    function updateCountdown() {

        if (remaining <= 0) {

            element.textContent =
                "STARTING NOW";

            return;
        }


        const hours =
            Math.floor(remaining / 3600);

        const minutes =
            Math.floor((remaining % 3600) / 60);

        const seconds =
            remaining % 60;


        element.textContent =
            `${String(hours).padStart(2, "0")}:` +
            `${String(minutes).padStart(2, "0")}:` +
            `${String(seconds).padStart(2, "0")}`;


        remaining--;
    }


    updateCountdown();

    setInterval(updateCountdown, 1000);

});
