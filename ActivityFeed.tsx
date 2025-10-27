// components/social/ActivityFeed.tsx
import React from 'react';
import { motion } from '../motion';
import type { ActivityItem, User } from '../../types';
import { Avatar } from '../ui/avatar';
import * as Icons from '../Icons';

interface ActivityFeedProps {
  activities: ActivityItem[];
  users: User[];
  onViewProfile: (user: User) => void;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, users, onViewProfile }) => {
  const getUserById = (userId: string) => users.find(u => u.id === userId);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'play':
        return <Icons.Play className="w-4 h-4 text-green-400" />;
      case 'post':
        return <Icons.FileText className="w-4 h-4 text-blue-400" />;
      case 'like':
        return <Icons.Heart className="w-4 h-4 text-red-400" />;
      case 'follow':
        return <Icons.UserPlus className="w-4 h-4 text-purple-400" />;
      case 'share':
        return <Icons.Share2 className="w-4 h-4 text-cyan-400" />;
      case 'discover':
        return <Icons.Sparkles className="w-4 h-4 text-yellow-400" />;
      default:
        return <Icons.Orbit className="w-4 h-4 text-slate-400" />;
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    const user = getUserById(activity.userId);
    const userName = <span className="font-bold text-white cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); user && onViewProfile(user); }}>{user?.name || 'Someone'}</span>;

    switch (activity.type) {
      case 'play':
        return (
          <>{userName} played <span className="text-purple-300">{activity.data.trackName}</span> {activity.data.artist && <span className="text-slate-400"> by {activity.data.artist}</span>}</>
        );
      case 'post':
        return (
          <>{userName} shared a journal entry {activity.data.content && <div className="text-sm text-slate-400 mt-1 line-clamp-2 italic">"{activity.data.content}"</div>}</>
        );
      case 'like':
        return <>{userName} liked a post</>;
      case 'follow':
        const targetUser = getUserById(activity.data.targetUserId || '');
        const targetName = <span className="font-bold text-cyan-300 cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); targetUser && onViewProfile(targetUser); }}>{targetUser?.name || 'someone'}</span>;
        return <>{userName} followed {targetName}</>;
      case 'share':
        return <>{userName} shared <span className="text-purple-300">{activity.data.trackName}</span></>;
      case 'discover':
        return <>{userName} discovered a new artist</>;
      default:
        return <>{userName}</>;
    }
  };

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Icons.Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No activity yet</p>
        <p className="text-sm mt-2">Follow users to see their musical journey</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const user = getUserById(activity.userId);
        if (!user) return null;

        return (
          <motion.div
            key={activity.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-3">
              <Avatar
                className="h-10 w-10 flex-shrink-0 cursor-pointer"
                onClick={() => onViewProfile(user)}
              >
                <img src={user.avatarUrl} alt={user.name} />
              </Avatar>
              <div className="flex-grow min-w-0">
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                  <div className="flex-grow min-w-0">
                    <p className="text-sm text-slate-200 leading-relaxed">{getActivityText(activity)}</p>
                    {(activity.type === 'play' || activity.type === 'share') && activity.data.albumArt && (
                      <div className="mt-2">
                        <img
                          src={activity.data.albumArt}
                          alt="Album art"
                          className="w-20 h-20 rounded-md shadow-lg"
                        />
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-1">{getRelativeTime(activity.timestamp)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;