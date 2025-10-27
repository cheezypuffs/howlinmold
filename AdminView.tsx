// FIX: Added React import to solve JSX errors.
import React, { useState } from 'react';
import type { AppState, Action, User as UserType } from '../../types';
import * as Icons from '../Icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';

// Import all the admin panels
import AdminCSVIntegrationPortal from './AdminCSVIntegrationPortal';
import AdminRadio from './AdminRadio';
import BlogAuthoring from './BlogAuthoring';
import AdminSettings from './AdminSettings';
import TeamManagement from './TeamManagement';
import ContentCuration from './ContentCuration';
import Cratebuilder from './Cratebuilder';
import { Card, CardContent } from '../ui/card';

interface AdminViewProps {
    state: AppState;
    dispatch: React.Dispatch<Action>;
    onDataChange: () => void;
    onLogout: () => void;
    user: UserType | null;
}

const AdminView: React.FC<AdminViewProps> = ({ state, dispatch, onDataChange, onLogout, user }) => {
    const [activeTab, setActiveTab] = useState('ingestion');

    if (user?.role !== 'admin') {
        return (
            <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl">
                 <Card className="bg-black/40 border-red-500/30 m-auto">
                    <CardContent className="p-12 text-center">
                    <Icons.Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h3>
                    <p className="text-white/70 max-w-sm">
                        You do not have the required permissions to view the admin panel. 
                        This area is restricted to system administrators.
                    </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl">
            <header className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <Icons.Shield className="w-8 h-8 text-red-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-red-400">Admin Panel</h1>
                        <p className="text-slate-400 text-sm">System configuration and content management.</p>
                    </div>
                </div>
                <Button onClick={onLogout} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                    <Icons.LogOut className="w-4 h-4 mr-2"/> Logout Admin
                </Button>
            </header>
            <main className="flex-grow min-h-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <TabsList className="grid w-full grid-cols-7 bg-black/30">
                        <TabsTrigger value="ingestion">CSV Ingestion</TabsTrigger>
                        <TabsTrigger value="radio">Radio Playlists</TabsTrigger>
                        <TabsTrigger value="blog">Blog Authoring</TabsTrigger>
                        <TabsTrigger value="cratebuilder">Cratebuilder</TabsTrigger>
                        <TabsTrigger value="content">Content Curation</TabsTrigger>
                        <TabsTrigger value="team">Team Management</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>
                    <div className="flex-grow mt-4 overflow-auto">
                        <TabsContent value="ingestion">
                            <AdminCSVIntegrationPortal 
                                onDataChange={onDataChange} 
                                isAdminUser={user?.role === 'admin'} 
                            />
                        </TabsContent>
                        <TabsContent value="radio">
                            <AdminRadio />
                        </TabsContent>
                        <TabsContent value="blog">
                           <BlogAuthoring user={user} />
                        </TabsContent>
                         <TabsContent value="cratebuilder">
                           <Cratebuilder />
                        </TabsContent>
                        <TabsContent value="content">
                            <ContentCuration />
                        </TabsContent>
                        <TabsContent value="team">
                            <TeamManagement />
                        </TabsContent>
                        <TabsContent value="settings">
                            <AdminSettings />
                        </TabsContent>
                    </div>
                </Tabs>
            </main>
        </div>
    );
};

export default AdminView;