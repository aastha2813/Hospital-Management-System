-- ============================================================
-- HOSPITAL MANAGEMENT SYSTEM
-- FILE: 06_cursors.sql
-- Cursor-based reports for PostgreSQL
-- ============================================================

-- Procedure 1: WeeklyDischargedPatients
-- Displays admissions discharged during the requested date range.

CREATE OR REPLACE PROCEDURE public.WeeklyDischargedPatients(
    IN p_start_date DATE,
    IN p_end_date DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_row RECORD;
    discharged_cursor CURSOR FOR
        SELECT
            a.admission_id,
            a.patient_id,
            TRIM(CONCAT_WS(' ', pp.first_name, pp.last_name)) AS patient_name,
            a.attending_doctor_id AS doctor_id,
            TRIM(CONCAT_WS(' ', dp.first_name, dp.last_name)) AS doctor_name,
            a.room_id,
            a.admit_date,
            a.discharge_date,
            a.type
        FROM public.admission AS a
        JOIN public.patient AS pt
          ON pt.patient_id = a.patient_id
        JOIN public.person AS pp
          ON pp.person_id = pt.person_id
        LEFT JOIN public.doctor AS d
          ON d.doctor_id = a.attending_doctor_id
        LEFT JOIN public.person AS dp
          ON dp.person_id = d.person_id
        WHERE a.status = 'Discharged'
          AND a.discharge_date BETWEEN p_start_date AND p_end_date
        ORDER BY a.discharge_date, a.admission_id;
BEGIN
    IF p_start_date IS NULL OR p_end_date IS NULL THEN
        RAISE EXCEPTION 'Start date and end date are required.';
    END IF;

    IF p_start_date > p_end_date THEN
        RAISE EXCEPTION 'Start date cannot be after end date.';
    END IF;

    RAISE NOTICE 'Discharged patients from % to %:', p_start_date, p_end_date;

    OPEN discharged_cursor;

    LOOP
        FETCH discharged_cursor INTO v_row;
        EXIT WHEN NOT FOUND;

        RAISE NOTICE
            'Admission: %, Patient: % (ID %), Doctor: % (ID %), Room: %, Admit date: %, Discharge date: %, Type: %',
            v_row.admission_id,
            v_row.patient_name,
            v_row.patient_id,
            COALESCE(v_row.doctor_name, 'Not assigned'),
            v_row.doctor_id,
            v_row.room_id,
            v_row.admit_date,
            v_row.discharge_date,
            v_row.type;
    END LOOP;

    CLOSE discharged_cursor;
END;
$$;


-- Procedure 2: DoctorAppointmentReport
-- Displays appointments for the specified doctor, ordered by date/time.

CREATE OR REPLACE PROCEDURE public.DoctorAppointmentReport(
    IN p_doctor_id INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_row RECORD;
    appointment_cursor CURSOR FOR
        SELECT
            a.appointment_id,
            a.patient_id,
            TRIM(CONCAT_WS(' ', pp.first_name, pp.last_name)) AS patient_name,
            a.date AS appointment_date,
            a."time" AS appointment_time,
            a.status,
            a.reason,
            a.appointment_type,
            a.branch_id
        FROM public.appointment AS a
        JOIN public.patient AS pt
          ON pt.patient_id = a.patient_id
        JOIN public.person AS pp
          ON pp.person_id = pt.person_id
        WHERE a.doctor_id = p_doctor_id
        ORDER BY a.date, a."time", a.appointment_id;
BEGIN
    IF p_doctor_id IS NULL THEN
        RAISE EXCEPTION 'Doctor ID is required.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.doctor AS d
        WHERE d.doctor_id = p_doctor_id
    ) THEN
        RAISE EXCEPTION 'Doctor % does not exist.', p_doctor_id;
    END IF;

    RAISE NOTICE 'Appointment report for Doctor ID %:', p_doctor_id;

    OPEN appointment_cursor;

    LOOP
        FETCH appointment_cursor INTO v_row;
        EXIT WHEN NOT FOUND;

        RAISE NOTICE
            'Appointment: %, Patient: % (ID %), Date: %, Time: %, Status: %, Reason: %, Type: %, Branch: %',
            v_row.appointment_id,
            v_row.patient_name,
            v_row.patient_id,
            v_row.appointment_date,
            v_row.appointment_time,
            v_row.status,
            v_row.reason,
            v_row.appointment_type,
            v_row.branch_id;
    END LOOP;

    CLOSE appointment_cursor;
END;
$$;


-- ============================================================
-- OPTIONAL TEST QUERIES
-- Run individually only after confirming the IDs/date range.
-- ============================================================
-- CALL public.DoctorAppointmentReport(1);
-- CALL public.WeeklyDischargedPatients(DATE '2026-10-01', DATE '2026-10-14');