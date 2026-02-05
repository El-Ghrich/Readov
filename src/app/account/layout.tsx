'use client'

export default function AccountLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {children}
            </div>
        </div>
    )
}
