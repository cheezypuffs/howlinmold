import React from 'react';

// Mock components for missing dependencies
export const ChatOverlay: React.FC<{children: React.ReactNode}> = ({ children }) => <div className="chat-overlay">{children}</div>;
// Using basic div instead of react-grid-layout for now
export const GridLayout: React.FC<{children: React.ReactNode}> = ({ children, ...props }) => <div className="grid-layout" {...props}>{children}</div>;
// Using basic div instead of react-window for now  
export const List: React.FC<{children: React.ReactNode}> = ({ children, ...props }) => <div className="virtualized-list" {...props}>{children}</div>;