'use client'

import { useState, useEffect } from 'react'
import { Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function PreferencesPage() {
    const [preferences, setPreferences] = useState({
        language: 'English',
        storyLength: 'medium',
        autoScroll: true
    })

    // Load from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('readov_prefs')
        if (saved) {
            setPreferences(JSON.parse(saved))
        }
    }, [])

    const handleSave = () => {
        localStorage.setItem('readov_prefs', JSON.stringify(preferences))
        alert('Preferences saved successfully!')
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
                <Link href="/stories" className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Preferences</h2>
                    <p className="text-sm text-gray-400">Customize reading experience</p>
                </div>
            </div>

            <div className="glass-dark p-8 rounded-2xl border border-white/5 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Default Language</label>
                    <select
                        value={preferences.language}
                        onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="Arabic">Arabic</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Story Length</label>
                    <select
                        value={preferences.storyLength}
                        onChange={(e) => setPreferences({ ...preferences, storyLength: e.target.value })}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                    >
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                    </select>
                </div>

                <div className="flex items-center justify-between py-4 border-t border-white/5">
                    <span className="text-gray-300">Auto-scroll to new parts</span>
                    <button
                        onClick={() => setPreferences({ ...preferences, autoScroll: !preferences.autoScroll })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${preferences.autoScroll ? 'bg-purple-600' : 'bg-gray-700'
                            }`}
                    >
                        <div
                            className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${preferences.autoScroll ? 'translate-x-6' : ''
                                }`}
                        />
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                    <Save className="w-4 h-4" />
                    Save Changes
                </button>
            </div>
        </div>
    )
}
