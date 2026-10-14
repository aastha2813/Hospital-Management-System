-- ============================================================
-- HOSPITAL MANAGEMENT SYSTEM
-- FILE: 05_functions.sql
-- PostgreSQL functions for billing and appointment reporting
-- ============================================================

-- Function 1: CalculateBill
-- Returns the bill total, amount paid, balance remaining, and
-- current payment status for one bill.

CREATE OR REPLACE FUNCTION public.CalculateBill(
    p_bill_id INTEGER
)
RETURNS TABLE (
    bill_id INTEGER,
    total_amount NUMERIC(10,2),
    amount_paid NUMERIC(10,2),
    amount_left NUMERIC(10,2),
    status VARCHAR
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_bill_total NUMERIC(10,2);
    v_bill_status VARCHAR(30);
    v_paid NUMERIC(10,2);
BEGIN
    IF p_bill_id IS NULL THEN
        RAISE EXCEPTION 'Bill ID is required.';
    END IF;

    SELECT b.total_amount, b.status
    INTO v_bill_total, v_bill_status
    FROM public.bill AS b
    WHERE b.bill_id = p_bill_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bill % does not exist.', p_bill_id;
    END IF;

    SELECT COALESCE(SUM(p.amount), 0)::NUMERIC(10,2)
    INTO v_paid
    FROM public.payment AS p
    WHERE p.bill_id = p_bill_id;

    RETURN QUERY
    SELECT
        p_bill_id,
        v_bill_total,
        v_paid,
        GREATEST(v_bill_total - v_paid, 0)::NUMERIC(10,2),
        CASE
            WHEN v_paid >= v_bill_total THEN 'Paid'
            WHEN v_paid > 0 THEN 'Partially Paid'
            ELSE COALESCE(v_bill_status, 'Pending')
        END::VARCHAR;
END;
$$;


-- Function 2: GetPatientTotalBill
-- Returns the sum of bills connected to a patient's admissions.
-- A patient with no bills receives 0.

CREATE OR REPLACE FUNCTION public.GetPatientTotalBill(
    p_patient_id INTEGER
)
RETURNS NUMERIC(12,2)
LANGUAGE plpgsql
AS $$
DECLARE
    v_total NUMERIC(12,2);
BEGIN
    IF p_patient_id IS NULL THEN
        RAISE EXCEPTION 'Patient ID is required.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.patient AS p
        WHERE p.patient_id = p_patient_id
    ) THEN
        RAISE EXCEPTION 'Patient % does not exist.', p_patient_id;
    END IF;

    SELECT COALESCE(SUM(b.total_amount), 0)::NUMERIC(12,2)
    INTO v_total
    FROM public.admission AS a
    JOIN public.bill AS b
      ON b.admission_id = a.admission_id
    WHERE a.patient_id = p_patient_id;

    RETURN v_total;
END;
$$;


-- Function 3: GetDoctorAppointmentCount
-- Counts all appointments assigned to a doctor, including cancelled
-- appointments, so it reports the full appointment record count.

CREATE OR REPLACE FUNCTION public.GetDoctorAppointmentCount(
    p_doctor_id INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_count INTEGER;
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

    SELECT COUNT(*)::INTEGER
    INTO v_count
    FROM public.appointment AS a
    WHERE a.doctor_id = p_doctor_id;

    RETURN v_count;
END;
$$;


-- ============================================================
-- OPTIONAL TEST QUERIES
-- Run these individually only after confirming the IDs exist.
-- ============================================================
-- SELECT * FROM public.CalculateBill(1);
-- SELECT public.GetPatientTotalBill(1);
-- SELECT public.GetDoctorAppointmentCount(1);