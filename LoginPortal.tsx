
// components/LoginPortal.tsx
import React, { useState } from 'react';
import { User } from '../entities/User';
import type { User as UserType } from '../types';
import * as Icons from './Icons';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';

interface LoginPortalProps {
  onLogin: (user: UserType) => void;
}

const LoginPortal: React.FC<LoginPortalProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('canon@howlinmold.com');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = await User.login(email);
            if (user) {
                toast({ title: 'Welcome', description: `Logged in as ${user.name}.`, type: 'success' });
                onLogin(user);
            } else {
                toast({ title: 'Login Failed', description: 'User not found.', type: 'error' });
            }
        } catch (error) {
            toast({ title: 'Error', description: 'An unexpected error occurred.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen bg-black text-white flex items-center justify-center font-sans">
            <div className="w-full max-w-sm p-8 bg-slate-900/50 border border-purple-500/20 rounded-2xl shadow-lg">
                <div className="text-center mb-8">
                    <Icons.Gem className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold">HOWLIN' MOLD</h1>
                    <p className="text-slate-400">Enter the Ritual</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <Input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="h-12 text-center"
                        disabled={isLoading}
                    />
                    <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                        {isLoading ? <Icons.Loader2 className="animate-spin" /> : 'Enter'}
                    </Button>
                </form>
                 <p className="text-xs text-slate-500 text-center mt-6">
                    This is a simulated login. Use 'canon@howlinmold.com' for admin access.
                </p>
            </div>
        </div>
    );
};

export default LoginPortal;
