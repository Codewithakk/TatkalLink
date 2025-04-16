"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const createRequestSchema = z.object({
    mode: z.string().min(1, "Mode is required."),
    from: z.string().min(2, "From location is required."),
    to: z.string().min(2, "To location is required."),
    travelDate: z.string().min(1, "Date is required."),
    timeRange: z.string().min(1, "Time range is required."),
    additionalNotes: z.string().optional(),
    priority: z.string().min(1, "Priority is required."),
    maxBudget: z.coerce.number().min(1, "Fare must be at least 1."),
    contactPreference: z.string().min(1, "Contact preference is required."),
})

type CreateRequestData = z.infer<typeof createRequestSchema>

export function CreateRequestForm({ onClose }: { onClose: () => void }) {
    const form = useForm<CreateRequestData>({
        resolver: zodResolver(createRequestSchema),
        defaultValues: {
            mode: "",
            from: "",
            to: "",
            travelDate: "",
            timeRange: "",
            additionalNotes: "",
            priority: "",
            maxBudget: 0,
            contactPreference: "",
        },
    })

    const token = localStorage.getItem("accessToken");

    if (!token) {
        alert("Please log in again.");
        return;
    }

    const onSubmit = async (data: CreateRequestData) => {
        try {
            const response = await fetch("https://tatkallink.onrender.com/api/v1/seeker/request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Request creation failed.")
            }

            alert("Request Created Successfully!")
            onClose()
        } catch (err: any) {
            alert(err.message || "An error occurred. Please try again.")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md max-w-2xl mx-auto w-full">

                {/* --- MODE DROPDOWN --- */}
                <FormField
                    control={form.control}
                    name="mode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Mode</FormLabel>
                            <FormControl>
                                <select
                                    {...field}
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                >
                                    <option value="">Select Mode</option>
                                    <option value="train">Train</option>
                                    <option value="flight">Airplane</option>
                                    <option value="bus">Bus</option>
                                    {/* <option value="Car">Car</option> */}
                                    {/* <option value="Other">Other</option> */}
                                </select>
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                    )}
                />

                {/* --- The rest remains unchanged --- */}
                <FormField
                    control={form.control}
                    name="from"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">From</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter departure location"
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="to"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">To</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter destination location"
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="travelDate"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Travel Date</FormLabel>
                            <FormControl>
                                <Input
                                    type="date"
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="timeRange"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Time Range</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter time range"
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Additional Notes</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Any specific requests?"
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Priority</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter priority level"
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                    )}
                />

                {/* --- BUDGET FIELD WITH CLEARER LABEL --- */}
                <FormField
                    control={form.control}
                    name="maxBudget"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Fare</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Enter expected fare"
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="contactPreference"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Contact Preference</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Call/Email preference"
                                    className="border border-gray-300 rounded-md p-2 w-full"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-red-500 text-sm mt-1" />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition duration-200 ease-in-out"
                >
                    Create Request
                </Button>
            </form>
        </Form>
    )
}
