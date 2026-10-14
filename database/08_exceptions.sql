-- ============================================================
-- HOSPITAL MANAGEMENT SYSTEM
-- FILE: 08_exceptions.sql
-- Purpose: Demonstrate explicit exception handling in PostgreSQL.
--
-- Compatible with the current hospital_management schema:
-- patient, doctor, appointment, room, admission, bill, payment.
--
-- IMPORTANT:
-- These are helper procedures for demonstrating exception handling.
-- They do not replace or modify BookAppointment, AdmitPatient,
-- DischargePatient, MakePayment, or CompleteAppointment.
-- ============================================================


-- ============================================================
-- PROCEDURE 1: SafeBookAppointment
-- Calls the existing BookAppointment procedure and handles errors.
--
-- BookAppointment has six IN parameters:
-- patient_id, doctor_id, date, time, reason, appointment_type.
-- Since doctor_id is IN (not INOUT), this helper cannot read back
-- the doctor allocated by BookAppointment. The backend can retrieve
-- the created appointment and assigned doctor from the database.
-- ============================================================

CREATE OR REPLACE PROCEDURE public.SafeBookAppointment(
    IN p_patient_id INTEGER,
    IN p_preferred_doctor_id INTEGER,
    IN p_date DATE,
    IN p_time TIME,
    IN p_reason VARCHAR(200),
    IN p_appointment_type VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    CALL public.BookAppointment(
        p_patient_id,
        p_preferred_doctor_id,
        p_date,
        p_time,
        p_reason,
        p_appointment_type
    );

    RAISE NOTICE 'Appointment booking procedure completed successfully.';

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Booking failed: a referenced patient, doctor, or branch does not exist.';
        RAISE;
    WHEN unique_violation THEN
        RAISE NOTICE 'Booking failed: a duplicate key was detected.';
        RAISE;
    WHEN check_violation THEN
        RAISE NOTICE 'Booking failed: a database constraint was violated.';
        RAISE;
    WHEN OTHERS THEN
        RAISE NOTICE 'Booking failed: %', SQLERRM;
        RAISE;
END;
$$;


-- ============================================================
-- PROCEDURE 2: SafeAdmitPatient
-- Demonstrates handling of missing records, occupied rooms,
-- and other admission errors. It calls the existing AdmitPatient.
-- ============================================================

CREATE OR REPLACE PROCEDURE public.SafeAdmitPatient(
    IN p_patient_id INTEGER,
    IN p_doctor_id INTEGER,
    IN p_appointment_id INTEGER,
    IN p_room_id INTEGER,
    IN p_admit_date DATE,
    IN p_type VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    CALL public.AdmitPatient(
        p_patient_id,
        p_doctor_id,
        p_appointment_id,
        p_room_id,
        p_admit_date,
        p_type
    );

    RAISE NOTICE 'Admission procedure completed successfully.';

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Admission failed: a referenced record does not exist.';
        RAISE;
    WHEN unique_violation THEN
        RAISE NOTICE 'Admission failed: a duplicate admission ID was detected.';
        RAISE;
    WHEN check_violation THEN
        RAISE NOTICE 'Admission failed: a database constraint was violated.';
        RAISE;
    WHEN OTHERS THEN
        RAISE NOTICE 'Admission failed: %', SQLERRM;
        RAISE;
END;
$$;


-- ============================================================
-- PROCEDURE 3: SafeMakePayment
-- Demonstrates exception handling for invalid payments and
-- overpayments by calling the existing MakePayment procedure.
-- ============================================================

CREATE OR REPLACE PROCEDURE public.SafeMakePayment(
    IN p_bill_id INTEGER,
    IN p_payment_date DATE,
    IN p_method VARCHAR(50),
    IN p_amount NUMERIC(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
    CALL public.MakePayment(
        p_bill_id,
        p_payment_date,
        p_method,
        p_amount
    );

    RAISE NOTICE 'Payment procedure completed successfully.';

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Payment failed: the referenced bill does not exist.';
        RAISE;
    WHEN unique_violation THEN
        RAISE NOTICE 'Payment failed: a duplicate payment ID was detected.';
        RAISE;
    WHEN check_violation THEN
        RAISE NOTICE 'Payment failed: a database constraint was violated.';
        RAISE;
    WHEN OTHERS THEN
        RAISE NOTICE 'Payment failed: %', SQLERRM;
        RAISE;
END;
$$;


-- ============================================================
-- PROCEDURE 4: ValidateAppointmentSlot
-- Checks whether a doctor or patient already has a non-cancelled
-- appointment overlapping the requested 30-minute slot.
--
-- This procedure only validates; it does not insert an appointment.
-- ============================================================

CREATE OR REPLACE PROCEDURE public.ValidateAppointmentSlot(
    IN p_patient_id INTEGER,
    IN p_doctor_id INTEGER,
    IN p_date DATE,
    IN p_time TIME
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_patient_id IS NULL OR p_doctor_id IS NULL
       OR p_date IS NULL OR p_time IS NULL THEN
        RAISE EXCEPTION
            'Patient, doctor, appointment date, and time are required.';
    END IF;

    IF p_time < TIME '09:00'
       OR p_time >= TIME '17:00'
       OR EXTRACT(MINUTE FROM p_time)::INTEGER NOT IN (0, 30)
       OR EXTRACT(SECOND FROM p_time) <> 0 THEN
        RAISE EXCEPTION
            'Appointment time must be a 30-minute slot between 09:00 and 16:30.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.patient
        WHERE patient_id = p_patient_id
    ) THEN
        RAISE EXCEPTION 'Patient % does not exist.', p_patient_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.doctor
        WHERE doctor_id = p_doctor_id
    ) THEN
        RAISE EXCEPTION 'Doctor % does not exist.', p_doctor_id;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.appointment AS a
        WHERE a.doctor_id = p_doctor_id
          AND a.date = p_date
          AND a.status IS DISTINCT FROM 'Cancelled'
          AND a."time" < p_time + INTERVAL '30 minutes'
          AND a."time" + INTERVAL '30 minutes' > p_time
    ) THEN
        RAISE EXCEPTION
            'Doctor % already has an appointment overlapping % on %.',
            p_doctor_id, p_time, p_date;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.appointment AS a
        WHERE a.patient_id = p_patient_id
          AND a.date = p_date
          AND a.status IS DISTINCT FROM 'Cancelled'
          AND a."time" < p_time + INTERVAL '30 minutes'
          AND a."time" + INTERVAL '30 minutes' > p_time
    ) THEN
        RAISE EXCEPTION
            'Patient % already has an appointment overlapping % on %.',
            p_patient_id, p_time, p_date;
    END IF;

    RAISE NOTICE 'The requested 30-minute appointment slot is available.';
END;
$$;


-- ============================================================
-- OPTIONAL TESTS
-- Uncomment and run one at a time after confirming IDs and dates.
-- These procedures re-raise failures, so invalid test inputs will
-- still appear as errors and will not be silently swallowed.
-- ============================================================

-- CALL public.SafeBookAppointment(1, NULL, CURRENT_DATE + 1, NULL,
--     'general checkup', 'Consultation');

-- CALL public.SafeAdmitPatient(1, 1, 1, 101, CURRENT_DATE, 'Inpatient');

-- CALL public.SafeMakePayment(1, CURRENT_DATE, 'Cash', 100.00);

-- CALL public.ValidateAppointmentSlot(1, 1, CURRENT_DATE + 1, TIME '09:00');


-- ============================================================
-- Verify that the helper procedures were created:
-- ============================================================
-- SELECT routine_name, routine_type
-- FROM information_schema.routines
-- WHERE routine_schema = 'public'
--   AND routine_name IN (
--       'safebookappointment',
--       'safeadmitpatient',
--       'safemakepayment',
--       'validateappointmentslot'
--   )
-- ORDER BY routine_name;