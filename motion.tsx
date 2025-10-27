// FIX: Added React import to solve JSX errors.
import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// A more capable stub for Framer Motion's 'motion' object.
// This version supports keyframe animations by dynamically creating <style> tags.
const MotionComponent = React.forwardRef((
  { children, initial, animate, exit, whileHover, whileTap, transition, ...props }: any,
  ref: any
) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const styleTagRef = useRef<HTMLStyleElement | null>(null);
  const animationName = useRef(`motion-${uuidv4()}`).current;

  useEffect(() => {
    if (!styleTagRef.current) {
      const styleEl = document.createElement('style');
      styleEl.id = animationName;
      document.head.appendChild(styleEl);
      styleTagRef.current = styleEl;
    }
    const styleSheet = styleTagRef.current;
    
    if (animate) {
      const { duration = 0.4, ease = 'ease', delay = 0, repeat = 0 } = transition || {};
      const keyframeSteps: { [key: string]: string[] } = {};
      let hasKeyframes = false;
      let maxLength = 0;

      Object.keys(animate).forEach(prop => {
        if (Array.isArray(animate[prop])) {
          hasKeyframes = true;
          maxLength = Math.max(maxLength, animate[prop].length);
        }
      });
      
      if (hasKeyframes) {
        for (let i = 0; i < maxLength; i++) {
          const percentage = maxLength > 1 ? (i / (maxLength - 1)) * 100 : 100;
          const stepKey = `${percentage}%`;
          keyframeSteps[stepKey] = [];
          
          const transformProps: string[] = [];
          
          Object.keys(animate).forEach(prop => {
            if (!Array.isArray(animate[prop])) return;

            const values = animate[prop];
            // Use the last value if keyframe array is shorter for a specific property
            const value = values[i] ?? values[values.length - 1];

            const cssProp = prop.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
            let cssValue = typeof value === 'number' && !['opacity', 'scale'].includes(prop) && !cssProp.includes('position') ? `${value}px` : value;
            if (cssProp.includes('position')) cssValue = value; // Keep string values like '0% 50%'

            if (['x', 'y', 'translateX', 'translateY', 'scale', 'rotate'].includes(prop)) {
              let transformFunc = prop;
              if (prop === 'x') transformFunc = 'translateX';
              if (prop === 'y') transformFunc = 'translateY';
              const unit = prop === 'rotate' ? 'deg' : (prop === 'scale' ? '' : 'px');
              transformProps.push(`${transformFunc}(${value}${unit})`);
            } else {
              keyframeSteps[stepKey].push(`${cssProp}: ${cssValue};`);
            }
          });

          if(transformProps.length > 0) {
            keyframeSteps[stepKey].push(`transform: ${transformProps.join(' ')};`);
          }
        }
        
        let keyframeRule = `@keyframes ${animationName} {`;
        Object.keys(keyframeSteps).sort((a,b) => parseFloat(a) - parseFloat(b)).forEach(step => {
            keyframeRule += `${step} { ${keyframeSteps[step].join(' ')} }`;
        });
        keyframeRule += '}';
        styleSheet.innerHTML = keyframeRule;
        
        const repeatValue = repeat === Infinity ? 'infinite' : repeat;
        const easingFunction = Array.isArray(ease) ? `cubic-bezier(${ease.join(',')})` : ease;

        if (elementRef.current) {
            elementRef.current.style.animation = `${animationName} ${duration}s ${easingFunction} ${delay}s ${repeatValue} normal forwards`;
        }
      }
    }

    return () => {
      if (styleSheet && styleSheet.parentNode) {
        styleSheet.parentNode.removeChild(styleSheet);
      }
    };
  }, [animate, transition, animationName]);

  const style: React.CSSProperties = { ...props.style };
  
    // Apply non-keyframe properties
    const motionPropsList = [initial, animate];
    const transformMap = new Map<string, string>();

    motionPropsList.forEach(motionProps => {
        if (!motionProps) return;
        for (const key in motionProps) {
            if (Array.isArray(motionProps[key])) continue;
            const value = motionProps[key];
            
            let transformFunc = key;
            if (key === 'x') transformFunc = 'translateX';
            if (key === 'y') transformFunc = 'translateY';

            if (['translateX', 'translateY', 'scale', 'rotate'].includes(transformFunc)) {
                const unit = transformFunc === 'rotate' ? 'deg' : (transformFunc === 'scale' ? '' : 'px');
                transformMap.set(transformFunc, `${transformFunc}(${value}${unit})`);
            } else {
                (style as any)[key] = value;
            }
        }
    });

    if (transformMap.size > 0) {
        // FIX: Cast style to 'any' to allow adding the 'transform' property,
        // resolving the TypeScript error in stricter environments.
        (style as any).transform = Array.from(transformMap.values()).join(' ');
    }

  const combinedRef = (node: HTMLDivElement) => {
      (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
  };
  
  return <div ref={combinedRef} {...props} style={style}>{children}</div>;
});


type MotionProxy = {
  [key: string]: React.ForwardRefExoticComponent<any & React.RefAttributes<any>>;
};

export const motion = new Proxy({}, {
  get: (target, prop) => {
    return MotionComponent;
  }
}) as MotionProxy;

// This is a stub for AnimatePresence. It simply renders its children.
export const AnimatePresence: React.FC<{ children: React.ReactNode; mode?: string; }> = ({ children }) => {
  return <>{children}</>;
};

// Stub for the useInView hook from Framer Motion
export const useInView = (ref: React.RefObject<Element>, options?: any) => {
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    if (ref.current) {
                        observer.unobserve(ref.current);
                    }
                }
            },
            { threshold: 0.1, ...options }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, options]);
    return inView;
};
