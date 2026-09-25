-- ============================================
-- HOSPITAL MANAGEMENT SYSTEM
-- SAMPLE DATA
-- ============================================


-- ============================================
-- 1. HOSPITAL BRANCHES
-- ============================================

INSERT INTO HOSPITAL_BRANCH
(branch_id, branch_name, address, city, state, contact_no)
VALUES
(1, 'CityCare Hospital - Surat Branch',
 'Adajan Road, Near LP Savani Circle', 'Surat', 'Gujarat', '02614002001'),

(2, 'CityCare Hospital - Valsad Branch',
 'Tithal Road, Near Dharampur Junction', 'Valsad', 'Gujarat', '02632200002');


-- ============================================
-- 2. DEPARTMENTS
-- ============================================

INSERT INTO DEPARTMENT
(dept_id, dept_name, location, description)
VALUES
(1, 'Cardiology', 'Ground Floor - Block A',
 'Diagnosis and treatment of heart-related conditions'),

(2, 'Neurology', 'First Floor - Block A',
 'Diagnosis and treatment of neurological disorders'),

(3, 'Orthopedics', 'First Floor - Block B',
 'Treatment of bones, joints and musculoskeletal conditions'),

(4, 'General Medicine', 'Ground Floor - Block B',
 'General medical consultation and primary care'),

(5, 'Pediatrics', 'Second Floor - Block A',
 'Medical care for infants, children and adolescents'),

(6, 'Emergency Medicine', 'Ground Floor - Emergency Wing',
 'Emergency and critical medical care');


-- ============================================
-- 3. PERSON
-- ============================================

INSERT INTO PERSON
(person_id, first_name, last_name, date_of_birth, gender, phone, email, address)
VALUES
(1, 'Riya', 'Patel', '1998-04-12', 'Female', '9876501001',
 'riya.patel@gmail.com', 'Adajan, Surat'),

(2, 'Kunal', 'Shah', '1995-08-23', 'Male', '9876501002',
 'kunal.shah@gmail.com', 'Vesu, Surat'),

(3, 'Meera', 'Desai', '2001-01-17', 'Female', '9876501003',
 'meera.desai@gmail.com', 'Katargam, Surat'),

(4, 'Rahul', 'Mehta', '1989-11-05', 'Male', '9876501004',
 'rahul.mehta@gmail.com', 'Athwa, Surat'),

(5, 'Anjali', 'Joshi', '1997-06-29', 'Female', '9876501005',
 'anjali.joshi@gmail.com', 'Varachha, Surat'),

(6, 'Harsh', 'Trivedi', '2000-09-14', 'Male', '9876501006',
 'harsh.trivedi@gmail.com', 'Piplod, Surat'),

(7, 'Neha', 'Bhatt', '1993-03-21', 'Female', '9876501007',
 'neha.bhatt@gmail.com', 'Pal, Surat'),

(8, 'Amit', 'Rana', '1987-12-10', 'Male', '9876501008',
 'amit.rana@gmail.com', 'Udhna, Surat'),

(9, 'Pooja', 'Thakkar', '1999-07-18', 'Female', '9876501009',
 'pooja.thakkar@gmail.com', 'Adajan, Surat'),

(10, 'Dhruv', 'Patel', '1996-02-27', 'Male', '9876501010',
 'dhruv.patel@gmail.com', 'Tithal Road, Valsad'),

(11, 'Sneha', 'Shah', '1992-10-09', 'Female', '9876501011',
 'sneha.shah@gmail.com', 'Abrama, Valsad'),

(12, 'Yash', 'Desai', '1985-05-16', 'Male', '9876501012',
 'yash.desai@gmail.com', 'Valsad City'),

(13, 'Isha', 'Mehta', '2002-08-31', 'Female', '9876501013',
 'isha.mehta@gmail.com', 'Tithal, Valsad'),

(14, 'Manav', 'Joshi', '1990-01-25', 'Male', '9876501014',
 'manav.joshi@gmail.com', 'Dharampur Road, Valsad'),

(15, 'Kavya', 'Patel', '1998-11-12', 'Female', '9876501015',
 'kavya.patel@gmail.com', 'Vapi Road, Valsad'),


-- Doctors

(16, 'Dr. Arjun', 'Shah', '1978-03-14', 'Male', '9876501016',
 'arjun.shah@citycare.com', 'Vesu, Surat'),

(17, 'Dr. Priya', 'Mehta', '1982-07-22', 'Female', '9876501017',
 'priya.mehta@citycare.com', 'Adajan, Surat'),

(18, 'Dr. Raj', 'Patel', '1980-11-03', 'Male', '9876501018',
 'raj.patel@citycare.com', 'Athwa, Surat'),

(19, 'Dr. Nisha', 'Desai', '1985-02-19', 'Female', '9876501019',
 'nisha.desai@citycare.com', 'Pal, Surat'),

(20, 'Dr. Vivek', 'Trivedi', '1975-09-27', 'Male', '9876501020',
 'vivek.trivedi@citycare.com', 'Piplod, Surat'),

(21, 'Dr. Rohan', 'Bhatt', '1983-06-11', 'Male', '9876501021',
 'rohan.bhatt@citycare.com', 'Katargam, Surat'),

(22, 'Dr. Aarti', 'Joshi', '1988-12-06', 'Female', '9876501022',
 'aarti.joshi@citycare.com', 'Tithal, Valsad'),

(23, 'Dr. Sameer', 'Rana', '1979-04-30', 'Male', '9876501023',
 'sameer.rana@citycare.com', 'Valsad City'),

(24, 'Dr. Neelam', 'Thakkar', '1986-10-15', 'Female', '9876501024',
 'neelam.thakkar@citycare.com', 'Abrama, Valsad'),

(25, 'Dr. Karan', 'Desai', '1981-01-08', 'Male', '9876501025',
 'karan.desai@citycare.com', 'Dharampur Road, Valsad'),


-- Staff

(26, 'Mitali', 'Patel', '1994-05-18', 'Female', '9876501026',
 'mitali.patel@citycare.com', 'Adajan, Surat'),

(27, 'Jay', 'Shah', '1991-08-07', 'Male', '9876501027',
 'jay.shah@citycare.com', 'Vesu, Surat'),

(28, 'Radhika', 'Mehta', '1996-03-26', 'Female', '9876501028',
 'radhika.mehta@citycare.com', 'Athwa, Surat'),

(29, 'Nirav', 'Patel', '1988-12-21', 'Male', '9876501029',
 'nirav.patel@citycare.com', 'Udhna, Surat'),

(30, 'Komal', 'Desai', '1993-09-13', 'Female', '9876501030',
 'komal.desai@citycare.com', 'Tithal, Valsad'),

(31, 'Parth', 'Joshi', '1990-06-04', 'Male', '9876501031',
 'parth.joshi@citycare.com', 'Valsad City'),

(32, 'Hetal', 'Shah', '1995-01-29', 'Female', '9876501032',
 'hetal.shah@citycare.com', 'Tithal, Valsad'),

(33, 'Sagar', 'Trivedi', '1987-11-17', 'Male', '9876501033',
 'sagar.trivedi@citycare.com', 'Dharampur Road, Valsad');


-- ============================================
-- 4. PATIENTS
-- ============================================

INSERT INTO PATIENT
(patient_id, blood_group, allergies, insurance_no, dept_id, person_id)
VALUES
(1, 'B+', 'Penicillin', 'INS-SUR-1001', 4, 1),
(2, 'O+', 'None', 'INS-SUR-1002', 1, 2),
(3, 'A+', 'Dust', 'INS-SUR-1003', 5, 3),
(4, 'AB+', 'None', 'INS-SUR-1004', 2, 4),
(5, 'B-', 'Sulfa drugs', 'INS-SUR-1005', 3, 5),
(6, 'O-', 'Peanuts', 'INS-SUR-1006', 4, 6),
(7, 'A-', 'None', 'INS-SUR-1007', 1, 7),
(8, 'B+', 'Latex', 'INS-SUR-1008', 6, 8),
(9, 'O+', 'None', 'INS-SUR-1009', 5, 9),
(10, 'A+', 'Dust', 'INS-VAL-1010', 3, 10),
(11, 'B+', 'Penicillin', 'INS-VAL-1011', 4, 11),
(12, 'O+', 'None', 'INS-VAL-1012', 1, 12),
(13, 'AB-', 'Seafood', 'INS-VAL-1013', 5, 13),
(14, 'A+', 'None', 'INS-VAL-1014', 2, 14),
(15, 'B+', 'Pollen', 'INS-VAL-1015', 3, 15);


-- ============================================
-- 5. DOCTORS
-- ============================================

INSERT INTO DOCTOR
(doctor_id, specialization, qualification, experience_years,
 consultation_fee, dept_id, person_id)
VALUES
(1, 'Cardiologist', 'MD Cardiology', 12, 1200.00, 1, 16),
(2, 'Neurologist', 'DM Neurology', 10, 1500.00, 2, 17),
(3, 'Orthopedic Surgeon', 'MS Orthopedics', 14, 1300.00, 3, 18),
(4, 'General Physician', 'MD Medicine', 9, 800.00, 4, 19),
(5, 'Pediatrician', 'MD Pediatrics', 11, 900.00, 5, 20),
(6, 'Emergency Physician', 'MD Emergency Medicine', 8, 1000.00, 6, 21),
(7, 'Cardiologist', 'MD Cardiology', 7, 1100.00, 1, 22),
(8, 'Orthopedic Surgeon', 'MS Orthopedics', 13, 1250.00, 3, 23),
(9, 'Pediatrician', 'MD Pediatrics', 6, 850.00, 5, 24),
(10, 'General Physician', 'MD Medicine', 15, 950.00, 4, 25);


-- ============================================
-- 6. STAFF
-- ============================================

INSERT INTO STAFF
(staff_id, role, shift, office_no, phone, dept_id, person_id)
VALUES
(1, 'Receptionist', 'Morning', 'R101', '9876501026', 4, 26),
(2, 'Nurse', 'Morning', 'N201', '9876501027', 1, 27),
(3, 'Nurse', 'Evening', 'N202', '9876501028', 2, 28),
(4, 'Billing Executive', 'Morning', 'B101', '9876501029', 4, 29),
(5, 'Nurse', 'Night', 'N301', '9876501030', 3, 30),
(6, 'Pharmacy Assistant', 'Morning', 'P101', '9876501031', 5, 31),
(7, 'Receptionist', 'Evening', 'R201', '9876501032', 6, 32),
(8, 'Billing Executive', 'Morning', 'B201', '9876501033', 4, 33);


-- ============================================
-- 7. ROOMS
-- ============================================

INSERT INTO ROOM
(room_id, branch_id, room_type, floor_no, status)
VALUES
(101, 1, 'General Ward', 1, 'vacant'),
(102, 1, 'General Ward', 1, 'vacant'),
(103, 1, 'Semi Private', 2, 'vacant'),
(104, 1, 'Private', 2, 'occupied'),
(105, 1, 'ICU', 3, 'occupied'),
(106, 1, 'Emergency', 0, 'occupied'),

(201, 2, 'General Ward', 1, 'vacant'),
(202, 2, 'General Ward', 1, 'vacant'),
(203, 2, 'Semi Private', 2, 'vacant'),
(204, 2, 'Private', 2, 'occupied'),
(205, 2, 'ICU', 3, 'occupied'),
(206, 2, 'Emergency', 0, 'vacant');


-- ============================================
-- 8. APPOINTMENTS
-- ============================================

INSERT INTO APPOINTMENT
(appointment_id, patient_id, doctor_id, date, time,
 status, reason, appointment_type)
VALUES
(1,  1,  1, '2026-09-28', '09:00', 'Completed',
 'Routine cardiac checkup', 'Consultation'),

(2,  2,  1, '2026-09-28', '10:00', 'Completed',
 'Chest discomfort', 'Consultation'),

(3,  7,  7, '2026-09-28', '11:00', 'Scheduled',
 'Follow-up cardiac evaluation', 'Follow-up'),

(4,  4,  2, '2026-09-29', '09:30', 'Completed',
 'Frequent headaches', 'Consultation'),

(5,  6,  2, '2026-09-29', '11:00', 'Scheduled',
 'Migraine symptoms', 'Consultation'),

(6,  5,  3, '2026-09-29', '10:00', 'Completed',
 'Knee pain', 'Consultation'),

-- Corrected: Admission 7 is based on this appointment
(7, 10, 3, '2026-09-30', '11:30', 'Completed',
 'Back pain', 'Consultation'),

(8, 15, 8, '2026-09-30', '14:00', 'Scheduled',
 'Joint pain', 'Follow-up'),

(9,  1,  4, '2026-09-30', '09:00', 'Completed',
 'Fever and weakness', 'Consultation'),

(10, 3, 4, '2026-10-01', '10:30', 'Scheduled',
 'General health checkup', 'Consultation'),

(11, 11, 10, '2026-10-01', '12:00', 'Scheduled',
 'Persistent fever', 'Consultation'),

(12, 3, 5, '2026-10-01', '09:30', 'Completed',
 'Routine pediatric checkup', 'Consultation'),

(13, 9, 5, '2026-10-02', '10:00', 'Scheduled',
 'Seasonal allergy', 'Consultation'),

(14, 13, 9, '2026-10-02', '11:30', 'Scheduled',
 'Child health assessment', 'Follow-up'),

(15, 8, 6, '2026-10-02', '08:30', 'Completed',
 'Minor injury', 'Emergency'),

-- Corrected: Admission 8 is based on this appointment
(16, 14, 6, '2026-10-03', '09:00', 'Completed',
 'Acute symptoms', 'Emergency'),

(17, 2, 7, '2026-10-03', '15:00', 'Scheduled',
 'Blood pressure follow-up', 'Follow-up'),

(18, 5, 8, '2026-10-04', '10:00', 'Completed',
 'Shoulder pain', 'Consultation'),

(19, 12, 9, '2026-10-04', '11:00', 'Scheduled',
 'Routine child consultation', 'Consultation'),

(20, 6, 10, '2026-10-05', '16:00', 'Cancelled',
 'General consultation', 'Consultation');


-- ============================================
-- 9. PRESCRIPTIONS
-- ============================================

INSERT INTO PRESCRIPTION
(prescription_id, patient_id, doctor_id, appointment_id, date, notes)
VALUES
(1, 1, 1, 1, '2026-09-28',
 'Continue cardiac medication and monitor blood pressure.'),

(2, 2, 1, 2, '2026-09-28',
 'Advised ECG and regular blood pressure monitoring.'),

(3, 4, 2, 4, '2026-09-29',
 'Advised rest and medication for migraine symptoms.'),

(4, 5, 3, 6, '2026-09-29',
 'Knee pain management and physiotherapy advised.'),

(5, 1, 4, 9, '2026-09-30',
 'Prescribed medication for fever and advised hydration.'),

(6, 3, 5, 12, '2026-10-01',
 'Routine pediatric medication and follow-up advised.'),

(7, 8, 6, 15, '2026-10-02',
 'Minor injury treated; wound care advised.'),

(8, 5, 8, 18, '2026-10-04',
 'Shoulder pain management and physiotherapy advised.'),

(9, 7, 7, 3, '2026-09-28',
 'Continue cardiac follow-up and monitor symptoms.'),

(10, 3, 4, 10, '2026-10-01',
 'General health evaluation and preventive care advised.'),

(11, 9, 5, 13, '2026-10-02',
 'Seasonal allergy management advised.'),

(12, 12, 9, 19, '2026-10-04',
 'Routine pediatric assessment completed.');


-- ============================================
-- 10. MEDICATIONS
-- ============================================

INSERT INTO MEDICATION
(med_id, prescription_id, name, dosage, frequency, duration)
VALUES
(1, 1, 'Amlodipine', '5 mg', 'Once daily', '30 days'),
(2, 1, 'Atorvastatin', '10 mg', 'Once daily', '30 days'),

(3, 2, 'Aspirin', '75 mg', 'Once daily', '30 days'),
(4, 2, 'Metoprolol', '25 mg', 'Twice daily', '15 days'),

(5, 3, 'Sumatriptan', '50 mg', 'As needed', '10 days'),
(6, 3, 'Paracetamol', '500 mg', 'Twice daily', '5 days'),

(7, 4, 'Ibuprofen', '400 mg', 'Twice daily', '7 days'),
(8, 4, 'Calcium', '500 mg', 'Once daily', '30 days'),

(9, 5, 'Paracetamol', '500 mg', 'Three times daily', '5 days'),
(10, 5, 'ORS', '1 sachet', 'Twice daily', '3 days'),

(11, 6, 'Amoxicillin', '250 mg', 'Three times daily', '7 days'),
(12, 6, 'Paracetamol', '250 mg', 'As needed', '5 days'),

(13, 7, 'Cefixime', '200 mg', 'Twice daily', '5 days'),
(14, 7, 'Mupirocin', '2%', 'Twice daily', '7 days'),

(15, 8, 'Diclofenac', '50 mg', 'Twice daily', '7 days'),
(16, 8, 'Pantoprazole', '40 mg', 'Once daily', '7 days'),

(17, 9, 'Bisoprolol', '5 mg', 'Once daily', '30 days'),

(18, 10, 'Multivitamin', '1 tablet', 'Once daily', '30 days'),

(19, 11, 'Cetirizine', '10 mg', 'Once daily', '10 days'),

(20, 12, 'Calcium', '500 mg', 'Once daily', '30 days');


-- ============================================
-- 11. ADMISSIONS
-- ============================================

INSERT INTO ADMISSION
(admission_id, patient_id, attending_doctor_id, appointment_id,
 room_id, admit_date, discharge_date, type, status)
VALUES
(1, 1, 1, 1, 104,
 '2026-09-28', NULL, 'Medical', 'Admitted'),

(2, 2, 1, 2, 105,
 '2026-09-28', NULL, 'Medical', 'Admitted'),

(3, 5, 3, 6, 106,
 '2026-09-29', NULL, 'Emergency', 'Admitted'),

(4, 8, 6, 15, 204,
 '2026-10-02', NULL, 'Emergency', 'Admitted'),

(5, 3, 5, 12, 205,
 '2026-10-01', NULL, 'Medical', 'Admitted'),

(6, 4, 2, 4, 103,
 '2026-09-29', '2026-10-01', 'Medical', 'Discharged'),

(7, 10, 3, 7, 203,
 '2026-09-30', '2026-10-02', 'Medical', 'Discharged'),

(8, 14, 6, 16, 201,
 '2026-10-03', '2026-10-04', 'Emergency', 'Discharged');


-- ============================================
-- 12. BILLS
-- ============================================

INSERT INTO BILL
(bill_id, admission_id, bill_date, total_amount, status)
VALUES
(1, 1, '2026-09-28', 18500.00, 'Pending'),
(2, 2, '2026-09-28', 32000.00, 'Partially Paid'),
(3, 3, '2026-09-29', 14500.00, 'Paid'),
(4, 4, '2026-10-02', 12000.00, 'Paid'),
(5, 5, '2026-10-01', 27500.00, 'Partially Paid'),
(6, 6, '2026-10-01', 16800.00, 'Paid'),
(7, 7, '2026-10-02', 14200.00, 'Paid'),
(8, 8, '2026-10-04', 9800.00, 'Paid');


-- ============================================
-- 13. PAYMENTS
-- ============================================

INSERT INTO PAYMENT
(payment_id, bill_id, payment_date, method, amount)
VALUES
(1, 2, '2026-09-28', 'UPI', 20000.00),
(2, 2, '2026-09-30', 'Credit Card', 12000.00),

(3, 3, '2026-09-30', 'Debit Card', 14500.00),

(4, 4, '2026-10-03', 'UPI', 12000.00),

(5, 5, '2026-10-02', 'Cash', 15000.00),
(6, 5, '2026-10-04', 'UPI', 5000.00),

(7, 6, '2026-10-01', 'Credit Card', 16800.00),

(8, 7, '2026-10-03', 'UPI', 14200.00),

(9, 8, '2026-10-04', 'Cash', 9800.00);