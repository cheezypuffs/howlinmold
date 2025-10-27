import React from 'react';
import * as Icons from '../Icons';

const ActivityPanel: React.FC = () => {
  return (
    <div className="bg-black/20 p-4 rounded-lg border border-white/10 h-full">
      <h3 className="text-sm font-bold text-slate-400 mb-4">Activity</h3>
      <div className="flex flex-col items-center justify-center h-full text-slate-500">
        <Icons.Activity className="w-8 h-8 mb-2" />
        <p className="text-xs">Activity Panel</p>
        <p className="text-xs">(Placeholder)</p>
      </div>
    </div>
  );
};

export default ActivityPanel;
