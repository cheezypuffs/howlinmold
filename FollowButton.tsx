

import React, { useState, useEffect } from 'react';
import { socialService } from '../../services/socialService';
import { Button } from '../ui/button';
import * as Icons from '../Icons';

interface FollowButtonProps {
    targetUserId: string;
    currentUserId: string;
    onDataChange: () => void;
}

const FollowButton: React.FC<FollowButtonProps> = ({ targetUserId, currentUserId, onDataChange }) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsFollowing(socialService.isFollowing(currentUserId, targetUserId));
    }, [currentUserId, targetUserId, onDataChange]);

    const handleFollow = async () => {
        setIsLoading(true);
        if (isFollowing) {
            await socialService.unfollowUser(currentUserId, targetUserId);
        } else {
            await socialService.followUser(currentUserId, targetUserId);
        }
        onDataChange();
        setIsLoading(false);
    };

    if (targetUserId === currentUserId) return null;

    return (
        <Button onClick={handleFollow} disabled={isLoading} size="sm" variant={isFollowing ? 'outline' : 'default'} className="w-full">
            {isLoading ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : isFollowing ? 'Following' : 'Follow'}
        </Button>
    );
};

export default FollowButton;