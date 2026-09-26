import {
    LayoutDashboard,
    Building2,
    Users,
    Stethoscope,
    CalendarDays,
    BedDouble,
    CreditCard,
    FileText,
    Activity,
    Settings,
    ChevronRight
} from "lucide-react";

import "./Sidebar.css";

function Sidebar({ currentPage, onPageChange }) {

    const menuItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: LayoutDashboard
        },
        {
            id: "branches",
            label: "Branches",
            icon: Building2
        },
        {
            id: "patients",
            label: "Patients",
            icon: Users
        },
        {
            id: "doctors",
            label: "Doctors",
            icon: Stethoscope
        },
        {
            id: "appointments",
            label: "Appointments",
            icon: CalendarDays
        },
        {
            id: "admissions",
            label: "Admissions",
            icon: BedDouble
        },
        {
            id: "rooms",
            label: "Rooms",
            icon: Building2
        }
    ];

    const managementItems = [
        {
            id: "billing",
            label: "Billing",
            icon: CreditCard
        },
        {
            id: "doctor-notes",
            label: "Doctor Notes",
            icon: FileText
        },
        {
            id: "iot-vitals",
            label: "IoT Vitals",
            icon: Activity
        }
    ];


    return (
        <aside className="sidebar">

            {/* =====================================================
                LOGO
            ===================================================== */}

            <div className="sidebar-logo">

                <div className="logo-icon">
                    <Building2 size={24} />
                </div>

                <div className="logo-text">

                    <h2>
                        CityCare
                    </h2>

                    <span>
                        Hospital Management
                    </span>

                </div>

            </div>


            {/* =====================================================
                NAVIGATION
            ===================================================== */}

            <nav className="sidebar-menu">


                {/* MAIN MENU */}

                <p className="menu-label">
                    MAIN MENU
                </p>


                {menuItems.map((item) => {

                    const Icon = item.icon;

                    return (

                        <button
                            key={item.id}
                            type="button"
                            className={`menu-item ${
                                currentPage === item.id
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                onPageChange(item.id)
                            }
                        >

                            <Icon size={19} />

                            <span>
                                {item.label}
                            </span>

                        </button>

                    );

                })}



                {/* MANAGEMENT */}

                <p className="menu-label secondary-label">
                    MANAGEMENT
                </p>


                {managementItems.map((item) => {

                    const Icon = item.icon;

                    return (

                        <button
                            key={item.id}
                            type="button"
                            className={`menu-item ${
                                currentPage === item.id
                                    ? "active"
                                    : ""
                            }`}
                            onClick={() =>
                                onPageChange(item.id)
                            }
                        >

                            <Icon size={19} />

                            <span>
                                {item.label}
                            </span>

                        </button>

                    );

                })}

            </nav>


            {/* =====================================================
                BOTTOM SECTION
            ===================================================== */}

            <div className="sidebar-bottom">


                {/* ADMIN PROFILE */}

                <div className="admin-profile">

                    <div className="admin-avatar">
                        A
                    </div>

                    <div className="admin-info">

                        <strong>
                            Hospital Admin
                        </strong>

                        <span>
                            Administrator
                        </span>

                    </div>

                    <ChevronRight size={16} />

                </div>


                {/* SETTINGS */}

                <button
                    type="button"
                    className={`settings-item ${
                        currentPage === "settings"
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        onPageChange("settings")
                    }
                >

                    <Settings size={18} />

                    <span>
                        Settings
                    </span>

                </button>

            </div>

        </aside>
    );
}

export default Sidebar;