
// components/TheJournal.tsx
import React, { useMemo, useState } from 'react';
import type { User, ActivityItem } from '../types';
import { socialService } from '../services/socialService';
import { activityService } from '../services/activityService';
import ActivityFeed from './social/ActivityFeed';
import { ScrollArea } from './ui/scroll-area';
import * as Icons from './Icons';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { cn } from '../utils/cn';

interface TheJournalProps {
    onViewProfile: (user: User) => void;
    socialDataVersion: number;
}

const getActivitySearchableString = (activity: ActivityItem, users: User[]): string => {
    const user = users.find(u => u.id === activity.userId);
    const userName = user?.name || 'Someone';

    switch (activity.type) {
        case 'play':
            return `${userName} played ${activity.data.trackName || ''} by ${activity.data.artist || ''}`;
        case 'post':
            return `${userName} shared a journal entry ${activity.data.content || ''}`;
        case 'like':
            return `${userName} liked a post`;
        case 'follow':
            const targetUser = users.find(u => u.id === activity.data.targetUserId);
            return `${userName} followed ${targetUser?.name || 'someone'}`;
        case 'share':
            return `${userName} shared ${activity.data.trackName || ''}`;
        case 'discover':
            return `${userName} discovered a new artist`;
        default:
            return userName;
    }
};

const TheJournal: React.FC<TheJournalProps> = ({ onViewProfile, socialDataVersion }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | ActivityItem['type']>('all');
    
    const { users, filteredActivities } = useMemo(() => {
        const data = socialService.getSocialData();
        const allActivities = activityService.generateActivities();
        const lowercasedSearch = searchTerm.toLowerCase();

        const activities = allActivities
            .filter(activity => {
                if (activeFilter === 'all') return true;
                return activity.type === activeFilter;
            })
            .filter(activity => {
                if (!lowercasedSearch) return true;
                const searchableString = getActivitySearchableString(activity, data.users).toLowerCase();
                return searchableString.includes(lowercasedSearch);
            });

        return {
            users: data.users,
            filteredActivities: activities,
        };
    }, [socialDataVersion, searchTerm, activeFilter]);
    
    const filterTypes: ('all' | ActivityItem['type'])[] = ['all', 'post', 'play', 'like', 'follow', 'share', 'discover'];

    return (
        <div className="p-4 h-full flex flex-col bg-black/20 rounded-3xl">
            <header className="flex justify-between items-center mb-6 px-2 flex-shrink-0">
                <div className="flex items-center gap-4">
                     <Icons.BookIcon className="w-8 h-8 text-purple-400" />
                    <div>
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">The Journal</h1>
                        <p className="text-slate-400 text-sm">A real-time feed of the Pack's sonic explorations.</p>
                    </div>
                </div>
            </header>
            <main className="flex-grow min-h-0 flex justify-center">
                <div className="w-full max-w-3xl flex flex-col">
                    <div className="flex-shrink-0 mb-4 space-y-4">
                        <div className="relative">
                            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <Input
                                placeholder="Search activities by keyword, user, or track..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 bg-black/30 border-white/20"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {filterTypes.map(type => (
                                <Button
                                    key={type}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setActiveFilter(type)}
                                    className={cn(
                                        'capitalize border-white/20 transition-all',
                                        activeFilter === type ? 'bg-purple-500/30 border-purple-400 text-white' : 'text-slate-300 hover:bg-white/10'
                                    )}
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <ScrollArea className="h-full pr-4 -mr-4">
                        <ActivityFeed activities={filteredActivities} users={users} onViewProfile={onViewProfile} />
                    </ScrollArea>
                </div>
            </main>
        </div>
    );
};

export default TheJournal;
