-- ============================================
-- HOSPITAL MANAGEMENT SYSTEM
-- PL/pgSQL CURSORS
-- ============================================


-- ============================================
-- CURSOR 1: Weekly Discharged Patients Report
-- ============================================

CREATE OR REPLACE PROCEDURE WeeklyDischargedPatients(
    p_start_date DATE,
    p_end_date DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
    patient_record RECORD;

    discharged_cursor CURSOR FOR
        SELECT
            p.patient_id,
            per.first_name || ' ' || COALESCE(per.last_name, '') AS patient_name,
            d.doctor_id,
            per_doc.first_name || ' ' || COALESCE(per_doc.last_name, '') AS doctor_name,
            a.room_id,
            a.discharge_date
        FROM ADMISSION a
        JOIN PATIENT p
            ON a.patient_id = p.patient_id
        JOIN PERSON per
            ON p.person_id = per.person_id
        JOIN DOCTOR d
            ON a.attending_doctor_id = d.doctor_id
        JOIN PERSON per_doc
            ON d.person_id = per_doc.person_id
        WHERE a.status = 'Discharged'
          AND a.discharge_date BETWEEN p_start_date AND p_end_date
        ORDER BY a.discharge_date;

BEGIN
    OPEN discharged_cursor;

    LOOP
        FETCH discharged_cursor INTO patient_record;

        EXIT WHEN NOT FOUND;

        RAISE NOTICE
            'Patient ID: %, Patient: %, Doctor: %, Room: %, Discharge Date: %',
            patient_record.patient_id,
            patient_record.patient_name,
            patient_record.doctor_name,
            patient_record.room_id,
            patient_record.discharge_date;
    END LOOP;

    CLOSE discharged_cursor;
END;
$$;


-- ============================================
-- CURSOR 2: Doctor Appointment Report
-- ============================================

CREATE OR REPLACE PROCEDURE DoctorAppointmentReport(
    p_doctor_id INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    appointment_record RECORD;

    appointment_cursor CURSOR FOR
        SELECT
            a.appointment_id,
            per.first_name || ' ' || COALESCE(per.last_name, '') AS patient_name,
            a.date,
            a.time,
            a.status
        FROM APPOINTMENT a
        JOIN PATIENT p
            ON a.patient_id = p.patient_id
        JOIN PERSON per
            ON p.person_id = per.person_id
        WHERE a.doctor_id = p_doctor_id
        ORDER BY a.date, a.time;

BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM DOCTOR
        WHERE doctor_id = p_doctor_id
    ) THEN
        RAISE EXCEPTION
            'Doctor % does not exist.',
            p_doctor_id;
    END IF;

    OPEN appointment_cursor;

    LOOP
        FETCH appointment_cursor INTO appointment_record;

        EXIT WHEN NOT FOUND;

        RAISE NOTICE
            'Appointment ID: %, Patient: %, Date: %, Time: %, Status: %',
            appointment_record.appointment_id,
            appointment_record.patient_name,
            appointment_record.date,
            appointment_record.time,
            appointment_record.status;
    END LOOP;

    CLOSE appointment_cursor;
END;
$$;