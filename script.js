
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
