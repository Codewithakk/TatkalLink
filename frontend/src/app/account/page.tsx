"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type UserProfile = {
    _id: string;
    name: string;
    email: string;
    userProfile?: string;
    phone: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
};

export default function AccountPage() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) {
                    router.push("/signin");
                    return;
                }

                const res = await fetch("https://tatkallink.onrender.com/api/v1/auth/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();
                if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch profile.");
                setUser(data.data.user);
            } catch (err: any) {
                setError(err.message || "Something went wrong.");
            }
        };

        fetchProfile();
    }, [router]);

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-50 p-6 rounded shadow text-red-600 text-center">
                    <p className="font-semibold">Error:</p>
                    <p>{error}</p>
                    <Button className="mt-4" onClick={() => router.push("/signin")}>Back to Sign In</Button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-muted-foreground text-lg">Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">My Account</h1>

                <div className="space-y-4">
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Name:</span>
                        <span className="text-gray-800">{user.name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Email:</span>
                        <span className="text-gray-800">{user.email}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Phone:</span>
                        <span className="text-gray-800">{user.phone}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Role:</span>
                        <span className="text-gray-800 capitalize">{user.role}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Verified:</span>
                        <span className={`font-semibold ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                            {user.isVerified ? "Yes" : "No"}
                        </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Created:</span>
                        <span className="text-gray-800">{new Date(user.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Last Updated:</span>
                        <span className="text-gray-800">{new Date(user.updatedAt).toLocaleString()}</span>
                    </div>
                </div>

                <Button className="w-full mt-8" onClick={() => router.push("/dashboard")}>
                    Back to Dashboard
                </Button>
            </div>
        </div>
    );
}
