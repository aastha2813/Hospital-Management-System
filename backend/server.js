const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// =====================================================
// POSTGRESQL CONNECTION
// =====================================================

const pool = new Pool({
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD
});


// =====================================================
// MONGODB CONNECTION
// =====================================================

const mongoClient = new MongoClient(process.env.MONGO_URI);

let mongoDB = null;


// =====================================================
// TEST POSTGRESQL CONNECTION
// =====================================================

pool.connect()
    .then((client) => {

        console.log(
            "PostgreSQL connected successfully"
        );

        client.release();

    })
    .catch((error) => {

        console.error(
            "PostgreSQL connection error:",
            error.message
        );

    });


// =====================================================
// CONNECT MONGODB
// =====================================================

async function connectMongoDB() {

    try {

        await mongoClient.connect();

        mongoDB =
            mongoClient.db(
                process.env.MONGODB_DATABASE ||
                "hospital_management"
            );

        console.log(
            "MongoDB connected successfully"
        );

    } catch (error) {

        console.error(
            "MongoDB connection error:",
            error.message
        );

    }

}


// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {

    res.json({
        message:
            "Hospital Management System API is running"
    });

});


// =====================================================
// BRANCH APIs
// =====================================================

// Get all branches

app.get(
    "/api/branches",
    async (req, res) => {

        try {

            const result =
                await pool.query(`
                    SELECT
                        branch_id,
                        branch_name,
                        address,
                        city,
                        state,
                        contact_no
                    FROM HOSPITAL_BRANCH
                    ORDER BY branch_id
                `);

            res.json(result.rows);

        } catch (error) {

            console.error(
                "Error fetching branches:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to fetch branches"
            });

        }

    }
);


// Get one branch

app.get(
    "/api/branches/:branch_id",
    async (req, res) => {

        try {

            const branchId =
                parseInt(
                    req.params.branch_id
                );

            if (isNaN(branchId)) {

                return res.status(400).json({
                    error:
                        "Invalid branch ID"
                });

            }


            const result =
                await pool.query(
                    `
                    SELECT
                        branch_id,
                        branch_name,
                        address,
                        city,
                        state,
                        contact_no
                    FROM HOSPITAL_BRANCH
                    WHERE branch_id = $1
                    `,
                    [branchId]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        "Branch not found"
                });

            }


            res.json(
                result.rows[0]
            );

        } catch (error) {

            console.error(
                "Error fetching branch:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to fetch branch"
            });

        }

    }
);


// =====================================================
// PATIENT APIs
// =====================================================

// Get patients

// Optional:
// /api/patients
// /api/patients?branch_id=1
// /api/patients?branch_id=2

app.get(
    "/api/patients",
    async (req, res) => {

        try {

            const branchId =
                req.query.branch_id;


            let query = `
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
                    p.dept_id,
                    p.branch_id,
                    h.branch_name,
                    h.city AS branch_city
                FROM PATIENT p
                JOIN PERSON per
                    ON p.person_id =
                       per.person_id
                JOIN HOSPITAL_BRANCH h
                    ON p.branch_id =
                       h.branch_id
            `;


            const values = [];


            if (branchId) {

                const parsedBranchId =
                    parseInt(branchId);


                if (
                    isNaN(parsedBranchId)
                ) {

                    return res.status(400)
                        .json({
                            error:
                                "Invalid branch ID"
                        });

                }


                query += `
                    WHERE p.branch_id = $1
                `;

                values.push(
                    parsedBranchId
                );

            }


            query += `
                ORDER BY p.patient_id
            `;


            const result =
                await pool.query(
                    query,
                    values
                );


            res.json(
                result.rows
            );

        } catch (error) {

            console.error(
                "Error fetching patients:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to fetch patients"
            });

        }

    }
);


// Get one patient

app.get(
    "/api/patients/:patient_id",
    async (req, res) => {

        try {

            const patientId =
                parseInt(
                    req.params.patient_id
                );


            if (isNaN(patientId)) {

                return res.status(400).json({
                    error:
                        "Invalid patient ID"
                });

            }


            const result =
                await pool.query(
                    `
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
                        p.dept_id,
                        p.branch_id,
                        h.branch_name,
                        h.city AS branch_city
                    FROM PATIENT p
                    JOIN PERSON per
                        ON p.person_id =
                           per.person_id
                    JOIN HOSPITAL_BRANCH h
                        ON p.branch_id =
                           h.branch_id
                    WHERE p.patient_id = $1
                    `,
                    [patientId]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        "Patient not found"
                });

            }


            res.json(
                result.rows[0]
            );

        } catch (error) {

            console.error(
                "Error fetching patient:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to fetch patient"
            });

        }

    }
);


// Create patient
app.post(
    "/api/patients",
    async (req, res) => {

        const client = await pool.connect();

        try {

            const {
                first_name,
                last_name,
                date_of_birth,
                gender,
                phone,
                email,
                address,
                blood_group,
                allergies,
                insurance_no,
                dept_id,
                branch_id
            } = req.body;

            if (
                !first_name ||
                !date_of_birth ||
                !gender ||
                !phone ||
                !branch_id
            ) {
                return res.status(400).json({
                    error:
                        "First name, date of birth, gender, phone and branch are required"
                });
            }

            const parsedBranchId = parseInt(branch_id);
            const parsedDeptId =
                dept_id ? parseInt(dept_id) : null;

            if (isNaN(parsedBranchId)) {
                return res.status(400).json({
                    error: "Invalid branch ID"
                });
            }

            if (dept_id && isNaN(parsedDeptId)) {
                return res.status(400).json({
                    error: "Invalid department ID"
                });
            }

            const branchResult = await pool.query(
                `
                SELECT branch_id
                FROM HOSPITAL_BRANCH
                WHERE branch_id = $1
                `,
                [parsedBranchId]
            );

            if (branchResult.rows.length === 0) {
                return res.status(400).json({
                    error: "Selected branch does not exist"
                });
            }

            if (parsedDeptId !== null) {

                const departmentResult = await pool.query(
                    `
                    SELECT dept_id
                    FROM DEPARTMENT
                    WHERE dept_id = $1
                    `,
                    [parsedDeptId]
                );

                if (departmentResult.rows.length === 0) {
                    return res.status(400).json({
                        error:
                            "Selected department does not exist"
                    });
                }
            }

            await client.query("BEGIN");

            const personIdResult = await client.query(
                `
                SELECT COALESCE(MAX(person_id), 0) + 1
                AS person_id
                FROM PERSON
                `
            );

            const personId =
                personIdResult.rows[0].person_id;

            await client.query(
                `
                INSERT INTO PERSON (
                    person_id,
                    first_name,
                    last_name,
                    date_of_birth,
                    gender,
                    phone,
                    email,
                    address
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8
                )
                `,
                [
                    personId,
                    first_name,
                    last_name || null,
                    date_of_birth,
                    gender,
                    phone,
                    email || null,
                    address || null
                ]
            );

            const patientIdResult = await client.query(
                `
                SELECT COALESCE(MAX(patient_id), 0) + 1
                AS patient_id
                FROM PATIENT
                `
            );

            const patientId =
                patientIdResult.rows[0].patient_id;

            await client.query(
                `
                INSERT INTO PATIENT (
                    patient_id,
                    blood_group,
                    allergies,
                    insurance_no,
                    dept_id,
                    person_id,
                    branch_id
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7
                )
                `,
                [
                    patientId,
                    blood_group || null,
                    allergies || null,
                    insurance_no || null,
                    parsedDeptId,
                    personId,
                    parsedBranchId
                ]
            );

            await client.query("COMMIT");

            const result = await pool.query(
                `
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
                    p.dept_id,
                    p.branch_id,
                    h.branch_name,
                    h.city AS branch_city
                FROM PATIENT p
                JOIN PERSON per
                    ON p.person_id = per.person_id
                JOIN HOSPITAL_BRANCH h
                    ON p.branch_id = h.branch_id
                WHERE p.patient_id = $1
                `,
                [patientId]
            );

            res.status(201).json({
                message: "Patient created successfully",
                patient: result.rows[0]
            });

        } catch (error) {

            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Rollback error:",
                    rollbackError.message
                );
            }

            console.error(
                "Error creating patient:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to create patient"
            });

        } finally {
            client.release();
        }
    }
);


// =====================================================
// DOCTOR APIs
// =====================================================

// Get doctors

// Optional:
// /api/doctors
// /api/doctors?branch_id=1
// /api/doctors?branch_id=2

// Create doctor
app.post(
    "/api/doctors",
    async (req, res) => {

        const client = await pool.connect();

        try {

            const {
                first_name,
                last_name,
                date_of_birth,
                gender,
                phone,
                email,
                address,
                specialization,
                qualification,
                experience_years,
                consultation_fee,
                dept_id,
                branch_id
            } = req.body;


            if (
                !first_name ||
                !date_of_birth ||
                !gender ||
                !phone ||
                !specialization ||
                !qualification ||
                experience_years === undefined ||
                experience_years === "" ||
                consultation_fee === undefined ||
                consultation_fee === "" ||
                !dept_id ||
                !branch_id
            ) {

                return res.status(400).json({
                    error:
                        "All required doctor fields must be filled"
                });

            }


            const experienceYears =
                Number(experience_years);

            const consultationFee =
                Math.round(
                    Number(consultation_fee) * 100
                ) / 100;

            const departmentId =
                Number(dept_id);

            const branchId =
                Number(branch_id);


            if (
                !Number.isInteger(experienceYears) ||
                experienceYears < 0 ||
                !Number.isFinite(consultationFee) ||
                consultationFee < 0 ||
                !Number.isInteger(departmentId) ||
                !Number.isInteger(branchId)
            ) {

                return res.status(400).json({
                    error:
                        "Invalid doctor numeric values"
                });

            }


            await client.query("BEGIN");


            // Check branch
            const branchResult =
                await client.query(
                    `
                    SELECT branch_id
                    FROM HOSPITAL_BRANCH
                    WHERE branch_id = $1
                    `,
                    [branchId]
                );


            if (
                branchResult.rows.length === 0
            ) {

                throw new Error(
                    "Selected branch does not exist"
                );

            }


            // Check department
            const departmentResult =
                await client.query(
                    `
                    SELECT dept_id
                    FROM DEPARTMENT
                    WHERE dept_id = $1
                    `,
                    [departmentId]
                );


            if (
                departmentResult.rows.length === 0
            ) {

                throw new Error(
                    "Selected department does not exist"
                );

            }


            // Generate new PERSON ID
            const personIdResult =
                await client.query(
                    `
                    SELECT
                        COALESCE(
                            MAX(person_id),
                            0
                        ) + 1 AS person_id
                    FROM PERSON
                    `
                );


            const personId =
                Number(
                    personIdResult.rows[0].person_id
                );


            // Generate new DOCTOR ID
            const doctorIdResult =
                await client.query(
                    `
                    SELECT
                        COALESCE(
                            MAX(doctor_id),
                            0
                        ) + 1 AS doctor_id
                    FROM DOCTOR
                    `
                );


            const doctorId =
                Number(
                    doctorIdResult.rows[0].doctor_id
                );


            // Insert into PERSON
            await client.query(
                `
                INSERT INTO PERSON (
                    person_id,
                    first_name,
                    last_name,
                    date_of_birth,
                    gender,
                    phone,
                    email,
                    address
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8
                )
                `,
                [
                    personId,
                    first_name,
                    last_name || null,
                    date_of_birth,
                    gender,
                    phone,
                    email || null,
                    address || null
                ]
            );


            // Insert into DOCTOR
            await client.query(
                `
                INSERT INTO DOCTOR (
                    doctor_id,
                    specialization,
                    qualification,
                    experience_years,
                    consultation_fee,
                    dept_id,
                    person_id,
                    branch_id
                )
                VALUES (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8
                )
                `,
                [
                    doctorId,
                    specialization,
                    qualification,
                    experienceYears,
                    consultationFee,
                    departmentId,
                    personId,
                    branchId
                ]
            );


            await client.query("COMMIT");


            // Get newly created doctor
            const result =
                await pool.query(
                    `
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
                        d.dept_id,
                        d.branch_id,
                        h.branch_name,
                        h.city AS branch_city
                    FROM DOCTOR d
                    JOIN PERSON per
                        ON d.person_id =
                           per.person_id
                    JOIN HOSPITAL_BRANCH h
                        ON d.branch_id =
                           h.branch_id
                    WHERE d.doctor_id = $1
                    `,
                    [doctorId]
                );


            res.status(201).json({
                message:
                    "Doctor created successfully",
                doctor:
                    result.rows[0]
            });


        } catch (error) {

            try {

                await client.query("ROLLBACK");

            } catch (rollbackError) {

                console.error(
                    "Rollback error:",
                    rollbackError.message
                );

            }


            console.error(
                "Error creating doctor:",
                error.message
            );


            res.status(500).json({
                error:
                    error.message ||
                    "Failed to create doctor"
            });


        } finally {

            client.release();

        }

    }
);


app.get(
    "/api/doctors",
    async (req, res) => {

        try {

            const branchId =
                req.query.branch_id;


            let query = `
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
                    d.dept_id,
                    d.branch_id,
                    h.branch_name,
                    h.city AS branch_city
                FROM DOCTOR d
                JOIN PERSON per
                    ON d.person_id =
                       per.person_id
                JOIN HOSPITAL_BRANCH h
                    ON d.branch_id =
                       h.branch_id
            `;


            const values = [];


            if (branchId) {

                const parsedBranchId =
                    parseInt(branchId);


                if (
                    isNaN(parsedBranchId)
                ) {

                    return res.status(400)
                        .json({
                            error:
                                "Invalid branch ID"
                        });

                }


                query += `
                    WHERE d.branch_id = $1
                `;

                values.push(
                    parsedBranchId
                );

            }


            query += `
                ORDER BY d.doctor_id
            `;


            const result =
                await pool.query(
                    query,
                    values
                );


            res.json(
                result.rows
            );

        } catch (error) {

            console.error(
                "Error fetching doctors:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to fetch doctors"
            });

        }

    }
);


// =====================================================
// APPOINTMENT APIs
// =====================================================

// Get appointments

// Optional:
// /api/appointments
// /api/appointments?branch_id=1
// /api/appointments?branch_id=2

app.get(
    "/api/appointments",
    async (req, res) => {

        try {

            const branchId =
                req.query.branch_id;


            let query = `
                SELECT
                    a.appointment_id,

                    a.patient_id,

                    CONCAT(
                        patient_person.first_name,
                        ' ',
                        COALESCE(
                            patient_person.last_name,
                            ''
                        )
                    ) AS patient_name,

                    a.doctor_id,

                    CONCAT(
                        doctor_person.first_name,
                        ' ',
                        COALESCE(
                            doctor_person.last_name,
                            ''
                        )
                    ) AS doctor_name,

                    a.date,
                    a.time,
                    a.status,
                    a.reason,
                    a.appointment_type,

                    a.branch_id,
                    h.branch_name,
                    h.city AS branch_city

                FROM APPOINTMENT a

                JOIN PATIENT p
                    ON a.patient_id =
                       p.patient_id

                JOIN PERSON patient_person
                    ON p.person_id =
                       patient_person.person_id

                JOIN DOCTOR d
                    ON a.doctor_id =
                       d.doctor_id

                JOIN PERSON doctor_person
                    ON d.person_id =
                       doctor_person.person_id

                JOIN HOSPITAL_BRANCH h
                    ON a.branch_id =
                       h.branch_id
            `;


            const values = [];


            if (branchId) {

                const parsedBranchId =
                    parseInt(branchId);


                if (
                    isNaN(parsedBranchId)
                ) {

                    return res.status(400)
                        .json({
                            error:
                                "Invalid branch ID"
                        });

                }


                query += `
                    WHERE a.branch_id = $1
                `;

                values.push(
                    parsedBranchId
                );

            }


            query += `
                ORDER BY a.date, a.time
            `;


            const result =
                await pool.query(
                    query,
                    values
                );


            res.json(
                result.rows
            );

        } catch (error) {

            console.error(
                "Error fetching appointments:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to fetch appointments"
            });

        }

    }
);


// Create appointment

app.post(
    "/api/appointments",
    async (req, res) => {

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
                !time
            ) {

                return res.status(400).json({
                    error:
                        "Patient, doctor, date and time are required"
                });

            }


            await pool.query(
                `
                CALL BookAppointment(
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6
                )
                `,
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

                message:
                    "Appointment booked successfully"

            });

        } catch (error) {

            console.error(
                "Error booking appointment:",
                error.message
            );

            res.status(400).json({
                error:
                    error.message
            });

        }

    }
);


// =====================================================
// ADMISSION APIs
// =====================================================

// Get admissions

// Optional:
// /api/admissions
// /api/admissions?branch_id=1
// /api/admissions?branch_id=2

app.get(
    "/api/admissions",
    async (req, res) => {

        try {

            const branchId =
                req.query.branch_id;


            let query = `
                SELECT
                    a.admission_id,

                    a.patient_id,

                    CONCAT(
                        patient_person.first_name,
                        ' ',
                        COALESCE(
                            patient_person.last_name,
                            ''
                        )
                    ) AS patient_name,

                    a.attending_doctor_id,

                    CONCAT(
                        doctor_person.first_name,
                        ' ',
                        COALESCE(
                            doctor_person.last_name,
                            ''
                        )
                    ) AS doctor_name,

                    a.appointment_id,
                    a.room_id,
                    a.admit_date,
                    a.discharge_date,
                    a.type,
                    a.status,

                    r.branch_id,
                    h.branch_name,
                    h.city AS branch_city,
                    r.room_type

                FROM ADMISSION a

                JOIN PATIENT p
                    ON a.patient_id =
                       p.patient_id

                JOIN PERSON patient_person
                    ON p.person_id =
                       patient_person.person_id

                JOIN DOCTOR d
                    ON a.attending_doctor_id =
                       d.doctor_id

                JOIN PERSON doctor_person
                    ON d.person_id =
                       doctor_person.person_id

                JOIN ROOM r
                    ON a.room_id =
                       r.room_id

                JOIN HOSPITAL_BRANCH h
                    ON r.branch_id =
                       h.branch_id
            `;


            const values = [];


            if (branchId) {

                const parsedBranchId =
                    parseInt(branchId);


                if (
                    isNaN(parsedBranchId)
                ) {

                    return res.status(400)
                        .json({
                            error:
                                "Invalid branch ID"
                        });

                }


                query += `
                    WHERE r.branch_id = $1
                `;

                values.push(
                    parsedBranchId
                );

            }


            query += `
                ORDER BY a.admission_id
            `;


            const result =
                await pool.query(
                    query,
                    values
                );


            res.json(
                result.rows
            );

        } catch (error) {

            console.error(
                "Error fetching admissions:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to fetch admissions"
            });

        }

    }
);


// =====================================================
// CREATE ADMISSION
// =====================================================

app.post(
    "/api/admissions",
    async (req, res) => {

        try {

            const {
                patient_id,
                doctor_id,
                appointment_id,
                room_id,
                admit_date,
                type
            } = req.body;


            // Validate required fields
            if (
                !patient_id ||
                !doctor_id ||
                !room_id ||
                !admit_date ||
                !type
            ) {

                return res.status(400).json({
                    error:
                        "Patient, doctor, room, admit date and admission type are required"
                });

            }


            // Call existing PostgreSQL procedure
            await pool.query(
                `
                CALL AdmitPatient(
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6
                )
                `,
                [
                    patient_id,
                    doctor_id,
                    appointment_id || null,
                    room_id,
                    admit_date,
                    type
                ]
            );


            res.status(201).json({

                message:
                    "Patient admitted successfully"

            });

        } catch (error) {

            console.error(
                "Error admitting patient:",
                error.message
            );


            res.status(400).json({

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// DISCHARGE PATIENT
// =====================================================

app.post(
    "/api/admissions/:admission_id/discharge",
    async (req, res) => {

        try {

            const admissionId =
                parseInt(req.params.admission_id);

            const {
                discharge_date
            } = req.body;


            // Validate admission ID
            if (isNaN(admissionId)) {

                return res.status(400).json({
                    error:
                        "Invalid admission ID"
                });

            }


            // Validate discharge date
            if (!discharge_date) {

                return res.status(400).json({
                    error:
                        "Discharge date is required"
                });

            }


            // Call existing PostgreSQL procedure
            await pool.query(
                `
                CALL DischargePatient(
                    $1,
                    $2
                )
                `,
                [
                    admissionId,
                    discharge_date
                ]
            );


            res.json({

                message:
                    "Patient discharged successfully"

            });

        } catch (error) {

            console.error(
                "Error discharging patient:",
                error.message
            );


            res.status(400).json({

                error:
                    error.message

            });

        }

    }
);


// =====================================================
// ROOM APIs
// =====================================================

// Optional:
// /api/rooms
// /api/rooms?branch_id=1
// /api/rooms?branch_id=2

app.get(
    "/api/rooms",
    async (req, res) => {

        try {

            const branchId =
                req.query.branch_id;


            let query = `
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
                    ON r.branch_id =
                       h.branch_id
            `;


            const values = [];


            if (branchId) {

                const parsedBranchId =
                    parseInt(branchId);


                if (
                    isNaN(parsedBranchId)
                ) {

                    return res.status(400)
                        .json({
                            error:
                                "Invalid branch ID"
                        });

                }


                query += `
                    WHERE r.branch_id = $1
                `;

                values.push(
                    parsedBranchId
                );

            }


            query += `
                ORDER BY
                    r.branch_id,
                    r.room_id
            `;


            const result =
                await pool.query(
                    query,
                    values
                );


            res.json(
                result.rows
            );

        } catch (error) {

            console.error(
                "Error fetching rooms:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to fetch rooms"
            });

        }

    }
);


// =====================================================
// BILLING APIs
// =====================================================

// Get one calculated bill

app.get(
    "/api/bills/:bill_id",
    async (req, res) => {

        try {

            const billId =
                parseInt(
                    req.params.bill_id
                );


            if (isNaN(billId)) {

                return res.status(400).json({
                    error:
                        "Invalid bill ID"
                });

            }


            const result =
                await pool.query(
                    `
                    SELECT *
                    FROM CalculateBill($1)
                    `,
                    [billId]
                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({
                    error:
                        "Bill not found"
                });

            }


            res.json(
                result.rows[0]
            );

        } catch (error) {

            console.error(
                "Error fetching bill:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to fetch bill"
            });

        }

    }
);


// Get all bills

// Optional:
// /api/bills
// /api/bills?branch_id=1
// /api/bills?branch_id=2

app.get(
    "/api/bills",
    async (req, res) => {

        try {

            const branchId =
                req.query.branch_id;


            let query = `
                SELECT
                    b.bill_id,
                    b.admission_id,
                    b.bill_date,
                    b.total_amount,

                    COALESCE(
                        SUM(py.amount),
                        0
                    ) AS amount_paid,

                    GREATEST(
                        b.total_amount -
                        COALESCE(
                            SUM(py.amount),
                            0
                        ),
                        0
                    ) AS amount_left,

                    CASE

                        WHEN
                            COALESCE(
                                SUM(py.amount),
                                0
                            )
                            >= b.total_amount

                        THEN 'Paid'

                        WHEN
                            COALESCE(
                                SUM(py.amount),
                                0
                            ) > 0

                        THEN 'Partially Paid'

                        ELSE 'Pending'

                    END AS status,

                    a.patient_id,

                    CONCAT(
                        per.first_name,
                        ' ',
                        COALESCE(
                            per.last_name,
                            ''
                        )
                    ) AS patient_name,

                    r.room_id,
                    r.branch_id,

                    h.branch_name,
                    h.city AS branch_city

                FROM BILL b

                JOIN ADMISSION a
                    ON b.admission_id =
                       a.admission_id

                JOIN PATIENT p
                    ON a.patient_id =
                       p.patient_id

                JOIN PERSON per
                    ON p.person_id =
                       per.person_id

                JOIN ROOM r
                    ON a.room_id =
                       r.room_id

                JOIN HOSPITAL_BRANCH h
                    ON r.branch_id =
                       h.branch_id

                LEFT JOIN PAYMENT py
                    ON b.bill_id =
                       py.bill_id
            `;


            const values = [];


            if (branchId) {

                const parsedBranchId =
                    parseInt(branchId);


                if (
                    isNaN(parsedBranchId)
                ) {

                    return res.status(400)
                        .json({
                            error:
                                "Invalid branch ID"
                        });

                }


                query += `
                    WHERE r.branch_id = $1
                `;

                values.push(
                    parsedBranchId
                );

            }


            query += `
                GROUP BY
                    b.bill_id,
                    b.admission_id,
                    b.bill_date,
                    b.total_amount,
                    a.patient_id,
                    per.first_name,
                    per.last_name,
                    r.room_id,
                    r.branch_id,
                    h.branch_name,
                    h.city

                ORDER BY
                    b.bill_id
            `;


            const result =
                await pool.query(
                    query,
                    values
                );


            res.json(
                result.rows
            );

        } catch (error) {

            console.error(
                "Error fetching bills:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to fetch bills"
            });

        }

    }
);


// Make payment

app.post(
    "/api/payments",
    async (req, res) => {

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
                    error:
                        "All payment fields are required"
                });

            }


            if (
                Number(amount) <= 0
            ) {

                return res.status(400).json({
                    error:
                        "Payment amount must be greater than zero"
                });

            }


            await pool.query(
                `
                CALL MakePayment(
                    $1,
                    $2,
                    $3,
                    $4
                )
                `,
                [
                    bill_id,
                    payment_date,
                    method,
                    amount
                ]
            );


            const result =
                await pool.query(
                    `
                    SELECT *
                    FROM CalculateBill($1)
                    `,
                    [bill_id]
                );


            res.status(201).json({

                message:
                    "Payment recorded successfully",

                bill:
                    result.rows[0]

            });

        } catch (error) {

            console.error(
                "Error making payment:",
                error.message
            );

            res.status(400).json({
                error:
                    error.message
            });

        }

    }
);


// =====================================================
// MONGODB - DOCTOR NOTES
// =====================================================

// Get doctor notes

// Optional:
// /api/doctor-notes
// /api/doctor-notes?branch_id=1
// /api/doctor-notes?branch_id=2

app.get(
    "/api/doctor-notes",
    async (req, res) => {

        try {

            if (!mongoDB) {

                return res.status(503).json({
                    error:
                        "MongoDB is not connected"
                });

            }


            const branchId =
                req.query.branch_id;


            let patientIds = null;


            // If branch selected,
            // first find patients belonging
            // to that branch.

            if (branchId) {

                const parsedBranchId =
                    parseInt(branchId);


                if (
                    isNaN(parsedBranchId)
                ) {

                    return res.status(400)
                        .json({
                            error:
                                "Invalid branch ID"
                        });

                }


                const patientResult =
                    await pool.query(
                        `
                        SELECT patient_id
                        FROM PATIENT
                        WHERE branch_id = $1
                        ORDER BY patient_id
                        `,
                        [parsedBranchId]
                    );


                patientIds =
                    patientResult.rows.map(
                        row =>
                            row.patient_id
                    );

            }


            const collection =
                mongoDB.collection(
                    "doctor_notes"
                );


            let query = {};


            if (patientIds !== null) {

                query = {
                    patient_id: {
                        $in: patientIds
                    }
                };

            }


            const notes =
                await collection
                    .find(query)
                    .sort({
                        date: -1
                    })
                    .toArray();


            res.json(notes);

        } catch (error) {

            console.error(
                "Error fetching doctor notes:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to fetch doctor notes"
            });

        }

    }
);


// =====================================================
// MONGODB - IOT VITALS
// =====================================================

// Get all vitals

// Optional:
// /api/vitals
// /api/vitals?branch_id=1
// /api/vitals?branch_id=2

app.get(
    "/api/vitals",
    async (req, res) => {

        try {

            if (!mongoDB) {

                return res.status(503).json({
                    error:
                        "MongoDB is not connected"
                });

            }


            const branchId =
                req.query.branch_id;


            let patientIds = null;


            if (branchId) {

                const parsedBranchId =
                    parseInt(branchId);


                if (
                    isNaN(parsedBranchId)
                ) {

                    return res.status(400)
                        .json({
                            error:
                                "Invalid branch ID"
                        });

                }


                const patientResult =
                    await pool.query(
                        `
                        SELECT patient_id
                        FROM PATIENT
                        WHERE branch_id = $1
                        ORDER BY patient_id
                        `,
                        [parsedBranchId]
                    );


                patientIds =
                    patientResult.rows.map(
                        row =>
                            row.patient_id
                    );

            }


            const collection =
                mongoDB.collection(
                    "iot_vitals"
                );


            let query = {};


            if (patientIds !== null) {

                query = {
                    patient_id: {
                        $in: patientIds
                    }
                };

            }


            const vitals =
                await collection
                    .find(query)
                    .sort({
                        timestamp: -1
                    })
                    .toArray();


            res.json(vitals);

        } catch (error) {

            console.error(
                "Error fetching vitals:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to fetch vitals"
            });

        }

    }
);


// =====================================================
// MONGODB - PATIENT VITALS
// =====================================================

// Get vitals for one patient

app.get(
    "/api/vitals/:patient_id",
    async (req, res) => {

        try {

            if (!mongoDB) {

                return res.status(503).json({
                    error:
                        "MongoDB is not connected"
                });

            }


            const patientId =
                parseInt(
                    req.params.patient_id
                );


            if (isNaN(patientId)) {

                return res.status(400).json({
                    error:
                        "Invalid patient ID"
                });

            }


            const collection =
                mongoDB.collection(
                    "iot_vitals"
                );


            const vitals =
                await collection
                    .find({
                        patient_id:
                            patientId
                    })
                    .sort({
                        timestamp: -1
                    })
                    .toArray();


            res.json(vitals);

        } catch (error) {

            console.error(
                "Error fetching patient vitals:",
                error.message
            );

            res.status(500).json({
                error:
                    "Failed to fetch patient vitals"
            });

        }

    }
);


// =====================================================
// START SERVER
// =====================================================

const PORT =
    process.env.PORT || 5000;


async function startServer() {

    await connectMongoDB();


    app.listen(
        PORT,
        () => {

            console.log(
                `Server running on port ${PORT}`
            );

        }
    );

}


startServer();