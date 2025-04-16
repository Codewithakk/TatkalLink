"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordFlow() {
    const [step, setStep] = useState<"email" | "otp" | "reset">("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (step === "email") {
                const res = await fetch("https://tatkallink.onrender.com/api/v1/auth/forgot-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });

                const result = await res.json();
                if (!res.ok || !result.success) throw new Error(result.message || "Failed to send OTP.");
                setStep("otp");

            } else if (step === "otp") {
                const res = await fetch("https://tatkallink.onrender.com/api/v1/auth/verify-otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ otp }),
                });

                const result = await res.json();
                if (!res.ok || !result.success) throw new Error(result.message || "Invalid OTP.");
                setStep("reset");

            } else if (step === "reset") {
                const res = await fetch("https://tatkallink.onrender.com/api/v1/auth/reset-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ otp, newPassword }),
                });

                const result = await res.json();
                if (!res.ok || !result.success) throw new Error(result.message || "Could not reset password.");
                router.push("/signin");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
                {step === "email" && <h2 className="text-2xl font-bold text-center">Forgot Password</h2>}
                {step === "otp" && <h2 className="text-2xl font-bold text-center">Enter OTP</h2>}
                {step === "reset" && <h2 className="text-2xl font-bold text-center">Set New Password</h2>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {step === "email" && (
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                        />
                    )}

                    {step === "otp" && (
                        <Input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            disabled={loading}
                            required
                        />
                    )}

                    {step === "reset" && (
                        <Input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    )}

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading
                            ? "Please wait..."
                            : step === "email"
                                ? "Send OTP"
                                : step === "otp"
                                    ? "Verify OTP"
                                    : "Reset Password"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
