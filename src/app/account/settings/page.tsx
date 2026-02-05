'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Lock, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
    const supabase = createClient()
    const router = useRouter()

    const handlePasswordReset = async () => {
        const email = prompt("Enter your email to receive a password reset link:")
        if (!email) return

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/account/settings/update-password`,
        })

        if (error) {
            alert(error.message)
        } else {
            alert("Password reset email sent!")
        }
    }

    const handleDeleteAccount = async () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            // In a real app, call a Supabase Edge Function to delete the user from auth.users
            // For now, sign out
            alert("Please contact support to delete your account permanently.")
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
                <Link href="/stories" className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Settings</h2>
                    <p className="text-sm text-gray-400">Security & Account</p>
                </div>
            </div>

            <div className="glass-dark p-8 rounded-2xl border border-white/5 space-y-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
                    <div className="flex items-center gap-3 text-white font-medium">
                        <Lock className="w-5 h-5 text-gray-400" />
                        Password
                    </div>
                    <p className="text-sm text-gray-400">
                        Send a password reset link to your email address to change your password.
                    </p>
                    <button
                        onClick={handlePasswordReset}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors border border-white/10"
                    >
                        Reset Password
                    </button>
                </div>

                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-4">
                    <div className="flex items-center gap-3 text-red-400 font-medium">
                        <Trash2 className="w-5 h-5" />
                        Delete Account
                    </div>
                    <p className="text-sm text-gray-400">
                        Permanently delete your account and all associated data.
                    </p>
                    <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-lg transition-colors border border-red-500/20"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    )
}
