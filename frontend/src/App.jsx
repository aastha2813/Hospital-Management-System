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
    getVitals
} from "./services/api";


function App() {

    // =====================================================
    // PAGE
    // =====================================================

    const [currentPage, setCurrentPage] = useState("dashboard");


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
    // LOADING / ERROR
    // =====================================================

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


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


    // =====================================================
    // BRANCH INFORMATION
    // =====================================================

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
                                Aastha
                            </strong>

                            <span>
                                Administrator
                            </span>

                        </div>

                        <ChevronDown size={16} />

                    </div>

                </div>

            </header>

        );

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

                        <button className="primary-action">
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
                    `${doctorCount} doctors in ${selectedBranchName}`
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

                                                    <span className="status-badge status-blue">
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
                    `${admissionCount} admissions in ${selectedBranchName}`
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
    // MAIN UI
    // =====================================================

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

        </div>

    );

}


export default App;