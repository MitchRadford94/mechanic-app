const form = document.getElementById("jobForm");
const jobList = document.getElementById("jobList");
const searchInput = document.getElementById("search");

// 🔥 LIVE API URL
const API_URL = "https://mechanic-app-v6wp.onrender.com";

let jobs = [];
let editingId = null;

// =======================
// LOAD JOBS
// =======================
loadJobs();

// =======================
// SEARCH
// =======================
searchInput.addEventListener("input", displayJobs);

// =======================
// ADD / EDIT JOB
// =======================
form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (editingId) {
        // EDIT
        fetch(`${API_URL}/jobs/${editingId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customer: customer.value,
                vehicle: vehicle.value,
                issue: issue.value,
                work: work.value,
                quote: quote.value,
                status: status.value
            })
        })
        .then(res => res.json())
        .then(() => {
            editingId = null;
            form.reset();
            loadJobs();
        })
        .catch(err => console.error("EDIT ERROR:", err));

    } else {
        // ADD
        const formData = new FormData(form);

        fetch(`${API_URL}/jobs`, {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(() => {
            form.reset();
            loadJobs();
        })
        .catch(err => console.error("ADD ERROR:", err));
    }
});

// =======================
// LOAD JOBS
// =======================
function loadJobs() {
    fetch(`${API_URL}/jobs`)
        .then(res => res.json())
        .then(data => {
            jobs = data;
            displayJobs();
        })
        .catch(err => console.error("LOAD ERROR:", err));
}

// =======================
// DISPLAY JOBS
// =======================
function displayJobs() {
    jobList.innerHTML = "";

    const search = searchInput.value.toLowerCase();

    jobs
        .filter(job =>
            job.customer.toLowerCase().includes(search) ||
            job.vehicle.toLowerCase().includes(search) ||
            job.issue.toLowerCase().includes(search)
        )
        .forEach(job => {
            const div = document.createElement("div");
            div.className = "job";

            div.innerHTML = `
                <strong>${job.customer}</strong><br>
                ${job.vehicle}<br>
                ${job.issue}<br>
                ${job.work}<br>
                £${job.quote}<br>

                <span class="status-${job.status.replace(" ", "-")}">
                    Status: ${job.status}
                </span><br>

                ${job.photo ? `<img src="${API_URL}/uploads/${job.photo}" width="200"><br>` : ""}

                <button onclick="updateStatus('${job.id}', 'in progress')">Start</button>
                <button onclick="updateStatus('${job.id}', 'done')">Complete</button>
                <button onclick="deleteJob('${job.id}')">Delete</button>
                <button onclick="editJob('${job.id}')">Edit</button>
            `;

            jobList.appendChild(div);
        });
}

// =======================
// EDIT JOB
// =======================
function editJob(id) {
    const job = jobs.find(j => j.id === id);

    customer.value = job.customer;
    vehicle.value = job.vehicle;
    issue.value = job.issue;
    work.value = job.work;
    quote.value = job.quote;
    status.value = job.status;

    editingId = id;
}

// =======================
// UPDATE STATUS
// =======================
function updateStatus(id, status) {
    fetch(`${API_URL}/jobs/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
    })
    .then(res => res.json())
    .then(loadJobs)
    .catch(err => console.error("STATUS ERROR:", err));
}

// =======================
// DELETE JOB
// =======================
function deleteJob(id) {
    if (!confirm("Delete this job?")) return;

    fetch(`${API_URL}/jobs/${id}`, {
        method: "DELETE"
    })
    .then(res => res.json())
    .then(loadJobs)
    .catch(err => console.error("DELETE ERROR:", err));
}