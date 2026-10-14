-- =========================================================
-- FILE: 04_procedures.sql
-- HOSPITAL MANAGEMENT SYSTEM
-- PostgreSQL
--
-- IMPORTANT:
-- 1. BookAppointment retains six IN parameters to match server.js.
-- 2. This file defines procedures; it does not modify existing records.
-- 3. Review the script before running it against the live database.
-- =========================================================


-- =========================================================
-- 1. BOOK APPOINTMENT
-- Automatically allocates a suitable doctor and 30-minute slot.
-- =========================================================

DROP PROCEDURE IF EXISTS public.bookappointment(
    INTEGER, INTEGER, DATE, TIME WITHOUT TIME ZONE,
    CHARACTER VARYING, CHARACTER VARYING
);

CREATE PROCEDURE public.bookappointment(
    IN p_patient_id INTEGER,
    IN p_doctor_id INTEGER,
    IN p_date DATE,
    IN p_time TIME,
    IN p_reason VARCHAR(200),
    IN p_appointment_type VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_branch_id INTEGER;
    v_dept_id INTEGER;
    v_allocated_doctor_id INTEGER;
    v_previous_doctor_id INTEGER;
    v_slot TIME;
    v_slot_found BOOLEAN := FALSE;
    v_slot_index INTEGER;
    v_max_slot_index INTEGER;
BEGIN
    -- Validate required inputs.
    IF p_patient_id IS NULL OR p_patient_id <= 0 THEN
        RAISE EXCEPTION 'Invalid patient ID.';
    END IF;

    IF p_date IS NULL OR p_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Appointment date cannot be in the past.';
    END IF;

    IF p_reason IS NULL OR BTRIM(p_reason) = '' THEN
        RAISE EXCEPTION 'Appointment reason is required.';
    END IF;

    -- Get the patient's branch.
    SELECT p.branch_id
      INTO v_branch_id
      FROM public.patient AS p
     WHERE p.patient_id = p_patient_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Patient % does not exist.', p_patient_id;
    END IF;

    -- Map common reason keywords to the verified department IDs:
    -- 1 Cardiology, 2 Neurology, 3 Orthopedics,
    -- 4 General Medicine, 5 Pediatrics, 6 Emergency Medicine.
    v_dept_id :=
        CASE
            WHEN LOWER(p_reason) LIKE '%cardio%'
              OR LOWER(p_reason) LIKE '%heart%'
                THEN 1
            WHEN LOWER(p_reason) LIKE '%neuro%'
              OR LOWER(p_reason) LIKE '%headache%'
              OR LOWER(p_reason) LIKE '%headsache%'
              OR LOWER(p_reason) LIKE '%migraine%'
              OR LOWER(p_reason) LIKE '%dizz%'
                THEN 2
            WHEN LOWER(p_reason) LIKE '%ortho%'
              OR LOWER(p_reason) LIKE '%bone%'
              OR LOWER(p_reason) LIKE '%joint%'
              OR LOWER(p_reason) LIKE '%fracture%'
                THEN 3
            WHEN LOWER(p_reason) LIKE '%pediatric%'
              OR LOWER(p_reason) LIKE '%child%'
                THEN 5
            WHEN LOWER(p_reason) LIKE '%emergency%'
              OR LOWER(p_reason) LIKE '%accident%'
                THEN 6
            ELSE 4
        END;

    -- Serialize calls to this procedure so two bookings using
    -- MAX(appointment_id) + 1 cannot allocate the same ID.
    LOCK TABLE public.appointment IN SHARE ROW EXCLUSIVE MODE;

    -- If a preferred doctor was supplied, ensure that the doctor
    -- belongs to this branch and the mapped department.
    IF p_doctor_id IS NOT NULL THEN
        PERFORM 1
          FROM public.doctor AS d
         WHERE d.doctor_id = p_doctor_id
           AND d.branch_id = v_branch_id
           AND d.dept_id = v_dept_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'Preferred doctor must belong to the patient branch and matching department.';
        END IF;
    END IF;

    -- Find the patient's most recent non-cancelled doctor in the
    -- same branch and department, for follow-up preference.
    SELECT a.doctor_id
      INTO v_previous_doctor_id
      FROM public.appointment AS a
      JOIN public.doctor AS d ON d.doctor_id = a.doctor_id
     WHERE a.patient_id = p_patient_id
       AND a.branch_id = v_branch_id
       AND d.dept_id = v_dept_id
       AND LOWER(COALESCE(a.status, '')) <> 'cancelled'
     ORDER BY a.date DESC, a.time DESC, a.appointment_id DESC
     LIMIT 1;

    -- A supplied time is checked exactly. Otherwise search from
    -- 09:00 to 16:30 in 30-minute intervals.
    IF p_time IS NOT NULL THEN
        IF p_time < TIME '09:00'
           OR p_time > TIME '16:30'
           OR EXTRACT(MINUTE FROM p_time)::INTEGER % 30 <> 0
           OR EXTRACT(SECOND FROM p_time) <> 0 THEN
            RAISE EXCEPTION
                'Appointment time must be between 09:00 and 16:30 in 30-minute intervals.';
        END IF;

        v_max_slot_index := 0;
    ELSE
        v_max_slot_index := 15;
    END IF;

    FOR v_slot_index IN 0..v_max_slot_index LOOP
        IF p_time IS NULL THEN
            v_slot := TIME '09:00' + v_slot_index * INTERVAL '30 minutes';
        ELSE
            v_slot := p_time;
        END IF;

        -- Do not allocate a time that has already passed today.
        IF p_date = CURRENT_DATE AND v_slot <= LOCALTIME THEN
            CONTINUE;
        END IF;

        -- Order doctors by preference, but do NOT restrict the
        -- search to the preferred doctor. If that doctor is busy,
        -- another eligible doctor may be selected.
        FOR v_allocated_doctor_id IN
            SELECT d.doctor_id
              FROM public.doctor AS d
             WHERE d.branch_id = v_branch_id
               AND d.dept_id = v_dept_id
             ORDER BY
                 CASE
                     WHEN d.doctor_id = p_doctor_id THEN 0
                     WHEN d.doctor_id = v_previous_doctor_id THEN 1
                     ELSE 2
                 END,
                 d.doctor_id
        LOOP
            -- Reject any overlap with the doctor's other active
            -- 30-minute appointments. Cancelled appointments do
            -- not reserve a slot.
            IF EXISTS (
                SELECT 1
                  FROM public.appointment AS a
                 WHERE a.doctor_id = v_allocated_doctor_id
                   AND a.date = p_date
                   AND LOWER(COALESCE(a.status, '')) <> 'cancelled'
                   AND a.time < v_slot + INTERVAL '30 minutes'
                   AND a.time + INTERVAL '30 minutes' > v_slot
            ) THEN
                CONTINUE;
            END IF;

            -- A patient cannot have overlapping appointments.
            IF EXISTS (
                SELECT 1
                  FROM public.appointment AS a
                 WHERE a.patient_id = p_patient_id
                   AND a.date = p_date
                   AND LOWER(COALESCE(a.status, '')) <> 'cancelled'
                   AND a.time < v_slot + INTERVAL '30 minutes'
                   AND a.time + INTERVAL '30 minutes' > v_slot
            ) THEN
                CONTINUE;
            END IF;

            v_slot_found := TRUE;
            EXIT;
        END LOOP;

        IF v_slot_found THEN
            EXIT;
        END IF;
    END LOOP;

    IF NOT v_slot_found THEN
        RAISE EXCEPTION
            'No suitable doctor or appointment slot is available for this date and branch.';
    END IF;

    INSERT INTO public.appointment (
        appointment_id,
        patient_id,
        doctor_id,
        branch_id,
        date,
        time,
        status,
        reason,
        appointment_type
    )
    VALUES (
        (SELECT COALESCE(MAX(appointment_id), 0) + 1
           FROM public.appointment),
        p_patient_id,
        v_allocated_doctor_id,
        v_branch_id,
        p_date,
        v_slot,
        'Scheduled',
        BTRIM(p_reason),
        COALESCE(NULLIF(BTRIM(p_appointment_type), ''), 'Consultation')
    );

    RAISE NOTICE
        'Appointment booked. Doctor ID: %, Date: %, Time: %',
        v_allocated_doctor_id, p_date, v_slot;
END;
$$;


-- =========================================================
-- 2. ADMIT PATIENT
-- =========================================================

CREATE OR REPLACE PROCEDURE public.admitpatient(
    IN p_patient_id INTEGER,
    IN p_doctor_id INTEGER,
    IN p_appointment_id INTEGER,
    IN p_room_id INTEGER,
    IN p_admit_date DATE,
    IN p_type VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_branch_id INTEGER;
    v_room_branch_id INTEGER;
    v_room_status VARCHAR(50);
BEGIN
    IF p_patient_id IS NULL
       OR p_doctor_id IS NULL
       OR p_room_id IS NULL
       OR p_admit_date IS NULL
       OR p_type IS NULL
       OR BTRIM(p_type) = '' THEN
        RAISE EXCEPTION 'Required admission details are missing.';
    END IF;

    IF p_admit_date > CURRENT_DATE THEN
        RAISE EXCEPTION 'Admission date cannot be in the future.';
    END IF;

    SELECT p.branch_id
      INTO v_branch_id
      FROM public.patient AS p
     WHERE p.patient_id = p_patient_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Patient does not exist.';
    END IF;

    PERFORM 1
      FROM public.doctor AS d
     WHERE d.doctor_id = p_doctor_id
       AND d.branch_id = v_branch_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Doctor must belong to the patient branch.';
    END IF;

    IF p_appointment_id IS NOT NULL THEN
        PERFORM 1
          FROM public.appointment AS a
         WHERE a.appointment_id = p_appointment_id
           AND a.patient_id = p_patient_id
           AND a.doctor_id = p_doctor_id
           AND LOWER(COALESCE(a.status, '')) <> 'cancelled';

        IF NOT FOUND THEN
            RAISE EXCEPTION
                'Appointment does not match the patient and doctor, or is cancelled.';
        END IF;
    END IF;

    SELECT r.branch_id, r.status
      INTO v_room_branch_id, v_room_status
      FROM public.room AS r
     WHERE r.room_id = p_room_id
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Room does not exist.';
    END IF;

    IF v_room_branch_id <> v_branch_id THEN
        RAISE EXCEPTION 'Room must belong to the patient branch.';
    END IF;

    IF LOWER(COALESCE(v_room_status, '')) NOT IN ('available', 'vacant') THEN
        RAISE EXCEPTION 'Room is not available.';
    END IF;

    INSERT INTO public.admission (
        admission_id,
        patient_id,
        attending_doctor_id,
        appointment_id,
        room_id,
        admit_date,
        type,
        status
    )
    VALUES (
        (SELECT COALESCE(MAX(admission_id), 0) + 1
           FROM public.admission),
        p_patient_id,
        p_doctor_id,
        p_appointment_id,
        p_room_id,
        p_admit_date,
        BTRIM(p_type),
        'Admitted'
    );

    RAISE NOTICE 'Patient admitted successfully.';
END;
$$;


-- =========================================================
-- 3. DISCHARGE PATIENT
-- =========================================================

CREATE OR REPLACE PROCEDURE public.dischargepatient(
    IN p_admission_id INTEGER,
    IN p_discharge_date DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_admit_date DATE;
    v_status VARCHAR(50);
BEGIN
    SELECT a.admit_date, a.status
      INTO v_admit_date, v_status
      FROM public.admission AS a
     WHERE a.admission_id = p_admission_id
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Admission does not exist.';
    END IF;

    IF LOWER(COALESCE(v_status, '')) = 'discharged' THEN
        RAISE EXCEPTION 'Patient is already discharged.';
    END IF;

    IF p_discharge_date IS NULL
       OR p_discharge_date < v_admit_date
       OR p_discharge_date > CURRENT_DATE THEN
        RAISE EXCEPTION 'Invalid discharge date.';
    END IF;

    UPDATE public.admission
       SET discharge_date = p_discharge_date,
           status = 'Discharged'
     WHERE admission_id = p_admission_id;

    RAISE NOTICE 'Patient discharged successfully.';
END;
$$;


-- =========================================================
-- 4. MAKE PAYMENT
-- Prevents overpayment and serializes payment ID allocation.
-- =========================================================

CREATE OR REPLACE PROCEDURE public.makepayment(
    IN p_bill_id INTEGER,
    IN p_payment_date DATE,
    IN p_method VARCHAR(50),
    IN p_amount NUMERIC(10,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_amount NUMERIC(10,2);
    v_paid_amount NUMERIC(10,2);
    v_bill_date DATE;
BEGIN
    LOCK TABLE public.payment IN SHARE ROW EXCLUSIVE MODE;

    SELECT b.total_amount, b.bill_date
      INTO v_total_amount, v_bill_date
      FROM public.bill AS b
     WHERE b.bill_id = p_bill_id
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bill does not exist.';
    END IF;

    IF p_payment_date IS NULL
       OR p_payment_date < v_bill_date
       OR p_payment_date > CURRENT_DATE THEN
        RAISE EXCEPTION 'Invalid payment date.';
    END IF;

    IF p_method IS NULL OR BTRIM(p_method) = '' THEN
        RAISE EXCEPTION 'Payment method is required.';
    END IF;

    IF p_amount IS NULL OR p_amount <= 0 THEN
        RAISE EXCEPTION 'Payment amount must be greater than zero.';
    END IF;

    SELECT COALESCE(SUM(py.amount), 0)
      INTO v_paid_amount
      FROM public.payment AS py
     WHERE py.bill_id = p_bill_id;

    IF v_paid_amount + p_amount > v_total_amount THEN
        RAISE EXCEPTION 'Payment exceeds the outstanding bill amount.';
    END IF;

    INSERT INTO public.payment (
        payment_id,
        bill_id,
        payment_date,
        method,
        amount
    )
    VALUES (
        (SELECT COALESCE(MAX(payment_id), 0) + 1
           FROM public.payment),
        p_bill_id,
        p_payment_date,
        BTRIM(p_method),
        p_amount
    );

    RAISE NOTICE 'Payment recorded successfully.';
END;
$$;


-- =========================================================
-- 5. COMPLETE APPOINTMENT
-- Preserves the existing Doctor Dashboard workflow.
-- =========================================================

CREATE OR REPLACE PROCEDURE public.completeappointment(
    IN p_appointment_id INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_status VARCHAR(20);
BEGIN
    SELECT a.status
      INTO v_status
      FROM public.appointment AS a
     WHERE a.appointment_id = p_appointment_id
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Appointment does not exist.';
    END IF;

    IF LOWER(COALESCE(v_status, '')) = 'cancelled' THEN
        RAISE EXCEPTION 'Cancelled appointments cannot be completed.';
    END IF;

    UPDATE public.appointment
       SET status = 'Completed'
     WHERE appointment_id = p_appointment_id;

    RAISE NOTICE 'Appointment completed successfully.';
END;
$$;