-- ============================================
-- HOSPITAL MANAGEMENT SYSTEM
-- Relational Database Schema
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
    FOREIGN KEY (dept_id) REFERENCES DEPARTMENT(dept_id),
    FOREIGN KEY (person_id) REFERENCES PERSON(person_id)
);


-- 5. DOCTOR

CREATE TABLE DOCTOR (
    doctor_id INT PRIMARY KEY,
    specialization VARCHAR(100),
    qualification VARCHAR(100),
    experience_years INT,
    consultation_fee DECIMAL(10,2),
    dept_id INT,
    person_id INT NOT NULL UNIQUE,
    FOREIGN KEY (dept_id) REFERENCES DEPARTMENT(dept_id),
    FOREIGN KEY (person_id) REFERENCES PERSON(person_id)
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
    FOREIGN KEY (dept_id) REFERENCES DEPARTMENT(dept_id),
    FOREIGN KEY (person_id) REFERENCES PERSON(person_id)
);


-- 7. ROOM

CREATE TABLE ROOM (
    room_id INT PRIMARY KEY,
    branch_id INT,
    room_type VARCHAR(50),
    floor_no INT,
    status VARCHAR(20),
    FOREIGN KEY (branch_id) REFERENCES HOSPITAL_BRANCH(branch_id)
);


-- 8. APPOINTMENT

CREATE TABLE APPOINTMENT (
    appointment_id INT PRIMARY KEY,
    patient_id INT,
    doctor_id INT,
    date DATE,
    time TIME,
    status VARCHAR(20),
    reason VARCHAR(200),
    appointment_type VARCHAR(50),
    FOREIGN KEY (patient_id) REFERENCES PATIENT(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES DOCTOR(doctor_id)
);


-- 9. PRESCRIPTION

CREATE TABLE PRESCRIPTION (
    prescription_id INT PRIMARY KEY,
    patient_id INT,
    doctor_id INT,
    appointment_id INT,
    date DATE,
    notes VARCHAR(500),
    FOREIGN KEY (patient_id) REFERENCES PATIENT(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES DOCTOR(doctor_id),
    FOREIGN KEY (appointment_id) REFERENCES APPOINTMENT(appointment_id)
);


-- 10. MEDICATION

CREATE TABLE MEDICATION (
    med_id INT PRIMARY KEY,
    prescription_id INT,
    name VARCHAR(100),
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    duration VARCHAR(50),
    FOREIGN KEY (prescription_id) REFERENCES PRESCRIPTION(prescription_id)
);


-- 11. ADMISSION

CREATE TABLE ADMISSION (
    admission_id INT PRIMARY KEY,
    patient_id INT,
    attending_doctor_id INT,
    appointment_id INT,
    room_id INT,
    admit_date DATE,
    discharge_date DATE,
    type VARCHAR(50),
    status VARCHAR(20),
    FOREIGN KEY (patient_id) REFERENCES PATIENT(patient_id),
    FOREIGN KEY (attending_doctor_id) REFERENCES DOCTOR(doctor_id),
    FOREIGN KEY (appointment_id) REFERENCES APPOINTMENT(appointment_id),
    FOREIGN KEY (room_id) REFERENCES ROOM(room_id)
);


-- 12. BILL

CREATE TABLE BILL (
    bill_id INT PRIMARY KEY,
    admission_id INT,
    bill_date DATE,
    total_amount DECIMAL(10,2),
    status VARCHAR(20),
    FOREIGN KEY (admission_id) REFERENCES ADMISSION(admission_id)
);


-- 13. PAYMENT

CREATE TABLE PAYMENT (
    payment_id INT PRIMARY KEY,
    bill_id INT,
    payment_date DATE,
    method VARCHAR(50),
    amount DECIMAL(10,2),
    FOREIGN KEY (bill_id) REFERENCES BILL(bill_id)
);