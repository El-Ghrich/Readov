import Link from "next/link";
import { ArrowLeft, LifeBuoy, Mail } from "lucide-react";

export default function SupportPage() {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
            </div>

            <div className="glass-dark p-8 md:p-12 rounded-2xl border border-white/5 text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Feedback & Support</h1>
                <p className="text-xl text-gray-400 mb-12">Find answers or share your thoughts to help us improve.</p>

                <div className="max-w-md mx-auto space-y-6">
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                        <LifeBuoy className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Help Center</h3>
                        <p className="text-gray-400 mb-4">Need assistance? Our support team is here for you.</p>
                        <a href="mailto:support@readov.com" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">Contact Support</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
