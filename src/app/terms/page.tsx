import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Terms of Use</h1>
                    <p className="text-gray-400">Updated November 2, 2025</p>
                </div>

                <div className="prose prose-invert max-w-none text-gray-300 space-y-8 leading-relaxed">
                    <section>
                        <p>Welcome to Readov, a creative storytelling platform developed by Readov Tech. By accessing or using Readov, you agree to these Terms of Use. Please read them carefully before using our app or website.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">1. About Readov</h2>
                        <p className="mb-4">Readov – (OV = Open Vision) is a vision-driven creation by two brothers who believe that learning and creativity should be both inspiring and limitless.</p>
                        <p className="mb-4">Our mission is to transform the way people learn, imagine, and create—whether it's stories, scenes, manga, or even a complete show in the near future — using the power of AI.</p>
                        <p>By seamlessly blending storytelling and education, Readov empowers users to explore their creativity, learn through engaging narratives, and experience the future of storytelling like never before.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">2. Acceptance of Terms</h2>
                        <p>By using Readov, you agree to comply with these Terms and all applicable laws. If you do not agree, please stop using the platform immediately.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">3. Eligibility</h2>
                        <p>Readov is available to users of all ages. However, if you are under 13, please use the platform under the supervision of a parent or guardian.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">4. Plans and Ownership of Content</h2>
                        <p className="mb-4">Readov offers three plans:</p>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                <div className="font-bold text-white mb-2">Free Plan</div>
                                <div className="text-sm text-gray-400">All stories and images generated under the free plan belong to Readov Tech. We may use them for research, improvements, or promotional purposes.</div>
                            </div>
                            <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-500/20">
                                <div className="font-bold text-white mb-2">Premium Plan</div>
                                <div className="text-sm text-gray-400">The stories and images generated belong to the user, but Readov may store them to improve its AI models (without publishing them).</div>
                            </div>
                            <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-500/20">
                                <div className="font-bold text-white mb-2">Super Plan</div>
                                <div className="text-sm text-gray-400">The user retains full ownership of all generated content, including text and images, and may request permanent deletion at any time.</div>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">5. Responsible Use</h2>
                        <p className="mb-2">You agree to use Readov ethically and respectfully. Do not generate, share, or promote stories or images that include:</p>
                        <ul className="list-disc pl-5 space-y-1 mb-4">
                            <li>Hate speech, violence, harassment, or discrimination.</li>
                            <li>Adult or explicit content.</li>
                            <li>False, misleading, or harmful information.</li>
                            <li>Any illegal or unethical themes.</li>
                        </ul>
                        <p>Readov Tech is not responsible for any inappropriate, offensive, or harmful use of the app by users.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">6. AI-Generated Content Disclaimer</h2>
                        <p className="mb-2">Readov uses artificial intelligence to generate stories, text, and images. Because of the nature of AI, outputs may sometimes contain factual errors, biased content, or unintended meanings. You understand and agree that:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>The generated content is not guaranteed to be accurate or appropriate.</li>
                            <li>You are responsible for reviewing, editing, and verifying all outputs before using or sharing them.</li>
                            <li>Readov Tech is not liable for any damages or consequences resulting from reliance on AI-generated content.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">7. Subscription and Payments</h2>
                        <p>All paid plans are billed monthly. By subscribing, you authorize recurring charges according to your selected plan. You may cancel your subscription anytime, and your access will continue until the end of the current billing period. No refunds are provided for partial billing periods unless required by law.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">8. Privacy</h2>
                        <p>We value your privacy. Personal data collected through Readov (such as name, email, and preferences) will be handled in accordance with our Privacy Policy. By using Readov, you consent to the collection and use of your information for platform functionality, personalization, and improvement.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">9. Intellectual Property</h2>
                        <p>All code, design, graphics, AI models, and materials used within Readov are owned by Readov Tech. Users may not copy, modify, distribute, or exploit any part of the platform without prior written permission.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">10. Termination</h2>
                        <p>We may suspend or terminate access to Readov at any time if we believe a user has violated these Terms or engaged in harmful activity. Upon termination, all rights to use the platform will immediately end.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">11. Limitation of Liability</h2>
                        <p>Readov is provided "as is," without warranties of any kind. Readov Tech is not liable for any direct or indirect damages resulting from the use or inability to use the platform, including loss of data, profits, or reputation.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">12. Governing Law</h2>
                        <p>These Terms are governed by the laws of the Kingdom of Morocco, without regard to conflict of law principles. Any disputes will be resolved in the competent courts of Morocco.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">13. Changes to These Terms</h2>
                        <p>We may update these Terms periodically. Changes will take effect when posted on our website or app. Continued use after updates means you accept the revised Terms.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-white mb-4">14. Contact</h2>
                        <p>For questions or concerns about these Terms, please contact us at: <a href="mailto:support@readov.com" className="text-purple-400 hover:text-purple-300">support@Readov.com</a></p>
                    </section>

                </div>
            </div>
        </div>
    );
}
