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
// PATIENT APIs
// =====================================================

// Get all patients
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

// Get one patient by ID
app.get("/api/patients/:patient_id", async (req, res) => {
    try {
        const patientId = parseInt(req.params.patient_id);

        if (isNaN(patientId)) {
            return res.status(400).json({
                error: "Invalid patient ID"
            });
        }

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
            WHERE p.patient_id = $1
        `, [patientId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Patient not found"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error("Error fetching patient:", error.message);

        res.status(500).json({
            error: "Failed to fetch patient"
        });
    }
});

// =====================================================
// DOCTOR APIs
// =====================================================

// Get all doctors
app.get("/api/doctors", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                d.doctor_id,
                per.person_id,
                per.first_name,
                per.last_name,
                per.date_of_birth,
                per.gender,
                per.phone,
                per.email,
                per.address,
                d.specialization,
                d.qualification,
                d.experience_years,
                d.consultation_fee,
                d.dept_id
            FROM DOCTOR d
            JOIN PERSON per
                ON d.person_id = per.person_id
            ORDER BY d.doctor_id
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching doctors:", error.message);

        res.status(500).json({
            error: "Failed to fetch doctors"
        });
    }
});

// =====================================================
// APPOINTMENT APIs
// =====================================================

// Get all appointments
app.get("/api/appointments", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.appointment_id,
                a.patient_id,
                CONCAT(
                    patient_person.first_name,
                    ' ',
                    COALESCE(patient_person.last_name, '')
                ) AS patient_name,
                a.doctor_id,
                CONCAT(
                    doctor_person.first_name,
                    ' ',
                    COALESCE(doctor_person.last_name, '')
                ) AS doctor_name,
                a.date,
                a.time,
                a.status,
                a.reason,
                a.appointment_type
            FROM APPOINTMENT a

            JOIN PATIENT p
                ON a.patient_id = p.patient_id

            JOIN PERSON patient_person
                ON p.person_id = patient_person.person_id

            JOIN DOCTOR d
                ON a.doctor_id = d.doctor_id

            JOIN PERSON doctor_person
                ON d.person_id = doctor_person.person_id

            ORDER BY a.date, a.time
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching appointments:", error.message);

        res.status(500).json({
            error: "Failed to fetch appointments"
        });
    }
});

// Book appointment using PostgreSQL procedure
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
// ADMISSION APIs
// =====================================================

// Get all admissions
app.get("/api/admissions", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.admission_id,
                a.patient_id,
                CONCAT(
                    patient_person.first_name,
                    ' ',
                    COALESCE(patient_person.last_name, '')
                ) AS patient_name,

                a.attending_doctor_id,
                CONCAT(
                    doctor_person.first_name,
                    ' ',
                    COALESCE(doctor_person.last_name, '')
                ) AS doctor_name,

                a.appointment_id,
                a.room_id,
                a.admit_date,
                a.discharge_date,
                a.type,
                a.status

            FROM ADMISSION a

            JOIN PATIENT p
                ON a.patient_id = p.patient_id

            JOIN PERSON patient_person
                ON p.person_id = patient_person.person_id

            JOIN DOCTOR d
                ON a.attending_doctor_id = d.doctor_id

            JOIN PERSON doctor_person
                ON d.person_id = doctor_person.person_id

            ORDER BY a.admission_id
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching admissions:", error.message);

        res.status(500).json({
            error: "Failed to fetch admissions"
        });
    }
});

// =====================================================
// ROOM APIs
// =====================================================

// Get all rooms
app.get("/api/rooms", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                r.room_id,
                r.branch_id,
                h.branch_name,
                h.city,
                r.room_type,
                r.floor_no,
                r.status
            FROM ROOM r
            JOIN HOSPITAL_BRANCH h
                ON r.branch_id = h.branch_id
            ORDER BY r.branch_id, r.room_id
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching rooms:", error.message);

        res.status(500).json({
            error: "Failed to fetch rooms"
        });
    }
});

// =====================================================
// BILLING APIs
// =====================================================

// Get calculated bill using PostgreSQL function
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

// Make payment using PostgreSQL procedure
app.post("/api/payments", async (req, res) => {
    try {
        const {
            bill_id,
            payment_date,
            method,
            amount
        } = req.body;

        if (
            !bill_id ||
            !payment_date ||
            !method ||
            amount === undefined
        ) {
            return res.status(400).json({
                error: "All payment fields are required"
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                error: "Payment amount must be greater than zero"
            });
        }

        await pool.query(
            "CALL MakePayment($1, $2, $3, $4)",
            [
                bill_id,
                payment_date,
                method,
                amount
            ]
        );

        // Fetch updated bill details
        const result = await pool.query(
            "SELECT * FROM CalculateBill($1)",
            [bill_id]
        );

        res.status(201).json({
            message: "Payment recorded successfully",
            bill: result.rows[0]
        });

    } catch (error) {
        console.error("Error making payment:", error.message);

        res.status(400).json({
            error: error.message
        });
    }
});

// =====================================================
// MONGODB APIs
// =====================================================

// Get all doctor notes
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

// Get IoT vitals for a patient
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
            .find({
                patient_id: patientId
            })
            .sort({
                recorded_at: -1
            })
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
// Start Server
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});