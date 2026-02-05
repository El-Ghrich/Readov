'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

export default function FooterWrapper() {
    const pathname = usePathname();

    // List of paths where the footer should appear
    // Usually landing page, and maybe info pages if they are not "in-app"
    // For this app, let's keep it on Landing Page, About, Terms, Privacy, Support, Contact, Payment
    const showFooterPaths = ['/', '/about', '/terms', '/privacy', '/support', '/contact', '/payment'];

    const shouldShowFooter = showFooterPaths.includes(pathname);

    if (!shouldShowFooter) {
        return null;
    }

    return <Footer />;
}
