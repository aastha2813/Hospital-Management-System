-- ============================================
-- HOSPITAL MANAGEMENT SYSTEM
-- TRIGGERS
-- PostgreSQL / PLpgSQL
-- ============================================

-- ============================================
-- TRIGGER 1: Admission -> Room Occupied
-- ============================================

CREATE OR REPLACE FUNCTION occupy_room_on_admission()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.room_id IS NOT NULL THEN
        UPDATE ROOM
        SET status = 'occupied'
        WHERE room_id = NEW.room_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_occupy_room_on_admission
ON ADMISSION;

CREATE TRIGGER trg_occupy_room_on_admission
AFTER INSERT ON ADMISSION
FOR EACH ROW
EXECUTE FUNCTION occupy_room_on_admission();


-- ============================================
-- TRIGGER 2: Discharge -> Room Vacant
-- ============================================

CREATE OR REPLACE FUNCTION release_room_on_discharge()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'Discharged'
       AND OLD.status IS DISTINCT FROM 'Discharged'
       AND NEW.room_id IS NOT NULL THEN

        UPDATE ROOM
        SET status = 'vacant'
        WHERE room_id = NEW.room_id
          AND NOT EXISTS (
              SELECT 1
              FROM ADMISSION a
              WHERE a.room_id = NEW.room_id
                AND a.admission_id <> NEW.admission_id
                AND a.status = 'Admitted'
          );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_release_room_on_discharge
ON ADMISSION;

CREATE TRIGGER trg_release_room_on_discharge
AFTER UPDATE OF status ON ADMISSION
FOR EACH ROW
EXECUTE FUNCTION release_room_on_discharge();


-- ============================================
-- TRIGGER 3: Payment -> Bill Status
-- Handles INSERT, UPDATE and DELETE
-- ============================================

CREATE OR REPLACE FUNCTION update_bill_status_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_bill_id INT;
    v_total_paid DECIMAL(10,2);
    v_bill_total DECIMAL(10,2);
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_bill_id := OLD.bill_id;
    ELSE
        v_bill_id := NEW.bill_id;
    END IF;

    SELECT total_amount
    INTO v_bill_total
    FROM BILL
    WHERE bill_id = v_bill_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bill % does not exist.', v_bill_id;
    END IF;

    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_paid
    FROM PAYMENT
    WHERE bill_id = v_bill_id;

    IF v_total_paid = 0 THEN
        UPDATE BILL
        SET status = 'Pending'
        WHERE bill_id = v_bill_id;

    ELSIF v_total_paid < v_bill_total THEN
        UPDATE BILL
        SET status = 'Partially Paid'
        WHERE bill_id = v_bill_id;

    ELSE
        UPDATE BILL
        SET status = 'Paid'
        WHERE bill_id = v_bill_id;
    END IF;

    -- If an existing payment is moved to another bill,
    -- recalculate the old bill too.
    IF TG_OP = 'UPDATE'
       AND OLD.bill_id IS DISTINCT FROM NEW.bill_id THEN

        SELECT total_amount
        INTO v_bill_total
        FROM BILL
        WHERE bill_id = OLD.bill_id
        FOR UPDATE;

        SELECT COALESCE(SUM(amount), 0)
        INTO v_total_paid
        FROM PAYMENT
        WHERE bill_id = OLD.bill_id;

        UPDATE BILL
        SET status = CASE
            WHEN v_total_paid = 0 THEN 'Pending'
            WHEN v_total_paid < v_bill_total THEN 'Partially Paid'
            ELSE 'Paid'
        END
        WHERE bill_id = OLD.bill_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_bill_status_on_payment
ON PAYMENT;

CREATE TRIGGER trg_update_bill_status_on_payment
AFTER INSERT OR UPDATE OR DELETE ON PAYMENT
FOR EACH ROW
EXECUTE FUNCTION update_bill_status_on_payment();


-- ============================================
-- TRIGGER 4: Prescription -> Appointment Validation
-- ============================================

CREATE OR REPLACE FUNCTION validate_prescription_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_appointment_status VARCHAR(20);
    v_patient_id INT;
    v_doctor_id INT;
BEGIN
    SELECT status, patient_id, doctor_id
    INTO v_appointment_status, v_patient_id, v_doctor_id
    FROM APPOINTMENT
    WHERE appointment_id = NEW.appointment_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Appointment % does not exist.',
            NEW.appointment_id;
    END IF;

    IF v_appointment_status <> 'Completed' THEN
        RAISE EXCEPTION
            'Prescription cannot be created because appointment % is not Completed.',
            NEW.appointment_id;
    END IF;

    IF NEW.patient_id IS DISTINCT FROM v_patient_id THEN
        RAISE EXCEPTION
            'Prescription patient does not match appointment %.',
            NEW.appointment_id;
    END IF;

    IF NEW.doctor_id IS DISTINCT FROM v_doctor_id THEN
        RAISE EXCEPTION
            'Prescription doctor does not match appointment %.',
            NEW.appointment_id;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_prescription_appointment
ON PRESCRIPTION;

CREATE TRIGGER trg_validate_prescription_appointment
BEFORE INSERT OR UPDATE ON PRESCRIPTION
FOR EACH ROW
EXECUTE FUNCTION validate_prescription_appointment();


-- ============================================
-- END OF TRIGGERS
-- ============================================
