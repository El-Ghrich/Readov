import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
            </div>

            <div className="glass-dark p-8 md:p-12 rounded-2xl border border-white/5 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Contact Us</h1>
                <p className="text-xl text-gray-400 mb-12">We'd love to hear from you! Reach us right here.</p>

                <div className="max-w-md mx-auto space-y-6">
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                        <Mail className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Email Us</h3>
                        <p className="text-gray-400 mb-4">For general inquiries and support.</p>
                        <a href="mailto:support@readov.com" className="text-purple-400 font-bold hover:underline">support@readov.com</a>
                    </div>

                    {/* 
             <div className="bg-white/5 p-6 rounded-xl border border-white/10 opacity-50">
                 <MessageSquare className="w-8 h-8 text-gray-500 mx-auto mb-4" />
                 <h3 className="text-lg font-bold text-gray-300 mb-2">Live Chat</h3>
                 <p className="text-gray-500">Coming soon.</p>
             </div>
             */}
                </div>
            </div>
        </div>
    );
}
