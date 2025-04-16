// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";
// import { auth } from "@/lib/firebase/config";
// import { Button } from "@/components/ui/button";
// import {
//     Form,
//     FormControl,
//     FormDescription,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";

// // Zod schema
// const formSchema = z.object({
//     email: z.string().email({ message: "Please enter a valid email." }),
//     password: z.string().min(6, { message: "Password must be at least 6 characters." }),
//     username: z.string().min(2, { message: "Username must be at least 2 characters." }).optional(),
// });

// type FormData = z.infer<typeof formSchema>;

// export function AuthForm() {
//     const [isSignUp, setIsSignUp] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const [loading, setLoading] = useState(false);
//     const router = useRouter();

//     const form = useForm<FormData>({
//         resolver: zodResolver(formSchema),
//         defaultValues: {
//             email: "",
//             password: "",
//             username: "",
//         },
//     });

//     const handlePasswordReset = async () => {
//         const email = form.getValues("email");
//         if (!email) return setError("Please enter your email.");
//         try {
//             await sendPasswordResetEmail(auth, email);
//             alert("Password reset email sent!");
//         } catch (err: any) {
//             setError(err.message);
//         }
//     };

//     const onSubmit = async (data: FormData) => {
//         setError(null);
//         setLoading(true);

//         try {
//             if (isSignUp) {
//                 const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
//                 if (data.username) {
//                     await updateProfile(userCredential.user, { displayName: data.username });
//                 }
//                 console.log("User signed up:", userCredential.user);
//             } else {
//                 const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
//                 console.log("User signed in:", userCredential.user);
//             }
//             form.reset();
//             router.push("/dashboard");
//         } catch (err: any) {
//             setError(err.message || "An error occurred. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="max-w-md mx-auto p-6">
//             <h2 className="text-2xl font-bold mb-4">{isSignUp ? "Sign Up for TatkalLink" : "Sign In to TatkalLink"}</h2>
//             <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//                     {isSignUp && (
//                         <FormField
//                             control={form.control}
//                             name="username"
//                             render={({ field }) => (
//                                 <FormItem>
//                                     <FormLabel>Username</FormLabel>
//                                     <FormControl>
//                                         <Input placeholder="Your username" {...field} disabled={loading} />
//                                     </FormControl>
//                                     <FormDescription>This is your public display name.</FormDescription>
//                                     <FormMessage />
//                                 </FormItem>
//                             )}
//                         />
//                     )}
//                     <FormField
//                         control={form.control}
//                         name="email"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Email</FormLabel>
//                                 <FormControl>
//                                     <Input placeholder="your@email.com" type="email" {...field} disabled={loading} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     <FormField
//                         control={form.control}
//                         name="password"
//                         render={({ field }) => (
//                             <FormItem>
//                                 <FormLabel>Password</FormLabel>
//                                 <FormControl>
//                                     <Input placeholder="••••••" type="password" {...field} disabled={loading} />
//                                 </FormControl>
//                                 <FormMessage />
//                             </FormItem>
//                         )}
//                     />
//                     {error && <p className="text-red-500 text-sm">{error}</p>}
//                     <Button type="submit" className="w-full" disabled={loading}>
//                         {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
//                     </Button>
//                 </form>
//             </Form>
//             <div className="mt-4 text-center">
//                 <button
//                     type="button"
//                     className="text-blue-500 hover:underline"
//                     onClick={() => {
//                         setIsSignUp(!isSignUp);
//                         form.reset();
//                         setError(null);
//                     }}
//                     disabled={loading}
//                 >
//                     {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
//                 </button>
//                 <button type="button" onClick={handlePasswordReset} className="text-blue-500 hover:underline">
//                     Forgot Password?
//                 </button>
//             </div>
//         </div>
//     );
// }

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Zod schema
const formSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    name: z.string().min(2, { message: "Name must be at least 2 characters." }).optional(),
    phone: z.string().min(10, { message: "Phone must be at least 10 digits." }).optional(),
    userProfile: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AuthForm() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
            name: "",
            phone: "",
            userProfile: "",
        },
    });

    const handlePasswordReset = async () => {
        const email = form.getValues("email");
        if (!email) return setError("Please enter your email to reset password.");
        try {
            alert("Password reset email sent! (API call placeholder)");
        } catch (err: any) {
            setError(err.message);
        }
    };

    const onSubmit = async (data: FormData) => {
        console.log(`🔹 Submitting as: ${isSignUp ? "Sign Up" : "Sign In"}`);
        console.log("➡️ Form Data:", data);
        setError(null);
        setLoading(true);

        try {
            const url = isSignUp
                ? "https://tatkallink.onrender.com/api/v1/auth/signup"
                : "https://tatkallink.onrender.com/api/v1/auth/signin";

            const payload = isSignUp
                ? {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    password: data.password,
                    userProfile: data.userProfile || "",
                }
                : { email: data.email, password: data.password };

            console.log("📡 Sending request to:", url);
            console.log("📝 Payload:", payload);

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            console.log("🌐 API Response Status:", response.status);

            const result = await response.json();
            console.log("📦 API Response Body:", result);

            if (!response.ok) {
                console.error("❌ Server responded with an error status:", response.status);
                throw new Error("Server error. Please try again later.");
            }

            if (!result.success) {
                console.error("❌ API failure:", result);
                throw new Error(result.message || "Invalid email or password.");
            }

            // If success
            localStorage.setItem("accessToken", result.data.token);
            localStorage.setItem("refreshToken", result.data.refreshToken);
            localStorage.setItem("user", JSON.stringify(result.data.user));

            console.log("✅ Authentication successful:", result.data.user);

            form.reset();
            router.push("/dashboard");
        } catch (err: any) {
            console.error("🔥 Error caught in submit:", err);
            setError(err.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">
                {isSignUp ? "Sign Up for TatkalLink" : "Sign In to TatkalLink"}
            </h2>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {isSignUp && (
                        <>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your name" {...field} disabled={loading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your phone number" {...field} disabled={loading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="userProfile"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User Profile (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your profile link" {...field} disabled={loading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </>
                    )}

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="your@email.com" type="email" {...field} disabled={loading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input placeholder="••••••" type="password" {...field} disabled={loading} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
                    </Button>
                </form>
            </Form>

            <div className="mt-4 text-center">
                <button
                    type="button"
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError(null);  // clear error on mode switch
                        form.reset();    // clear form on mode switch
                    }}
                    className="text-blue-500 hover:underline mb-2"
                >
                    {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
                </button>
                <br />
                <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-blue-500 hover:underline"
                >
                    Forgot Password?
                </button>
            </div>
        </div>
    );
}
