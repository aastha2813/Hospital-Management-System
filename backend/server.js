const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// =====================================================
// PostgreSQL Connection
// =====================================================

const pool = new Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD
});

// Test PostgreSQL connection
pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.error("PostgreSQL connection failed:", err.message);
    } else {
        console.log("PostgreSQL connected successfully");
        console.log("Database time:", result.rows[0].now);
    }
});

// =====================================================
// MongoDB Connection
// =====================================================

const mongoClient = new MongoClient(process.env.MONGO_URI);

let mongoDB;

async function connectMongoDB() {
    try {
        await mongoClient.connect();

        mongoDB = mongoClient.db(process.env.MONGO_DATABASE);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
    }
}

connectMongoDB();

// =====================================================
// Test Route
// =====================================================

app.get("/", (req, res) => {
    res.json({
        message: "Hospital Management System Backend is running"
    });
});

// =====================================================
// Patient API
// =====================================================

app.get("/api/patients", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                p.patient_id,
                per.person_id,
                per.first_name,
                per.last_name,
                per.date_of_birth,
                per.gender,
                per.phone,
                per.email,
                per.address,
                p.blood_group,
                p.allergies,
                p.insurance_no,
                p.dept_id
            FROM PATIENT p
            JOIN PERSON per
                ON p.person_id = per.person_id
            ORDER BY p.patient_id
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching patients:", error.message);
        res.status(500).json({
            error: "Failed to fetch patients"
        });
    }
});

// =====================================================
// Doctor Notes API - MongoDB
// =====================================================

app.get("/api/doctor-notes", async (req, res) => {
    try {
        if (!mongoDB) {
            return res.status(503).json({
                error: "MongoDB is not connected"
            });
        }

        const notes = await mongoDB
            .collection("doctor_notes")
            .find({})
            .sort({ note_date: -1 })
            .toArray();

        res.json(notes);
    } catch (error) {
        console.error("Error fetching doctor notes:", error.message);

        res.status(500).json({
            error: "Failed to fetch doctor notes"
        });
    }
});

// =====================================================
// IoT Vitals API - MongoDB
// =====================================================

app.get("/api/vitals/:patient_id", async (req, res) => {
    try {
        if (!mongoDB) {
            return res.status(503).json({
                error: "MongoDB is not connected"
            });
        }

        const patientId = parseInt(req.params.patient_id);

        if (isNaN(patientId)) {
            return res.status(400).json({
                error: "Invalid patient ID"
            });
        }

        const vitals = await mongoDB
            .collection("iot_vitals")
            .find({ patient_id: patientId })
            .sort({ recorded_at: -1 })
            .toArray();

        res.json(vitals);
    } catch (error) {
        console.error("Error fetching IoT vitals:", error.message);

        res.status(500).json({
            error: "Failed to fetch IoT vitals"
        });
    }
});

// =====================================================
// Billing API - PostgreSQL Function
// =====================================================

app.get("/api/bills/:bill_id", async (req, res) => {
    try {
        const billId = parseInt(req.params.bill_id);

        if (isNaN(billId)) {
            return res.status(400).json({
                error: "Invalid bill ID"
            });
        }

        const result = await pool.query(
            "SELECT * FROM CalculateBill($1)",
            [billId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Bill not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error fetching bill:", error.message);

        res.status(500).json({
            error: "Failed to fetch bill"
        });
    }
});

// =====================================================
// Book Appointment API - PostgreSQL Procedure
// =====================================================

app.post("/api/appointments", async (req, res) => {
    try {
        const {
            patient_id,
            doctor_id,
            date,
            time,
            reason,
            appointment_type
        } = req.body;

        if (
            !patient_id ||
            !doctor_id ||
            !date ||
            !time ||
            !reason ||
            !appointment_type
        ) {
            return res.status(400).json({
                error: "All appointment fields are required"
            });
        }

        await pool.query(
            "CALL BookAppointment($1, $2, $3, $4, $5, $6)",
            [
                patient_id,
                doctor_id,
                date,
                time,
                reason,
                appointment_type
            ]
        );

        res.status(201).json({
            message: "Appointment booked successfully"
        });

    } catch (error) {
        console.error("Error booking appointment:", error.message);

        res.status(400).json({
            error: error.message
        });
    }
});

// =====================================================
// Start Server
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});