const express = require("express");
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const app = express();

// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());

// =======================
// FILE PATHS
// =======================
const DATA_FILE = path.join(__dirname, "jobs.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");

console.log("USING FILE:", DATA_FILE);

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
}

// Serve uploads
app.use("/uploads", express.static(UPLOADS_DIR));

// Serve frontend (IMPORTANT)
app.use(express.static(__dirname));

// =======================
// MULTER SETUP
// =======================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// =======================
// HELPERS
// =======================
function getJobs() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, "[]");
    }
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveJobs(jobs) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2));
    console.log("FILE SAVED:", jobs);
}

// =======================
// ROUTES (API)
// =======================

// Get all jobs
app.get("/jobs", (req, res) => {
    res.json(getJobs());
});

// Add job
app.post("/jobs", upload.single("photo"), (req, res) => {
    const jobs = getJobs();

    const newJob = {
        id: Date.now().toString(),
        customer: req.body.customer,
        vehicle: req.body.vehicle,
        issue: req.body.issue,
        work: req.body.work,
        quote: req.body.quote,
        status: req.body.status,
        photo: req.file ? req.file.filename : null
    };

    console.log("CREATING JOB:", newJob);

    jobs.push(newJob);
    saveJobs(jobs);

    res.json({ message: "Job saved", job: newJob });
});

// Update job (FULL EDIT)
app.put("/jobs/:id", (req, res) => {
    const jobs = getJobs();
    const id = req.params.id;

    const job = jobs.find(j => j.id === id);

    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }

    job.customer = req.body.customer;
    job.vehicle = req.body.vehicle;
    job.issue = req.body.issue;
    job.work = req.body.work;
    job.quote = req.body.quote;
    job.status = req.body.status;

    saveJobs(jobs);

    res.json({ message: "Job updated", job });
});

// Delete job
app.delete("/jobs/:id", (req, res) => {
    const jobs = getJobs();
    const id = req.params.id;

    const newJobs = jobs.filter(j => j.id !== id);

    if (jobs.length === newJobs.length) {
        return res.status(404).json({ message: "Job not found" });
    }

    saveJobs(newJobs);

    res.json({ message: "Job deleted" });
});

// =======================
// FRONTEND ROUTE
// =======================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});