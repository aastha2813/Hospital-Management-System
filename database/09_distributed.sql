-- ============================================================
-- HOSPITAL MANAGEMENT SYSTEM
-- FILE: 09_distributed.sql
-- Purpose: Demonstrate branch-based fragmentation and replication
-- for the Surat and Valsad hospital branches.
--
-- This file creates READ-ONLY views over existing base tables.
-- It does not copy data, move data, or change the live schema.
-- It assumes hospital_branch.branch_id values:
--   1 = Surat
--   2 = Valsad
--
-- Verify branch IDs before using these views:
-- SELECT branch_id, branch_name, city FROM public.hospital_branch;
-- ============================================================


-- ============================================================
-- SECTION 1: Branch-specific horizontal fragmentation views
-- ============================================================

CREATE OR REPLACE VIEW public.surat_patients AS
SELECT p.*
FROM public.patient AS p
WHERE p.branch_id = 1;

CREATE OR REPLACE VIEW public.valsad_patients AS
SELECT p.*
FROM public.patient AS p
WHERE p.branch_id = 2;


CREATE OR REPLACE VIEW public.surat_doctors AS
SELECT d.*
FROM public.doctor AS d
WHERE d.branch_id = 1;

CREATE OR REPLACE VIEW public.valsad_doctors AS
SELECT d.*
FROM public.doctor AS d
WHERE d.branch_id = 2;


CREATE OR REPLACE VIEW public.surat_appointments AS
SELECT a.*
FROM public.appointment AS a
WHERE a.branch_id = 1;

CREATE OR REPLACE VIEW public.valsad_appointments AS
SELECT a.*
FROM public.appointment AS a
WHERE a.branch_id = 2;


-- ============================================================
-- SECTION 2: Global views across both branches
-- These combine rows from both branch fragments.
-- ============================================================

CREATE OR REPLACE VIEW public.all_branch_patients AS
SELECT p.*, hb.branch_name, hb.city
FROM public.patient AS p
JOIN public.hospital_branch AS hb
  ON hb.branch_id = p.branch_id;

CREATE OR REPLACE VIEW public.all_branch_doctors AS
SELECT d.*, hb.branch_name, hb.city
FROM public.doctor AS d
JOIN public.hospital_branch AS hb
  ON hb.branch_id = d.branch_id;

CREATE OR REPLACE VIEW public.all_branch_appointments AS
SELECT a.*, hb.branch_name, hb.city
FROM public.appointment AS a
JOIN public.hospital_branch AS hb
  ON hb.branch_id = a.branch_id;


-- ============================================================
-- SECTION 3: Replication demonstration
--
-- HOSPITAL_BRANCH and DEPARTMENT are shared reference data.
-- These views expose the same shared rows to either branch.
-- This demonstrates a shared/global logical view, not physical
-- replication to a second PostgreSQL server.
-- ============================================================

CREATE OR REPLACE VIEW public.shared_branch_reference AS
SELECT branch_id, branch_name, address, city, state, contact_no
FROM public.hospital_branch;

CREATE OR REPLACE VIEW public.shared_department_reference AS
SELECT dept_id, dept_name, location, description
FROM public.department;


-- ============================================================
-- SECTION 4: Fragment validation
-- Run these SELECT statements to inspect the fragments.
-- They do not change any data.
-- ============================================================

-- Surat fragments:
-- SELECT * FROM public.surat_patients;
-- SELECT * FROM public.surat_doctors;
-- SELECT * FROM public.surat_appointments;

-- Valsad fragments:
-- SELECT * FROM public.valsad_patients;
-- SELECT * FROM public.valsad_doctors;
-- SELECT * FROM public.valsad_appointments;

-- Global views:
-- SELECT * FROM public.all_branch_patients;
-- SELECT * FROM public.all_branch_doctors;
-- SELECT * FROM public.all_branch_appointments;

-- Shared reference data:
-- SELECT * FROM public.shared_branch_reference;
-- SELECT * FROM public.shared_department_reference;


-- ============================================================
-- SECTION 5: Fragment completeness and disjointness checks
-- Counts should match the base-table totals when branch IDs 1 and 2
-- cover all rows. Rows with other/null branch IDs would not be in
-- either branch fragment, so check the counts before assuming this.
-- ============================================================

-- SELECT
--   (SELECT COUNT(*) FROM public.patient) AS base_patient_count,
--   (SELECT COUNT(*) FROM public.surat_patients)
--     + (SELECT COUNT(*) FROM public.valsad_patients) AS fragmented_patient_count;

-- SELECT
--   (SELECT COUNT(*) FROM public.doctor) AS base_doctor_count,
--   (SELECT COUNT(*) FROM public.surat_doctors)
--     + (SELECT COUNT(*) FROM public.valsad_doctors) AS fragmented_doctor_count;

-- SELECT
--   (SELECT COUNT(*) FROM public.appointment) AS base_appointment_count,
--   (SELECT COUNT(*) FROM public.surat_appointments)
--     + (SELECT COUNT(*) FROM public.valsad_appointments) AS fragmented_appointment_count;


-- ============================================================
-- IMPORTANT LIMITATION
-- These are logical views for a classroom distributed-database
-- simulation. Actual replication between separate database servers
-- requires physical replication or a replication mechanism, which
-- this file intentionally does not configure.
-- ============================================================