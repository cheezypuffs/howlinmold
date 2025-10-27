import React from 'react';
import type { User } from '../types';
import * as Icons from './Icons';
import { cn } from '../utils/cn';

interface UserStatusButtonProps {
    user: User | null;
    setActiveView: (view: string) => void;
}

const UserStatusButton: React.FC<UserStatusButtonProps> = ({ user, setActiveView }) => {
    // Style tag for custom animation as requested
    const animationStyle = `
        @keyframes pulse-light {
            0% { transform: scale(1); }
            50% { transform: scale(1.04); }
            100% { transform: scale(1); }
        }
        .animate-pulse-light {
            animation: pulse-light 1.8s infinite;
        }
    `;

    if (!user) {
        return null;
    }

    const handleNavigate = () => {
        setActiveView('subscribe');
    };

    const { subscription_tier, discovery_credits } = user;

    switch (subscription_tier) {
        case 'lite':
            return (
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-slate-200 text-slate-800 cursor-default">
                    <Icons.Sparkles className="w-4 h-4 mr-1.5 inline-block" /> LITE
                </div>
            );
        
        case 'studio':
            return (
                <div className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-gradient-to-tr from-yellow-300 to-rose-700 text-white cursor-default">
                    <Icons.Sparkles className="w-4 h-4 mr-1.5 inline-block" /> STUDIO
                </div>
            );

        default: // free tier
            const credits = discovery_credits ?? 0;
            const isLowOnCredits = credits < 5;

            if (isLowOnCredits) {
                return (
                    <>
                        <style>{animationStyle}</style>
                        <button
                            className="flex items-center px-4 py-2 rounded-full font-semibold text-sm text-white bg-orange-600 transition-all duration-300 ease-in-out animate-pulse-light"
                            onClick={handleNavigate}
                        >
                            Upgrade Now
                        </button>
                    </>
                );
            } else {
                return (
                    <button
                        className="flex items-center px-4 py-2 rounded-full font-semibold text-sm bg-slate-200 text-slate-800 transition-all duration-300 ease-in-out hover:bg-slate-300 hover:-translate-y-px"
                        onClick={handleNavigate}
                    >
                        {credits} Credits Remaining
                    </button>
                );
            }
    }
};

export default UserStatusButton;