-- ============================================
-- HOSPITAL MANAGEMENT SYSTEM
-- PL/pgSQL FUNCTIONS
-- ============================================


-- ============================================
-- FUNCTION 1: CalculateBill
-- Returns complete billing summary
-- ============================================

CREATE OR REPLACE FUNCTION CalculateBill(
    p_bill_id INT
)
RETURNS TABLE (
    bill_id INT,
    total_amount DECIMAL(10,2),
    amount_paid DECIMAL(10,2),
    amount_left DECIMAL(10,2),
    status VARCHAR(20)
)
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM BILL
        WHERE BILL.bill_id = p_bill_id
    ) THEN
        RAISE EXCEPTION 'Bill % does not exist.', p_bill_id;
    END IF;

    RETURN QUERY
    SELECT
        b.bill_id,
        b.total_amount,
        COALESCE(SUM(p.amount), 0)::DECIMAL(10,2),
        (b.total_amount - COALESCE(SUM(p.amount), 0))::DECIMAL(10,2),
        b.status
    FROM BILL b
    LEFT JOIN PAYMENT p
        ON b.bill_id = p.bill_id
    WHERE b.bill_id = p_bill_id
    GROUP BY b.bill_id, b.total_amount, b.status;
END;
$$;


-- ============================================
-- FUNCTION 2: GetPatientTotalBill
-- Returns total billed amount for a patient
-- ============================================

CREATE OR REPLACE FUNCTION GetPatientTotalBill(
    p_patient_id INT
)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
    total_bill DECIMAL(10,2);
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM PATIENT
        WHERE patient_id = p_patient_id
    ) THEN
        RAISE EXCEPTION 'Patient % does not exist.', p_patient_id;
    END IF;

    SELECT COALESCE(SUM(b.total_amount), 0)
    INTO total_bill
    FROM BILL b
    JOIN ADMISSION a
        ON b.admission_id = a.admission_id
    WHERE a.patient_id = p_patient_id;

    RETURN total_bill;
END;
$$;


-- ============================================
-- FUNCTION 3: GetDoctorAppointmentCount
-- Returns appointment count for a doctor
-- ============================================

CREATE OR REPLACE FUNCTION GetDoctorAppointmentCount(
    p_doctor_id INT
)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
    appointment_count INT;
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM DOCTOR
        WHERE doctor_id = p_doctor_id
    ) THEN
        RAISE EXCEPTION 'Doctor % does not exist.', p_doctor_id;
    END IF;

    SELECT COUNT(*)
    INTO appointment_count
    FROM APPOINTMENT
    WHERE doctor_id = p_doctor_id;

    RETURN appointment_count;
END;
$$;