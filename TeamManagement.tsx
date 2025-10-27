import React from 'react';
import * as Icons from '../Icons';

const TeamManagement: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8 bg-black/30 rounded-lg border border-white/10">
            <Icons.Users2 className="w-16 h-16 mb-4" />
            <h2 className="text-2xl font-bold text-slate-300">Team Management</h2>
            <p className="mt-2 max-w-md">
                This feature for managing user roles and permissions is currently under development.
            </p>
        </div>
    );
};

export default TeamManagement;
