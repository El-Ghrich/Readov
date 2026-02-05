'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail, Zap, ArrowLeft, UserIcon, Sliders, Save } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // Preferences State
    const [preferences, setPreferences] = useState({
        language: 'English',
        storyLength: 'medium',
        autoScroll: true
    })

    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        async function loadData() {
            // Load User
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)

            const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()
            setProfile(data)
            setLoading(false)

            // Load Preferences
            const saved = localStorage.getItem('readov_prefs')
            if (saved) {
                setPreferences(JSON.parse(saved))
            }
        }
        loadData()
    }, [router, supabase])

    const handleSavePreferences = () => {
        localStorage.setItem('readov_prefs', JSON.stringify(preferences))
        // Basic feedback - could be improved with a toast
        alert('Preferences saved successfully!')
    }

    if (loading) return <div className="text-center text-muted-foreground p-8">Loading Profile...</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Link href="/stories" className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">Account & Preferences</h2>
                    <p className="text-sm text-muted-foreground">Manage your personal information and settings</p>
                </div>
            </div>

            <div className="grid gap-8">
                {/* Profile Section */}
                <section className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-primary" />
                        Personal Information
                    </h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">First Name</label>
                                <div className="px-4 py-3 bg-muted/50 border border-border rounded-lg text-foreground">
                                    {profile?.first_name || '-'}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Last Name</label>
                                <div className="px-4 py-3 bg-muted/50 border border-border rounded-lg text-foreground">
                                    {profile?.last_name || '-'}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                            <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border border-border rounded-lg text-foreground">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                {user?.email}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Plan</label>
                            <div className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-primary" />
                                    <span className="text-foreground font-medium capitalize">{profile?.plan || 'Free'} Plan</span>
                                </div>
                                {profile?.plan !== 'premium' && (
                                    <Link href="/payment" className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-full font-bold hover:opacity-90 transition-transform">
                                        Upgrade
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Preferences Section */}
                <section className="bg-card p-8 rounded-2xl border border-border shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-primary" />
                        Preferences
                    </h3>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Default Language</label>
                                <select
                                    value={preferences.language}
                                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                                >
                                    <option value="English">English</option>
                                    <option value="Spanish">Spanish</option>
                                    <option value="French">French</option>
                                    <option value="Arabic">Arabic</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-2">Story Length</label>
                                <select
                                    value={preferences.storyLength}
                                    onChange={(e) => setPreferences({ ...preferences, storyLength: e.target.value })}
                                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                                >
                                    <option value="short">Short</option>
                                    <option value="medium">Medium</option>
                                    <option value="long">Long</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-4 border-t border-border">
                            <span className="text-foreground font-medium">Auto-scroll to new parts</span>
                            <button
                                onClick={() => setPreferences({ ...preferences, autoScroll: !preferences.autoScroll })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${preferences.autoScroll ? 'bg-primary' : 'bg-muted'
                                    }`}
                            >
                                <div
                                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${preferences.autoScroll ? 'translate-x-6' : ''
                                        }`}
                                />
                            </button>
                        </div>

                        <button
                            onClick={handleSavePreferences}
                            className="w-full md:w-auto px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 ml-auto"
                        >
                            <Save className="w-4 h-4" />
                            Save Preferences
                        </button>
                    </div>
                </section>
            </div>
        </div>
    )
}
