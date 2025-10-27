
import React from 'react';
import type { User } from '../../types';
import { Avatar } from '../ui/avatar';
import FollowButton from './FollowButton';
import { motion } from '../motion';

interface UserCardProps {
    user: User;
    currentUser: User;
    onViewProfile: (user: User) => void;
    onDataChange: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, currentUser, onViewProfile, onDataChange }) => {
    return (
        <motion.div
            className="user-card"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
        >
            <div onClick={() => onViewProfile(user)} className="flex flex-col items-center gap-2 cursor-pointer">
                <Avatar className="h-14 w-14">
                    <img src={user.avatarUrl} alt={user.name} />
                </Avatar>
                <div className="text-center">
                    <p className="font-bold text-white">{user.name}</p>
                    <p className="text-sm text-slate-400">{user.handle}</p>
                </div>
            </div>
            <FollowButton
                targetUserId={user.id}
                currentUserId={currentUser.id}
                onDataChange={onDataChange}
            />
        </motion.div>
    );
};

export default UserCard;