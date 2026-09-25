-- ============================================
-- HOSPITAL MANAGEMENT SYSTEM
-- TRIGGERS
-- PostgreSQL / PLpgSQL
-- ============================================


-- ============================================
-- TRIGGER 1
-- Admission -> Room Occupied
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


-- Remove existing trigger if it already exists
DROP TRIGGER IF EXISTS trg_occupy_room_on_admission
ON ADMISSION;


-- Create trigger
CREATE TRIGGER trg_occupy_room_on_admission
AFTER INSERT ON ADMISSION
FOR EACH ROW
EXECUTE FUNCTION occupy_room_on_admission();


-- ============================================
-- TRIGGER 2
-- Discharge -> Room Vacant
-- ============================================

CREATE OR REPLACE FUNCTION release_room_on_discharge()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.status = 'Discharged'
       AND OLD.status <> 'Discharged' THEN

        UPDATE ROOM
        SET status = 'vacant'
        WHERE room_id = NEW.room_id;

    END IF;

    RETURN NEW;
END;
$$;


-- Remove existing trigger if it already exists
DROP TRIGGER IF EXISTS trg_release_room_on_discharge
ON ADMISSION;


-- Create trigger
CREATE TRIGGER trg_release_room_on_discharge
AFTER UPDATE OF status ON ADMISSION
FOR EACH ROW
EXECUTE FUNCTION release_room_on_discharge();


-- ============================================
-- TRIGGER 3
-- Payment -> Bill Status
-- ============================================

CREATE OR REPLACE FUNCTION update_bill_status_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    total_paid DECIMAL(10,2);
    bill_total DECIMAL(10,2);
BEGIN

    -- Calculate total amount paid for the bill
    SELECT COALESCE(SUM(amount), 0)
    INTO total_paid
    FROM PAYMENT
    WHERE bill_id = NEW.bill_id;


    -- Get the original bill amount
    SELECT total_amount
    INTO bill_total
    FROM BILL
    WHERE bill_id = NEW.bill_id;


    -- Determine bill status
    IF total_paid = 0 THEN

        UPDATE BILL
        SET status = 'Pending'
        WHERE bill_id = NEW.bill_id;

    ELSIF total_paid < bill_total THEN

        UPDATE BILL
        SET status = 'Partially Paid'
        WHERE bill_id = NEW.bill_id;

    ELSE

        -- Includes fully paid and overpaid bills
        UPDATE BILL
        SET status = 'Paid'
        WHERE bill_id = NEW.bill_id;

    END IF;


    RETURN NEW;
END;
$$;


-- Remove existing trigger if it already exists
DROP TRIGGER IF EXISTS trg_update_bill_status_on_payment
ON PAYMENT;


-- Create trigger
CREATE TRIGGER trg_update_bill_status_on_payment
AFTER INSERT ON PAYMENT
FOR EACH ROW
EXECUTE FUNCTION update_bill_status_on_payment();


-- ============================================
-- TRIGGER 4
-- Prescription -> Appointment Validation
-- ============================================

CREATE OR REPLACE FUNCTION validate_prescription_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    appointment_status VARCHAR(20);
BEGIN

    -- Check appointment status
    SELECT status
    INTO appointment_status
    FROM APPOINTMENT
    WHERE appointment_id = NEW.appointment_id;


    -- Appointment does not exist
    IF appointment_status IS NULL THEN

        RAISE EXCEPTION
        'Appointment % does not exist.',
        NEW.appointment_id;

    END IF;


    -- Prescription allowed only for completed appointments
    IF appointment_status <> 'Completed' THEN

        RAISE EXCEPTION
        'Prescription cannot be created because appointment % is not Completed.',
        NEW.appointment_id;

    END IF;


    RETURN NEW;
END;
$$;


-- Remove existing trigger if it already exists
DROP TRIGGER IF EXISTS trg_validate_prescription_appointment
ON PRESCRIPTION;


-- Create trigger
CREATE TRIGGER trg_validate_prescription_appointment
BEFORE INSERT ON PRESCRIPTION
FOR EACH ROW
EXECUTE FUNCTION validate_prescription_appointment();


-- ============================================
-- END OF TRIGGERS
-- ============================================