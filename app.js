const form = document.getElementById("jobForm");
const jobList = document.getElementById("jobList");
const searchInput = document.getElementById("search");

// 🔥 LIVE API
const API_URL = "https://mechanic-app-v6wp.onrender.com";

let jobs = [];
let editingId = null;
let currentFilter = "all";

// =======================
// INIT
// =======================
loadJobs();
searchInput.addEventListener("input", displayJobs);

// =======================
// ADD / EDIT JOB
// =======================
form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (editingId) {
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
        });

    } else {
        const formData = new FormData(form);

        fetch(`${API_URL}/jobs`, {
            method: "POST",
            body: formData
        })
        .then(res => res.json())
        .then(() => {
            form.reset();
            loadJobs();
        });
    }
});

// =======================
// LOAD JOBS + DASHBOARD
// =======================
function loadJobs() {
    fetch(`${API_URL}/jobs`)
        .then(res => res.json())
        .then(data => {
            jobs = Array.isArray(data) ? data : [];

            document.getElementById("count-new").innerText =
                jobs.filter(j => j.status === "new").length;

            document.getElementById("count-progress").innerText =
                jobs.filter(j => j.status === "in progress").length;

            document.getElementById("count-done").innerText =
                jobs.filter(j => j.status === "done").length;

            displayJobs();
        });
}

// =======================
// DISPLAY JOBS
// =======================
function displayJobs() {
    jobList.innerHTML = "";

    const search = (searchInput.value || "").toLowerCase();

    jobs
        .filter(job => {
            const matchesSearch =
                (job.customer || "").toLowerCase().includes(search) ||
                (job.vehicle || "").toLowerCase().includes(search) ||
                (job.issue || "").toLowerCase().includes(search);

            const matchesFilter =
                currentFilter === "all" || job.status === currentFilter;

            return matchesSearch && matchesFilter;
        })
        .forEach(job => {
            const div = document.createElement("div");
            div.className = "job";

            div.innerHTML = `
                <div class="job-header">
                    <h3>${job.customer || ""}</h3>
                    <span class="status-${(job.status || "new").replace(" ", "-")}">
                        ${job.status || "new"}
                    </span>
                </div>

                <div class="job-body">
                    <p><strong>Vehicle:</strong> ${job.vehicle || ""}</p>
                    <p><strong>Issue:</strong> ${job.issue || ""}</p>
                    <p><strong>Work:</strong> ${job.work || ""}</p>
                    <p><strong>Quote:</strong> £${job.quote || ""}</p>
                </div>

                ${job.photo ? `<img src="${API_URL}/uploads/${job.photo}">` : ""}

                <div class="job-actions">
                    <button onclick="updateStatus('${job.id}', 'in progress')">Start</button>
                    <button onclick="updateStatus('${job.id}', 'done')">Done</button>
                    <button onclick="deleteJob('${job.id}')">Delete</button>
                    <button onclick="editJob('${job.id}')">Edit</button>
                    <button onclick="printJob('${job.id}')">Print</button>
                </div>
            `;

            jobList.appendChild(div);
        });
}

// =======================
// FILTER
// =======================
function setFilter(filter) {
    currentFilter = filter;
    displayJobs();
}

// =======================
// EDIT JOB
// =======================
function editJob(id) {
    const job = jobs.find(j => j.id === id);
    if (!job) return;

    customer.value = job.customer || "";
    vehicle.value = job.vehicle || "";
    issue.value = job.issue || "";
    work.value = job.work || "";
    quote.value = job.quote || "";
    status.value = job.status || "new";

    editingId = id;
}

// =======================
// UPDATE STATUS
// =======================
function updateStatus(id, statusValue) {
    fetch(`${API_URL}/jobs/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: statusValue })
    })
    .then(res => res.json())
    .then(loadJobs);
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
    .then(loadJobs);
}

// =======================
// PRINT JOB
// =======================
function printJob(id) {
    const job = jobs.find(j => j.id === id);
    if (!job) return;

    const printWindow = window.open("", "", "width=800,height=600");

    printWindow.document.write(`
        <html>
        <head>
            <title>Job Sheet</title>
            <style>
                body { font-family: Arial; padding: 20px; }
                h1 { text-align: center; }
                .section { margin-bottom: 15px; }
            </style>
        </head>
        <body>

            <h1>Mechanic Job Sheet</h1>

            <div class="section"><strong>Customer:</strong> ${job.customer}</div>
            <div class="section"><strong>Vehicle:</strong> ${job.vehicle}</div>
            <div class="section"><strong>Issue:</strong> ${job.issue}</div>
            <div class="section"><strong>Work Required:</strong> ${job.work}</div>
            <div class="section"><strong>Quote:</strong> £${job.quote}</div>
            <div class="section"><strong>Status:</strong> ${job.status}</div>

            ${job.photo ? `<img src="${API_URL}/uploads/${job.photo}" width="300">` : ""}

        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.print();
}