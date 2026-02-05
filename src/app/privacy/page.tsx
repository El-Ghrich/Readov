import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
            </div>

            <div className="glass-dark p-8 md:p-12 rounded-2xl border border-white/5 space-y-8">
                <div className="border-b border-white/10 pb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
                    <p className="text-gray-400">Updated November 2, 2025</p>
                </div>

                <div className="prose prose-invert max-w-none text-gray-300 space-y-8 leading-relaxed">
                    <section>
                        <p>Welcome to Readov, a product of Readov Tech. Your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your information when you use our app or website. By using Readov, you agree to the terms of this Privacy Policy.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">1. Who We Are</h2>
                        <p>Readov Tech is a technology company founded by two brothers with a mission to change the way people learn and create stories or manga images through artificial intelligence. We value creativity, education, and trust — and that includes protecting your data.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">2. Information We Collect</h2>
                        <p className="mb-4">We collect only the information necessary to provide and improve your experience. This may include:</p>

                        <h3 className="text-lg font-semibold text-white mt-4 mb-2">a. Information You Provide</h3>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                            <li>Name, email address, and account details when you sign up or contact us.</li>
                            <li>Story preferences, genres, learning subjects, or other creative inputs you provide inside the app.</li>
                            <li>Payment information (processed securely by trusted third-party payment providers — we do not store your credit card details).</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-white mt-4 mb-2">b. Automatically Collected Data</h3>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                            <li>Device type, browser type, IP address, and general location (for performance and security).</li>
                            <li>Usage data such as the number of generated stories, features used, or time spent in the app.</li>
                            <li>Cookies and similar technologies (see Section 6).</li>
                        </ul>

                        <h3 className="text-lg font-semibold text-white mt-4 mb-2">c. AI-Generated Content</h3>
                        <p>We may temporarily store stories or images generated in your account to improve AI accuracy and user experience.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                        <p className="mb-2">We use your information to:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                            <li>Operate and maintain the Readov platform.</li>
                            <li>Personalize your story generation experience.</li>
                            <li>Improve AI models and develop new features.</li>
                            <li>Communicate updates, support, and offers (only if you've agreed).</li>
                            <li>Process payments for subscriptions.</li>
                            <li>Protect against misuse, fraud, or illegal activity.</li>
                        </ul>
                        <p>We never sell your personal data to third parties.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">4. Data Ownership</h2>
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10 space-y-4">
                            <p><strong>For Free Plan users:</strong> Generated stories and images may be analyzed or reused by Readov Tech for research and platform improvement.</p>
                            <p><strong>For Premium and Super Plan users:</strong> Content belongs to you. Readov may store it securely to enhance AI quality but will not publish or share it without your consent.</p>
                        </div>
                        <p className="mt-4">You may request deletion of your data or generated content at any time.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">5. How We Protect Your Data</h2>
                        <p>We use standard industry security measures, including encryption, secure servers, and restricted access, to protect your information. While no system is 100% secure, we continually improve our security to safeguard your data against unauthorized access or misuse.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">6. Cookies and Tracking Technologies</h2>
                        <p>We use cookies and similar tools to:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-2 mb-4">
                            <li>Keep you logged in.</li>
                            <li>Remember your preferences.</li>
                            <li>Analyze usage to improve performance.</li>
                        </ul>
                        <p>You can disable cookies in your browser settings, but some features may not function properly without them.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">7. Data Sharing and Third Parties</h2>
                        <p className="mb-2">We may share limited data only with trusted service providers who help us run the app — such as:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                            <li>Payment processors,</li>
                            <li>Cloud hosting services,</li>
                            <li>Email or analytics providers.</li>
                        </ul>
                        <p className="mb-2">They are required to handle your data securely and only for the purpose of providing their service to us.</p>
                        <p>We do not share, sell, or rent your personal data for marketing purposes.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">8. International Data Transfers</h2>
                        <p>Your information may be processed or stored on servers located outside your country, including in regions with different data protection laws. By using Readov, you consent to such transfers, provided that appropriate data protection measures are in place.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">9. Your Rights</h2>
                        <p className="mb-2">Depending on your country, you may have the right to:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                            <li>Access a copy of your data.</li>
                            <li>Correct inaccurate information.</li>
                            <li>Request deletion of your data.</li>
                            <li>Withdraw consent for data processing.</li>
                            <li>Request a copy of your data for transfer.</li>
                        </ul>
                        <p>To exercise these rights, contact us at <a href="mailto:support@readov.com" className="text-purple-400">support@Readov.com</a>.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">10. Children's Privacy</h2>
                        <p>Readov is designed for users of all ages. If you are under 13, please use the platform under the supervision of a parent or guardian. We do not knowingly collect personal data from children under 13 without parental consent.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">11. Data Retention</h2>
                        <p>We retain your information only as long as necessary to provide our services or comply with legal requirements. You can request account deletion at any time, and your personal data will be permanently removed within a reasonable period.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">12. Links to Other Websites</h2>
                        <p>Readov may contain links to third-party sites (e.g., tutorials, tools, or payment gateways). We are not responsible for the privacy practices of those websites.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">13. Updates to This Policy</h2>
                        <p>We may update this Privacy Policy occasionally to reflect improvements or legal requirements. When changes are made, we'll update the effective date and notify users through the app or email.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">14. Contact Us</h2>
                        <p>If you have any questions or concerns about this Privacy Policy, please contact: <a href="mailto:support@readov.com" className="text-purple-400 hover:text-purple-300">support@Readov.com</a></p>
                    </section>

                </div>
            </div>
        </div>
    );
}
