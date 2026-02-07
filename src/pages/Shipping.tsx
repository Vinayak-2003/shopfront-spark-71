import Navbar from "@/components/Navbar";
import { Truck, Globe, Clock, ShieldCheck } from "lucide-react";

export default function Shipping() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Shipping Information</h1>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
                        <Truck className="h-10 w-10 text-primary mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Standard Shipping</h3>
                        <p className="text-muted-foreground mb-4">
                            Free on all orders over $50. Delivery within 3-5 business days.
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Real-time tracking</li>
                            <li>Insured Delivery</li>
                            <li>Carbon neutral option</li>
                        </ul>
                    </div>

                    <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
                        <Clock className="h-10 w-10 text-accent mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Express Delivery</h3>
                        <p className="text-muted-foreground mb-4">
                            Get it fast! Delivery within 1-2 business days for a flat rate of $15.
                        </p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            <li>Priority processing</li>
                            <li>Guaranteed delivery date</li>
                            <li>SMS notifications</li>
                        </ul>
                    </div>
                </div>

                <div className="prose max-w-none text-muted-foreground">
                    <h2 className="text-2xl font-bold text-foreground mb-4">International Shipping</h2>
                    <p className="mb-4">
                        We currently ship to over 50 countries worldwide. International shipping rates are calculated at checkout based on your location and the weight of your order. Please note that customs duties and taxes may apply and are the responsibility of the customer.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mb-4 mt-8">Order Processing</h2>
                    <p className="mb-4">
                        Orders placed before 2 PM EST are typically processed and shipped the same business day. Orders placed after 2 PM EST or on weekends/holidays will be processed the next business day.
                    </p>
                </div>
            </div>
        </div>
    );
}
