import { useState } from "react";
import { loginUser } from "../services/api";
import {
    ArrowLeft,
    Building2,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ShieldCheck,
    Stethoscope,
    UserRound,
} from "lucide-react";

function LoginPage({ role, branch, onBack, onLoginSuccess }) {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loggingIn, setLoggingIn] = useState(false);

    const roleConfig = {
        admin: {
            title: "Administrator Login",
            subtitle: "Sign in to manage the CityCare Hospital system.",
            icon: ShieldCheck,
        },
        doctor: {
            title: "Doctor Login",
            subtitle: "Sign in to access appointments and patient clinical information.",
            icon: Stethoscope,
        },
        patient: {
            title: "Patient Login",
            subtitle: "Sign in to access your appointments, medical records and bills.",
            icon: UserRound,
        },
    };

    const config = roleConfig[role] || roleConfig.patient;
    const RoleIcon = config.icon;

    const branchName = branch
        ? branch.fullName
        : "All Branches";

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!email.trim() || !password.trim()) {
            setMessage("Please enter your email and password.");
            return;
        }

        setLoggingIn(true);
        setMessage("");

        try {
            const result = await loginUser({
                email: email.trim(),
                password,
                role,
                branch_id: branch?.id ?? null
            });

            console.log("Authenticated user:", result.user);

            setMessage(
                `Login successful. Welcome ${result.user.profile
                    ? `${result.user.profile.first_name} ${result.user.profile.last_name || ""}`.trim()
                    : result.user.email
                }!`
            );

            onLoginSuccess(result.user);
        } catch (error) {
            setMessage(
                error.message || "Login failed. Please check your credentials."
            );
        } finally {
            setLoggingIn(false);
        }
    };

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
                    maxWidth: "460px",
                }}
            >
                <div
                    style={{
                        textAlign: "center",
                        marginBottom: "28px",
                    }}
                >
                    <div
                        style={{
                            width: "64px",
                            height: "64px",
                            margin: "0 auto 16px",
                            borderRadius: "18px",
                            background: "#2563eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow:
                                "0 12px 30px rgba(37, 99, 235, 0.22)",
                        }}
                    >
                        <Building2 size={32} color="#ffffff" />
                    </div>

                    <div
                        style={{
                            color: "#2563eb",
                            fontSize: "14px",
                            fontWeight: 700,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            marginBottom: "7px",
                        }}
                    >
                        CityCare Hospital
                    </div>

                    <h1
                        style={{
                            margin: 0,
                            color: "#0f172a",
                            fontSize: "30px",
                            fontWeight: 750,
                        }}
                    >
                        Hospital Management System
                    </h1>
                </div>

                <div
                    style={{
                        background: "#ffffff",
                        border: "1px solid #dbe5f2",
                        borderRadius: "22px",
                        padding: "34px",
                        boxShadow:
                            "0 18px 50px rgba(15, 23, 42, 0.09)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                            marginBottom: "24px",
                        }}
                    >
                        <div
                            style={{
                                width: "54px",
                                height: "54px",
                                flexShrink: 0,
                                borderRadius: "15px",
                                background: "#eff6ff",
                                color: "#2563eb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <RoleIcon size={27} />
                        </div>

                        <div>
                            <h2
                                style={{
                                    margin: 0,
                                    color: "#0f172a",
                                    fontSize: "23px",
                                    fontWeight: 700,
                                }}
                            >
                                {config.title}
                            </h2>

                            <p
                                style={{
                                    margin: "5px 0 0",
                                    color: "#64748b",
                                    fontSize: "13px",
                                    lineHeight: 1.5,
                                }}
                            >
                                {config.subtitle}
                            </p>
                        </div>
                    </div>

                    <div
                        style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            padding: "12px 14px",
                            marginBottom: "24px",
                        }}
                    >
                        <div
                            style={{
                                color: "#94a3b8",
                                fontSize: "11px",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                                marginBottom: "4px",
                            }}
                        >
                            Selected Branch
                        </div>

                        <div
                            style={{
                                color: "#334155",
                                fontSize: "13px",
                                fontWeight: 600,
                            }}
                        >
                            {branchName}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <label
                            style={{
                                display: "block",
                                color: "#334155",
                                fontSize: "13px",
                                fontWeight: 700,
                                marginBottom: "8px",
                            }}
                        >
                            Email Address
                        </label>

                        <div
                            style={{
                                position: "relative",
                                marginBottom: "18px",
                            }}
                        >
                            <Mail
                                size={18}
                                style={{
                                    position: "absolute",
                                    left: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#94a3b8",
                                }}
                            />

                            <input
                                type="email"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    setMessage("");
                                }}
                                placeholder="Enter your email"
                                autoComplete="username"
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    height: "48px",
                                    border: "1px solid #dbe5f2",
                                    borderRadius: "11px",
                                    padding: "0 14px 0 42px",
                                    outline: "none",
                                    color: "#0f172a",
                                    fontSize: "14px",
                                    background: "#ffffff",
                                }}
                            />
                        </div>

                        <label
                            style={{
                                display: "block",
                                color: "#334155",
                                fontSize: "13px",
                                fontWeight: 700,
                                marginBottom: "8px",
                            }}
                        >
                            Password
                        </label>

                        <div
                            style={{
                                position: "relative",
                                marginBottom: "18px",
                            }}
                        >
                            <LockKeyhole
                                size={18}
                                style={{
                                    position: "absolute",
                                    left: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#94a3b8",
                                }}
                            />

                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    setMessage("");
                                }}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    height: "48px",
                                    border: "1px solid #dbe5f2",
                                    borderRadius: "11px",
                                    padding: "0 48px 0 42px",
                                    outline: "none",
                                    color: "#0f172a",
                                    fontSize: "14px",
                                    background: "#ffffff",
                                }}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((value) => !value)
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    border: "none",
                                    background: "transparent",
                                    color: "#64748b",
                                    cursor: "pointer",
                                    padding: "5px",
                                }}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginBottom: "22px",
                            }}
                        >
                            <button
                                type="button"
                                style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "#2563eb",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    padding: 0,
                                }}
                                onClick={() =>
                                    setMessage(
                                        "Password recovery will be added with authentication."
                                    )
                                }
                            >
                                Forgot password?
                            </button>
                        </div>

                        {message && (
                            <div
                                style={{
                                    background: "#eff6ff",
                                    border: "1px solid #bfdbfe",
                                    color: "#1d4ed8",
                                    borderRadius: "10px",
                                    padding: "11px 13px",
                                    fontSize: "12px",
                                    lineHeight: 1.5,
                                    marginBottom: "16px",
                                }}
                            >
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loggingIn}
                            style={{
                                width: "100%",
                                height: "48px",
                                border: "none",
                                borderRadius: "11px",
                                background: loggingIn ? "#93c5fd" : "#2563eb",
                                color: "#ffffff",
                                fontSize: "14px",
                                fontWeight: 700,
                                cursor: loggingIn ? "not-allowed" : "pointer",
                                boxShadow:
                                    "0 8px 20px rgba(37, 99, 235, 0.20)",
                            }}
                        >
                            {loggingIn ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={onBack}
                        style={{
                            width: "100%",
                            marginTop: "18px",
                            border: "none",
                            background: "transparent",
                            color: "#64748b",
                            fontSize: "13px",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "7px",
                        }}
                    >
                        <ArrowLeft size={16} />
                        {role === "admin"
                            ? "Back to role selection"
                            : "Back to branch selection"}
                    </button>
                </div>

                <p
                    style={{
                        textAlign: "center",
                        marginTop: "20px",
                        color: "#94a3b8",
                        fontSize: "11px",
                    }}
                >
                    Secure access to the CityCare Hospital Management System
                </p>
            </div>
        </div>
    );
}

export default LoginPage;