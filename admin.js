
const supabaseUrl =
    "https://dkhmjpqmleuhyailhcud.supabase.co";

// Сюди пізніше вставимо публічний ключ Supabase
const supabaseKey = "sb_publishable_5q3xAmfGcv1lZr1NIXhekA_CEKH16VX";

const db = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

const loginForm = document.getElementById("adminLogin");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { error } = await db.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        alert("Помилка входу. Перевір email і пароль.");
        return;
    }

    await showAdminPanel();
});

const adminPanel = document.getElementById("adminPanel");
const bookingsList = document.getElementById("bookingsList");

const filterDate = document.getElementById("filterDate");
const filterMaster = document.getElementById("filterMaster");

filterDate.addEventListener("change", loadBookings);
filterMaster.addEventListener("change", loadBookings);

document.getElementById("resetFilters")
    .addEventListener("click", () => {
        filterDate.value = "";
        filterMaster.value = "";
        loadBookings();
    });

async function loadBookings() {
    
let query = db
    .from("bookings")
    .select("id, client_name, client_phone, service, master, booking_date, booking_time, status");

if (filterDate.value) {
    query = query.eq("booking_date", filterDate.value);
}

if (filterMaster.value) {
    query = query.eq("master", filterMaster.value);
}

const { data, error } = await query
    .order("booking_date", { ascending: true })
    .order("booking_time", { ascending: true });


    if (error) {
        alert("Не вдалося завантажити бронювання");
        return;
    }

    bookingsList.replaceChildren();

    for (const booking of data) {
        const tr = document.createElement("tr");

const serviceNames = {
    haircut: "Чоловіча стрижка",
    beard: "Стрижка бороди",
    combo: "Стрижка + борода"
};

const masterNames = {
    andriy: "Андрій",
    maksym: "Максим"
};

const statusNames = {
    pending: "Очікує",
    confirmed: "Підтверджено",
    cancelled: "Скасовано"
};

        const values = [
    booking.client_name,
    booking.client_phone,
    serviceNames[booking.service] || booking.service,
    masterNames[booking.master] || booking.master,
    booking.booking_date,
    booking.booking_time,
    statusNames[booking.status] || booking.status
];

        for (const value of values) {
            const td = document.createElement("td");
            td.textContent = value ?? "";
            tr.appendChild(td);
        }

const actions = document.createElement("td");

for (const [label, status] of [
    ["Підтвердити", "confirmed"],
    ["Скасувати", "cancelled"]
]) {
    const button = document.createElement("button");
    button.textContent = label;
    button.type = "button";

    button.disabled = booking.status === status;

    button.addEventListener("click", async () => {
        button.disabled = true;

        const { error } = await db
            .from("bookings")
            .update({ status })
            .eq("id", booking.id);

        if (error) {
            alert("Помилка зміни статусу");
            button.disabled = false;
            return;
        }

        await loadBookings();
    });

    actions.appendChild(button);
}

tr.appendChild(actions);

        bookingsList.appendChild(tr);
    }
}

async function showAdminPanel() {
    const { data: { user } } = await db.auth.getUser();

    if (!user) return;

    const { data: admin, error } = await db
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error || !admin) {
        alert("У вас немає прав адміністратора");
        await db.auth.signOut();
        return;
    }

    loginForm.hidden = true;
    adminPanel.hidden = false;
    await loadBookings();
}

document.getElementById("logoutBtn")
    .addEventListener("click", async () => {
        await db.auth.signOut();
        adminPanel.hidden = true;
        loginForm.hidden = false;
        bookingsList.replaceChildren();
    });

showAdminPanel();

setInterval(async () => {
    const { data: { user } } = await db.auth.getUser();

    if (user && !adminPanel.hidden) {
        await loadBookings();
    }
}, 30000);
