import Navbar from "@/components/Navbar";
import { RotateCcw, CheckCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Returns() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Returns & Refunds</h1>

                <div className="bg-muted/30 p-8 rounded-xl mb-12 text-center">
                    <h2 className="text-2xl font-semibold mb-4">Our "Love It or Return It" Guarantee</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
                        We want you to be completely satisfied with your purchase. If you're not happy with your order,
                        you can return it within 30 days of purchase for a full refund or exchange.
                    </p>
                    <Button size="lg">Start a Return</Button>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="text-center p-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <RotateCcw className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold mb-2">30-Day Window</h3>
                        <p className="text-sm text-muted-foreground">Items must be returned within 30 days of delivery.</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold mb-2">Original Condition</h3>
                        <p className="text-sm text-muted-foreground">Items must be unused, unworn, and in original packaging.</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <HelpCircle className="h-6 w-6" />
                        </div>
                        <h3 className="font-semibold mb-2">Easy Process</h3>
                        <p className="text-sm text-muted-foreground">Use our online portal to generate a prepaid shipping label.</p>
                    </div>
                </div>

                <div className="prose max-w-none text-muted-foreground">
                    <h3 className="text-xl font-bold text-foreground mb-3">How to Return</h3>
                    <ol className="list-decimal list-inside space-y-2 mb-6">
                        <li>Log in to your account and go to "Orders".</li>
                        <li>Select the order containing the item(s) you wish to return.</li>
                        <li>Click "Return Item" and follow the prompts.</li>
                        <li>Print the prepaid shipping label and attach it to your package.</li>
                        <li>Drop off the package at any authorized shipping carrier location.</li>
                    </ol>

                    <h3 className="text-xl font-bold text-foreground mb-3">Refunds</h3>
                    <p>
                        Once we receive your return, please allow 3-5 business days for us to inspect and process it.
                        Refunds will be issued to the original payment method. Depending on your bank, it may take an
                        additional 5-10 business days for the funds to appear in your account.
                    </p>
                </div>
            </div>
        </div>
    );
}
