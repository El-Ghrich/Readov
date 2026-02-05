import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-[#0d0c1d]/90 backdrop-blur-xl transition-colors duration-300 z-50 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-1 space-y-4">
                        <Link href="/" className="inline-block cursor-pointer">
                            <div className="relative w-32 h-10">
                                {/* Assuming logo is available at /logo.png, adjust if needed */}
                                <img
                                    src="/logo_white.png"
                                    alt="Readov Logo"
                                    className="object-contain w-full h-full"
                                />
                            </div>
                        </Link>
                        <p className="text-sm text-[#a1a1b5] leading-relaxed">
                            Turn your imagination into living stories. The platform where every page is a new adventure.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div className="col-span-1 text-center md:text-left">
                        <h4 className="font-semibold text-white mb-4">Platform</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/create" className="text-[#a1a1b5] hover:text-[#4e45e3] transition-colors cursor-pointer">Start Creating</Link></li>
                            <li><Link href="/explore" className="text-[#a1a1b5] hover:text-[#4e45e3] transition-colors cursor-pointer">Explore Library</Link></li>
                            <li><Link href="/features" className="text-[#a1a1b5] hover:text-[#4e45e3] transition-colors cursor-pointer">Features</Link></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div className="col-span-1 text-center md:text-left">
                        <h4 className="font-semibold text-white mb-4">Company</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/about" className="text-[#a1a1b5] hover:text-[#4e45e3] transition-colors cursor-pointer">About Us</Link></li>
                            <li><Link href="/contact" className="text-muted-foreground hover:text-[#4e45e3] transition-colors cursor-pointer">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Links Column 3 */}
                    <div className="col-span-1 text-center md:text-left">
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/privacy" className="text-[#a1a1b5] hover:text-[#4e45e3] transition-colors cursor-pointer">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-[#a1a1b5] hover:text-[#4e45e3] transition-colors cursor-pointer">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#a1a1b5]">
                    <p>&copy; {new Date().getFullYear()} Readov. All rights reserved.</p>
                    <div className="flex gap-6">
                        {/* Social Placeholders could go here */}
                        <Link href="#" className="hover:text-white transition-colors cursor-pointer">Twitter</Link>
                        <Link href="#" className="hover:text-white transition-colors cursor-pointer">Instagram</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
