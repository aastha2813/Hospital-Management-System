-- ============================================
-- HOSPITAL MANAGEMENT SYSTEM
-- PL/SQL PROCEDURES
-- ============================================

-- ============================================
-- PROCEDURE 1: BookAppointment
-- ============================================

CREATE OR REPLACE PROCEDURE BookAppointment(
    p_patient_id INT,
    p_doctor_id INT,
    p_date DATE,
    p_time TIME,
    p_reason VARCHAR(200),
    p_appointment_type VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM PATIENT
        WHERE patient_id = p_patient_id
    ) THEN
        RAISE EXCEPTION 'Patient % does not exist.', p_patient_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM DOCTOR
        WHERE doctor_id = p_doctor_id
    ) THEN
        RAISE EXCEPTION 'Doctor % does not exist.', p_doctor_id;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM APPOINTMENT
        WHERE doctor_id = p_doctor_id
          AND date = p_date
          AND time = p_time
          AND status <> 'Cancelled'
    ) THEN
        RAISE EXCEPTION
            'Doctor % is already booked on % at %.',
            p_doctor_id, p_date, p_time;
    END IF;

    INSERT INTO APPOINTMENT(
        appointment_id,
        patient_id,
        doctor_id,
        date,
        time,
        status,
        reason,
        appointment_type
    )
    VALUES(
        COALESCE((SELECT MAX(appointment_id)
                  FROM APPOINTMENT), 0) + 1,
        p_patient_id,
        p_doctor_id,
        p_date,
        p_time,
        'Scheduled',
        p_reason,
        p_appointment_type
    );

    RAISE NOTICE
        'Appointment booked successfully for Patient % with Doctor % on % at %.',
        p_patient_id, p_doctor_id, p_date, p_time;
END;
$$;


-- ============================================
-- PROCEDURE 2: AdmitPatient
-- ============================================

CREATE OR REPLACE PROCEDURE AdmitPatient(
    p_patient_id INT,
    p_doctor_id INT,
    p_appointment_id INT,
    p_room_id INT,
    p_admit_date DATE,
    p_type VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
DECLARE
    new_admission_id INT;
    room_status VARCHAR(20);
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM PATIENT
        WHERE patient_id = p_patient_id
    ) THEN
        RAISE EXCEPTION 'Patient % does not exist.', p_patient_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM DOCTOR
        WHERE doctor_id = p_doctor_id
    ) THEN
        RAISE EXCEPTION 'Doctor % does not exist.', p_doctor_id;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM APPOINTMENT
        WHERE appointment_id = p_appointment_id
    ) THEN
        RAISE EXCEPTION 'Appointment % does not exist.', p_appointment_id;
    END IF;

    SELECT status
    INTO room_status
    FROM ROOM
    WHERE room_id = p_room_id;

    IF room_status IS NULL THEN
        RAISE EXCEPTION 'Room % does not exist.', p_room_id;
    END IF;

    IF LOWER(room_status) <> 'vacant' THEN
        RAISE EXCEPTION 'Room % is currently occupied.', p_room_id;
    END IF;

    SELECT COALESCE(MAX(admission_id), 0) + 1
    INTO new_admission_id
    FROM ADMISSION;

    INSERT INTO ADMISSION(
        admission_id,
        patient_id,
        attending_doctor_id,
        appointment_id,
        room_id,
        admit_date,
        discharge_date,
        type,
        status
    )
    VALUES(
        new_admission_id,
        p_patient_id,
        p_doctor_id,
        p_appointment_id,
        p_room_id,
        p_admit_date,
        NULL,
        p_type,
        'Admitted'
    );

    RAISE NOTICE
        'Patient % admitted successfully in Room %.',
        p_patient_id, p_room_id;
END;
$$;


-- ============================================
-- PROCEDURE 3: DischargePatient
-- ============================================

CREATE OR REPLACE PROCEDURE DischargePatient(
    p_admission_id INT,
    p_discharge_date DATE
)
LANGUAGE plpgsql
AS $$
DECLARE
    current_status VARCHAR(20);
BEGIN
    SELECT status
    INTO current_status
    FROM ADMISSION
    WHERE admission_id = p_admission_id;

    IF current_status IS NULL THEN
        RAISE EXCEPTION
            'Admission % does not exist.',
            p_admission_id;
    END IF;

    IF current_status = 'Discharged' THEN
        RAISE EXCEPTION
            'Admission % is already discharged.',
            p_admission_id;
    END IF;

    UPDATE ADMISSION
    SET discharge_date = p_discharge_date,
        status = 'Discharged'
    WHERE admission_id = p_admission_id;

    RAISE NOTICE
        'Admission % discharged successfully on %.',
        p_admission_id, p_discharge_date;
END;
$$;


-- ============================================
-- PROCEDURE 4: MakePayment
-- ============================================

CREATE OR REPLACE PROCEDURE MakePayment(
    p_bill_id INT,
    p_payment_date DATE,
    p_method VARCHAR(50),
    p_amount DECIMAL(10,2)
)
LANGUAGE plpgsql
AS $$
DECLARE
    new_payment_id INT;
    bill_total DECIMAL(10,2);
    total_paid DECIMAL(10,2);
BEGIN
    SELECT total_amount
    INTO bill_total
    FROM BILL
    WHERE bill_id = p_bill_id;

    IF bill_total IS NULL THEN
        RAISE EXCEPTION
            'Bill % does not exist.',
            p_bill_id;
    END IF;

    IF p_amount <= 0 THEN
        RAISE EXCEPTION
            'Payment amount must be greater than zero.';
    END IF;

    SELECT COALESCE(SUM(amount), 0)
    INTO total_paid
    FROM PAYMENT
    WHERE bill_id = p_bill_id;

    IF total_paid + p_amount > bill_total THEN
        RAISE EXCEPTION
            'Payment exceeds bill amount. Bill total: %, Already paid: %, Attempted payment: %.',
            bill_total, total_paid, p_amount;
    END IF;

    SELECT COALESCE(MAX(payment_id), 0) + 1
    INTO new_payment_id
    FROM PAYMENT;

    INSERT INTO PAYMENT(
        payment_id,
        bill_id,
        payment_date,
        method,
        amount
    )
    VALUES(
        new_payment_id,
        p_bill_id,
        p_payment_date,
        p_method,
        p_amount
    );

    RAISE NOTICE
        'Payment of % recorded successfully for Bill %.',
        p_amount, p_bill_id;
END;
$$;