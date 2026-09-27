import { useEffect, useRef, useState } from "react";

import {
    Search,
    Bell,
    ChevronDown,
    Check,
    Users,
    Stethoscope,
    CalendarDays,
    BedDouble,
    UserPlus,
    CalendarPlus,
    DoorOpen,
    CreditCard,
    Building2,
    Clock3,
    ArrowUpRight,
    MoreHorizontal,
    FileText,
    Activity,
    Settings,
    MapPin,
    Phone,
    Mail
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import RoleSelection from "./components/RoleSelection";
import BranchSelection from "./components/BranchSelection";
import LoginPage from "./components/LoginPage";
import "./App.css";

import {
    getPatients,
    getDoctors,
    getAppointments,
    getAdmissions,
    getBranches,
    getRooms,
    getBills,
    getDoctorNotes,
    getVitals,
    createDoctor,
    createAppointment,
    createAdmission,
    dischargePatient
} from "./services/api";


function App() {

    // =====================================================
    // PAGE
    // =====================================================

    const [currentPage, setCurrentPage] = useState("dashboard");
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedAuthBranch, setSelectedAuthBranch] = useState(null);

    // =====================================================
    // AUTHENTICATED USER
    // =====================================================

    const [authenticatedUser, setAuthenticatedUser] = useState(null);

    // =====================================================
    // DOCTOR PATIENT DETAILS
    // =====================================================

    const [selectedDoctorPatient, setSelectedDoctorPatient] = useState(null);


    // =====================================================
    // API DATA
    // =====================================================

    const [patients, setPatients] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [admissions, setAdmissions] = useState([]);
    const [branches, setBranches] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [bills, setBills] = useState([]);
    const [doctorNotes, setDoctorNotes] = useState([]);
    const [vitals, setVitals] = useState([]);

    // =====================================================
// ADD PATIENT MODAL
// =====================================================

const [addPatientOpen, setAddPatientOpen] = useState(false);

const [patientForm, setPatientForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    blood_group: "",
    allergies: "",
    insurance_no: "",
    dept_id: "",
    branch_id: ""
});

const [addingPatient, setAddingPatient] = useState(false);
const [patientFormError, setPatientFormError] = useState("");
const [patientFormSuccess, setPatientFormSuccess] = useState("");

const [addDoctorOpen, setAddDoctorOpen] = useState(false);

const [doctorForm, setDoctorForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    specialization: "",
    qualification: "",
    experience_years: "",
    consultation_fee: "",
    dept_id: "",
    branch_id: ""
});

const [addingDoctor, setAddingDoctor] = useState(false);
const [doctorFormError, setDoctorFormError] = useState("");
const [doctorFormSuccess, setDoctorFormSuccess] = useState("");


    // =====================================================
    // APPOINTMENT MODAL
    // =====================================================

    const [addAppointmentOpen, setAddAppointmentOpen] = useState(false);

    const [appointmentForm, setAppointmentForm] = useState({
        patient_id: "",
        doctor_id: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
        reason: "",
        appointment_type: "Consultation"
    });

    const [addingAppointment, setAddingAppointment] = useState(false);
    const [appointmentFormError, setAppointmentFormError] = useState("");
    const [appointmentFormSuccess, setAppointmentFormSuccess] = useState("");


    // =====================================================
    // ADMISSION MODAL
    // =====================================================

    const [addAdmissionOpen, setAddAdmissionOpen] = useState(false);

    const [admissionForm, setAdmissionForm] = useState({
        patient_id: "",
        doctor_id: "",
        appointment_id: "",
        room_id: "",
        admit_date: new Date().toISOString().split("T")[0],
        type: "Inpatient"
    });

    const [addingAdmission, setAddingAdmission] = useState(false);
    const [admissionFormError, setAdmissionFormError] = useState("");
    const [admissionFormSuccess, setAdmissionFormSuccess] = useState("");
    const [dischargingAdmissionId, setDischargingAdmissionId] = useState(null);


    // =====================================================
    // LOADING / ERROR
    // =====================================================

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Appointment completion state
    const [completingAppointmentId, setCompletingAppointmentId] = useState(null);
    const [completionError, setCompletionError] = useState("");


    // =====================================================
    // GLOBAL BRANCH SELECTION
    // =====================================================

    const [selectedBranch, setSelectedBranch] = useState("all");
    const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

    const branchDropdownRef = useRef(null);


    // =====================================================
    // PAGE TITLES
    // =====================================================

    const pageTitles = {
        dashboard: {
            title: "Dashboard",
            subtitle: "Overview of your hospital operations"
        },

        branches: {
            title: "Hospital Branches",
            subtitle: "Manage CityCare hospital branches"
        },

        patients: {
            title: "Patients",
            subtitle: "View and manage registered patients"
        },

        doctors: {
            title: "Doctors",
            subtitle: "View doctors across the hospital"
        },

        appointments: {
            title: "Appointments",
            subtitle: "Manage patient appointments"
        },

        admissions: {
            title: "Admissions",
            subtitle: "Monitor current and past admissions"
        },

        rooms: {
            title: "Rooms",
            subtitle: "Monitor room availability and occupancy"
        },

        billing: {
            title: "Billing",
            subtitle: "View hospital bills and payments"
        },

        doctorNotes: {
            title: "Doctor Notes",
            subtitle: "Clinical notes stored in MongoDB"
        },

        vitals: {
            title: "IoT Vitals",
            subtitle: "Patient health data collected from IoT devices"
        },

        settings: {
            title: "Settings",
            subtitle: "Hospital system settings"
        }
    };


    // =====================================================
    // CLOSE BRANCH DROPDOWN
    // =====================================================

    useEffect(() => {

        const handleOutsideClick = (event) => {

            if (
                branchDropdownRef.current &&
                !branchDropdownRef.current.contains(event.target)
            ) {
                setBranchDropdownOpen(false);
            }

        };

        document.addEventListener(
            "mousedown",
            handleOutsideClick
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleOutsideClick
            );

        };

    }, []);


    // =====================================================
    // LOAD DATA
    // =====================================================

    useEffect(() => {

        const loadData = async () => {

            try {

                setLoading(true);
                setError("");

                const branchId =
                    selectedBranch === "all"
                        ? null
                        : Number(selectedBranch);


                // -----------------------------------------
                // BRANCHES
                // -----------------------------------------

                const branchesData =
                    await getBranches();

                setBranches(branchesData);


                // -----------------------------------------
                // RELATIONAL DATA
                // -----------------------------------------

                const [
                    patientsData,
                    doctorsData,
                    appointmentsData,
                    admissionsData,
                    roomsData,
                    billsData
                ] = await Promise.all([

                    getPatients(branchId),

                    getDoctors(branchId),

                    getAppointments(branchId),

                    getAdmissions(branchId),

                    getRooms(branchId),

                    getBills(branchId)

                ]);


                setPatients(patientsData);
                setDoctors(doctorsData);
                setAppointments(appointmentsData);
                setAdmissions(admissionsData);
                setRooms(roomsData);
                setBills(billsData);


                // -----------------------------------------
                // MONGODB - DOCTOR NOTES
                // -----------------------------------------

                try {

                    const notesData =
                        await getDoctorNotes(branchId);

                    setDoctorNotes(notesData);

                } catch (notesError) {

                    console.error(
                        "Doctor Notes Error:",
                        notesError
                    );

                    setDoctorNotes([]);

                }


                // -----------------------------------------
                // MONGODB - IOT VITALS
                // -----------------------------------------

                try {

                    const vitalsData =
                        await getVitals(branchId);

                    setVitals(vitalsData);

                } catch (vitalsError) {

                    console.error(
                        "Vitals Error:",
                        vitalsError
                    );

                    setVitals([]);

                }


            } catch (err) {

                console.error(
                    "Dashboard API Error:",
                    err
                );

                setError(
                    "Unable to load hospital data. Make sure the backend server is running."
                );

            } finally {

                setLoading(false);

            }

        };


        loadData();

    }, [selectedBranch]);

    // Keep appointment status synchronized across Doctor, Admin and
    // Patient dashboards. Any dashboard open in another browser/tab
    // will pick up a completed appointment automatically.
    useEffect(() => {
        const refreshAppointmentStatus = async () => {
            try {
                const currentBranchId =
                    selectedBranch === "all"
                        ? null
                        : Number(selectedBranch);

                const updatedAppointments =
                    await getAppointments(currentBranchId);

                setAppointments(updatedAppointments);
            } catch (refreshError) {
                console.error(
                    "Appointment status refresh error:",
                    refreshError
                );
            }
        };

        const intervalId = setInterval(
            refreshAppointmentStatus,
            5000
        );

        return () => clearInterval(intervalId);
    }, [selectedBranch]);


    // =====================================================
    // BRANCH INFORMATION
    // =====================================================

    const handleDoctorFormChange = (event) => {

        const { name, value } = event.target;

        setDoctorForm((previous) => ({
            ...previous,
            [name]: value
        }));

        setDoctorFormError("");
        setDoctorFormSuccess("");
    };


    const handleAddDoctor = async (event) => {

        event.preventDefault();

        const branchId =
            doctorForm.branch_id ||
            (selectedBranch !== "all" ? selectedBranch : "");

        if (
            !doctorForm.first_name ||
            !doctorForm.date_of_birth ||
            !doctorForm.gender ||
            !doctorForm.phone ||
            !doctorForm.specialization ||
            !doctorForm.qualification ||
            doctorForm.experience_years === "" ||
            doctorForm.consultation_fee === "" ||
            !doctorForm.dept_id ||
            !branchId
        ) {
            setDoctorFormError("Please fill all required fields.");
            return;
        }

        try {
            setAddingDoctor(true);
            setDoctorFormError("");
            setDoctorFormSuccess("");

            const data = await createDoctor({
                ...doctorForm,
                branch_id: Number(branchId),
                dept_id: Number(doctorForm.dept_id),
                experience_years: parseInt(
                    doctorForm.experience_years,
                    10
                ),
                consultation_fee: Math.round(
                    Number(doctorForm.consultation_fee) * 100
                ) / 100
            });

            const currentBranchId =
                selectedBranch === "all"
                    ? null
                    : Number(selectedBranch);

            const updatedDoctors = await getDoctors(currentBranchId);
            setDoctors(updatedDoctors);

            setDoctorFormSuccess(
                `Doctor D${data.doctor_id} added successfully.`
            );

            setDoctorForm({
                first_name: "",
                last_name: "",
                date_of_birth: "",
                gender: "",
                phone: "",
                email: "",
                address: "",
                specialization: "",
                qualification: "",
                experience_years: "",
                consultation_fee: "",
                dept_id: "",
                branch_id: selectedBranch !== "all"
                    ? selectedBranch
                    : ""
            });

        } catch (error) {
            console.error("Add Doctor Error:", error);
            setDoctorFormError(
                error.message || "Failed to add doctor."
            );
        } finally {
            setAddingDoctor(false);
        }

    };



    // =====================================================
    // APPOINTMENT HANDLERS
    // =====================================================

    const findDoctorForProblem = (
        problemText,
        patientId
    ) => {

        if (!problemText || !patientId) {
            return null;
        }

        const patient =
            patients.find(
                (item) =>
                    Number(item.patient_id) ===
                    Number(patientId)
            );

        if (!patient) {
            return null;
        }

        const text =
            problemText
                .toLowerCase()
                .trim();

        let specialization = "General Medicine";

        // Cardiology-related problems
        if (
            /chest|heart|cardiac|palpitation|blood pressure|hypertension|breathing problem|shortness of breath/.test(text)
        ) {
            specialization = "Cardiology";

        // Neurology-related problems
        } else if (
            /migraine|dizziness|seizure|vertigo|memory|neurological|numbness/.test(text)
        ) {
            specialization = "Neurology";

        // Orthopedics-related problems
        } else if (
            /bone|joint|knee|back pain|fracture|shoulder|arthritis|muscle|sprain|leg pain/.test(text)
        ) {
            specialization = "Orthopedics";

        // Pediatrics-related problems
        } else if (
            /child|baby|infant|pediatric|paediatric|kid/.test(text)
        ) {
            specialization = "Pediatrics";

        // Emergency-related problems
        } else if (
            /accident|severe injury|trauma|bleeding|unconscious|emergency/.test(text)
        ) {
            specialization = "Emergency Medicine";

        // General Medicine-related problems
        // Headache is intentionally included here.
        } else if (
            /fever|headache|cold|cough|flu|weakness|fatigue|stomach|vomiting|diarrhea|infection|body pain|general pain/.test(text)
        ) {
            specialization = "General Medicine";
        }

        const branchDoctors =
            doctors.filter(
                (doctor) =>
                    Number(doctor.branch_id) ===
                    Number(patient.branch_id)
            );

        const matchedDoctor =
            branchDoctors.find((doctor) => {

                const doctorSpecialization =
                    String(
                        doctor.specialization || ""
                    )
                        .toLowerCase()
                        .trim();

                if (
                    specialization === "Cardiology" &&
                    (
                        doctorSpecialization === "cardiology" ||
                        doctorSpecialization === "cardiologist"
                    )
                ) {
                    return true;
                }

                if (
                    specialization === "Neurology" &&
                    (
                        doctorSpecialization === "neurology" ||
                        doctorSpecialization === "neurologist"
                    )
                ) {
                    return true;
                }

                if (
                    specialization === "Orthopedics" &&
                    (
                        doctorSpecialization === "orthopedics" ||
                        doctorSpecialization === "orthopedic" ||
                        doctorSpecialization === "orthopaedics"
                    )
                ) {
                    return true;
                }

                if (
                    specialization === "Pediatrics" &&
                    (
                        doctorSpecialization === "pediatrics" ||
                        doctorSpecialization === "pediatrician"
                    )
                ) {
                    return true;
                }

                if (
                    specialization === "Emergency Medicine" &&
                    (
                        doctorSpecialization === "emergency medicine" ||
                        doctorSpecialization === "emergency physician"
                    )
                ) {
                    return true;
                }

                if (
                    specialization === "General Medicine" &&
                    doctorSpecialization === "general medicine"
                ) {
                    return true;
                }

                return false;
            });

        // Do not randomly assign the first doctor in the branch.
        return matchedDoctor || null;

    };


    const handleAppointmentFormChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setAppointmentForm((previous) => {

            const next = {
                ...previous,
                [name]: value
            };

            if (
                name === "patient_id" ||
                name === "reason"
            ) {

                const patientId =
                    name === "patient_id"
                        ? value
                        : previous.patient_id;

                const reason =
                    name === "reason"
                        ? value
                        : previous.reason;

                const doctor =
                    findDoctorForProblem(
                        reason,
                        patientId
                    );

                next.doctor_id =
                    doctor
                        ? String(doctor.doctor_id)
                        : "";

            }

            return next;

        });

        setAppointmentFormError("");
        setAppointmentFormSuccess("");

    };


    const resetAppointmentForm = () => {

        setAppointmentForm({
            patient_id: "",
            doctor_id: "",
            date: new Date()
                .toISOString()
                .split("T")[0],
            time: "",
            reason: "",
            appointment_type: "Consultation"
        });

        setAppointmentFormError("");
        setAppointmentFormSuccess("");

    };


    const handleAddAppointment = async (event) => {

        event.preventDefault();

        if (
            !appointmentForm.patient_id ||
            !appointmentForm.doctor_id ||
            !appointmentForm.date ||
            !appointmentForm.time ||
            !appointmentForm.reason.trim() ||
            !appointmentForm.appointment_type
        ) {

            setAppointmentFormError(
                "Please enter the patient's problem and complete all required fields."
            );

            return;

        }

        const selectedPatient =
            patients.find(
                (patient) =>
                    Number(patient.patient_id) ===
                    Number(appointmentForm.patient_id)
            );

        const selectedDoctor =
            doctors.find(
                (doctor) =>
                    Number(doctor.doctor_id) ===
                    Number(appointmentForm.doctor_id)
            );

        if (!selectedPatient || !selectedDoctor) {

            setAppointmentFormError(
                "Unable to automatically assign a doctor for this patient."
            );

            return;

        }

        if (
            Number(selectedPatient.branch_id) !==
            Number(selectedDoctor.branch_id)
        ) {

            setAppointmentFormError(
                "The assigned doctor must belong to the patient's branch."
            );

            return;

        }

        try {

            setAddingAppointment(true);
            setAppointmentFormError("");
            setAppointmentFormSuccess("");

            await createAppointment({

                patient_id:
                    Number(
                        appointmentForm.patient_id
                    ),

                doctor_id:
                    Number(
                        appointmentForm.doctor_id
                    ),

                date:
                    appointmentForm.date,

                time:
                    appointmentForm.time,

                reason:
                    appointmentForm.reason.trim(),

                appointment_type:
                    appointmentForm.appointment_type

            });

            const currentBranchId =
                selectedBranch === "all"
                    ? null
                    : Number(selectedBranch);

            const updatedAppointments =
                await getAppointments(
                    currentBranchId
                );

            setAppointments(
                updatedAppointments
            );

            setAppointmentFormSuccess(
                `Appointment booked. ${selectedDoctor.first_name ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name || ""}` : `Doctor #${selectedDoctor.doctor_id}`} (${String(selectedDoctor.specialization || "").toLowerCase() === "general physician" ? "General Medicine" : selectedDoctor.specialization}) has been assigned.`
            );

            setAppointmentForm({
                patient_id: "",
                doctor_id: "",
                date: new Date()
                    .toISOString()
                    .split("T")[0],
                time: "",
                reason: "",
                appointment_type: "Consultation"
            });

        } catch (error) {

            console.error(
                "Book Appointment Error:",
                error
            );

            setAppointmentFormError(
                error.message ||
                "Failed to book appointment."
            );

        } finally {

            setAddingAppointment(false);

        }

    };


    // =====================================================
    // ADMISSION HANDLERS
    // =====================================================

    const handleAdmissionFormChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setAdmissionForm((previous) => ({
            ...previous,
            [name]: value
        }));

        setAdmissionFormError("");
        setAdmissionFormSuccess("");
    };


    const resetAdmissionForm = () => {

        setAdmissionForm({
            patient_id: "",
            doctor_id: "",
            appointment_id: "",
            room_id: "",
            admit_date: new Date().toISOString().split("T")[0],
            type: "Inpatient"
        });

        setAdmissionFormError("");
        setAdmissionFormSuccess("");
    };


    const handleAddAdmission = async (event) => {

        event.preventDefault();

        if (
            !admissionForm.patient_id ||
            !admissionForm.doctor_id ||
            !admissionForm.appointment_id ||
            !admissionForm.room_id ||
            !admissionForm.admit_date ||
            !admissionForm.type
        ) {
            setAdmissionFormError(
                "Please fill all required fields."
            );
            return;
        }

        const selectedPatient =
            patients.find(
                (patient) =>
                    Number(patient.patient_id) ===
                    Number(admissionForm.patient_id)
            );

        const selectedDoctor =
            doctors.find(
                (doctor) =>
                    Number(doctor.doctor_id) ===
                    Number(admissionForm.doctor_id)
            );

        const selectedRoom =
            rooms.find(
                (room) =>
                    Number(room.room_id) ===
                    Number(admissionForm.room_id)
            );

        const selectedAppointment =
            appointments.find(
                (appointment) =>
                    Number(appointment.appointment_id) ===
                    Number(admissionForm.appointment_id)
            );

        if (
            !selectedPatient ||
            !selectedDoctor ||
            !selectedRoom ||
            !selectedAppointment
        ) {
            setAdmissionFormError(
                "A valid patient, recent appointment, doctor and vacant room are required."
            );
            return;
        }

        if (
            Number(selectedAppointment.patient_id) !==
            Number(selectedPatient.patient_id)
        ) {
            setAdmissionFormError(
                "The selected appointment does not belong to this patient."
            );
            return;
        }

        if (
            Number(selectedAppointment.doctor_id) !==
            Number(selectedDoctor.doctor_id)
        ) {
            setAdmissionFormError(
                "The attending doctor must match the patient's appointment."
            );
            return;
        }

        if (
            Number(selectedPatient.branch_id) !==
            Number(selectedDoctor.branch_id)
        ) {
            setAdmissionFormError(
                "Patient and doctor must belong to the same branch."
            );
            return;
        }

        if (
            Number(selectedPatient.branch_id) !==
            Number(selectedRoom.branch_id)
        ) {
            setAdmissionFormError(
                "Patient and room must belong to the same branch."
            );
            return;
        }

        if (
            selectedRoom.status &&
            selectedRoom.status.toLowerCase() !== "vacant"
        ) {
            setAdmissionFormError(
                "Selected room is not vacant."
            );
            return;
        }

        try {

            setAddingAdmission(true);
            setAdmissionFormError("");
            setAdmissionFormSuccess("");

            await createAdmission({
                patient_id:
                    Number(admissionForm.patient_id),

                doctor_id:
                    Number(admissionForm.doctor_id),

                appointment_id:
                    admissionForm.appointment_id
                        ? Number(admissionForm.appointment_id)
                        : null,

                room_id:
                    Number(admissionForm.room_id),

                admit_date:
                    admissionForm.admit_date,

                type:
                    admissionForm.type
            });

            const currentBranchId =
                selectedBranch === "all"
                    ? null
                    : Number(selectedBranch);

            const [
                updatedAdmissions,
                updatedRooms
            ] = await Promise.all([
                getAdmissions(currentBranchId),
                getRooms(currentBranchId)
            ]);

            setAdmissions(updatedAdmissions);
            setRooms(updatedRooms);

            const admittedPatientId =
                admissionForm.patient_id;

            resetAdmissionForm();

            setAdmissionFormSuccess(
                `Patient P${admittedPatientId} admitted successfully.`
            );

        } catch (error) {

            console.error(
                "Add Admission Error:",
                error
            );

            setAdmissionFormError(
                error.message ||
                "Failed to admit patient."
            );

        } finally {

            setAddingAdmission(false);

        }

    };


    const handleDischargePatient = async (admissionId) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to discharge Admission #${admissionId}?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setDischargingAdmissionId(admissionId);

            const today =
                new Date().toISOString().split("T")[0];

            await dischargePatient(
                admissionId,
                today
            );

            const currentBranchId =
                selectedBranch === "all"
                    ? null
                    : Number(selectedBranch);

            const [
                updatedAdmissions,
                updatedRooms
            ] = await Promise.all([
                getAdmissions(currentBranchId),
                getRooms(currentBranchId)
            ]);

            setAdmissions(updatedAdmissions);
            setRooms(updatedRooms);

        } catch (error) {

            console.error(
                "Discharge Patient Error:",
                error
            );

            window.alert(
                error.message ||
                "Failed to discharge patient."
            );

        } finally {

            setDischargingAdmissionId(null);

        }

    };


    // =====================================================
    // COMPLETE APPOINTMENT
    // =====================================================

    const handleCompleteAppointment = async (appointmentId) => {
        if (!appointmentId || completingAppointmentId !== null) {
            return;
        }

        const appointment = appointments.find(
            (item) =>
                Number(item.appointment_id) === Number(appointmentId)
        );

        if (!appointment) {
            window.alert("Appointment not found.");
            return;
        }

        if (
            String(appointment.status || "Scheduled")
                .toLowerCase() === "completed"
        ) {
            return;
        }

        const confirmed = window.confirm(
            `Mark appointment A${appointmentId} as completed?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setCompletingAppointmentId(Number(appointmentId));
            setCompletionError("");

            /*
             * The backend must execute the PostgreSQL CompleteAppointment
             * procedure and then return the updated appointment.
             */
            const response = await fetch(
                `http://localhost:5000/api/appointments/${appointmentId}/complete`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to complete appointment."
                );
            }

            /*
             * Refresh appointments from PostgreSQL.
             * This makes the same database status visible in:
             * - Doctor Dashboard
             * - Admin Dashboard
             * - Patient Dashboard
             */
            const currentBranchId =
                selectedBranch === "all"
                    ? null
                    : Number(selectedBranch);

            const updatedAppointments =
                await getAppointments(currentBranchId);

            setAppointments(updatedAppointments);

            window.alert(
                `Appointment A${appointmentId} has been marked as Completed.`
            );
        } catch (error) {
            console.error("Complete Appointment Error:", error);

            setCompletionError(
                error.message ||
                "Failed to complete appointment."
            );

            window.alert(
                error.message ||
                "Failed to complete appointment."
            );
        } finally {
            setCompletingAppointmentId(null);
        }
    };


    const selectedBranchObject =
        branches.find(
            (branch) =>
                Number(branch.branch_id) ===
                Number(selectedBranch)
        );


    const selectedBranchName =
        selectedBranch === "all"
            ? "All Branches"
            : selectedBranchObject?.branch_name ||
              "Branch";


    const visibleBranches =
        branches.filter(
            (branch) =>
                selectedBranch === "all" ||
                Number(branch.branch_id) ===
                Number(selectedBranch)
        );


    // =====================================================
    // BRANCH SELECT
    // =====================================================

    const handleBranchSelect = (branchId) => {

        setSelectedBranch(
            String(branchId)
        );

        setBranchDropdownOpen(false);

    };


    // =====================================================
    // COUNTS
    // =====================================================

    const patientCount =
        patients.length;

    const doctorCount =
        doctors.length;

    const appointmentCount =
        appointments.length;

    const admissionCount =
        admissions.length;


    // =====================================================
    // ROOM COUNTS
    // =====================================================

    const totalRooms =
        rooms.length;

    const vacantRooms =
        rooms.filter(
            (room) =>
                room.status &&
                room.status.toLowerCase() ===
                "vacant"
        ).length;

    const occupiedRooms =
        rooms.filter(
            (room) =>
                room.status &&
                room.status.toLowerCase() ===
                "occupied"
        ).length;


    const vacantPercentage =
        totalRooms > 0
            ? (vacantRooms / totalRooms) * 100
            : 0;

    const occupiedPercentage =
        totalRooms > 0
            ? (occupiedRooms / totalRooms) * 100
            : 0;


    // =====================================================
    // ACTIVE ADMISSIONS
    // =====================================================

    const activeAdmissions =
        admissions.filter(
            (admission) =>
                !admission.status ||
                admission.status.toLowerCase() !==
                "discharged"
        ).length;


    // =====================================================
    // BRANCH ROOM COUNT
    // =====================================================

    const getBranchRoomCount = (branchId) => {

        return rooms.filter(
            (room) =>
                Number(room.branch_id) ===
                Number(branchId)
        ).length;

    };


    // =====================================================
    // TOPBAR
    // =====================================================

    const renderTopbar = () => {

        const page =
            pageTitles[currentPage] ||
            pageTitles.dashboard;


        return (

            <header className="topbar">

                <div className="topbar-left">

                    <div className="page-heading">

                        <h1>
                            {page.title}
                        </h1>

                        <p>
                            {page.subtitle}
                        </p>

                    </div>

                </div>


                <div className="topbar-right">


                    {/* =====================================
                        BRANCH SELECTOR
                    ===================================== */}

                    <div
                        className="branch-dropdown"
                        ref={branchDropdownRef}
                    >

                        <button
                            type="button"
                            className={`branch-dropdown-trigger ${
                                branchDropdownOpen
                                    ? "open"
                                    : ""
                            }`}
                            onClick={() =>
                                setBranchDropdownOpen(
                                    !branchDropdownOpen
                                )
                            }
                        >

                            <Building2 size={17} />

                            <span className="branch-trigger-text">
                                {selectedBranchName}
                            </span>

                            <ChevronDown
                                size={15}
                                className={
                                    branchDropdownOpen
                                        ? "rotate-arrow"
                                        : ""
                                }
                            />

                        </button>


                        {branchDropdownOpen && (

                            <div className="branch-dropdown-menu">


                                {/* ALL BRANCHES */}

                                <button
                                    type="button"
                                    className={`branch-option ${
                                        selectedBranch === "all"
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        handleBranchSelect(
                                            "all"
                                        )
                                    }
                                >

                                    <div className="branch-option-icon">
                                        <Building2 size={17} />
                                    </div>

                                    <div className="branch-option-content">

                                        <strong>
                                            All Branches
                                        </strong>

                                        <span>
                                            CityCare Hospital Network
                                        </span>

                                    </div>

                                    {selectedBranch === "all" && (

                                        <Check
                                            size={17}
                                            className="branch-check"
                                        />

                                    )}

                                </button>


                                {/* INDIVIDUAL BRANCHES */}

                                {branches.map(
                                    (branch) => (

                                        <button
                                            type="button"
                                            key={
                                                branch.branch_id
                                            }
                                            className={`branch-option ${
                                                Number(
                                                    selectedBranch
                                                ) ===
                                                Number(
                                                    branch.branch_id
                                                )
                                                    ? "selected"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleBranchSelect(
                                                    branch.branch_id
                                                )
                                            }
                                        >

                                            <div className="branch-option-icon">
                                                <Building2 size={17} />
                                            </div>

                                            <div className="branch-option-content">

                                                <strong>
                                                    {
                                                        branch.branch_name
                                                    }
                                                </strong>

                                                <span>
                                                    {branch.city}

                                                    {branch.state
                                                        ? `, ${branch.state}`
                                                        : ""}
                                                </span>

                                            </div>

                                            {Number(
                                                selectedBranch
                                            ) ===
                                                Number(
                                                    branch.branch_id
                                                ) && (

                                                <Check
                                                    size={17}
                                                    className="branch-check"
                                                />

                                            )}

                                        </button>

                                    )
                                )}

                            </div>

                        )}

                    </div>


                    {/* =====================================
                        SEARCH
                    ===================================== */}

                    <div className="search-box">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search patients, doctors..."
                        />

                    </div>


                    {/* =====================================
                        NOTIFICATION
                    ===================================== */}

                    <button className="notification-button">

                        <Bell size={19} />

                        <span className="notification-dot"></span>

                    </button>


                    {/* =====================================
                        PROFILE
                    ===================================== */}

                    <div className="topbar-profile">

                        <div className="profile-avatar">
                            A
                        </div>

                        <div className="profile-details">

                            <strong>
                                {authenticatedUser?.profile
                                    ? `${authenticatedUser.profile.first_name} ${authenticatedUser.profile.last_name || ""}`.trim()
                                    : "Aastha"}
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                        <ChevronDown size={16} />

                    </div>

                    <button
                        type="button"
                        className="primary-action"
                        onClick={() => {
                            setAuthenticatedUser(null);
                            setSelectedRole(null);
                            setSelectedAuthBranch(null);
                            setCurrentPage("dashboard");
                            setSelectedBranch("all");
                        }}
                    >
                        Logout
                    </button>

                </div>

            </header>

        );

    };


    // =====================================================
    // ADD PATIENT
    // =====================================================

    const departments = [
        { dept_id: 1, dept_name: "Cardiology" },
        { dept_id: 2, dept_name: "Neurology" },
        { dept_id: 3, dept_name: "Orthopedics" },
        { dept_id: 4, dept_name: "General Medicine" },
        { dept_id: 5, dept_name: "Pediatrics" },
        { dept_id: 6, dept_name: "Emergency Medicine" }
    ];


    const handlePatientFormChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setPatientForm((previous) => ({
            ...previous,
            [name]: value
        }));

        setPatientFormError("");
        setPatientFormSuccess("");
    };


    const handleAddPatient = async (event) => {

        event.preventDefault();

        const branchId =
            patientForm.branch_id ||
            (
                selectedBranch !== "all"
                    ? selectedBranch
                    : ""
            );

        if (
            !patientForm.first_name ||
            !patientForm.date_of_birth ||
            !patientForm.gender ||
            !patientForm.phone ||
            !patientForm.dept_id ||
            !branchId
        ) {
            setPatientFormError(
                "Please fill all required fields."
            );
            return;
        }

        try {

            setAddingPatient(true);
            setPatientFormError("");
            setPatientFormSuccess("");

            const response =
                await fetch(
                    "http://localhost:5000/api/patients",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify({
                            ...patientForm,
                            branch_id:
                                Number(branchId),
                            dept_id:
                                Number(
                                    patientForm.dept_id
                                )
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to add patient."
                );
            }

            const currentBranchId =
                selectedBranch === "all"
                    ? null
                    : Number(selectedBranch);

            const updatedPatients =
                await getPatients(
                    currentBranchId
                );

            setPatients(updatedPatients);

            setPatientFormSuccess(
                `Patient P${data.patient_id} added successfully.`
            );

            setPatientForm({
                first_name: "",
                last_name: "",
                date_of_birth: "",
                gender: "",
                phone: "",
                email: "",
                address: "",
                blood_group: "",
                allergies: "",
                insurance_no: "",
                dept_id: "",
                branch_id:
                    selectedBranch !== "all"
                        ? selectedBranch
                        : ""
            });

        } catch (err) {

            console.error(
                "Add Patient Error:",
                err
            );

            setPatientFormError(
                err.message ||
                "Unable to add patient."
            );

        } finally {

            setAddingPatient(false);

        }

    };


    // =====================================================
    // PAGE HEADER
    // =====================================================

    const renderPageHeader = (
        title,
        subtitle,
        actionText = null
    ) => {

        return (

            <div className="page-section-header">

                <div>

                    <h2>
                        {title}
                    </h2>

                    <p>
                        {subtitle}
                    </p>

                </div>

                <div>

                    {actionText && (

                        <button
                            type="button"
                            className="primary-action"
                            onClick={
                                title === "Patients"
                                    ? () => {
                                        setPatientFormError("");
                                        setPatientFormSuccess("");

                                        setPatientForm((previous) => ({
                                            ...previous,
                                            branch_id:
                                                selectedBranch !== "all"
                                                    ? selectedBranch
                                                    : previous.branch_id
                                        }));

                                        setAddPatientOpen(true);
                                    }
                                    : title === "Doctors"
                                        ? () => {
                                            setDoctorFormError("");
                                            setDoctorFormSuccess("");

                                            setDoctorForm((previous) => ({
                                                ...previous,
                                                branch_id:
                                                    selectedBranch !== "all"
                                                        ? selectedBranch
                                                        : previous.branch_id
                                            }));

                                            setAddDoctorOpen(true);
                                        }
                                        : title === "Admissions"
                                            ? () => {
                                                resetAdmissionForm();
                                                setAddAdmissionOpen(true);
                                            }
                                            : title === "Appointments"
                                                ? () => {
                                                    resetAppointmentForm();
                                                    setAddAppointmentOpen(true);
                                                }
                                                : undefined
                            }
                        >
                            {actionText}
                        </button>

                    )}

                </div>

            </div>

        );

    };


    // =====================================================
    // BRANCHES PAGE
    // =====================================================

    const renderBranchesPage = () => {

        return (

            <div>

                {renderPageHeader(
                    "Hospital Branches",
                    `Showing ${selectedBranchName.toLowerCase()}`
                )}


                <div className="branch-page-grid">

                    {visibleBranches.map(
                        (branch) => (

                            <div
                                className="branch-detail-card"
                                key={branch.branch_id}
                            >

                                <div className="branch-detail-icon">
                                    <Building2 size={28} />
                                </div>

                                <div className="branch-detail-content">

                                    <h3>
                                        {branch.branch_name}
                                    </h3>

                                    <p>
                                        <MapPin size={14} />
                                        {branch.address}
                                    </p>

                                    <p>
                                        {branch.city},{" "}
                                        {branch.state}
                                    </p>

                                    <p>
                                        <Phone size={14} />
                                        {branch.contact_no}
                                    </p>

                                </div>

                                <div className="branch-detail-footer">

                                    <span>
                                        {
                                            getBranchRoomCount(
                                                branch.branch_id
                                            )
                                        }{" "}
                                        Rooms
                                    </span>

                                    <span className="active-status">
                                        Active
                                    </span>

                                </div>

                            </div>

                        )
                    )}

                </div>

            </div>

        );

    };


    // =====================================================
    // PATIENTS PAGE
    // =====================================================

    const renderPatientsPage = () => {

        return (

            <div>

                {renderPageHeader(
                    "Patients",
                    `${patientCount} patients in ${selectedBranchName}`,
                    "Add Patient"
                )}


                <div className="data-card">

                    <div className="data-card-header">

                        <div>

                            <h3>
                                Patient Directory
                            </h3>

                            <p>
                                Registered patients
                            </p>

                        </div>

                    </div>


                    {loading ? (

                        <div className="table-loading">
                            Loading patients...
                        </div>

                    ) : patients.length === 0 ? (

                        <div className="table-empty">
                            No patients found for this branch.
                        </div>

                    ) : (

                        <div className="table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Patient ID
                                        </th>

                                        <th>
                                            Patient
                                        </th>

                                        <th>
                                            Gender
                                        </th>

                                        <th>
                                            Blood Group
                                        </th>

                                        <th>
                                            Phone
                                        </th>

                                        <th>
                                            Insurance
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {patients.map(
                                        (patient) => (

                                            <tr
                                                key={
                                                    patient.patient_id
                                                }
                                            >

                                                <td>
                                                    <span className="id-badge">
                                                        P{
                                                            patient.patient_id
                                                        }
                                                    </span>
                                                </td>

                                                <td>

                                                    <div className="table-person">

                                                        <div className="table-avatar blue-avatar">
                                                            {(
                                                                patient.first_name ||
                                                                "P"
                                                            )[0]}
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    patient.first_name
                                                                }{" "}
                                                                {
                                                                    patient.last_name ||
                                                                    ""
                                                                }
                                                            </strong>

                                                            <span>
                                                                Patient
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td>
                                                    {
                                                        patient.gender ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        patient.blood_group ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        patient.phone ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        patient.insurance_no ||
                                                        "—"
                                                    }
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        );

    };


    // =====================================================
    // DOCTORS PAGE
    // =====================================================

    const renderDoctorsPage = () => {

        return (

            <div>

                {renderPageHeader(
                    "Doctors",
                    `${doctorCount} doctors in ${selectedBranchName}`,
                    "Add Doctor"
                )}


                <div className="data-card">

                    <div className="data-card-header">

                        <div>

                            <h3>
                                Medical Staff
                            </h3>

                            <p>
                                Doctors and their specializations
                            </p>

                        </div>

                    </div>


                    {loading ? (

                        <div className="table-loading">
                            Loading doctors...
                        </div>

                    ) : doctors.length === 0 ? (

                        <div className="table-empty">
                            No doctors found for this branch.
                        </div>

                    ) : (

                        <div className="table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Doctor ID
                                        </th>

                                        <th>
                                            Doctor
                                        </th>

                                        <th>
                                            Specialization
                                        </th>

                                        <th>
                                            Qualification
                                        </th>

                                        <th>
                                            Experience
                                        </th>

                                        <th>
                                            Consultation Fee
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {doctors.map(
                                        (doctor) => (

                                            <tr
                                                key={
                                                    doctor.doctor_id
                                                }
                                            >

                                                <td>
                                                    <span className="id-badge purple-id">
                                                        D{
                                                            doctor.doctor_id
                                                        }
                                                    </span>
                                                </td>

                                                <td>

                                                    <div className="table-person">

                                                        <div className="table-avatar purple-avatar">
                                                            {(
                                                                doctor.first_name ||
                                                                "D"
                                                            )[0]}
                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    doctor.first_name
                                                                }{" "}
                                                                {
                                                                    doctor.last_name ||
                                                                    ""
                                                                }
                                                            </strong>

                                                            <span>
                                                                Doctor
                                                            </span>

                                                        </div>

                                                    </div>

                                                </td>

                                                <td>
                                                    {
                                                        doctor.specialization ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        doctor.qualification ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        doctor.experience_years ??
                                                        "—"
                                                    }{" "}
                                                    years
                                                </td>

                                                <td className="money-cell">
                                                    ₹
                                                    {
                                                        doctor.consultation_fee ??
                                                        "0"
                                                    }
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        );

    };


    // =====================================================
    // APPOINTMENTS PAGE
    // =====================================================

    const renderAppointmentsPage = () => {

        return (

            <div>

                {renderPageHeader(
                    "Appointments",
                    `${appointmentCount} appointments in ${selectedBranchName}`,
                    "Book Appointment"
                )}


                <div className="data-card">

                    {loading ? (

                        <div className="table-loading">
                            Loading appointments...
                        </div>

                    ) : appointments.length === 0 ? (

                        <div className="table-empty">
                            No appointments found.
                        </div>

                    ) : (

                        <div className="table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Appointment ID
                                        </th>

                                        <th>
                                            Patient
                                        </th>

                                        <th>
                                            Doctor
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Time
                                        </th>

                                        <th>
                                            Type
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {appointments.map(
                                        (appointment) => (

                                            <tr
                                                key={
                                                    appointment.appointment_id
                                                }
                                            >

                                                <td>
                                                    <span className="id-badge orange-id">
                                                        A{
                                                            appointment.appointment_id
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    Patient #
                                                    {
                                                        appointment.patient_id
                                                    }
                                                </td>

                                                <td>
                                                    Doctor #
                                                    {
                                                        appointment.doctor_id
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        appointment.date
                                                            ? new Date(
                                                                appointment.date
                                                            ).toLocaleDateString()
                                                            : "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        appointment.time ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        appointment.appointment_type ||
                                                        "—"
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={`status-badge ${
                                                            String(
                                                                appointment.status || "Scheduled"
                                                            ).toLowerCase() === "completed"
                                                                ? "status-green"
                                                                : "status-blue"
                                                        }`}
                                                    >
                                                        {
                                                            appointment.status ||
                                                            "Scheduled"
                                                        }
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        );

    };


    // =====================================================
    // ADMISSIONS PAGE
    // =====================================================

    const renderAdmissionsPage = () => {

        return (

            <div>

                {renderPageHeader(
                    "Admissions",
                    `${admissionCount} admissions in ${selectedBranchName}`,
                    "Admit Patient"
                )}


                <div className="data-card">

                    {loading ? (

                        <div className="table-loading">
                            Loading admissions...
                        </div>

                    ) : admissions.length === 0 ? (

                        <div className="table-empty">
                            No admissions found.
                        </div>

                    ) : (

                        <div className="table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Admission ID
                                        </th>

                                        <th>
                                            Patient
                                        </th>

                                        <th>
                                            Doctor
                                        </th>

                                        <th>
                                            Room
                                        </th>

                                        <th>
                                            Admit Date
                                        </th>

                                        <th>
                                            Discharge Date
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {admissions.map(
                                        (admission) => (

                                            <tr
                                                key={
                                                    admission.admission_id
                                                }
                                            >

                                                <td>
                                                    <span className="id-badge green-id">
                                                        ADM{
                                                            admission.admission_id
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    Patient #
                                                    {
                                                        admission.patient_id
                                                    }
                                                </td>

                                                <td>
                                                    Doctor #
                                                    {
                                                        admission.attending_doctor_id
                                                    }
                                                </td>

                                                <td>
                                                    Room #
                                                    {
                                                        admission.room_id
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        admission.admit_date
                                                            ? new Date(
                                                                admission.admit_date
                                                            ).toLocaleDateString()
                                                            : "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        admission.discharge_date
                                                            ? new Date(
                                                                admission.discharge_date
                                                            ).toLocaleDateString()
                                                            : "—"
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={`status-badge ${
                                                            admission.status?.toLowerCase() ===
                                                            "discharged"
                                                                ? "status-gray"
                                                                : "status-green"
                                                        }`}
                                                    >
                                                        {
                                                            admission.status ||
                                                            "Active"
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    {admission.status?.toLowerCase() !==
                                                        "discharged" ? (

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDischargePatient(
                                                                    admission.admission_id
                                                                )
                                                            }
                                                            disabled={
                                                                dischargingAdmissionId ===
                                                                admission.admission_id
                                                            }
                                                            style={{
                                                                padding: "7px 12px",
                                                                border: "1px solid #fecaca",
                                                                background: "#fff1f2",
                                                                color: "#be123c",
                                                                borderRadius: "8px",
                                                                fontSize: "12px",
                                                                fontWeight: 600,
                                                                cursor:
                                                                    dischargingAdmissionId ===
                                                                    admission.admission_id
                                                                        ? "not-allowed"
                                                                        : "pointer",
                                                                opacity:
                                                                    dischargingAdmissionId ===
                                                                    admission.admission_id
                                                                        ? 0.6
                                                                        : 1
                                                            }}
                                                        >
                                                            {dischargingAdmissionId ===
                                                            admission.admission_id
                                                                ? "Discharging..."
                                                                : "Discharge"}
                                                        </button>

                                                    ) : (

                                                        <span
                                                            style={{
                                                                color: "#94a3b8",
                                                                fontSize: "12px"
                                                            }}
                                                        >
                                                            Completed
                                                        </span>

                                                    )}

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        );

    };


    // =====================================================
    // ROOMS PAGE
    // =====================================================

    const renderRoomsPage = () => {

        return (

            <div>

                {renderPageHeader(
                    "Rooms",
                    `${totalRooms} rooms in ${selectedBranchName}`
                )}


                <div className="room-grid">

                    {rooms.map(
                        (room) => {

                            const occupied =
                                room.status?.toLowerCase() ===
                                "occupied";

                            return (

                                <div
                                    className={`room-card ${
                                        occupied
                                            ? "room-occupied"
                                            : "room-vacant"
                                    }`}
                                    key={room.room_id}
                                >

                                    <div className="room-card-top">

                                        <div className="room-card-icon">
                                            <BedDouble size={22} />
                                        </div>

                                        <span
                                            className={`room-status ${
                                                occupied
                                                    ? "room-status-occupied"
                                                    : "room-status-vacant"
                                            }`}
                                        >
                                            {room.status}
                                        </span>

                                    </div>

                                    <h3>
                                        Room {room.room_id}
                                    </h3>

                                    <p>
                                        {room.room_type ||
                                            "General"}
                                    </p>

                                    <span>
                                        Floor{" "}
                                        {room.floor_no ??
                                            "—"}
                                    </span>

                                </div>

                            );

                        }
                    )}

                </div>

            </div>

        );

    };


    // =====================================================
    // BILLING PAGE
    // =====================================================

    const renderBillingPage = () => {

        const totalBilling = bills.reduce(
            (sum, bill) =>
                sum + Number(bill.total_amount || 0),
            0
        );

        const totalPaid = bills.reduce(
            (sum, bill) =>
                sum + Number(bill.amount_paid || 0),
            0
        );

        const totalOutstanding = bills.reduce(
            (sum, bill) =>
                sum + Number(
                    bill.amount_left ??
                    (
                        Number(bill.total_amount || 0) -
                        Number(bill.amount_paid || 0)
                    )
                ),
            0
        );

        return (

            <div>

                {renderPageHeader(
                    "Billing",
                    `${bills.length} bills in ${selectedBranchName}`
                )}

                {/* =========================================
                    BILLING SUMMARY
                ========================================= */}

                <div className="page-stat-grid">

                    <div className="page-stat-card">

                        <CreditCard size={22} />

                        <div>
                            <span>Total Bills</span>
                            <strong>{bills.length}</strong>
                        </div>

                    </div>

                    <div className="page-stat-card green-card">

                        <CreditCard size={22} />

                        <div>
                            <span>Total Billing</span>
                            <strong>
                                ₹{totalBilling.toLocaleString("en-IN")}
                            </strong>
                        </div>

                    </div>

                    <div className="page-stat-card purple-card">

                        <CreditCard size={22} />

                        <div>
                            <span>Amount Paid</span>
                            <strong>
                                ₹{totalPaid.toLocaleString("en-IN")}
                            </strong>
                        </div>

                    </div>

                    <div className="page-stat-card orange-card">

                        <CreditCard size={22} />

                        <div>
                            <span>Outstanding</span>
                            <strong>
                                ₹{totalOutstanding.toLocaleString("en-IN")}
                            </strong>
                        </div>

                    </div>

                </div>

                {/* =========================================
                    BILLING TABLE
                ========================================= */}

                <div className="data-card">

                    {loading ? (

                        <div className="table-loading">
                            Loading billing data...
                        </div>

                    ) : bills.length === 0 ? (

                        <div className="table-empty">
                            No bills found for this branch.
                        </div>

                    ) : (

                        <div className="table-wrapper">

                            <table>

                                <thead>
                                    <tr>
                                        <th>Bill ID</th>
                                        <th>Admission</th>
                                        <th>Bill Date</th>
                                        <th>Total Amount</th>
                                        <th>Amount Paid</th>
                                        <th>Amount Left</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {bills.map((bill) => {

                                        const totalAmount =
                                            Number(bill.total_amount || 0);

                                        const amountPaid =
                                            Number(bill.amount_paid || 0);

                                        const amountLeft =
                                            Number(
                                                bill.amount_left ??
                                                (totalAmount - amountPaid)
                                            );

                                        const status =
                                            bill.status ||
                                            (
                                                amountLeft <= 0
                                                    ? "Paid"
                                                    : amountPaid > 0
                                                        ? "Partially Paid"
                                                        : "Pending"
                                            );

                                        return (

                                            <tr key={bill.bill_id}>

                                                <td>
                                                    <span className="id-badge orange-id">
                                                        B{bill.bill_id}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="admission-link">
                                                        Admission #{bill.admission_id}
                                                    </span>
                                                </td>

                                                <td>
                                                    {bill.bill_date
                                                        ? new Date(
                                                            bill.bill_date
                                                        ).toLocaleDateString()
                                                        : "—"}
                                                </td>

                                                <td className="money-cell total-money">
                                                    ₹{totalAmount.toLocaleString("en-IN")}
                                                </td>

                                                <td className="money-cell paid-money">
                                                    ₹{amountPaid.toLocaleString("en-IN")}
                                                </td>

                                                <td className="money-cell left-money">
                                                    ₹{amountLeft.toLocaleString("en-IN")}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status-badge ${
                                                            status.toLowerCase() === "paid"
                                                                ? "status-green"
                                                                : status.toLowerCase() === "partially paid"
                                                                    ? "status-blue"
                                                                    : "status-gray"
                                                        }`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>

                                            </tr>

                                        );

                                    })}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        );

    };

    // =====================================================
    // DOCTOR NOTES PAGE
    // =====================================================

    const renderDoctorNotesPage = () => {

        return (

            <div>

                {renderPageHeader(
                    "Doctor Notes",
                    `${doctorNotes.length} clinical notes in ${selectedBranchName}`
                )}


                {doctorNotes.length === 0 ? (

                    <div className="data-card">

                        <div className="table-empty">
                            No doctor notes found for this branch.
                        </div>

                    </div>

                ) : (

                    <div className="notes-grid">

                        {doctorNotes.map(
                            (note, index) => (

                                <div
                                    className="note-card"
                                    key={
                                        note._id ||
                                        index
                                    }
                                >

                                    <div className="note-icon">
                                        <FileText size={21} />
                                    </div>

                                    <div>

                                        <div className="note-card-header">

                                            <h3>
                                                Patient #
                                                {
                                                    note.patient_id
                                                }
                                            </h3>

                                        </div>


                                        <p>
                                            {note.note ||
                                                note.notes ||
                                                note.content ||
                                                "Clinical note"}
                                        </p>


                                        {note.doctor_id && (

                                            <span>
                                                Doctor #
                                                {
                                                    note.doctor_id
                                                }
                                            </span>

                                        )}

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        );

    };


    // =====================================================
    // IOT VITALS PAGE
    // =====================================================

    const renderVitalsPage = () => {

        return (

            <div>

                {renderPageHeader(
                    "IoT Vitals",
                    `${vitals.length} vital records in ${selectedBranchName}`
                )}


                {vitals.length === 0 ? (

                    <div className="data-card">

                        <div className="table-empty">
                            No IoT vitals found for this branch.
                        </div>

                    </div>

                ) : (

                    <div className="data-card">

                        <div className="table-wrapper">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Patient
                                        </th>

                                        <th>
                                            Heart Rate
                                        </th>

                                        <th>
                                            GSR
                                        </th>

                                        <th>
                                            Temperature
                                        </th>

                                        <th>
                                            Air Quality
                                        </th>

                                        <th>
                                            Recorded At
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {vitals.map(
                                        (vital, index) => (

                                            <tr
                                                key={
                                                    vital._id ||
                                                    index
                                                }
                                            >

                                                <td>

                                                    <span className="id-badge">
                                                        Patient #
                                                        {
                                                            vital.patient_id
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    {vital.heart_rate ??
                                                        vital.heartRate ??
                                                        "—"}

                                                    {(
                                                        vital.heart_rate ??
                                                        vital.heartRate
                                                    ) !==
                                                        undefined &&
                                                        " BPM"}

                                                </td>

                                                <td>
                                                    {
                                                        vital.gsr ??
                                                        vital.gsr_value ??
                                                        "—"
                                                    }
                                                </td>

                                                <td>

                                                    {
                                                        vital.temperature ??
                                                        vital.temp ??
                                                        "—"
                                                    }

                                                    {(
                                                        vital.temperature ??
                                                        vital.temp
                                                    ) !==
                                                        undefined &&
                                                        " °C"}

                                                </td>

                                                <td>
                                                    {
                                                        vital.air_quality ??
                                                        vital.airQuality ??
                                                        "—"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        vital.timestamp
                                                            ? new Date(
                                                                vital.timestamp
                                                            ).toLocaleString()
                                                            : "—"
                                                    }
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

            </div>

        );

    };


    // =====================================================
    // SETTINGS PAGE
    // =====================================================

    const renderSettingsPage = () => {

        return (

            <div>

                {renderPageHeader(
                    "Settings",
                    "System configuration and information"
                )}


                <div className="settings-grid">

                    <div className="setting-item">

                        <div className="setting-icon">
                            <Building2 size={20} />
                        </div>

                        <div>

                            <strong>
                                Current Branch
                            </strong>

                            <span>
                                {selectedBranchName}
                            </span>

                        </div>

                    </div>


                    <div className="setting-item">

                        <div className="setting-icon">
                            <Activity size={20} />
                        </div>

                        <div>

                            <strong>
                                PostgreSQL Database
                            </strong>

                            <span className="system-online">
                                Connected
                            </span>

                        </div>

                    </div>


                    <div className="setting-item">

                        <div className="setting-icon">
                            <FileText size={20} />
                        </div>

                        <div>

                            <strong>
                                MongoDB Database
                            </strong>

                            <span className="system-online">
                                Connected
                            </span>

                        </div>

                    </div>


                    <div className="setting-item">

                        <div className="setting-icon">
                            <Settings size={20} />
                        </div>

                        <div>

                            <strong>
                                Application
                            </strong>

                            <span>
                                CityCare Hospital Management
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        );

    };


    // =====================================================
    // DASHBOARD
    // =====================================================

    const renderDashboard = () => {

        return (

            <>

                {/* WELCOME */}

                <div className="welcome-card">

                    <div className="welcome-content">

                        <span className="welcome-label">
                            CITYCARE HOSPITAL
                        </span>

                        <h2>
                            Good Morning, Admin 👋
                        </h2>

                        <p>
                            Here's what's happening across
                            your hospital branches today.
                        </p>

                    </div>

                    <div className="welcome-illustration">

                        <Building2
                            size={72}
                            strokeWidth={1.3}
                        />

                    </div>

                </div>


                {/* ERROR */}

                {error && (

                    <div
                        style={{
                            marginTop: "16px",
                            padding: "12px 16px",
                            borderRadius: "10px",
                            background:
                                "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                            fontSize: "14px"
                        }}
                    >
                        {error}
                    </div>

                )}


                {/* SELECTED BRANCH */}

                <div className="selected-branch-label">

                    Showing data for:

                    <strong>
                        {selectedBranchName}
                    </strong>

                </div>


                {/* STAT CARDS */}

                <div className="stats-grid">


                    <div className="stat-card">

                        <div className="stat-icon blue">
                            <Users size={21} />
                        </div>

                        <div className="stat-info">

                            <span>
                                Total Patients
                            </span>

                            <div className="stat-value-row">

                                <h2>
                                    {loading
                                        ? "—"
                                        : patientCount}
                                </h2>

                                <small className="positive">
                                    Registered
                                </small>

                            </div>

                            <p>
                                Registered patients
                            </p>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon purple">
                            <Stethoscope size={21} />
                        </div>

                        <div className="stat-info">

                            <span>
                                Total Doctors
                            </span>

                            <div className="stat-value-row">

                                <h2>
                                    {loading
                                        ? "—"
                                        : doctorCount}
                                </h2>

                                <small className="positive">
                                    Active
                                </small>

                            </div>

                            <p>
                                Across selected branch
                            </p>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon orange">
                            <CalendarDays size={21} />
                        </div>

                        <div className="stat-info">

                            <span>
                                Appointments
                            </span>

                            <div className="stat-value-row">

                                <h2>
                                    {loading
                                        ? "—"
                                        : appointmentCount}
                                </h2>

                                <small className="positive">
                                    Total
                                </small>

                            </div>

                            <p>
                                Scheduled & completed
                            </p>

                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon green">
                            <BedDouble size={21} />
                        </div>

                        <div className="stat-info">

                            <span>
                                Admissions
                            </span>

                            <div className="stat-value-row">

                                <h2>
                                    {loading
                                        ? "—"
                                        : admissionCount}
                                </h2>

                                <small className="warning">
                                    {activeAdmissions} active
                                </small>

                            </div>

                            <p>
                                Current hospital admissions
                            </p>

                        </div>

                    </div>

                </div>


                {/* QUICK ACTIONS */}

                <div className="section-header">

                    <div>

                        <h3>
                            Quick Actions
                        </h3>

                        <p>
                            Frequently used hospital operations
                        </p>

                    </div>

                </div>


                <div className="quick-actions">

                    <button
                        className="quick-action"
                        onClick={() =>
                            setCurrentPage("patients")
                        }
                    >

                        <div className="quick-icon blue">
                            <UserPlus size={20} />
                        </div>

                        <div>

                            <strong>
                                Add Patient
                            </strong>

                            <span>
                                Register a new patient
                            </span>

                        </div>

                        <ArrowUpRight size={16} />

                    </button>


                    <button
                        className="quick-action"
                        onClick={() =>
                            setCurrentPage("appointments")
                        }
                    >

                        <div className="quick-icon purple">
                            <CalendarPlus size={20} />
                        </div>

                        <div>

                            <strong>
                                Book Appointment
                            </strong>

                            <span>
                                Schedule a consultation
                            </span>

                        </div>

                        <ArrowUpRight size={16} />

                    </button>


                    <button
                        className="quick-action"
                        onClick={() =>
                            setCurrentPage("rooms")
                        }
                    >

                        <div className="quick-icon green">
                            <DoorOpen size={20} />
                        </div>

                        <div>

                            <strong>
                                View Rooms
                            </strong>

                            <span>
                                Check room availability
                            </span>

                        </div>

                        <ArrowUpRight size={16} />

                    </button>


                    <button
                        className="quick-action"
                        onClick={() =>
                            setCurrentPage("billing")
                        }
                    >

                        <div className="quick-icon orange">
                            <CreditCard size={20} />
                        </div>

                        <div>

                            <strong>
                                Record Payment
                            </strong>

                            <span>
                                Manage hospital billing
                            </span>

                        </div>

                        <ArrowUpRight size={16} />

                    </button>

                </div>


                {/* BRANCH + ROOM */}

                <div className="dashboard-grid">


                    {/* BRANCHES */}

                    <div className="dashboard-card">

                        <div className="card-header">

                            <div>

                                <h3>
                                    Hospital Branches
                                </h3>

                                <p>
                                    Overview of CityCare branches
                                </p>

                            </div>

                            <button
                                className="view-all-button"
                                onClick={() =>
                                    setCurrentPage("branches")
                                }
                            >
                                View all
                                <ArrowUpRight size={14} />
                            </button>

                        </div>


                        <div className="branch-list">

                            {loading ? (

                                <div className="empty-state">
                                    Loading branches...
                                </div>

                            ) : visibleBranches.length ===
                                0 ? (

                                <div className="empty-state">
                                    No branches found.
                                </div>

                            ) : (

                                visibleBranches.map(
                                    (branch) => (

                                        <div
                                            className="branch-row"
                                            key={
                                                branch.branch_id
                                            }
                                        >

                                            <div className="branch-main">

                                                <div className="branch-icon">

                                                    <Building2
                                                        size={20}
                                                    />

                                                </div>

                                                <div>

                                                    <strong>
                                                        {
                                                            branch.branch_name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            branch.city
                                                        }

                                                        {branch.state
                                                            ? `, ${branch.state}`
                                                            : ""}
                                                    </span>

                                                </div>

                                            </div>

                                            <div className="branch-stats">

                                                <span>

                                                    {
                                                        getBranchRoomCount(
                                                            branch.branch_id
                                                        )
                                                    }{" "}
                                                    Rooms

                                                </span>

                                                <span className="active-status">
                                                    Active
                                                </span>

                                            </div>

                                        </div>

                                    )
                                )

                            )}

                        </div>

                    </div>


                    {/* ROOM OCCUPANCY */}

                    <div className="dashboard-card">

                        <div className="card-header">

                            <div>

                                <h3>
                                    Room Occupancy
                                </h3>

                                <p>

                                    {selectedBranch ===
                                        "all"
                                        ? "Across all hospital branches"
                                        : `Across ${selectedBranchName}`}

                                </p>

                            </div>

                            <span className="total-label">

                                {loading
                                    ? "—"
                                    : `${totalRooms} Total`}

                            </span>

                        </div>


                        <div className="room-stat-container">

                            <div className="room-stat">

                                <span className="room-number vacant">
                                    {loading
                                        ? "—"
                                        : vacantRooms}
                                </span>

                                <span>
                                    Vacant
                                </span>

                            </div>


                            <div className="room-divider"></div>


                            <div className="room-stat">

                                <span className="room-number occupied">
                                    {loading
                                        ? "—"
                                        : occupiedRooms}
                                </span>

                                <span>
                                    Occupied
                                </span>

                            </div>

                        </div>


                        <div className="occupancy-bar">

                            <div
                                className="vacant-progress"
                                style={{
                                    width:
                                        `${vacantPercentage}%`
                                }}
                            />

                            <div
                                className="occupied-progress"
                                style={{
                                    width:
                                        `${occupiedPercentage}%`
                                }}
                            />

                        </div>


                        <div className="occupancy-footer">

                            <span>

                                <i className="dot vacant-dot"></i>

                                Vacant rooms

                            </span>

                            <span>

                                <i className="dot occupied-dot"></i>

                                Occupied rooms

                            </span>

                        </div>

                    </div>

                </div>


                {/* APPOINTMENTS + ACTIVITY */}

                <div className="dashboard-grid bottom-grid">


                    {/* APPOINTMENTS */}

                    <div className="dashboard-card appointments-card">

                        <div className="card-header">

                            <div>

                                <h3>
                                    Recent Appointments
                                </h3>

                                <p>
                                    Latest scheduled consultations
                                </p>

                            </div>

                            <button
                                className="view-all-button"
                                onClick={() =>
                                    setCurrentPage(
                                        "appointments"
                                    )
                                }
                            >

                                View all

                                <ArrowUpRight size={14} />

                            </button>

                        </div>


                        <div className="appointment-list">

                            {appointments
                                .slice(0, 4)
                                .map(
                                    (
                                        appointment,
                                        index
                                    ) => (

                                        <div
                                            className="appointment-row"
                                            key={
                                                appointment.appointment_id
                                            }
                                        >

                                            <div className="appointment-time">

                                                <strong>
                                                    {
                                                        appointment.time ||
                                                        "--:--"
                                                    }
                                                </strong>

                                            </div>


                                            <div className="appointment-patient">

                                                <div className="patient-avatar">

                                                    {`P${
                                                        appointment.patient_id
                                                    }`}

                                                </div>

                                                <div>

                                                    <strong>
                                                        Patient #
                                                        {
                                                            appointment.patient_id
                                                        }
                                                    </strong>

                                                    <span>
                                                        Appointment
                                                    </span>

                                                </div>

                                            </div>


                                            <div className="appointment-doctor">

                                                <span>
                                                    Doctor
                                                </span>

                                                <strong>
                                                    Dr. #
                                                    {
                                                        appointment.doctor_id
                                                    }
                                                </strong>

                                            </div>


                                            <span
                                                className={
                                                    appointment.status?.toLowerCase() ===
                                                    "completed"
                                                        ? "completed-badge"
                                                        : "scheduled-badge"
                                                }
                                            >
                                                {
                                                    appointment.status ||
                                                    "Scheduled"
                                                }
                                            </span>

                                            <MoreHorizontal
                                                size={17}
                                            />

                                        </div>

                                    )
                                )}

                        </div>

                    </div>


                    {/* ACTIVITY */}

                    <div className="dashboard-card activity-card">

                        <div className="card-header">

                            <div>

                                <h3>
                                    System Overview
                                </h3>

                                <p>
                                    Current branch statistics
                                </p>

                            </div>

                            <Clock3 size={18} />

                        </div>


                        <div className="activity-list">

                            <div className="activity-item">

                                <div className="activity-icon blue">
                                    <Users size={16} />
                                </div>

                                <div>

                                    <strong>
                                        Patients
                                    </strong>

                                    <span>
                                        {patientCount} registered
                                    </span>

                                </div>

                            </div>


                            <div className="activity-item">

                                <div className="activity-icon purple">
                                    <Stethoscope size={16} />
                                </div>

                                <div>

                                    <strong>
                                        Doctors
                                    </strong>

                                    <span>
                                        {doctorCount} active
                                    </span>

                                </div>

                            </div>


                            <div className="activity-item">

                                <div className="activity-icon green">
                                    <BedDouble size={16} />
                                </div>

                                <div>

                                    <strong>
                                        Rooms
                                    </strong>

                                    <span>
                                        {vacantRooms} vacant /{" "}
                                        {occupiedRooms} occupied
                                    </span>

                                </div>

                            </div>


                            <div className="activity-item">

                                <div className="activity-icon orange">
                                    <Activity size={16} />
                                </div>

                                <div>

                                    <strong>
                                        IoT Vitals
                                    </strong>

                                    <span>
                                        {vitals.length} records
                                    </span>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </>

        );

    };


    // =====================================================
    // RENDER CURRENT PAGE
    // =====================================================

    const renderCurrentPage = () => {

        switch (currentPage) {

            case "branches":
                return renderBranchesPage();

            case "patients":
                return renderPatientsPage();

            case "doctors":
                return renderDoctorsPage();

            case "appointments":
                return renderAppointmentsPage();

            case "admissions":
                return renderAdmissionsPage();

            case "rooms":
                return renderRoomsPage();

            case "billing":
                return renderBillingPage();

            case "doctorNotes":
                return renderDoctorNotesPage();

            case "vitals":
                return renderVitalsPage();

            case "settings":
                return renderSettingsPage();

            case "dashboard":
            default:
                return renderDashboard();

        }

    };


    // =====================================================
    // PORTAL VIEWS
    // =====================================================

    const getUserDisplayName = () => {
        const profile = authenticatedUser?.profile;

        if (profile?.first_name) {
            return `${profile.first_name} ${profile.last_name || ""}`.trim();
        }

        return authenticatedUser?.email || "User";
    };

    const renderDoctorPortal = () => {
        const doctorId = authenticatedUser?.doctor_id;
        const branchId = authenticatedUser?.branch_id;

        // Keep the doctor portal restricted to the authenticated doctor
        // and the authenticated hospital branch.
        const doctorAppointments = appointments
            .filter(
                (appointment) =>
                    Number(appointment.doctor_id) === Number(doctorId) &&
                    Number(appointment.branch_id) === Number(branchId)
            )
            .sort((a, b) => {
                const first = `${a.date || ""} ${a.time || ""}`;
                const second = `${b.date || ""} ${b.time || ""}`;
                return first.localeCompare(second);
            });

        const doctorNotesForUser = doctorNotes.filter(
            (note) =>
                Number(note.doctor_id) === Number(doctorId) &&
                Number(note.branch_id || branchId) === Number(branchId)
        );

        const doctorPatientIds = [
            ...new Set(
                doctorAppointments.map((appointment) =>
                    Number(appointment.patient_id)
                )
            )
        ];

        const doctorPatients = patients.filter((patient) =>
            doctorPatientIds.includes(Number(patient.patient_id))
        );

        const patientById = Object.fromEntries(
            doctorPatients.map((patient) => [
                Number(patient.patient_id),
                patient
            ])
        );

        // Project/demo date used by the hospital dataset.
        // The current appointment data uses 28 September 2026 as "today".
        // Keeping this as a YYYY-MM-DD string also avoids timezone conversion
        // issues with PostgreSQL DATE values.
        const today = "2026-09-28";

        // PostgreSQL DATE values may arrive through the API as either:
        //   2026-09-28
        // or an ISO timestamp such as:
        //   2026-09-27T18:30:00.000Z
        // The latter represents 28/09/2026 in India (IST).
        // Always normalize appointment dates using Asia/Kolkata so the
        // dashboard does not show the previous day because of UTC conversion.
        const getDateKey = (dateValue) => {
            if (!dateValue) return "";

            const raw = String(dateValue);

            // A true PostgreSQL DATE string should be used directly.
            if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
                return raw;
            }

            // API timestamp -> Indian calendar date.
            const parsed = new Date(raw);
            if (Number.isNaN(parsed.getTime())) return raw.slice(0, 10);

            const parts = new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Kolkata",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).formatToParts(parsed);

            const year = parts.find((part) => part.type === "year")?.value;
            const month = parts.find((part) => part.type === "month")?.value;
            const day = parts.find((part) => part.type === "day")?.value;

            return year && month && day
                ? `${year}-${month}-${day}`
                : raw.slice(0, 10);
        };

        const formatDateIndian = (dateValue) => {
            const dateKey = getDateKey(dateValue);
            if (!dateKey || dateKey.length !== 10) return "—";

            const [year, month, day] = dateKey.split("-");
            if (!year || !month || !day) return "—";

            return `${day}/${month}/${year}`;
        };

        const todaysAppointments = doctorAppointments.filter(
            (appointment) => getDateKey(appointment.date) === today
        );

        const upcomingAppointments = doctorAppointments.filter(
            (appointment) =>
                getDateKey(appointment.date) > today &&
                String(appointment.status || "").toLowerCase() !== "completed"
        );

        const getPatientName = (patientId) => {
            const patient = patientById[Number(patientId)];

            if (!patient) {
                return `Patient #${patientId}`;
            }

            return `${patient.first_name || ""} ${patient.last_name || ""}`.trim();
        };

        const getBranchName = () => {
            const branch = branches.find(
                (item) => Number(item.branch_id) === Number(branchId)
            );

            return branch?.branch_name ||
                (Number(branchId) === 1 ? "CityCare Hospital - Surat Branch" :
                    Number(branchId) === 2 ? "CityCare Hospital - Valsad Branch" :
                        "Hospital Branch");
        };

        return (
            <div className="app">
                <main
                    className="main-content"
                    style={{ marginLeft: 0, width: "100%" }}
                >
                    <header className="topbar">
                        <div className="topbar-left">
                            <div className="page-heading">
                                <h1>Doctor Portal</h1>
                                <p>
                                    Welcome back, Dr. {getUserDisplayName()}
                                </p>
                            </div>
                        </div>

                        <div className="topbar-right">
                            <div className="topbar-profile">
                                <div className="profile-avatar">
                                    {(getUserDisplayName()[0] || "D").toUpperCase()}
                                </div>

                                <div className="profile-details">
                                    <strong>{getUserDisplayName()}</strong>
                                    <span>Doctor</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="primary-action"
                                onClick={() => {
                                    setAuthenticatedUser(null);
                                    setSelectedRole(null);
                                    setSelectedAuthBranch(null);
                                    setCurrentPage("dashboard");
                                    setSelectedBranch("all");
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </header>

                    <section className="dashboard-content">

                        {/* PROFILE HEADER */}
                        <div className="page-section-header">
                            <div>
                                <h2>My Dashboard</h2>
                                <p>
                                    {authenticatedUser?.profile?.specialization ||
                                        "Medical professional"} · {getBranchName()}
                                </p>
                            </div>
                        </div>

                        {/* DOCTOR PROFILE */}
                        <div
                            className="data-card"
                            style={{
                                marginBottom: "24px",
                                padding: "20px"
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "16px",
                                    flexWrap: "wrap"
                                }}
                            >
                                <div
                                    className="profile-avatar"
                                    style={{
                                        width: "58px",
                                        height: "58px",
                                        fontSize: "22px"
                                    }}
                                >
                                    {(getUserDisplayName()[0] || "D").toUpperCase()}
                                </div>

                                <div style={{ flex: 1, minWidth: "220px" }}>
                                    <h3 style={{ margin: 0 }}>
                                        Dr. {getUserDisplayName()}
                                    </h3>
                                    <p style={{ margin: "5px 0", color: "#64748b" }}>
                                        {authenticatedUser?.profile?.specialization ||
                                            "Doctor"}
                                    </p>
                                    <span style={{ color: "#64748b", fontSize: "13px" }}>
                                        Doctor ID: D{doctorId} · {getBranchName()}
                                    </span>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "22px",
                                        flexWrap: "wrap"
                                    }}
                                >
                                    <div>
                                        <span style={{ color: "#64748b", fontSize: "12px" }}>
                                            Qualification
                                        </span>
                                        <strong style={{ display: "block" }}>
                                            {authenticatedUser?.profile?.qualification || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span style={{ color: "#64748b", fontSize: "12px" }}>
                                            Experience
                                        </span>
                                        <strong style={{ display: "block" }}>
                                            {authenticatedUser?.profile?.experience_years ?? "—"} years
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SUMMARY CARDS */}
                        <div className="page-stat-grid">
                            <div className="page-stat-card">
                                <CalendarDays size={22} />
                                <div>
                                    <span>My Appointments</span>
                                    <strong>{doctorAppointments.length}</strong>
                                </div>
                            </div>

                            <div className="page-stat-card green-card">
                                <Clock3 size={22} />
                                <div>
                                    <span>Today's Appointments</span>
                                    <strong>{todaysAppointments.length}</strong>
                                </div>
                            </div>

                            <div className="page-stat-card purple-card">
                                <Users size={22} />
                                <div>
                                    <span>My Patients</span>
                                    <strong>{doctorPatients.length}</strong>
                                </div>
                            </div>

                            <div className="page-stat-card orange-card">
                                <FileText size={22} />
                                <div>
                                    <span>Doctor Notes</span>
                                    <strong>{doctorNotesForUser.length}</strong>
                                </div>
                            </div>
                        </div>

                        {completionError && (
                            <div
                                style={{
                                    marginTop: "16px",
                                    padding: "12px 14px",
                                    borderRadius: "9px",
                                    background: "#fef2f2",
                                    border: "1px solid #fecaca",
                                    color: "#b91c1c",
                                    fontSize: "13px"
                                }}
                            >
                                {completionError}
                            </div>
                        )}

                        {/* TODAY'S APPOINTMENTS */}
                        <div
                            className="data-card"
                            style={{ marginTop: "24px" }}
                        >
                            <div className="data-card-header">
                                <div>
                                    <h3>Today's Appointments</h3>
                                    <p>Appointments scheduled for today</p>
                                </div>
                            </div>

                            {todaysAppointments.length === 0 ? (
                                <div className="table-empty">
                                    No appointments scheduled for today.
                                </div>
                            ) : (
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Appointment</th>
                                                <th>Patient</th>
                                                <th>Time</th>
                                                <th>Reason</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {todaysAppointments.map((appointment) => (
                                                <tr key={appointment.appointment_id}>
                                                    <td>
                                                        <span className="id-badge orange-id">
                                                            A{appointment.appointment_id}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedDoctorPatient({
                                                                    patient: patientById[Number(appointment.patient_id)],
                                                                    appointment
                                                                })
                                                            }
                                                            style={{
                                                                background: "none",
                                                                border: "none",
                                                                padding: 0,
                                                                cursor: "pointer",
                                                                textAlign: "left"
                                                            }}
                                                        >
                                                            <strong style={{ color: "#2563eb" }}>
                                                                {getPatientName(appointment.patient_id)}
                                                            </strong>
                                                            <span style={{
                                                                display: "block",
                                                                color: "#64748b",
                                                                fontSize: "12px",
                                                                marginTop: "3px"
                                                            }}>
                                                                P{appointment.patient_id} · View Details
                                                            </span>
                                                        </button>
                                                    </td>

                                                    <td>{appointment.time || "—"}</td>

                                                    <td>
                                                        {appointment.reason || "—"}
                                                    </td>

                                                    <td>
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "8px",
                                                                flexWrap: "wrap"
                                                            }}
                                                        >
                                                            <span
                                                                className={`status-badge ${
                                                                    String(
                                                                        appointment.status || "Scheduled"
                                                                    ).toLowerCase() === "completed"
                                                                        ? "status-green"
                                                                        : "status-blue"
                                                                }`}
                                                            >
                                                                {appointment.status || "Scheduled"}
                                                            </span>

                                                            {String(
                                                                appointment.status || "Scheduled"
                                                            ).toLowerCase() !== "completed" && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleCompleteAppointment(
                                                                            appointment.appointment_id
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        completingAppointmentId ===
                                                                        Number(
                                                                            appointment.appointment_id
                                                                        )
                                                                    }
                                                                    style={{
                                                                        padding: "7px 12px",
                                                                        border: "1px solid #bbf7d0",
                                                                        background: "#f0fdf4",
                                                                        color: "#15803d",
                                                                        borderRadius: "8px",
                                                                        fontSize: "12px",
                                                                        fontWeight: 600,
                                                                        cursor:
                                                                            completingAppointmentId ===
                                                                            Number(
                                                                                appointment.appointment_id
                                                                            )
                                                                                ? "not-allowed"
                                                                                : "pointer",
                                                                        opacity:
                                                                            completingAppointmentId ===
                                                                            Number(
                                                                                appointment.appointment_id
                                                                            )
                                                                                ? 0.6
                                                                                : 1
                                                                    }}
                                                                >
                                                                    {completingAppointmentId ===
                                                                    Number(
                                                                        appointment.appointment_id
                                                                    )
                                                                        ? "Completing..."
                                                                        : "Complete"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* UPCOMING APPOINTMENTS */}
                        <div
                            className="data-card"
                            style={{ marginTop: "24px" }}
                        >
                            <div className="data-card-header">
                                <div>
                                    <h3>Upcoming Appointments</h3>
                                    <p>Your upcoming patient appointments</p>
                                </div>
                            </div>

                            {upcomingAppointments.length === 0 ? (
                                <div className="table-empty">
                                    No upcoming appointments.
                                </div>
                            ) : (
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Appointment</th>
                                                <th>Patient</th>
                                                <th>Date</th>
                                                <th>Time</th>
                                                <th>Reason</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {upcomingAppointments.slice(0, 8).map(
                                                (appointment) => (
                                                    <tr key={appointment.appointment_id}>
                                                        <td>A{appointment.appointment_id}</td>

                                                        <td>
                                                            {getPatientName(
                                                                appointment.patient_id
                                                            )}
                                                        </td>

                                                        <td>
                                                            {formatDateIndian(appointment.date)}
                                                        </td>

                                                        <td>
                                                            {appointment.time || "—"}
                                                        </td>

                                                        <td>
                                                            {appointment.reason || "—"}
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`status-badge ${
                                                                    String(
                                                                        appointment.status || "Scheduled"
                                                                    ).toLowerCase() === "completed"
                                                                        ? "status-green"
                                                                        : "status-blue"
                                                                }`}
                                                            >
                                                                {appointment.status || "Scheduled"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* MY PATIENTS */}
                        <div
                            className="data-card"
                            style={{ marginTop: "24px" }}
                        >
                            <div className="data-card-header">
                                <div>
                                    <h3>My Patients</h3>
                                    <p>Patients associated with your appointments</p>
                                </div>
                            </div>

                            {doctorPatients.length === 0 ? (
                                <div className="table-empty">
                                    No patients assigned to you yet.
                                </div>
                            ) : (
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Patient</th>
                                                <th>Patient ID</th>
                                                <th>Gender</th>
                                                <th>Blood Group</th>
                                                <th>Phone</th>
                                                <th>Allergies</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {doctorPatients.map((patient) => (
                                                <tr key={patient.patient_id}>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setSelectedDoctorPatient({
                                                                    patient,
                                                                    appointment:
                                                                        doctorAppointments.find(
                                                                            (appointment) =>
                                                                                Number(appointment.patient_id) ===
                                                                                Number(patient.patient_id)
                                                                        )
                                                                })
                                                            }
                                                            style={{
                                                                background: "none",
                                                                border: "none",
                                                                padding: 0,
                                                                cursor: "pointer",
                                                                textAlign: "left"
                                                            }}
                                                        >
                                                            <strong style={{ color: "#2563eb" }}>
                                                                {patient.first_name}{" "}
                                                                {patient.last_name || ""}
                                                            </strong>
                                                        </button>
                                                    </td>

                                                    <td>P{patient.patient_id}</td>
                                                    <td>{patient.gender || "—"}</td>
                                                    <td>{patient.blood_group || "—"}</td>
                                                    <td>{patient.phone || "—"}</td>
                                                    <td>{patient.allergies || "None recorded"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* CLINICAL INFORMATION */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                                gap: "24px",
                                marginTop: "24px"
                            }}
                        >
                            {/* NOTES */}
                            <div className="data-card">
                                <div className="data-card-header">
                                    <div>
                                        <h3>My Doctor Notes</h3>
                                        <p>Clinical notes recorded by you</p>
                                    </div>
                                </div>

                                {doctorNotesForUser.length === 0 ? (
                                    <div className="table-empty">
                                        No clinical notes found.
                                    </div>
                                ) : (
                                    <div style={{ padding: "0 20px 20px" }}>
                                        {doctorNotesForUser.slice(0, 5).map(
                                            (note, index) => (
                                                <div
                                                    key={note._id || index}
                                                    style={{
                                                        padding: "14px 0",
                                                        borderBottom:
                                                            index <
                                                            Math.min(
                                                                doctorNotesForUser.length,
                                                                5
                                                            ) - 1
                                                                ? "1px solid #e2e8f0"
                                                                : "none"
                                                    }}
                                                >
                                                    <strong>
                                                        {getPatientName(note.patient_id)}
                                                    </strong>

                                                    <p style={{
                                                        margin: "6px 0",
                                                        color: "#475569",
                                                        fontSize: "13px"
                                                    }}>
                                                        {note.note ||
                                                            note.notes ||
                                                            note.content ||
                                                            note.diagnosis ||
                                                            "Clinical note"}
                                                    </p>

                                                    {note.diagnosis && (
                                                        <span style={{
                                                            color: "#64748b",
                                                            fontSize: "12px"
                                                        }}>
                                                            Diagnosis: {note.diagnosis}
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* VITALS */}
                            <div className="data-card">
                                <div className="data-card-header">
                                    <div>
                                        <h3>Recent IoT Vitals</h3>
                                        <p>Latest available patient vital records</p>
                                    </div>
                                </div>

                                {vitals.length === 0 ? (
                                    <div className="table-empty">
                                        No IoT vitals available.
                                    </div>
                                ) : (
                                    <div className="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Patient</th>
                                                    <th>Heart Rate</th>
                                                    <th>SpO₂</th>
                                                    <th>Temperature</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {vitals
                                                    .filter((vital) =>
                                                        doctorPatientIds.includes(
                                                            Number(vital.patient_id)
                                                        )
                                                    )
                                                    .slice(0, 6)
                                                    .map((vital, index) => (
                                                        <tr key={vital._id || index}>
                                                            <td>
                                                                {getPatientName(
                                                                    vital.patient_id
                                                                )}
                                                            </td>
                                                            <td>
                                                                {vital.heart_rate ??
                                                                    vital.hr ??
                                                                    "—"}
                                                            </td>
                                                            <td>
                                                                {vital.spo2 ??
                                                                    vital.spO2 ??
                                                                    "—"}
                                                            </td>
                                                            <td>
                                                                {vital.temperature ??
                                                                    vital.temp ??
                                                                    "—"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                    </section>
                {/* PATIENT DETAILS MODAL */}
                {selectedDoctorPatient && selectedDoctorPatient.patient && (
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(15, 23, 42, 0.55)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 2000,
                            padding: "24px"
                        }}
                        onClick={() => setSelectedDoctorPatient(null)}
                    >
                        <div
                            className="data-card"
                            style={{
                                width: "min(900px, 100%)",
                                maxHeight: "90vh",
                                overflowY: "auto",
                                background: "#fff",
                                borderRadius: "16px",
                                boxShadow: "0 20px 50px rgba(0,0,0,0.18)"
                            }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            {(() => {
                                const patient = selectedDoctorPatient.patient;
                                const appointment = selectedDoctorPatient.appointment;

                                const patientAppointments = doctorAppointments
                                    .filter(
                                        (item) =>
                                            Number(item.patient_id) ===
                                            Number(patient.patient_id)
                                    )
                                    .sort((a, b) => {
                                        const first = `${a.date || ""} ${a.time || ""}`;
                                        const second = `${b.date || ""} ${b.time || ""}`;
                                        return second.localeCompare(first);
                                    });

                                const patientAdmissions = admissions.filter(
                                    (admission) =>
                                        Number(admission.patient_id) ===
                                        Number(patient.patient_id)
                                );

                                const patientNotes = doctorNotesForUser.filter(
                                    (note) =>
                                        Number(note.patient_id) ===
                                        Number(patient.patient_id)
                                );

                                const patientVitals = vitals
                                    .filter(
                                        (vital) =>
                                            Number(vital.patient_id) ===
                                            Number(patient.patient_id)
                                    )
                                    .slice(-3)
                                    .reverse();

                                return (
                                    <>
                                        <div
                                            className="data-card-header"
                                            style={{
                                                padding: "20px 24px",
                                                borderBottom: "1px solid #e5e7eb"
                                            }}
                                        >
                                            <div>
                                                <h3 style={{ marginBottom: "4px" }}>
                                                    Patient Details
                                                </h3>
                                                <p>
                                                    {patient.first_name}{" "}
                                                    {patient.last_name || ""} · P{patient.patient_id}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setSelectedDoctorPatient(null)}
                                                style={{
                                                    border: "none",
                                                    background: "#f1f5f9",
                                                    borderRadius: "8px",
                                                    padding: "8px 12px",
                                                    cursor: "pointer",
                                                    fontWeight: 600
                                                }}
                                            >
                                                Close
                                            </button>
                                        </div>

                                        <div style={{ padding: "24px" }}>
                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "repeat(auto-fit, minmax(200px, 1fr))",
                                                    gap: "14px"
                                                }}
                                            >
                                                {[
                                                    ["Patient ID", `P${patient.patient_id}`],
                                                    ["Gender", patient.gender || "—"],
                                                    ["Blood Group", patient.blood_group || "—"],
                                                    ["Phone", patient.phone || "—"]
                                                ].map(([label, value]) => (
                                                    <div className="page-stat-card" key={label}>
                                                        <div>
                                                            <span>{label}</span>
                                                            <strong>{value}</strong>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "repeat(auto-fit, minmax(280px, 1fr))",
                                                    gap: "20px",
                                                    marginTop: "22px"
                                                }}
                                            >
                                                <div className="data-card" style={{ padding: "20px" }}>
                                                    <h4 style={{ marginTop: 0 }}>
                                                        Patient Information
                                                    </h4>
                                                    <p>
                                                        <strong>Date of Birth:</strong>{" "}
                                                        {formatDateIndian(patient.date_of_birth)}
                                                    </p>
                                                    <p>
                                                        <strong>Email:</strong>{" "}
                                                        {patient.email || "—"}
                                                    </p>
                                                    <p>
                                                        <strong>Address:</strong>{" "}
                                                        {patient.address || "—"}
                                                    </p>
                                                    <p>
                                                        <strong>Allergies:</strong>{" "}
                                                        {patient.allergies || "None recorded"}
                                                    </p>
                                                    <p>
                                                        <strong>Insurance No:</strong>{" "}
                                                        {patient.insurance_no || "—"}
                                                    </p>
                                                </div>

                                                <div className="data-card" style={{ padding: "20px" }}>
                                                    <h4 style={{ marginTop: 0 }}>
                                                        Current Appointment
                                                    </h4>
                                                    {appointment ? (
                                                        <>
                                                            <p><strong>Appointment:</strong> A{appointment.appointment_id}</p>
                                                            <p><strong>Date:</strong> {formatDateIndian(appointment.date)}</p>
                                                            <p><strong>Time:</strong> {appointment.time || "—"}</p>
                                                            <p><strong>Reason:</strong> {appointment.reason || "—"}</p>
                                                            <p><strong>Status:</strong> {appointment.status || "Scheduled"}</p>
                                                        </>
                                                    ) : (
                                                        <p>No appointment selected.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="data-card" style={{ marginTop: "20px", padding: "20px" }}>
                                                <h4 style={{ marginTop: 0 }}>Appointment History</h4>
                                                {patientAppointments.length === 0 ? (
                                                    <p>No appointment history available.</p>
                                                ) : (
                                                    <div className="table-wrapper">
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th>Appointment</th>
                                                                    <th>Date</th>
                                                                    <th>Reason</th>
                                                                    <th>Status</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {patientAppointments.map((item) => (
                                                                    <tr key={item.appointment_id}>
                                                                        <td>A{item.appointment_id}</td>
                                                                        <td>{formatDateIndian(item.date)}</td>
                                                                        <td>{item.reason || "—"}</td>
                                                                        <td>{item.status || "—"}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>

                                            <div
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns:
                                                        "repeat(auto-fit, minmax(280px, 1fr))",
                                                    gap: "20px",
                                                    marginTop: "20px"
                                                }}
                                            >
                                                <div className="data-card" style={{ padding: "20px" }}>
                                                    <h4 style={{ marginTop: 0 }}>Admissions</h4>
                                                    {patientAdmissions.length === 0 ? (
                                                        <p>No admission records available.</p>
                                                    ) : (
                                                        patientAdmissions.map((admission) => (
                                                            <div key={admission.admission_id} style={{ padding: "10px 0", borderBottom: "1px solid #e5e7eb" }}>
                                                                <strong>Admission A{admission.admission_id}</strong>
                                                                <p style={{ margin: "5px 0" }}>
                                                                    Room: {admission.room_id ? `R${admission.room_id}` : "—"}
                                                                </p>
                                                                <p style={{ margin: "5px 0" }}>
                                                                    Status: {admission.status || "—"}
                                                                </p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                <div className="data-card" style={{ padding: "20px" }}>
                                                    <h4 style={{ marginTop: 0 }}>Recent IoT Vitals</h4>
                                                    {patientVitals.length === 0 ? (
                                                        <p>No IoT vitals available.</p>
                                                    ) : (
                                                        patientVitals.map((vital, index) => (
                                                            <div key={vital._id || index} style={{ padding: "10px 0", borderBottom: "1px solid #e5e7eb" }}>
                                                                <strong>
                                                                    Heart Rate: {vital.heart_rate ?? vital.hr ?? "—"} bpm
                                                                </strong>
                                                                <p style={{ margin: "5px 0" }}>
                                                                    SpO₂: {vital.spo2 ?? vital.spO2 ?? "—"} · Temp: {vital.temperature ?? vital.temp ?? "—"}
                                                                </p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <div className="data-card" style={{ marginTop: "20px", padding: "20px" }}>
                                                <h4 style={{ marginTop: 0 }}>Doctor Notes</h4>
                                                {patientNotes.length === 0 ? (
                                                    <p>No doctor notes available for this patient.</p>
                                                ) : (
                                                    patientNotes.map((note, index) => (
                                                        <div key={note._id || index} style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>
                                                            <strong>{note.diagnosis || "Clinical Note"}</strong>
                                                            <p style={{ margin: "6px 0" }}>
                                                                {note.notes || note.observations || "No additional notes recorded."}
                                                            </p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}

                </main>
            </div>
        );
    };

    const renderPatientPortal = () => {
        const patientId = authenticatedUser?.patient_id;
        const branchId = authenticatedUser?.branch_id;

        const patientAppointments = appointments.filter(
            (appointment) =>
                Number(appointment.patient_id) === Number(patientId) &&
                Number(appointment.branch_id) === Number(branchId)
        );

        const patientAdmissions = admissions.filter(
            (admission) => Number(admission.patient_id) === Number(patientId)
        );

        const patientBills = bills.filter(
            (bill) => Number(bill.patient_id) === Number(patientId)
        );

        const patientNotes = doctorNotes.filter(
            (note) => Number(note.patient_id) === Number(patientId)
        );

        const patientVitals = vitals.filter(
            (vital) => Number(vital.patient_id) === Number(patientId)
        );

        return (
            <div className="app">
                <main className="main-content" style={{ marginLeft: 0, width: "100%" }}>
                    <header className="topbar">
                        <div className="topbar-left">
                            <div className="page-heading">
                                <h1>Patient Portal</h1>
                                <p>Welcome back, {getUserDisplayName()}</p>
                            </div>
                        </div>

                        <div className="topbar-right">
                            <div className="topbar-profile">
                                <div className="profile-avatar">
                                    {(getUserDisplayName()[0] || "P").toUpperCase()}
                                </div>
                                <div className="profile-details">
                                    <strong>{getUserDisplayName()}</strong>
                                    <span>Patient</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="primary-action"
                                onClick={() => {
                                    setAuthenticatedUser(null);
                                    setSelectedRole(null);
                                    setSelectedAuthBranch(null);
                                    setCurrentPage("dashboard");
                                }}
                            >
                                Logout
                            </button>
                        </div>
                    </header>

                    <section className="dashboard-content">
                        <div className="page-section-header">
                            <div>
                                <h2>My Health Overview</h2>
                                <p>Your appointments, medical information and billing</p>
                            </div>
                        </div>

                        <div className="page-stat-grid">
                            <div className="page-stat-card">
                                <CalendarDays size={22} />
                                <div>
                                    <span>Appointments</span>
                                    <strong>{patientAppointments.length}</strong>
                                </div>
                            </div>

                            <div className="page-stat-card green-card">
                                <BedDouble size={22} />
                                <div>
                                    <span>Admissions</span>
                                    <strong>{patientAdmissions.length}</strong>
                                </div>
                            </div>

                            <div className="page-stat-card purple-card">
                                <FileText size={22} />
                                <div>
                                    <span>Medical Notes</span>
                                    <strong>{patientNotes.length}</strong>
                                </div>
                            </div>

                            <div className="page-stat-card orange-card">
                                <Activity size={22} />
                                <div>
                                    <span>Vital Records</span>
                                    <strong>{patientVitals.length}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="data-card" style={{ marginTop: "24px" }}>
                            <div className="data-card-header">
                                <div>
                                    <h3>My Appointments</h3>
                                    <p>Your upcoming and previous appointments</p>
                                </div>
                            </div>

                            {patientAppointments.length === 0 ? (
                                <div className="table-empty">No appointments found.</div>
                            ) : (
                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Appointment</th>
                                                <th>Doctor</th>
                                                <th>Date</th>
                                                <th>Time</th>
                                                <th>Reason</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {patientAppointments.map((appointment) => (
                                                <tr key={appointment.appointment_id}>
                                                    <td>A{appointment.appointment_id}</td>
                                                    <td>Dr. {appointment.doctor_id}</td>
                                                    <td>{appointment.date ? new Date(appointment.date).toLocaleDateString() : "—"}</td>
                                                    <td>{appointment.time || "—"}</td>
                                                    <td>{appointment.reason || "—"}</td>
                                                    <td>
                                                        <span className="status-badge status-blue">
                                                            {appointment.status || "Scheduled"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>
                </main>
            </div>
        );
    };


    // =====================================================
    // MAIN UI
    // =====================================================

    // Once authentication succeeds, route the user according to their role.
    if (authenticatedUser?.role === "doctor") {
        return renderDoctorPortal();
    }

    if (authenticatedUser?.role === "patient") {
        return renderPatientPortal();
    }

    if (!selectedRole && !authenticatedUser) {
        return (
            <RoleSelection
                onSelectRole={(role) => {
                    setSelectedRole(role);
                    setSelectedAuthBranch(null);
                }}
            />
        );
    }

    if (
        (selectedRole === "doctor" || selectedRole === "patient") &&
        !selectedAuthBranch
    ) {
        return (
            <BranchSelection
                role={selectedRole}
                onSelectBranch={(branch) => setSelectedAuthBranch(branch)}
                onBack={() => {
                    setSelectedRole(null);
                    setSelectedAuthBranch(null);
                }}
            />
        );
    }

    if (
        !authenticatedUser &&
        (
            selectedRole === "admin" ||
            ((selectedRole === "doctor" || selectedRole === "patient") &&
                selectedAuthBranch)
        )
    ) {
        return (
            <LoginPage
                role={selectedRole}
                branch={selectedAuthBranch}
                onLoginSuccess={(user) => {
                    setAuthenticatedUser(user);

                    // Admin stays on the existing dashboard.
                    if (user?.role === "admin") {
                        setCurrentPage("dashboard");
                        setSelectedBranch("all");
                    } else if (user?.branch_id) {
                        // Doctor/patient portal data should be restricted to
                        // their authenticated hospital branch.
                        setSelectedBranch(String(user.branch_id));
                    }
                }}
                onBack={() => {
                    if (selectedRole === "admin") {
                        setSelectedRole(null);
                        setSelectedAuthBranch(null);
                    } else {
                        setSelectedAuthBranch(null);
                    }
                }}
            />
        );
    }

    return (

        <div className="app">


            {/* SIDEBAR */}

            <Sidebar
                currentPage={currentPage}
                onPageChange={setCurrentPage}
            />


            {/* MAIN */}

            <main className="main-content">

                {renderTopbar()}


                <section className="dashboard-content">

                    {renderCurrentPage()}

                </section>

            </main>


            {addAppointmentOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15, 23, 42, 0.48)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px",
                        zIndex: 1000
                    }}
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !addingAppointment
                        ) {
                            setAddAppointmentOpen(false);
                        }
                    }}
                >
                    <div
                        style={{
                            width: "100%",
                            maxWidth: "620px",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            background: "#ffffff",
                            borderRadius: "16px",
                            boxShadow:
                                "0 24px 70px rgba(15, 23, 42, 0.25)",
                            padding: "26px"
                        }}
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: "20px"
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        color: "#0f172a",
                                        fontSize: "22px"
                                    }}
                                >
                                    Book Appointment
                                </h2>

                                <p
                                    style={{
                                        margin: "6px 0 0",
                                        color: "#64748b",
                                        fontSize: "13px"
                                    }}
                                >
                                    Briefly describe the patient's problem.
                                    The system will assign a suitable doctor.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    !addingAppointment &&
                                    setAddAppointmentOpen(false)
                                }
                                disabled={addingAppointment}
                                style={{
                                    border: "none",
                                    background: "#f1f5f9",
                                    color: "#475569",
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "9px",
                                    fontSize: "21px",
                                    cursor: addingAppointment
                                        ? "not-allowed"
                                        : "pointer"
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {appointmentFormError && (
                            <div
                                style={{
                                    marginBottom: "14px",
                                    padding: "11px 13px",
                                    background: "#fef2f2",
                                    border: "1px solid #fecaca",
                                    borderRadius: "9px",
                                    color: "#b91c1c",
                                    fontSize: "13px"
                                }}
                            >
                                {appointmentFormError}
                            </div>
                        )}

                        {appointmentFormSuccess && (
                            <div
                                style={{
                                    marginBottom: "14px",
                                    padding: "11px 13px",
                                    background: "#f0fdf4",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: "9px",
                                    color: "#15803d",
                                    fontSize: "13px"
                                }}
                            >
                                {appointmentFormSuccess}
                            </div>
                        )}

                        <form onSubmit={handleAddAppointment}>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(2, minmax(0, 1fr))",
                                    gap: "16px"
                                }}
                            >
                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            color: "#334155",
                                            fontSize: "13px",
                                            fontWeight: 600
                                        }}
                                    >
                                        Patient *
                                    </label>

                                    <select
                                        name="patient_id"
                                        value={
                                            appointmentForm.patient_id
                                        }
                                        onChange={
                                            handleAppointmentFormChange
                                        }
                                        disabled={addingAppointment}
                                        required
                                        style={{
                                            width: "100%",
                                            boxSizing: "border-box",
                                            padding: "11px 12px",
                                            border: "1px solid #dbe3ef",
                                            borderRadius: "9px",
                                            background: "#ffffff",
                                            color: "#0f172a"
                                        }}
                                    >
                                        <option value="">
                                            Select patient
                                        </option>

                                        {patients.map(
                                            (patient) => (
                                                <option
                                                    key={
                                                        patient.patient_id
                                                    }
                                                    value={
                                                        patient.patient_id
                                                    }
                                                >
                                                    Patient #
                                                    {
                                                        patient.patient_id
                                                    }
                                                    {" — "}
                                                    {
                                                        patient.first_name ||
                                                        ""
                                                    }
                                                    {" "}
                                                    {
                                                        patient.last_name ||
                                                        ""
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            color: "#334155",
                                            fontSize: "13px",
                                            fontWeight: 600
                                        }}
                                    >
                                        Problem *
                                    </label>

                                    <input
                                        type="text"
                                        name="reason"
                                        value={
                                            appointmentForm.reason
                                        }
                                        onChange={
                                            handleAppointmentFormChange
                                        }
                                        disabled={addingAppointment}
                                        required
                                        placeholder="e.g. severe headache and dizziness"
                                        style={{
                                            width: "100%",
                                            boxSizing: "border-box",
                                            padding: "11px 12px",
                                            border: "1px solid #dbe3ef",
                                            borderRadius: "9px",
                                            background: "#ffffff",
                                            color: "#0f172a"
                                        }}
                                    />
                                </div>

                                <div
                                    style={{
                                        gridColumn: "1 / -1"
                                    }}
                                >
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            color: "#334155",
                                            fontSize: "13px",
                                            fontWeight: 600
                                        }}
                                    >
                                        Automatically Assigned Doctor
                                    </label>

                                    <div
                                        style={{
                                            padding: "13px 14px",
                                            border: "1px solid #bfdbfe",
                                            borderRadius: "9px",
                                            background: "#eff6ff",
                                            color: "#1e3a8a",
                                            minHeight: "48px",
                                            display: "flex",
                                            alignItems: "center"
                                        }}
                                    >
                                        {appointmentForm.doctor_id
                                            ? (() => {
                                                const doctor =
                                                    doctors.find(
                                                        (item) =>
                                                            Number(
                                                                item.doctor_id
                                                            ) ===
                                                            Number(
                                                                appointmentForm.doctor_id
                                                            )
                                                    );

                                                return doctor
                                                    ? `Dr. ${doctor.first_name || ""} ${doctor.last_name || ""} — ${String(doctor.specialization || "").toLowerCase() === "general physician" ? "General Medicine" : doctor.specialization}`
                                                    : "No suitable doctor found";
                                            })()
                                            : appointmentForm.patient_id &&
                                              appointmentForm.reason
                                                ? "No suitable doctor found"
                                                : "Enter the patient's problem to assign a doctor"}
                                    </div>
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            color: "#334155",
                                            fontSize: "13px",
                                            fontWeight: 600
                                        }}
                                    >
                                        Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="date"
                                        value={
                                            appointmentForm.date
                                        }
                                        onChange={
                                            handleAppointmentFormChange
                                        }
                                        disabled={addingAppointment}
                                        required
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split("T")[0]
                                        }
                                        style={{
                                            width: "100%",
                                            boxSizing: "border-box",
                                            padding: "11px 12px",
                                            border: "1px solid #dbe3ef",
                                            borderRadius: "9px",
                                            background: "#ffffff",
                                            color: "#0f172a"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            color: "#334155",
                                            fontSize: "13px",
                                            fontWeight: 600
                                        }}
                                    >
                                        Time *
                                    </label>

                                    <input
                                        type="time"
                                        name="time"
                                        value={
                                            appointmentForm.time
                                        }
                                        onChange={
                                            handleAppointmentFormChange
                                        }
                                        disabled={addingAppointment}
                                        required
                                        style={{
                                            width: "100%",
                                            boxSizing: "border-box",
                                            padding: "11px 12px",
                                            border: "1px solid #dbe3ef",
                                            borderRadius: "9px",
                                            background: "#ffffff",
                                            color: "#0f172a"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            color: "#334155",
                                            fontSize: "13px",
                                            fontWeight: 600
                                        }}
                                    >
                                        Appointment Type *
                                    </label>

                                    <select
                                        name="appointment_type"
                                        value={
                                            appointmentForm.appointment_type
                                        }
                                        onChange={
                                            handleAppointmentFormChange
                                        }
                                        disabled={addingAppointment}
                                        required
                                        style={{
                                            width: "100%",
                                            boxSizing: "border-box",
                                            padding: "11px 12px",
                                            border: "1px solid #dbe3ef",
                                            borderRadius: "9px",
                                            background: "#ffffff",
                                            color: "#0f172a"
                                        }}
                                    >
                                        <option value="Consultation">
                                            Consultation
                                        </option>
                                        <option value="Follow-up">
                                            Follow-up
                                        </option>
                                        <option value="Emergency">
                                            Emergency
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div
                                style={{
                                    marginTop: "22px",
                                    paddingTop: "18px",
                                    borderTop:
                                        "1px solid #e2e8f0",
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "10px"
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        !addingAppointment &&
                                        setAddAppointmentOpen(false)
                                    }
                                    disabled={addingAppointment}
                                    style={{
                                        padding: "11px 18px",
                                        borderRadius: "9px",
                                        border:
                                            "1px solid #dbe3ef",
                                        background: "#ffffff",
                                        color: "#475569",
                                        fontWeight: 600,
                                        cursor: addingAppointment
                                            ? "not-allowed"
                                            : "pointer"
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        addingAppointment ||
                                        !appointmentForm.doctor_id
                                    }
                                    style={{
                                        padding: "11px 20px",
                                        borderRadius: "9px",
                                        border: "none",
                                        background: "#2563eb",
                                        color: "#ffffff",
                                        fontWeight: 600,
                                        cursor:
                                            addingAppointment ||
                                            !appointmentForm.doctor_id
                                                ? "not-allowed"
                                                : "pointer",
                                        opacity:
                                            addingAppointment ||
                                            !appointmentForm.doctor_id
                                                ? 0.7
                                                : 1
                                    }}
                                >
                                    {addingAppointment
                                        ? "Booking..."
                                        : "Book Appointment"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {addAdmissionOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15, 23, 42, 0.48)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px",
                        zIndex: 1000
                    }}
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !addingAdmission
                        ) {
                            setAddAdmissionOpen(false);
                        }
                    }}
                >

                    <div
                        style={{
                            width: "min(760px, 100%)",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            background: "#ffffff",
                            borderRadius: "18px",
                            boxShadow:
                                "0 24px 70px rgba(15, 23, 42, 0.25)",
                            padding: "28px"
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "22px"
                            }}
                        >

                            <div>

                                <h2
                                    style={{
                                        margin: 0,
                                        color: "#0f172a",
                                        fontSize: "24px"
                                    }}
                                >
                                    Admit Patient
                                </h2>

                                <p
                                    style={{
                                        margin: "6px 0 0",
                                        color: "#64748b",
                                        fontSize: "14px"
                                    }}
                                >
                                    Create a new hospital admission
                                </p>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    !addingAdmission &&
                                    setAddAdmissionOpen(false)
                                }
                                style={{
                                    border: "none",
                                    background: "#f1f5f9",
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "10px",
                                    fontSize: "22px",
                                    cursor: "pointer",
                                    color: "#475569"
                                }}
                            >
                                ×
                            </button>

                        </div>


                        {admissionFormError && (
                            <div
                                style={{
                                    background: "#fef2f2",
                                    color: "#b91c1c",
                                    border: "1px solid #fecaca",
                                    padding: "11px 14px",
                                    borderRadius: "10px",
                                    marginBottom: "16px",
                                    fontSize: "14px"
                                }}
                            >
                                {admissionFormError}
                            </div>
                        )}


                        {admissionFormSuccess && (
                            <div
                                style={{
                                    background: "#f0fdf4",
                                    color: "#15803d",
                                    border: "1px solid #bbf7d0",
                                    padding: "11px 14px",
                                    borderRadius: "10px",
                                    marginBottom: "16px",
                                    fontSize: "14px"
                                }}
                            >
                                {admissionFormSuccess}
                            </div>
                        )}


                        <form onSubmit={handleAddAdmission}>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(2, minmax(0, 1fr))",
                                    gap: "16px"
                                }}
                            >

                                {/* PATIENT */}

                                <div>

                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#334155"
                                        }}
                                    >
                                        Patient *
                                    </label>

                                    <select
                                        name="patient_id"
                                        value={admissionForm.patient_id}
                                        onChange={(event) => {

                                            const patientId =
                                                event.target.value;

                                            const patientAppointments =
                                                appointments
                                                    .filter(
                                                        (appointment) =>
                                                            Number(
                                                                appointment.patient_id
                                                            ) ===
                                                            Number(patientId) &&
                                                            (appointment.status || "")
                                                                .toLowerCase() !==
                                                            "cancelled"
                                                    )
                                                    .sort((a, b) => {

                                                        const aDate =
                                                            `${a.date || ""} ${a.time || ""}`;

                                                        const bDate =
                                                            `${b.date || ""} ${b.time || ""}`;

                                                        return (
                                                            new Date(bDate) -
                                                            new Date(aDate)
                                                        );

                                                    });

                                            const latestAppointment =
                                                patientAppointments[0] || null;

                                            setAdmissionForm(
                                                (previous) => ({
                                                    ...previous,
                                                    patient_id:
                                                        patientId,
                                                    doctor_id:
                                                        latestAppointment
                                                            ? String(
                                                                latestAppointment.doctor_id
                                                            )
                                                            : "",
                                                    room_id: "",
                                                    appointment_id:
                                                        latestAppointment
                                                            ? String(
                                                                latestAppointment.appointment_id
                                                            )
                                                            : ""
                                                })
                                            );

                                            setAdmissionFormError("");
                                            setAdmissionFormSuccess("");

                                        }}
                                        required
                                        style={{
                                            width: "100%",
                                            boxSizing: "border-box",
                                            padding: "11px 12px",
                                            border: "1px solid #dbe3ef",
                                            borderRadius: "9px",
                                            outline: "none",
                                            fontSize: "14px",
                                            color: "#0f172a",
                                            background: "#ffffff"
                                        }}
                                    >

                                        <option value="">
                                            Select Patient
                                        </option>

                                        {patients.map(
                                            (patient) => (
                                                <option
                                                    key={
                                                        patient.patient_id
                                                    }
                                                    value={
                                                        patient.patient_id
                                                    }
                                                >
                                                    P{patient.patient_id} —{" "}
                                                    {patient.first_name}{" "}
                                                    {patient.last_name || ""}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>


                                {/* DOCTOR */}

                                <div>

                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#334155"
                                        }}
                                    >
                                        Attending Doctor *
                                    </label>

                                    <select
                                        name="doctor_id"
                                        value={admissionForm.doctor_id}
                                        onChange={handleAdmissionFormChange}
                                        required
                                        disabled={!admissionForm.patient_id || !!admissionForm.appointment_id}
                                        style={{
                                            width: "100%",
                                            boxSizing: "border-box",
                                            padding: "11px 12px",
                                            border: "1px solid #dbe3ef",
                                            borderRadius: "9px",
                                            outline: "none",
                                            fontSize: "14px",
                                            color: "#0f172a",
                                            background: "#ffffff"
                                        }}
                                    >

                                        <option value="">
                                            {admissionForm.patient_id
                                                ? "No appointment found"
                                                : "Select Patient First"}
                                        </option>

                                        {doctors
                                            .filter((doctor) => {

                                                const patient =
                                                    patients.find(
                                                        (item) =>
                                                            Number(
                                                                item.patient_id
                                                            ) ===
                                                            Number(
                                                                admissionForm.patient_id
                                                            )
                                                    );

                                                return (
                                                    patient &&
                                                    Number(
                                                        doctor.branch_id
                                                    ) ===
                                                    Number(
                                                        patient.branch_id
                                                    )
                                                );

                                            })
                                            .map(
                                                (doctor) => (
                                                    <option
                                                        key={
                                                            doctor.doctor_id
                                                        }
                                                        value={
                                                            doctor.doctor_id
                                                        }
                                                    >
                                                        D{doctor.doctor_id} —{" "}
                                                        Dr.{" "}
                                                        {doctor.first_name}{" "}
                                                        {doctor.last_name || ""}
                                                    </option>
                                                )
                                            )}

                                    </select>

                                </div>


                                {/* ROOM */}

                                <div>

                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#334155"
                                        }}
                                    >
                                        Room *
                                    </label>

                                    <select
                                        name="room_id"
                                        value={admissionForm.room_id}
                                        onChange={handleAdmissionFormChange}
                                        required
                                        disabled={!admissionForm.patient_id}
                                        style={{
                                            width: "100%",
                                            boxSizing: "border-box",
                                            padding: "11px 12px",
                                            border: "1px solid #dbe3ef",
                                            borderRadius: "9px",
                                            outline: "none",
                                            fontSize: "14px",
                                            color: "#0f172a",
                                            background: "#ffffff"
                                        }}
                                    >

                                        <option value="">
                                            {admissionForm.patient_id
                                                ? "Select Available Room"
                                                : "Select Patient First"}
                                        </option>

                                        {rooms
                                            .filter((room) => {

                                                const patient =
                                                    patients.find(
                                                        (item) =>
                                                            Number(
                                                                item.patient_id
                                                            ) ===
                                                            Number(
                                                                admissionForm.patient_id
                                                            )
                                                    );

                                                return (
                                                    patient &&
                                                    Number(
                                                        room.branch_id
                                                    ) ===
                                                    Number(
                                                        patient.branch_id
                                                    ) &&
                                                    room.status?.toLowerCase() ===
                                                    "vacant"
                                                );

                                            })
                                            .map(
                                                (room) => (
                                                    <option
                                                        key={
                                                            room.room_id
                                                        }
                                                        value={
                                                            room.room_id
                                                        }
                                                    >
                                                        Room {room.room_id} —{" "}
                                                        {room.room_type ||
                                                            "General"}{" "}
                                                        — Floor{" "}
                                                        {room.floor_no ??
                                                            "—"}
                                                    </option>
                                                )
                                            )}

                                    </select>

                                </div>


                                {/* ADMISSION DATE */}

                                <div>

                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#334155"
                                        }}
                                    >
                                        Admit Date *
                                    </label>

                                    <input
                                        type="date"
                                        name="admit_date"
                                        value={admissionForm.admit_date}
                                        onChange={handleAdmissionFormChange}
                                        required
                                        style={{
                                            width: "100%",
                                            boxSizing: "border-box",
                                            padding: "11px 12px",
                                            border: "1px solid #dbe3ef",
                                            borderRadius: "9px",
                                            outline: "none",
                                            fontSize: "14px",
                                            color: "#0f172a"
                                        }}
                                    />

                                </div>


                                {/* ADMISSION TYPE */}

                                <div>

                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#334155"
                                        }}
                                    >
                                        Admission Type *
                                    </label>

                                    <select
                                        name="type"
                                        value={admissionForm.type}
                                        onChange={handleAdmissionFormChange}
                                        required
                                        style={{
                                            width: "100%",
                                            boxSizing: "border-box",
                                            padding: "11px 12px",
                                            border: "1px solid #dbe3ef",
                                            borderRadius: "9px",
                                            outline: "none",
                                            fontSize: "14px",
                                            color: "#0f172a",
                                            background: "#ffffff"
                                        }}
                                    >

                                        <option value="Inpatient">
                                            Inpatient
                                        </option>

                                        <option value="Emergency">
                                            Emergency
                                        </option>

                                        <option value="Surgery">
                                            Surgery
                                        </option>

                                        <option value="Observation">
                                            Observation
                                        </option>

                                    </select>

                                </div>


                                {/* RECENT APPOINTMENT */}

                                <div>

                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#334155"
                                        }}
                                    >
                                        Recent Appointment *
                                    </label>

                                    {(() => {

                                        const patientAppointments =
                                            appointments
                                                .filter(
                                                    (appointment) =>
                                                        Number(
                                                            appointment.patient_id
                                                        ) ===
                                                        Number(
                                                            admissionForm.patient_id
                                                        ) &&
                                                        (appointment.status || "")
                                                            .toLowerCase() !==
                                                        "cancelled"
                                                )
                                                .sort((a, b) => {

                                                    const aDate =
                                                        `${a.date || ""} ${a.time || ""}`;

                                                    const bDate =
                                                        `${b.date || ""} ${b.time || ""}`;

                                                    return (
                                                        new Date(bDate) -
                                                        new Date(aDate)
                                                    );

                                                });

                                        const latestAppointment =
                                            patientAppointments[0];

                                        return (

                                            <div
                                                style={{
                                                    width: "100%",
                                                    boxSizing: "border-box",
                                                    minHeight: "44px",
                                                    padding: "11px 12px",
                                                    border: "1px solid #dbe3ef",
                                                    borderRadius: "9px",
                                                    background: "#f8fafc",
                                                    color: latestAppointment
                                                        ? "#0f172a"
                                                        : "#64748b",
                                                    fontSize: "14px",
                                                    display: "flex",
                                                    alignItems: "center"
                                                }}
                                            >
                                                {latestAppointment
                                                    ? `A${latestAppointment.appointment_id} — ${
                                                        latestAppointment.date
                                                            ? new Date(
                                                                latestAppointment.date
                                                            ).toLocaleDateString()
                                                            : "No Date"
                                                    } — Dr. ${
                                                        latestAppointment.doctor_id
                                                    } — ${
                                                        latestAppointment.status ||
                                                        "Appointment"
                                                    }`
                                                    : admissionForm.patient_id
                                                        ? "No valid appointment found for this patient"
                                                        : "Select Patient First"}
                                            </div>

                                        );

                                    })()}

                                    <p
                                        style={{
                                            margin: "6px 0 0",
                                            color: "#64748b",
                                            fontSize: "11px"
                                        }}
                                    >
                                        The latest non-cancelled appointment is selected automatically.
                                    </p>

                                </div>

                            </div>


                            <div
                                style={{
                                    marginTop: "14px",
                                    padding: "11px 13px",
                                    background: "#f8fafc",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "9px",
                                    color: "#64748b",
                                    fontSize: "12px"
                                }}
                            >
                                Room status is updated by the PostgreSQL
                                admission trigger after successful admission.
                            </div>


                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "10px",
                                    marginTop: "24px",
                                    paddingTop: "18px",
                                    borderTop: "1px solid #e2e8f0"
                                }}
                            >

                                <button
                                    type="button"
                                    onClick={() =>
                                        !addingAdmission &&
                                        setAddAdmissionOpen(false)
                                    }
                                    disabled={addingAdmission}
                                    style={{
                                        padding: "11px 18px",
                                        borderRadius: "9px",
                                        border: "1px solid #dbe3ef",
                                        background: "#ffffff",
                                        color: "#475569",
                                        fontWeight: 600,
                                        cursor:
                                            addingAdmission
                                                ? "not-allowed"
                                                : "pointer"
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        addingAdmission ||
                                        !admissionForm.appointment_id
                                    }
                                    style={{
                                        padding: "11px 20px",
                                        borderRadius: "9px",
                                        border: "none",
                                        background: "#2563eb",
                                        color: "#ffffff",
                                        fontWeight: 600,
                                        cursor:
                                            addingAdmission ||
                                            !admissionForm.appointment_id
                                                ? "not-allowed"
                                                : "pointer",
                                        opacity:
                                            addingAdmission ||
                                            !admissionForm.appointment_id
                                                ? 0.7
                                                : 1
                                    }}
                                >
                                    {addingAdmission
                                        ? "Admitting..."
                                        : "Admit Patient"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


            {addDoctorOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15, 23, 42, 0.48)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px",
                        zIndex: 1000
                    }}
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !addingDoctor) {
                            setAddDoctorOpen(false);
                        }
                    }}
                >
                    <div
                        style={{
                            width: "min(820px, 100%)",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            background: "#ffffff",
                            borderRadius: "18px",
                            boxShadow: "0 24px 70px rgba(15, 23, 42, 0.25)",
                            padding: "28px"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
                            <div>
                                <h2 style={{ margin: 0, color: "#0f172a", fontSize: "24px" }}>Add New Doctor</h2>
                                <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "14px" }}>Register a doctor in the hospital system</p>
                            </div>
                            <button type="button" onClick={() => !addingDoctor && setAddDoctorOpen(false)} style={{ border: "none", background: "#f1f5f9", width: "36px", height: "36px", borderRadius: "10px", fontSize: "22px", cursor: "pointer", color: "#475569" }}>×</button>
                        </div>

                        {doctorFormError && (
                            <div style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", padding: "11px 14px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px" }}>
                                {doctorFormError}
                            </div>
                        )}

                        {doctorFormSuccess && (
                            <div style={{ background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0", padding: "11px 14px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px" }}>
                                {doctorFormSuccess}
                            </div>
                        )}

                        <form onSubmit={handleAddDoctor}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
                                {[
                                    ["first_name", "First Name", "text", true],
                                    ["last_name", "Last Name", "text", false],
                                    ["date_of_birth", "Date of Birth", "date", true],
                                    ["phone", "Phone", "tel", true],
                                    ["email", "Email", "email", false],
                                    ["address", "Address", "text", false],
                                    ["specialization", "Specialization", "text", true],
                                    ["qualification", "Qualification", "text", true],
                                    ["experience_years", "Experience (Years)", "text", true],
                                    ["consultation_fee", "Consultation Fee (₹)", "text", true]
                                ].map(([name, label, type, required]) => (
                                    <div key={name} style={{ gridColumn: name === "address" ? "1 / -1" : "auto" }}>
                                        <label style={{ display: "block", marginBottom: "7px", fontSize: "13px", fontWeight: 600, color: "#334155" }}>
                                            {label}{required && " *"}
                                        </label>
                                        <input
                                            name={name}
                                            type={type}
                                            inputMode={
                                                name === "experience_years"
                                                    ? "numeric"
                                                    : name === "consultation_fee"
                                                        ? "decimal"
                                                        : undefined
                                            }
                                            min={
                                                name === "experience_years" ||
                                                name === "consultation_fee"
                                                    ? "0"
                                                    : undefined
                                            }
                                            step={
                                                name === "consultation_fee"
                                                    ? "0.01"
                                                    : undefined
                                            }
                                            value={doctorForm[name]}
                                            onChange={handleDoctorFormChange}
                                            required={required}
                                            style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #dbe3ef", borderRadius: "9px", outline: "none", fontSize: "14px", color: "#0f172a" }}
                                        />
                                    </div>
                                ))}

                                <div>
                                    <label style={{ display: "block", marginBottom: "7px", fontSize: "13px", fontWeight: 600, color: "#334155" }}>Gender *</label>
                                    <select name="gender" value={doctorForm.gender} onChange={handleDoctorFormChange} required style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #dbe3ef", borderRadius: "9px", outline: "none", fontSize: "14px", color: "#0f172a", background: "#ffffff" }}>
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "7px", fontSize: "13px", fontWeight: 600, color: "#334155" }}>Department *</label>
                                    <select name="dept_id" value={doctorForm.dept_id} onChange={handleDoctorFormChange} required style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #dbe3ef", borderRadius: "9px", outline: "none", fontSize: "14px", color: "#0f172a", background: "#ffffff" }}>
                                        <option value="">Select Department</option>
                                        <option value="1">Cardiology</option>
                                        <option value="2">Neurology</option>
                                        <option value="3">Orthopedics</option>
                                        <option value="4">General Medicine</option>
                                        <option value="5">Pediatrics</option>
                                        <option value="6">Emergency Medicine</option>
                                    </select>
                                </div>

                                <div>
                                    <label style={{ display: "block", marginBottom: "7px", fontSize: "13px", fontWeight: 600, color: "#334155" }}>Branch *</label>
                                    <select name="branch_id" value={doctorForm.branch_id} onChange={handleDoctorFormChange} required style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #dbe3ef", borderRadius: "9px", outline: "none", fontSize: "14px", color: "#0f172a", background: "#ffffff" }}>
                                        <option value="">Select Branch</option>
                                        {branches.map((branch) => (
                                            <option key={branch.branch_id} value={branch.branch_id}>{branch.branch_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px", paddingTop: "18px", borderTop: "1px solid #e2e8f0" }}>
                                <button type="button" onClick={() => setAddDoctorOpen(false)} disabled={addingDoctor} style={{ padding: "11px 18px", borderRadius: "9px", border: "1px solid #dbe3ef", background: "#ffffff", color: "#475569", fontWeight: 600, cursor: addingDoctor ? "not-allowed" : "pointer" }}>Cancel</button>
                                <button type="submit" disabled={addingDoctor} style={{ padding: "11px 20px", borderRadius: "9px", border: "none", background: "#2563eb", color: "#ffffff", fontWeight: 600, cursor: addingDoctor ? "not-allowed" : "pointer", opacity: addingDoctor ? 0.7 : 1 }}>
                                    {addingDoctor ? "Adding Doctor..." : "Add Doctor"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {addPatientOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(15, 23, 42, 0.48)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "24px",
                        zIndex: 1000
                    }}
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setAddPatientOpen(false);
                        }
                    }}
                >

                    <div
                        style={{
                            width: "min(760px, 100%)",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            background: "#ffffff",
                            borderRadius: "18px",
                            boxShadow:
                                "0 24px 70px rgba(15, 23, 42, 0.25)",
                            padding: "28px"
                        }}
                    >

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "22px"
                            }}
                        >

                            <div>
                                <h2
                                    style={{
                                        margin: 0,
                                        color: "#0f172a",
                                        fontSize: "24px"
                                    }}
                                >
                                    Add New Patient
                                </h2>

                                <p
                                    style={{
                                        margin: "6px 0 0",
                                        color: "#64748b",
                                        fontSize: "14px"
                                    }}
                                >
                                    Register a new patient in the hospital system
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setAddPatientOpen(false)
                                }
                                style={{
                                    border: "none",
                                    background: "#f1f5f9",
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "10px",
                                    fontSize: "22px",
                                    cursor: "pointer",
                                    color: "#475569"
                                }}
                            >
                                ×
                            </button>

                        </div>


                        {patientFormError && (
                            <div
                                style={{
                                    background: "#fef2f2",
                                    color: "#b91c1c",
                                    border: "1px solid #fecaca",
                                    padding: "11px 14px",
                                    borderRadius: "10px",
                                    marginBottom: "16px",
                                    fontSize: "14px"
                                }}
                            >
                                {patientFormError}
                            </div>
                        )}


                        {patientFormSuccess && (
                            <div
                                style={{
                                    background: "#f0fdf4",
                                    color: "#15803d",
                                    border: "1px solid #bbf7d0",
                                    padding: "11px 14px",
                                    borderRadius: "10px",
                                    marginBottom: "16px",
                                    fontSize: "14px"
                                }}
                            >
                                {patientFormSuccess}
                            </div>
                        )}


                        <form onSubmit={handleAddPatient}>

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(2, minmax(0, 1fr))",
                                    gap: "16px"
                                }}
                            >

                                {[
                                    ["first_name", "First Name", "text", true],
                                    ["last_name", "Last Name", "text", false],
                                    ["date_of_birth", "Date of Birth", "date", true],
                                    ["phone", "Phone", "tel", true],
                                    ["email", "Email", "email", false],
                                    ["address", "Address", "text", false],
                                    ["blood_group", "Blood Group", "text", false],
                                    ["allergies", "Allergies", "text", false],
                                    ["insurance_no", "Insurance No.", "text", false]
                                ].map(
                                    ([
                                        name,
                                        label,
                                        type,
                                        required
                                    ]) => (
                                        <div
                                            key={name}
                                            style={{
                                                gridColumn:
                                                    name === "address"
                                                        ? "1 / -1"
                                                        : "auto"
                                            }}
                                        >

                                            <label
                                                style={{
                                                    display: "block",
                                                    marginBottom: "7px",
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    color: "#334155"
                                                }}
                                            >
                                                {label}
                                                {required && " *"}
                                            </label>

                                            <input
                                                name={name}
                                                type={type}
                                                value={
                                                    patientForm[name]
                                                }
                                                onChange={
                                                    handlePatientFormChange
                                                }
                                                required={required}
                                                style={{
                                                    width: "100%",
                                                    boxSizing: "border-box",
                                                    padding: "11px 12px",
                                                    border: "1px solid #dbe3ef",
                                                    borderRadius: "9px",
                                                    outline: "none",
                                                    fontSize: "14px",
                                                    color: "#0f172a"
                                                }}
                                            />

                                        </div>
                                    )
                                )}


                                <div>

                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#334155"
                                        }}
                                    >
                                        Gender *
                                    </label>

                                    <select
                                        name="gender"
                                        value={patientForm.gender}
                                        onChange={
                                            handlePatientFormChange
                                        }
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "11px 12px",
                                            border: "1px solid #dbe3ef",
                                            borderRadius: "9px",
                                            fontSize: "14px",
                                            background: "#fff"
                                        }}
                                    >
                                        <option value="">
                                            Select Gender
                                        </option>
                                        <option value="Male">
                                            Male
                                        </option>
                                        <option value="Female">
                                            Female
                                        </option>
                                        <option value="Other">
                                            Other
                                        </option>
                                    </select>

                                </div>


                                <div>

                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#334155"
                                        }}
                                    >
                                        Department *
                                    </label>

                                    <select
                                        name="dept_id"
                                        value={patientForm.dept_id}
                                        onChange={
                                            handlePatientFormChange
                                        }
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "11px 12px",
                                            border: "1px solid #dbe3ef",
                                            borderRadius: "9px",
                                            fontSize: "14px",
                                            background: "#fff"
                                        }}
                                    >
                                        <option value="">
                                            Select Department
                                        </option>

                                        {departments.map(
                                            (department) => (
                                                <option
                                                    key={
                                                        department.dept_id
                                                    }
                                                    value={
                                                        department.dept_id
                                                    }
                                                >
                                                    {
                                                        department.dept_name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>


                                <div>

                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "7px",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            color: "#334155"
                                        }}
                                    >
                                        Branch *
                                    </label>

                                    <select
                                        name="branch_id"
                                        value={patientForm.branch_id}
                                        onChange={
                                            handlePatientFormChange
                                        }
                                        required
                                        style={{
                                            width: "100%",
                                            padding: "11px 12px",
                                            border: "1px solid #dbe3ef",
                                            borderRadius: "9px",
                                            fontSize: "14px",
                                            background: "#fff"
                                        }}
                                    >
                                        <option value="">
                                            Select Branch
                                        </option>

                                        {branches.map(
                                            (branch) => (
                                                <option
                                                    key={
                                                        branch.branch_id
                                                    }
                                                    value={
                                                        branch.branch_id
                                                    }
                                                >
                                                    {
                                                        branch.branch_name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            </div>


                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "10px",
                                    marginTop: "24px",
                                    paddingTop: "18px",
                                    borderTop: "1px solid #e2e8f0"
                                }}
                            >

                                <button
                                    type="button"
                                    onClick={() =>
                                        setAddPatientOpen(false)
                                    }
                                    style={{
                                        padding: "11px 18px",
                                        border: "1px solid #dbe3ef",
                                        background: "#ffffff",
                                        color: "#475569",
                                        borderRadius: "9px",
                                        fontWeight: 600,
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={addingPatient}
                                    style={{
                                        padding: "11px 20px",
                                        border: "none",
                                        background:
                                            addingPatient
                                                ? "#93c5fd"
                                                : "#2563eb",
                                        color: "#ffffff",
                                        borderRadius: "9px",
                                        fontWeight: 600,
                                        cursor:
                                            addingPatient
                                                ? "not-allowed"
                                                : "pointer"
                                    }}
                                >
                                    {addingPatient
                                        ? "Adding..."
                                        : "Add Patient"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}


        </div>

    );

}


export default App; 