import { Building2, Stethoscope, UserRound } from "lucide-react";

function RoleSelection({ onSelectRole }) {
    const roles = [
        {
            id: "admin",
            title: "Administrator",
            description:
                "Manage hospital operations, staff, branches and billing.",
            icon: Building2
        },
        {
            id: "doctor",
            title: "Doctor",
            description:
                "Access appointments, patient records and clinical information.",
            icon: Stethoscope
        },
        {
            id: "patient",
            title: "Patient",
            description:
                "View your medical information, appointments, prescriptions and bills.",
            icon: UserRound
        }
    ];

    return (
        <div
            style={{
                minHeight: "100vh",
                background:
                    "linear-gradient(135deg, #f8fbff 0%, #eef5ff 50%, #f8fbff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 20px",
                fontFamily:
                    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "1080px",
                    textAlign: "center"
                }}
            >
                {/* Hospital Icon */}

                <div
                    style={{
                        width: "64px",
                        height: "64px",
                        margin: "0 auto 18px",
                        borderRadius: "18px",
                        background: "#2563eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow:
                            "0 12px 30px rgba(37, 99, 235, 0.22)"
                    }}
                >
                    <Building2 size={32} color="#ffffff" />
                </div>

                {/* Hospital Name */}

                <div
                    style={{
                        color: "#2563eb",
                        fontSize: "15px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: "8px"
                    }}
                >
                    CityCare Hospital
                </div>

                {/* Main Heading */}

                <h1
                    style={{
                        margin: 0,
                        color: "#0f172a",
                        fontSize: "36px",
                        lineHeight: 1.15,
                        fontWeight: 750
                    }}
                >
                    Hospital Management System
                </h1>

                {/* Welcome */}

                <h2
                    style={{
                        margin: "42px 0 8px",
                        color: "#0f172a",
                        fontSize: "28px",
                        fontWeight: 700
                    }}
                >
                    Welcome Back
                </h2>

                <p
                    style={{
                        margin: "0 0 30px",
                        color: "#64748b",
                        fontSize: "15px"
                    }}
                >
                    Select your role to continue
                </p>

                {/* Role Cards */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(3, minmax(0, 1fr))",
                        gap: "22px",
                        textAlign: "left"
                    }}
                >
                    {roles.map((role) => {
                        const Icon = role.icon;

                        return (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() =>
                                    onSelectRole(role.id)
                                }
                                style={{
                                    border:
                                        "1px solid #dbe5f2",
                                    background: "#ffffff",
                                    borderRadius: "20px",
                                    padding: "30px 26px",
                                    minHeight: "245px",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    boxShadow:
                                        "0 12px 35px rgba(15, 23, 42, 0.07)",
                                    color: "#0f172a"
                                }}
                            >
                                {/* Icon */}

                                <div
                                    style={{
                                        width: "58px",
                                        height: "58px",
                                        borderRadius: "16px",
                                        background: "#eff6ff",
                                        color: "#2563eb",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: "22px"
                                    }}
                                >
                                    <Icon size={28} />
                                </div>

                                {/* Role Title */}

                                <h3
                                    style={{
                                        margin: "0 0 9px",
                                        fontSize: "21px",
                                        fontWeight: 700
                                    }}
                                >
                                    {role.title}
                                </h3>

                                {/* Description */}

                                <p
                                    style={{
                                        margin: 0,
                                        color: "#64748b",
                                        fontSize: "13px",
                                        lineHeight: 1.6
                                    }}
                                >
                                    {role.description}
                                </p>

                                {/* Continue */}

                                <div
                                    style={{
                                        marginTop: "22px",
                                        color: "#2563eb",
                                        fontSize: "13px",
                                        fontWeight: 700
                                    }}
                                >
                                    Continue →
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}

                <p
                    style={{
                        marginTop: "30px",
                        color: "#94a3b8",
                        fontSize: "12px"
                    }}
                >
                    Secure access to the CityCare Hospital Management
                    System
                </p>
            </div>
        </div>
    );
}

export default RoleSelection;