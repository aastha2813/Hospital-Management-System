const API_BASE_URL = "http://localhost:5000/api";

// Generic GET request
const get = async (endpoint) => {

    const response =
        await fetch(`${API_BASE_URL}${endpoint}`);

    if (!response.ok) {

        throw new Error(
            `API Error: ${response.status}`
        );

    }

    return response.json();

};


// Generic POST request
const post = async (endpoint, data) => {

    const response =
        await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

    if (!response.ok) {

        const errorData =
            await response
                .json()
                .catch(() => ({}));

        throw new Error(
            errorData.error ||
            `API Error: ${response.status}`
        );

    }

    return response.json();

};


// =====================================================
// BRANCHES
// =====================================================

export const getBranches = () =>
    get("/branches");


// =====================================================
// PATIENTS
// =====================================================

export const getPatients = (
    branchId = null
) =>
    get(
        branchId
            ? `/patients?branch_id=${branchId}`
            : "/patients"
    );


// =====================================================
// DOCTORS
// =====================================================

export const getDoctors = (
    branchId = null
) =>
    get(
        branchId
            ? `/doctors?branch_id=${branchId}`
            : "/doctors"
    );


// =====================================================
// APPOINTMENTS
// =====================================================

export const getAppointments = (
    branchId = null
) =>
    get(
        branchId
            ? `/appointments?branch_id=${branchId}`
            : "/appointments"
    );


// =====================================================
// ADMISSIONS
// =====================================================

export const getAdmissions = (
    branchId = null
) =>
    get(
        branchId
            ? `/admissions?branch_id=${branchId}`
            : "/admissions"
    );


// =====================================================
// ROOMS
// =====================================================

export const getRooms = (
    branchId = null
) =>
    get(
        branchId
            ? `/rooms?branch_id=${branchId}`
            : "/rooms"
    );


// =====================================================
// BILLING
// =====================================================

export const getBills = (
    branchId = null
) =>
    get(
        branchId
            ? `/bills?branch_id=${branchId}`
            : "/bills"
    );


// Single bill
export const getBill = (
    billId
) =>
    get(`/bills/${billId}`);


// =====================================================
// DOCTOR NOTES
// =====================================================

export const getDoctorNotes = (
    branchId = null
) =>
    get(
        branchId
            ? `/doctor-notes?branch_id=${branchId}`
            : "/doctor-notes"
    );


// =====================================================
// IOT VITALS
// =====================================================

// One patient's vitals

export const getPatientVitals = (
    patientId
) =>
    get(`/vitals/${patientId}`);


// Branch-filtered/all vitals

export const getVitals = (
    branchId = null
) =>
    get(
        branchId
            ? `/vitals?branch_id=${branchId}`
            : "/vitals"
    );


// =====================================================
// CREATE APPOINTMENT
// =====================================================

export const createAppointment = (
    appointmentData
) =>
    post(
        "/appointments",
        appointmentData
    );


// =====================================================
// MAKE PAYMENT
// =====================================================

export const makePayment = (
    paymentData
) =>
    post(
        "/payments",
        paymentData
    );