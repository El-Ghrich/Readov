'use client'

import { Check, Star, Zap } from 'lucide-react'

export default function PaymentPage() {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            period: '/month',
            features: [
                '3 Stories per day',
                'Basic AI Model',
                'Standard Generation Speed',
                'Community Access'
            ],
            cta: 'Current Plan',
            active: true
        },
        {
            name: 'Premium',
            price: '$9.99',
            period: '/month',
            features: [
                'Unlimited Stories',
                'Advanced AI Model (Mistral Large)',
                'Fast Generation Speed',
                'Image Generation',
                'Priority Support'
            ],
            cta: 'Upgrade Now',
            highlight: true
        }
    ]

    const handleUpgrade = () => {
        // Integrate Stripe here
        alert("Stripe integration would redirect here")
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-white mb-4">Payment</h1>
                <p className="text-gray-400 max-w-2xl mx-auto mb-16">
                    Unlock the full potential of Readov with our Premium plan. Generate unlimited stories with advanced AI and visualize them with image generation.
                </p>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan) => (
                        <div key={plan.name} className={`relative p-8 rounded-2xl border ${plan.highlight ? 'glass-dark border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'glass border-white/5'} flex flex-col`}>
                            {plan.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                    <Zap className="w-3 h-3" />
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-gray-400">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8 flex-1 text-left">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3 text-gray-300">
                                        <Check className={`w-5 h-5 flex-shrink-0 ${plan.highlight ? 'text-purple-400' : 'text-gray-500'}`} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={plan.highlight ? handleUpgrade : undefined}
                                disabled={plan.active}
                                className={`w-full py-4 rounded-xl font-bold transition-all ${plan.active
                                    ? 'bg-white/10 text-gray-400 cursor-default'
                                    : 'bg-white text-black hover:bg-gray-200 hover:scale-105'
                                    }`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
