import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import * as Icons from '../Icons';

const AdminLogin: React.FC = () => {
    return (
        <Card className="bg-black/30">
            <CardHeader>
                <CardTitle>Admin Login</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-slate-500">
                <Icons.Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>This component is a placeholder for a dedicated admin login screen.</p>
            </CardContent>
        </Card>
    );
};

export default AdminLogin;
