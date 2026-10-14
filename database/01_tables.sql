-- ============================================
-- HOSPITAL MANAGEMENT SYSTEM
-- RELATIONAL DATABASE SCHEMA
-- PostgreSQL
-- ============================================

-- 1. PERSON
CREATE TABLE PERSON (
    person_id INT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(10),
    phone VARCHAR(15),
    email VARCHAR(100),
    address VARCHAR(200)
);

-- 2. HOSPITAL_BRANCH
CREATE TABLE HOSPITAL_BRANCH (
    branch_id INT PRIMARY KEY,
    branch_name VARCHAR(100) NOT NULL,
    address VARCHAR(200),
    city VARCHAR(50),
    state VARCHAR(50),
    contact_no VARCHAR(15)
);

-- 3. DEPARTMENT
CREATE TABLE DEPARTMENT (
    dept_id INT PRIMARY KEY,
    dept_name VARCHAR(100) NOT NULL,
    location VARCHAR(100),
    description VARCHAR(200)
);

-- 4. PATIENT
CREATE TABLE PATIENT (
    patient_id INT PRIMARY KEY,
    blood_group VARCHAR(5),
    allergies VARCHAR(200),
    insurance_no VARCHAR(50),
    dept_id INT,
    person_id INT NOT NULL UNIQUE,
    branch_id INT,

    CONSTRAINT fk_patient_department
        FOREIGN KEY (dept_id)
        REFERENCES DEPARTMENT(dept_id),

    CONSTRAINT fk_patient_person
        FOREIGN KEY (person_id)
        REFERENCES PERSON(person_id),

    CONSTRAINT fk_patient_branch
        FOREIGN KEY (branch_id)
        REFERENCES HOSPITAL_BRANCH(branch_id)
);

-- 5. DOCTOR
CREATE TABLE DOCTOR (
    doctor_id INT PRIMARY KEY,
    specialization VARCHAR(100),
    qualification VARCHAR(100),
    experience_years INT CHECK (experience_years >= 0),
    consultation_fee DECIMAL(10,2)
        CHECK (consultation_fee >= 0),
    dept_id INT,
    person_id INT NOT NULL UNIQUE,
    branch_id INT,

    CONSTRAINT fk_doctor_department
        FOREIGN KEY (dept_id)
        REFERENCES DEPARTMENT(dept_id),

    CONSTRAINT fk_doctor_person
        FOREIGN KEY (person_id)
        REFERENCES PERSON(person_id),

    CONSTRAINT fk_doctor_branch
        FOREIGN KEY (branch_id)
        REFERENCES HOSPITAL_BRANCH(branch_id)
);

-- 6. STAFF
CREATE TABLE STAFF (
    staff_id INT PRIMARY KEY,
    role VARCHAR(50),
    shift VARCHAR(50),
    office_no VARCHAR(20),
    phone VARCHAR(15),
    dept_id INT,
    person_id INT NOT NULL UNIQUE,

    CONSTRAINT fk_staff_department
        FOREIGN KEY (dept_id)
        REFERENCES DEPARTMENT(dept_id),

    CONSTRAINT fk_staff_person
        FOREIGN KEY (person_id)
        REFERENCES PERSON(person_id)
);

-- 7. ROOM
CREATE TABLE ROOM (
    room_id INT PRIMARY KEY,
    branch_id INT,
    room_type VARCHAR(50),
    floor_no INT,
    status VARCHAR(20) DEFAULT 'vacant',

    CONSTRAINT fk_room_branch
        FOREIGN KEY (branch_id)
        REFERENCES HOSPITAL_BRANCH(branch_id),

    CONSTRAINT chk_room_status
        CHECK (status IN ('vacant', 'occupied'))
);

-- 8. APPOINTMENT
CREATE TABLE APPOINTMENT (
    appointment_id INT PRIMARY KEY,
    patient_id INT,
    doctor_id INT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'Scheduled',
    reason VARCHAR(200),
    appointment_type VARCHAR(50),

    CONSTRAINT fk_appointment_patient
        FOREIGN KEY (patient_id)
        REFERENCES PATIENT(patient_id),

    CONSTRAINT fk_appointment_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES DOCTOR(doctor_id),

    CONSTRAINT chk_appointment_status
        CHECK (
            status IN (
                'Scheduled',
                'Completed',
                'Cancelled'
            )
        )
);

-- 9. PRESCRIPTION
CREATE TABLE PRESCRIPTION (
    prescription_id INT PRIMARY KEY,
    patient_id INT,
    doctor_id INT,
    appointment_id INT,
    date DATE,
    notes VARCHAR(500),

    CONSTRAINT fk_prescription_patient
        FOREIGN KEY (patient_id)
        REFERENCES PATIENT(patient_id),

    CONSTRAINT fk_prescription_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES DOCTOR(doctor_id),

    CONSTRAINT fk_prescription_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES APPOINTMENT(appointment_id)
);

-- 10. MEDICATION
CREATE TABLE MEDICATION (
    med_id INT PRIMARY KEY,
    prescription_id INT,
    name VARCHAR(100),
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    duration VARCHAR(50),

    CONSTRAINT fk_medication_prescription
        FOREIGN KEY (prescription_id)
        REFERENCES PRESCRIPTION(prescription_id)
);

-- 11. ADMISSION
CREATE TABLE ADMISSION (
    admission_id INT PRIMARY KEY,
    patient_id INT,
    attending_doctor_id INT,
    appointment_id INT,
    room_id INT,
    admit_date DATE NOT NULL,
    discharge_date DATE,
    type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Admitted',

    CONSTRAINT fk_admission_patient
        FOREIGN KEY (patient_id)
        REFERENCES PATIENT(patient_id),

    CONSTRAINT fk_admission_doctor
        FOREIGN KEY (attending_doctor_id)
        REFERENCES DOCTOR(doctor_id),

    CONSTRAINT fk_admission_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES APPOINTMENT(appointment_id),

    CONSTRAINT fk_admission_room
        FOREIGN KEY (room_id)
        REFERENCES ROOM(room_id),

    CONSTRAINT chk_admission_status
        CHECK (status IN ('Admitted', 'Discharged')),

    CONSTRAINT chk_admission_dates
        CHECK (
            discharge_date IS NULL
            OR discharge_date >= admit_date
        )
);

-- 12. BILL
CREATE TABLE BILL (
    bill_id INT PRIMARY KEY,
    admission_id INT,
    bill_date DATE,
    total_amount DECIMAL(10,2)
        CHECK (total_amount >= 0),
    status VARCHAR(20) DEFAULT 'Pending',

    CONSTRAINT fk_bill_admission
        FOREIGN KEY (admission_id)
        REFERENCES ADMISSION(admission_id),

    CONSTRAINT chk_bill_status
        CHECK (
            status IN (
                'Pending',
                'Partially Paid',
                'Paid'
            )
        )
);

-- 13. PAYMENT
CREATE TABLE PAYMENT (
    payment_id INT PRIMARY KEY,
    bill_id INT,
    payment_date DATE,
    method VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL
        CHECK (amount > 0),

    CONSTRAINT fk_payment_bill
        FOREIGN KEY (bill_id)
        REFERENCES BILL(bill_id)
);

-- ============================================
-- END OF RELATIONAL SCHEMA
-- 13 TABLES
-- ============================================