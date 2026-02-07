import Navbar from "@/components/Navbar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
    const faqs = [
        {
            question: "How long does shipping take?",
            answer: "Standard shipping typically takes 3-5 business days. Express shipping options are available at checkout and usually arrive within 1-2 business days."
        },
        {
            question: "What is your return policy?",
            answer: "We offer a 30-day return policy for all unused items in their original packaging. Please verify the returns page for more detailed information."
        },
        {
            question: "Do you ship internationally?",
            answer: "Yes, we ship to most countries worldwide. International shipping times and costs vary by location."
        },
        {
            question: "How can I track my order?",
            answer: "Once your order ships, you will receive a tracking number via email. You can also track your order status in your account dashboard."
        },
        {
            question: "Are my payment details secure?",
            answer: "Absolutely. We use industry-standard encryption to protect your personal and payment information."
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-3xl font-bold mb-2 text-center">Frequently Asked Questions</h1>
                <p className="text-muted-foreground text-center mb-8">
                    Find answers to common questions about our products and services.
                </p>

                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
