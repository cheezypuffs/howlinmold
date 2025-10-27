import React from 'react';

const CollaborationDock: React.FC = () => {
    return (
        <div className="p-4 bg-red-900/50 border border-red-500 text-red-300 rounded-lg">
            <h3 className="font-bold">Developer Notice</h3>
            <p className="text-sm">
                The component `CollaborationDock.tsx` is likely deprecated.
                Please use `CollabDock.tsx` instead. This file is a placeholder to prevent build errors.
            </p>
        </div>
    );
};

export default CollaborationDock;
