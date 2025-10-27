import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../utils/cn';

const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
}>({
  activeTab: '',
  setActiveTab: () => {},
});

const Tabs: React.FC<{ children: React.ReactNode; value: string; onValueChange: (value: string) => void; className?: string; }> = ({ children, value, onValueChange, className }) => {
  return (
    <TabsContext.Provider value={{ activeTab: value, setActiveTab: onValueChange }}>
      <div className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<{ children: React.ReactNode; className?: string; }> = ({ children, className }) => (
  <div className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)}>
    {children}
  </div>
);

const TabsTrigger: React.FC<{ children: React.ReactNode; value: string; className?: string; disabled?: boolean; }> = ({ children, value, className, disabled }) => {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => !disabled && setActiveTab(value)}
      disabled={disabled}
      data-state={isActive ? 'active' : 'inactive'}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<{ children: React.ReactNode; value: string; className?: string; }> = ({ children, value, className }) => {
  const { activeTab } = useContext(TabsContext);
  return activeTab === value ? <div className={cn('mt-2', className)}>{children}</div> : null;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };