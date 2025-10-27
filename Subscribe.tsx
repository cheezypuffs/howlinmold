// FIX: Added React import to solve JSX errors.
import React, { useState, useEffect } from 'react';
import { User } from '../entities/User';
import { Button } from "./ui/button";
import {
  Eye, Zap, Sparkles, CreditCard, CheckCircle, AlertCircle, Loader2, Users, Infinity, BrainCircuit, BarChart3
} from './Icons';
import { motion, AnimatePresence } from './motion';
import { createCheckoutSession } from "../functions/createCheckoutSession";
import { InvokeLLM } from '../integrations/Core';
import type { User as UserType } from '../types';
import { SignalTransmission } from '../entities/SignalTransmission';
import { cn } from '../utils/cn';

interface SubscribeProps {
    user: UserType | null;
    setActiveView: (view: string) => void;
}

const GlowingIcon = ({ children, className = "", delay = 0 }: { children?: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.6 }}
    className={`relative ${className}`}
  >
    <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full animate-pulse"></div>
    <div className="relative z-10">{children}</div>
  </motion.div>
);

const StatusBanner = ({ type, message, onDismiss, children }: { type: 'success' | 'error' | 'info', message: string, onDismiss?: () => void, children?: React.ReactNode }) => {
  const config = {
    success: { icon: <CheckCircle className="w-5 h-5" />, bgColor: 'bg-green-900/20', borderColor: 'border-green-500/30', textColor: 'text-green-400' },
    error: { icon: <AlertCircle className="w-5 h-5" />, bgColor: 'bg-red-900/20', borderColor: 'border-red-500/30', textColor: 'text-red-400' },
    info: { icon: <Eye className="w-5 h-5" />, bgColor: 'bg-blue-900/20', borderColor: 'border-blue-500/30', textColor: 'text-blue-400' }
  };
  const { icon, bgColor, borderColor, textColor } = config[type] || config.info;
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}  className={`max-w-3xl mx-auto mb-8 p-4 ${bgColor} border ${borderColor} rounded-lg flex flex-col items-center gap-3 text-center`}>
      <div className="flex items-center gap-3">
        <GlowingIcon><div className={textColor}>{icon}</div></GlowingIcon>
        <p className={`${textColor} flex-1`}>{message}</p>
        {onDismiss && <Button onClick={onDismiss} variant="ghost" size="sm" className={`${textColor} hover:bg-white/10`}>×</Button>}
      </div>
      {children && <div className="mt-4 text-left w-full">{children}</div>}
    </motion.div>
  );
};

export default function Subscribe({ user: passedUser, setActiveView }: SubscribeProps) {
  const [loadingState, setLoadingState] = useState({ active: false, message: '' });
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [user, setUser] = useState<UserType | null>(passedUser);
  const [isSuccess, setIsSuccess] = useState(false);
  const [aiWelcome, setAiWelcome] = useState<{ welcome_line: string, directive_1: string, directive_2: string } | null>(null);

  const LOW_CREDIT_THRESHOLD = 5;
  const credits = user?.discovery_credits ?? 0;
  const isLowOnCredits = !user?.subscription_tier && credits <= LOW_CREDIT_THRESHOLD;

  const STRIPE_PRICES = {
    lite_monthly: 'price_LITE_MONTHLY_MOCK',
    studio_monthly: 'price_STUDIO_MONTHLY_MOCK',
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subscriptionStatus = urlParams.get('subscription');
    const tier = urlParams.get('tier') as 'lite' | 'studio';

    const handleSubscriptionSuccess = async () => {
      setIsSuccess(true);
      setStatusMessage({ type: 'success', message: `Welcome to HOWLIN' ${tier.toUpperCase()}! Analyzing your frequency...` });

      try {
        const updatedUser = await User.updateMyUserData({ 
          subscription_tier: tier, 
          is_subscribed: true, 
          discovery_credits: 9999 // Effectively unlimited
        });
        setUser(updatedUser);

        const library = await SignalTransmission.list();
        let personalizationContext = "";
        if (library.length > 3) {
            const genres = library.map(t => t.genre).filter(Boolean);
            const bpms = library.map(t => t.tempo).filter(Boolean).map(Number);
            if(genres.length > 0 && bpms.length > 0){
                const mostCommonGenre = genres.sort((a,b) => genres.filter(v => v===a).length - genres.filter(v => v===b).length).pop();
                const avgBpm = bpms.reduce((a, b) => a + b, 0) / bpms.length;
                personalizationContext = `Their library shows an interest in ${mostCommonGenre} around ${avgBpm.toFixed(0)} BPM.`;
            }
        }
        
        const result = await InvokeLLM({
            // FIX: Changed property access from `full_name` to `name` to match the User type.
            prompt: `A user named ${updatedUser?.name || 'a new canonizer'} just subscribed to HOWLIN' MOLD's "${tier.toUpperCase()}" tier. ${personalizationContext} Generate a short, evocative welcome message (1-2 sentences) in the esoteric style of the app. Then, provide two distinct 'First Directives' for them to explore their new features. Keep it concise and intriguing.`,
            response_json_schema: { type: "object", properties: { welcome_line: { type: "string" }, directive_1: { type: "string" }, directive_2: { type: "string" }}, required: ["welcome_line", "directive_1", "directive_2"] }
        });
        setAiWelcome(result || { welcome_line: "Signal acquired. Full access granted.", directive_1: "Engage the Smart Discovery Engine.", directive_2: "Chart the cosmos in Nebula Mode." });
        setTimeout(() => setActiveView(tier === 'studio' ? 'analytics' : 'deck'), 8000);
      } catch (error) {
        console.error("AI welcome message generation failed:", error);
        setAiWelcome({ welcome_line: "Signal acquired. Full access granted.", directive_1: "Engage the Smart Discovery Engine.", directive_2: "Chart the cosmos in Nebula Mode." });
        setTimeout(() => setActiveView(tier === 'studio' ? 'analytics' : 'deck'), 5000);
      }
    };

    if (subscriptionStatus === 'success' && tier) {
      handleSubscriptionSuccess();
    } else if (subscriptionStatus === 'cancelled') {
      setStatusMessage({ type: 'info', message: 'Your subscription request was cancelled. You can return when ready.' });
    }
    if (subscriptionStatus) window.history.replaceState({}, document.title, window.location.pathname);
  }, [setActiveView]);

  const createStripeCheckoutSession = async (tier: 'lite' | 'studio') => {
    const planKey = `${tier}_monthly` as keyof typeof STRIPE_PRICES;
    setLoadingState({ active: true, message: 'Initializing secure payment...' });
    setStatusMessage(null);
    try {
      const priceId = STRIPE_PRICES[planKey];
      if (!priceId) throw new Error("Payment configuration error.");

      const requestData = {
        priceId, mode: 'subscription' as 'subscription', tier, isAnnual: false,
        successUrl: `${window.location.origin}${window.location.pathname}?subscription=success`,
        cancelUrl: `${window.location.origin}${window.location.pathname}?subscription=cancelled`,
        userId: user?.id || null, userEmail: user?.email || null, customerEmail: user?.email || null,
      };
      const response = await createCheckoutSession(requestData);
      const checkoutUrl = response?.data?.url || response?.url;
      if (!checkoutUrl) throw new Error('Failed to create checkout session.');
      setLoadingState({ active: true, message: 'Redirecting to secure payment...' });
      setTimeout(() => { window.location.href = checkoutUrl; }, 500);
    } catch (error: any) {
      setStatusMessage({ type: 'error', message: error.message || 'Unable to process payment.' });
      setLoadingState({ active: false, message: '' });
    }
  };
  
    const isLoading = loadingState.active;
    const isLite = user?.subscription_tier === 'lite';
    const isStudio = user?.subscription_tier === 'studio';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-auto">
      <div className="relative z-10 p-8">
        <section className="text-center py-16">
          <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">Find Your Sound</h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            {user?.subscription_tier 
              ? `You are on the ${user.subscription_tier.toUpperCase()} plan. Thank you for your support!`
              : `You have ${credits} discovery credits remaining. Upgrade to unlock your full potential.`
            }
          </p>
        </section>

        <AnimatePresence>
            {statusMessage && (isSuccess ? (
              <StatusBanner type="success" message={statusMessage.message}>
                {aiWelcome ? (
                    <div className="text-center">
                        <p className="text-lg font-semibold italic text-white">"{aiWelcome.welcome_line}"</p>
                        <div className="mt-4 text-left space-y-2 max-w-sm mx-auto">
                            <h4 className="font-bold text-gray-300 mb-1 text-center">First Directives:</h4>
                            <p className="text-gray-300">1. {aiWelcome.directive_1}</p>
                            <p className="text-gray-300">2. {aiWelcome.directive_2}</p>
                        </div>
                    </div>
                ) : <Loader2 className="w-5 h-5 animate-spin text-green-400" />}
                 <p className="text-xs text-gray-500 mt-4 text-center">Redirecting you shortly...</p>
              </StatusBanner>
            ) : (
                <StatusBanner type={statusMessage.type} message={statusMessage.message} onDismiss={() => setStatusMessage(null)} />
            ))}
        </AnimatePresence>

        {!isSuccess && (
          <motion.section
            className="py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* LITE TIER */}
              <div className="relative p-8 bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-sm border-2 border-purple-500/30 rounded-xl flex flex-col">
                <h3 className="text-3xl font-bold text-purple-300 mb-2">HOWLIN' MOLD LITE</h3>
                <p className="text-gray-300 text-lg mb-6">The essential listening experience.</p>
                <div className="mb-8"><span className="text-4xl font-bold">$7</span><span className="text-gray-400">/month</span></div>
                <ul className="space-y-3 mb-8 flex-grow">
                    {[ "Unlimited Music Discoveries", "Save & Organize Your Library", "Standard Audio Quality"].map(f => <li key={f} className="flex items-center gap-3"><Sparkles className="w-4 h-4 text-purple-300" /> {f}</li>)}
                </ul>
                <Button onClick={() => createStripeCheckoutSession('lite')} disabled={isLoading || isLite || isStudio} className={cn("w-full bg-purple-600 hover:bg-purple-500 font-bold py-3", isLowOnCredits && "animate-pulse", (isLite || isStudio) && "bg-gray-600 hover:bg-gray-600")}>
                  <CreditCard className="w-5 h-5 mr-2" />
                  {isLite || isStudio ? 'Current Plan' : 'Choose Plan'}
                </Button>
              </div>

              {/* STUDIO TIER */}
              <div className="relative p-8 bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-sm border-2 border-amber-500/50 rounded-xl flex flex-col">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-black text-sm font-bold px-6 py-2 rounded-full">RECOMMENDED</div>
                <h3 className="text-3xl font-bold text-amber-300 mb-2">HOWLIN' MOLD STUDIO</h3>
                <p className="text-gray-300 text-lg mb-6">For creators and sonic scientists.</p>
                <div className="mb-8"><span className="text-4xl font-bold">$15</span><span className="text-gray-400">/month</span></div>
                <ul className="space-y-3 mb-8 flex-grow">
                     {[ "All LITE features, plus:", "The Analytics Dashboard", "AI-Powered Mix Suggestions", "High-Fidelity Audio", "Export Mix History" ].map((f, i) => <li key={f} className={cn("flex items-center gap-3", i === 0 ? "text-purple-300 font-bold" : "")}>{i === 0 ? <CheckCircle className="w-4 h-4 text-purple-300" /> : <BrainCircuit className="w-4 h-4 text-amber-300" />} {f}</li>)}
                </ul>
                <Button onClick={() => createStripeCheckoutSession('studio')} disabled={isLoading || isStudio} className={cn("w-full bg-amber-600 hover:bg-amber-500 text-black font-bold py-3", isLowOnCredits && "animate-pulse", isStudio && "bg-gray-600 hover:bg-gray-600")}>
                    <BarChart3 className="w-5 h-5 mr-2" />
                    {isStudio ? 'Current Plan' : (isLite ? 'Upgrade to Studio' : 'Choose Plan')}
                </Button>
              </div>
            </div>
          </motion.section>
        )}
        
        {!isSuccess && (
             <motion.section className="py-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <div className="max-w-lg mx-auto text-center">
                    <div className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-lg p-8">
                        <h3 className="text-xl font-bold mb-4">
                            {user?.subscription_tier ? 'Manage Your Subscription' : 'Or, Start Where You Are'}
                        </h3>
                        <p className="text-gray-300 mb-6">
                            {user?.subscription_tier 
                                ? 'You can manage your billing and plan details through our secure portal.'
                                : `Explore with ${user?.discovery_credits ?? 20} free discovery credits. Subscribe anytime for unlimited access.`
                            }
                        </p>
                         {user?.subscription_tier ? (
                            <Button variant="ghost" className="text-amber-400 font-bold px-8 py-3"><CreditCard className="w-4 h-4 mr-2" /> Manage Billing</Button>
                         ) : (
                            <Button onClick={() => setActiveView('deck')} disabled={isLoading} variant="ghost" className="text-amber-400 font-bold px-8 py-3"><Eye className="w-4 h-4 mr-2" /> Continue as Guest</Button>
                         )}
                    </div>
                </div>
            </motion.section>
        )}
      </div>
    </div>
  );
}