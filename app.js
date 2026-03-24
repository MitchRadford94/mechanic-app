const form = document.getElementById("jobForm");
const jobList = document.getElementById("jobList");
const searchInput = document.getElementById("search");

let jobs = [];
let editingId = null;

// Load jobs
loadJobs();

// Search
searchInput.addEventListener("input", displayJobs);

// Submit (Add / Edit)
form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (editingId) {
        // EDIT
        fetch(`http://localhost:3000/jobs/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                customer: customer.value,
                vehicle: vehicle.value,
                issue: issue.value,
                work: work.value,
                quote: quote.value,
                status: status.value
            })
        })
        .then(() => {
            editingId = null;
            form.reset();
            loadJobs();
        });

    } else {
        // ADD
        const formData = new FormData(form);

        fetch("http://localhost:3000/jobs", {
            method: "POST",
            body: formData
        })
        .then(() => {
            form.reset();
            loadJobs();
        });
    }
});

// Load jobs
function loadJobs() {
    fetch("http://localhost:3000/jobs")
        .then(res => res.json())
        .then(data => {
            jobs = data;
            displayJobs();
        });
}

// Display jobs
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

                ${job.photo ? `<img src="http://localhost:3000/uploads/${job.photo}" width="200"><br>` : ""}

                <button onclick="updateStatus('${job.id}', 'in progress')">Start</button>
                <button onclick="updateStatus('${job.id}', 'done')">Complete</button>
                <button onclick="deleteJob('${job.id}')">Delete</button>
                <button onclick="editJob('${job.id}')">Edit</button>
            `;

            jobList.appendChild(div);
        });
}

// Edit
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

// Update status
function updateStatus(id, status) {
    fetch(`http://localhost:3000/jobs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    }).then(loadJobs);
}

// Delete
function deleteJob(id) {
    if (!confirm("Delete this job?")) return;

    fetch(`http://localhost:3000/jobs/${id}`, {
        method: "DELETE"
    }).then(loadJobs);
}