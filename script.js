
const form = document.getElementById("bookingForm");
const dateInput = document.getElementById("date");

// Забороняємо вибирати минулі дати
function updateMinDate() {
    const today = new Date();
    const localDate = new Date(
        today.getTime() -
        today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    dateInput.min = localDate;
}

updateMinDate();

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("clientName").value.trim();
    const phone = document.getElementById("clientPhone").value.trim();
    const service = document.getElementById("service").value;
    const master = document.getElementById("master").value;
    const date = dateInput.value;
    const time = document.getElementById("time").value;

    if (!/^\+380\d{9}$/.test(phone)) {
        alert("Введіть телефон у форматі +380XXXXXXXXX");
        return;
    }

    if (date < dateInput.min) {
        alert("Не можна записатися на минулу дату!");
        return;
    }

   
const booking = {
    name,
    phone,
    service,
    master,
    date,
    time
};

sendBooking(booking);

});

const BOOKING_API =
    "https://dkhmjpqmleuhyailhcud.supabase.co/functions/v1/super-service";

const ENABLE_LIVE_BOOKINGS = true;

async function sendBooking(booking) {
    
const turnstileToken = document.querySelector(
    '[name="cf-turnstile-response"]'
)?.value;

if (!turnstileToken) {
    alert("Спочатку пройдіть перевірку безпеки!");
    return;
}

booking.turnstileToken = turnstileToken;

    if (!ENABLE_LIVE_BOOKINGS) {
        console.log("Тестове бронювання:", booking);
        alert(
            "Форму підготовлено до підключення. " +
            "Онлайн-запис поки не активований."
        );
        return;
    }

    try {
        const response = await fetch(BOOKING_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(booking)
        });

        const result = await response.json();

        if (!response.ok || !result.saved) {
            throw new Error(
                result.error || "Помилка бронювання"
            );
        }

        alert("Ваш запис успішно збережено!");
   
} catch (error) {
    alert(error.message);
} finally {
    if (window.turnstile) {
        const widget = document.querySelector(".cf-turnstile");

        if (widget) {
            window.turnstile.reset(widget);
        }
    }
}

}

const bookingDb = window.supabase.createClient(
    "https://dkhmjpqmleuhyailhcud.supabase.co",
    "sb_publishable_5q3xAmfGcv1lZr1NIXhekA_CEKH16VX"
);

const serviceSelect = document.getElementById("service");
const masterSelect = document.getElementById("master");

const urlParams = new URLSearchParams(window.location.search);
const selectedMaster = urlParams.get("master");

if (["andriy", "maksym"].includes(selectedMaster)) {
    masterSelect.value = selectedMaster;
}

const timeSelect = document.getElementById("time");

const durations = {
    haircut: 45,
    beard: 30,
    combo: 75
};

async function updateAvailableTimes() {
    const master = masterSelect.value;
    const date = dateInput.value;
    const service = serviceSelect.value;

    timeSelect.replaceChildren(
        new Option("Оберіть час", "")
    );

    if (!master || !date || !service) return;

    timeSelect.add(new Option("Завантаження...", ""));
    timeSelect.disabled = true;

    const { data, error } = await bookingDb.rpc(
        "get_busy_slots",
        { p_master: master, p_date: date }
    );
    console.log("Зайняті години:", data);
console.log("Помилка Supabase:", error);

    timeSelect.replaceChildren(
        new Option("Оберіть час", "")
    );

    if (error) {
        timeSelect.add(new Option("Не вдалося завантажити години", ""));
        return;
    }

    const requestedDuration = durations[service];

    const toMinutes = (value) => {
        const [hours, minutes] = value.split(":").map(Number);
        return hours * 60 + minutes;
    };

    for (let hour = 10; hour <= 18; hour++) {
        const start = hour * 60;
        const end = start + requestedDuration;

        if (end > 20 * 60) continue;

        const busy = data.some(slot => {
            const busyStart = toMinutes(slot.booking_time);
            const busyEnd = busyStart + slot.duration_minutes;

            return start < busyEnd && end > busyStart;
        });

        if (!busy) {
            const label = `${String(hour).padStart(2, "0")}:00`;
            timeSelect.add(new Option(label, label));
        }
    }

    timeSelect.disabled = false;
}

serviceSelect.addEventListener("change", updateAvailableTimes);
masterSelect.addEventListener("change", updateAvailableTimes);
dateInput.addEventListener("change", updateAvailableTimes);

console.log("Перевірка: script.js завантажився");

serviceSelect.addEventListener("change", () => {
    console.log("Обрано послугу:", serviceSelect.value);
});
