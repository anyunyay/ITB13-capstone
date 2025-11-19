import { Head } from '@inertiajs/react';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
    return (
        <>
            <Head title="Terms of Service" />
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-primary/10 rounded-lg">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold">Terms of Service</h1>
                    </div>

                    <div className="bg-card rounded-lg shadow-sm border p-6 space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">SMMC – Agricultural E-Commerce Platform</h2>
                            <p className="text-muted-foreground">
                                By accessing or using SMMC as a consumer, you agree to the terms outlined below:
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold mb-2">Use of the Platform</h3>
                            <p className="text-muted-foreground">
                                Consumers may use SMMC to browse, order, and purchase agricultural products. You agree to provide accurate information and use the platform responsibly.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold mb-2">Consumer Account Responsibilities</h3>
                            <p className="text-muted-foreground">
                                You are responsible for keeping your account information, including your password, secure. Do not share your login details with others. Any activity under your account is your responsibility.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold mb-2">Ordering Products</h3>
                            <p className="text-muted-foreground mb-2">
                                Place orders honestly and only for legitimate use. SMMC may cancel orders placed with false, misleading, or fraudulent information. Product availability, prices, and details may change without prior notice.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold mb-2">Payments and Delivery</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Payments are made via Cash on Delivery (COD).</li>
                                <li>A 10% delivery fee will be added to each order.</li>
                                <li>Orders are typically delivered within 48 hours.</li>
                                <li>Delivery times may vary depending on location, weather, and logistics availability.</li>
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold mb-2">Prohibited Activities</h3>
                            <p className="text-muted-foreground mb-2">Consumers must not:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>Provide false or misleading information</li>
                                <li>Attempt to hack, interfere with, or disrupt platform operations</li>
                                <li>Engage in fraudulent, illegal, or harmful activities</li>
                            </ul>
                            <p className="text-muted-foreground mt-2">
                                Violations may result in order cancellation or legal action.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold mb-2">Privacy</h3>
                            <p className="text-muted-foreground">
                                SMMC collects only the personal information needed to manage accounts, process orders, and coordinate deliveries. Your data will not be shared with external parties without your consent, except where required by law.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold mb-2">Limitation of Liability</h3>
                            <p className="text-muted-foreground">
                                SMMC is not responsible for any issues caused by misuse of the platform or failure to follow instructions. We are not liable for damages arising from product use after delivery.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold mb-2">Cancellations and Refunds</h3>
                            <p className="text-muted-foreground">
                                Please note that cancellations and refunds are not available. All orders are considered final once placed.
                            </p>
                        </section>

                        <section>
                            <h3 className="text-lg font-semibold mb-2">Changes to the Terms</h3>
                            <p className="text-muted-foreground">
                                SMMC may update these Terms at any time. Continued use of the platform constitutes acceptance of the latest terms.
                            </p>
                        </section>
                    </div>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => window.close()}
                            className="text-primary hover:underline"
                        >
                            Close this window
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
