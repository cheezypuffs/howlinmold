import React, { createContext, useContext } from 'react';
import { cn } from '../../utils/cn';

// Context to share state between Select components
interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  items: Map<string, React.ReactNode>;
  placeholder?: string;
}

const SelectContext = createContext<SelectContextType | null>(null);

const Select: React.FC<{ children: React.ReactNode; value: string; onValueChange: (value: string) => void; }> = ({ children, value, onValueChange }) => {
  const items = new Map<string, React.ReactNode>();
  let placeholder: string | undefined;

  // Pre-process children to extract item labels and placeholder
  React.Children.forEach(children, child => {
    if (React.isValidElement(child)) {
      if (child.type === SelectContent) {
        React.Children.forEach((child.props as { children?: React.ReactNode }).children, item => {
          if (React.isValidElement<{ value: string; children: React.ReactNode }>(item) && item.type === SelectItem) {
            items.set(item.props.value, item.props.children);
          }
        });
      } else if (child.type === SelectTrigger) {
         const selectValue = React.Children.toArray((child.props as { children?: React.ReactNode }).children).find(
             (c): c is React.ReactElement<{ placeholder?: string }> => React.isValidElement(c) && c.type === SelectValue
         );
         if (selectValue) {
            placeholder = selectValue.props.placeholder;
         }
      }
    }
  });

  return (
    <SelectContext.Provider value={{ value, onValueChange, items, placeholder }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

const SelectTrigger: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within a Select");

  const { value, items } = context;
  const displayValue = items.get(value);

  return (
    <div className={cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)}>
      {displayValue || children}
      <svg className="h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </div>
  );
};

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectValue must be used within a Select");

  // Only render placeholder if no value is selected
  if (!context.items.has(context.value)) {
    return <span className="text-muted-foreground">{placeholder}</span>;
  }
  return null;
};

const SelectContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectContent must be used within a Select");
  
  return (
    <select
      value={context.value || ''}
      onChange={(e) => context.onValueChange(e.target.value)}
      className={cn("absolute inset-0 w-full h-full opacity-0 cursor-pointer", className)}
    >
      {context.placeholder && <option value="" disabled>{context.placeholder}</option>}
      {children}
    </select>
  );
};

const SelectItem: React.FC<{ children: React.ReactNode, value: string }> = ({ children, value }) => {
  return <option value={value}>{children}</option>;
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };