import { ArrowLeft, Building2, MapPin } from "lucide-react";

function BranchSelection({ role, onSelectBranch, onBack }) {
    const branches = [
        {
            id: 1,
            name: "Surat Branch",
            fullName: "CityCare Hospital - Surat Branch",
            location: "Surat, Gujarat",
            address: "Adajan Road, Near LP Savani Circle, Surat",
        },
        {
            id: 2,
            name: "Valsad Branch",
            fullName: "CityCare Hospital - Valsad Branch",
            location: "Valsad, Gujarat",
            address: "Tithal Road, Near Dharampur Junction, Valsad",
        },
    ];

    const roleLabel = role === "doctor" ? "Doctor" : "Patient";

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
                    "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "920px",
                    textAlign: "center",
                }}
            >
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
                        boxShadow: "0 12px 30px rgba(37, 99, 235, 0.22)",
                    }}
                >
                    <Building2 size={32} color="#ffffff" />
                </div>

                <div
                    style={{
                        color: "#2563eb",
                        fontSize: "15px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                    }}
                >
                    CityCare Hospital
                </div>

                <h1
                    style={{
                        margin: 0,
                        color: "#0f172a",
                        fontSize: "36px",
                        lineHeight: 1.15,
                        fontWeight: 750,
                    }}
                >
                    Select Your Branch
                </h1>

                <p
                    style={{
                        margin: "14px 0 8px",
                        color: "#475569",
                        fontSize: "16px",
                    }}
                >
                    Choose the hospital branch for your {roleLabel.toLowerCase()} account
                </p>

                <p
                    style={{
                        margin: "0 0 34px",
                        color: "#94a3b8",
                        fontSize: "13px",
                    }}
                >
                    Select the branch where you are registered or assigned.
                </p>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: "24px",
                        textAlign: "left",
                    }}
                >
                    {branches.map((branch) => (
                        <button
                            key={branch.id}
                            type="button"
                            onClick={() => onSelectBranch(branch)}
                            style={{
                                border: "1px solid #dbe5f2",
                                background: "#ffffff",
                                borderRadius: "20px",
                                padding: "30px",
                                minHeight: "250px",
                                cursor: "pointer",
                                textAlign: "left",
                                boxShadow:
                                    "0 12px 35px rgba(15, 23, 42, 0.07)",
                                color: "#0f172a",
                            }}
                        >
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
                                    marginBottom: "22px",
                                }}
                            >
                                <Building2 size={28} />
                            </div>

                            <h2
                                style={{
                                    margin: "0 0 8px",
                                    fontSize: "23px",
                                    fontWeight: 700,
                                }}
                            >
                                {branch.name}
                            </h2>

                            <p
                                style={{
                                    margin: "0 0 10px",
                                    color: "#334155",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                }}
                            >
                                {branch.fullName}
                            </p>

                            <p
                                style={{
                                    margin: "0 0 7px",
                                    color: "#64748b",
                                    fontSize: "13px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                <MapPin size={15} />
                                {branch.location}
                            </p>

                            <p
                                style={{
                                    margin: 0,
                                    color: "#94a3b8",
                                    fontSize: "12px",
                                    lineHeight: 1.5,
                                }}
                            >
                                {branch.address}
                            </p>

                            <div
                                style={{
                                    marginTop: "22px",
                                    color: "#2563eb",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                }}
                            >
                                Continue →
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={onBack}
                    style={{
                        marginTop: "28px",
                        border: "none",
                        background: "transparent",
                        color: "#64748b",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                    }}
                >
                    <ArrowLeft size={16} />
                    Back to role selection
                </button>
            </div>
        </div>
    );
}

export default BranchSelection;
