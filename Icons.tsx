import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from './motion';
import {
    Loader as LucideLoader,
    Loader2 as LucideLoader2,
    Upload,
    Pause,
    Play,
    SlidersHorizontal,
    Grid,
    ListMusic,
    Music,
    Zap,
    Gem,
    Home,
    Radio,
    Layers,
    Compass,
    Users,
    Disc,
    Activity,
    Archive,
    Brain,
    Crown,
    Disc3,
    BarChart3,
    Shield,
    LogOut,
    X,
    Orbit,
    ShoppingBag,
    Volume2,
    Target,
    Search,
    Clock,
    CheckCircle,
    AlertCircle,
    MessageCircle,
    Mic,
    Heart,
    Waves,
    Plus,
    Trash2,
    Book,
    KeyRound,
    Facebook,
    Twitter,
    Check,
    Database,
    FileText,
    Cog,
    Sparkles,
    Save,
    Info,
    Eye,
    EyeOff,
    CreditCard,
    Infinity,
    BrainCircuit,
    ChevronDown,
    Palette,
    Spline,
    Cloud,
    CloudSun,
    Snowflake,
    Wind,
    XCircle,
    Guitar,
    Droplets,
    Edit,
    Minus,
    GitBranch,
    Copy,
    Users2,
    Instagram,
    Youtube,
    Link,
    Share2,
    Bookmark,
    Send,
    UserCheck,
    UserPlus,
    Image,
    SkipBack,
    SkipForward,
} from 'lucide-react';

// High-performance audio context singleton for icon sounds
const iconAudioContext = typeof window !== 'undefined' && window.AudioContext ? new AudioContext() : null;

// Icon-specific animation profiles with gaming-grade effects
const iconAnimations: Record<string, any> = {
    Play: { 
        scale: [1, 1.15, 1], rotate: [0, 360], opacity: [1, 0.8, 1], glow: true,
        sound: { freq: 440, duration: 0.1, type: 'sine' },
        glowColor: '#D6B55D' // --hm-gold
    },
    Pause: { 
        scale: [1, 0.9, 1], opacity: [1, 0.7, 1], glow: true,
        sound: { freq: 330, duration: 0.08, type: 'square' },
        glowColor: '#D6B55D' // --hm-gold
    },
    Music: { 
        rotate: [0, 5, -5, 0], scale: [1, 1.1, 1], opacity: [1, 0.8, 1], glow: true,
        sound: { freq: 523, duration: 0.12, type: 'sine' },
        glowColor: '#D6B55D' // --hm-gold
    },
    Radio: {
        scale: [1, 1.2, 1], rotate: [0, 15, -15, 0], opacity: [1, 0.8, 1], glow: true,
        sound: { freq: 392, duration: 0.1, type: 'sawtooth' },
        glowColor: '#2CE1D0' // --hm-cyan
    },
    Waves: {
        rotate: [0, 360], scale: [1, 1.15, 1], opacity: [1, 0.8, 1], glow: true,
        sound: { freq: 262, duration: 0.15, type: 'triangle' },
        glowColor: '#2CE1D0'
    },
    Zap: {
        scale: [1, 1.3, 1], rotate: [0, 45, -45, 0], opacity: [1, 0.8, 1], glow: true,
        sound: { freq: 800, duration: 0.06, type: 'sawtooth' },
        glowColor: '#D6B55D' // Bright Gold
    },
    Sparkles: {
        scale: [1, 1.25, 1], rotate: [0, 360], opacity: [1, 0.6, 1], glow: true,
        sound: { freq: 1000, duration: 0.08, type: 'sine' },
        glowColor: '#F5EEDA'
    },
    Cog: {
        rotate: [0, 180], scale: [1, 1.1, 1], opacity: [1, 0.8, 1], glow: true,
        sound: { freq: 400, duration: 0.12, type: 'sawtooth' }
    },
    ChevronDown: {
        rotate: [0, 180], scale: [1, 1.1, 1], opacity: [1, 0.8, 1], glow: true,
        sound: { freq: 420, duration: 0.1, type: 'sine' }
    },
    default: {
        scale: [1, 1.1, 1], opacity: [1, 0.8, 1],
        sound: { freq: 440, duration: 0.1, type: 'sine' },
        glowColor: '#ffffff'
    }
};

const ParticleOverlay: React.FC<{ color: string; intensity: number }> = ({ color, intensity }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const particles: Array<{ x: number; y: number; vx: number; vy: number; life: number }> = [];
        for (let i = 0; i < 20 * intensity; i++) {
            particles.push({
                x: canvas.width / 2, y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2,
                life: 1.0
            });
        }

        const animate = () => {
            if(!ctx || !canvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy;
                p.vx *= 0.98; p.vy *= 0.98;
                p.life -= 0.03;
                
                if (p.life <= 0) { particles.splice(i, 1); continue; }
                
                ctx.globalAlpha = p.life;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            if (particles.length > 0) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };
        
        animate();
        return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
    }, [color, intensity]);

    return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" width={48} height={48} />;
};

const AnimatedIconWrapper: React.FC<{
    iconName: string;
    animation?: any;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
    className?: string;
    children: React.ReactNode;
    [key: string]: any;
}> = ({ iconName, animation = iconAnimations.default, onClick, className = '', children, ...rest }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showParticles, setShowParticles] = useState(false);
    
    const glowColor = animation?.glowColor || '#ffffff';

    const animationProps = isHovered && animation ? {
        scale: animation.scale || 1.1,
        rotate: animation.rotate,
        opacity: animation.opacity,
    } : {
        scale: 1,
        rotate: 0,
        opacity: 1,
    };
    
    const transitionProps = isHovered ? { duration: 0.3, ease: 'easeOut' } : { duration: 0.2 };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (iconAudioContext && animation?.sound) {
            const osc = iconAudioContext.createOscillator();
            const gain = iconAudioContext.createGain();
            osc.type = animation.sound.type as OscillatorType;
            osc.frequency.setValueAtTime(animation.sound.freq, iconAudioContext.currentTime);
            gain.gain.setValueAtTime(0.1, iconAudioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, iconAudioContext.currentTime + animation.sound.duration);
            osc.connect(gain);
            gain.connect(iconAudioContext.destination);
            osc.start();
            osc.stop(iconAudioContext.currentTime + animation.sound.duration);
        }
        
        setShowParticles(false);
        setTimeout(() => setShowParticles(true), 0);
        
        onClick?.(e);
    };

    return (
        <motion.div
            className={`relative inline-flex items-center justify-center cursor-pointer ${className}`}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={handleClick}
            animate={animationProps}
            transition={transitionProps}
            {...rest}
        >
            {children}
            {animation?.glow && (isHovered || (iconName === 'Radio' && isHovered)) && (
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        boxShadow: `0 0 12px 2px ${glowColor}, 0 0 20px 4px ${glowColor}66`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                />
            )}
            {showParticles && <ParticleOverlay color={glowColor} intensity={1} />}
        </motion.div>
    );
};

type AnimatedIconComponent = React.FC<React.PropsWithChildren<{ onClick?: (e: React.MouseEvent<HTMLDivElement>) => void, className?: string }>>;

const createAnimatedIcon = (name: string, animation: any): AnimatedIconComponent => {
    const Component: AnimatedIconComponent = ({ children, onClick, className, ...rest }) => (
        <AnimatedIconWrapper iconName={name} animation={animation} onClick={onClick} className={className} {...rest}>
            {children}
        </AnimatedIconWrapper>
    );
    Component.displayName = `AnimatedIcon(${name})`;
    return Component;
};

export const AnimatedIcon = {
    Play: createAnimatedIcon('Play', iconAnimations.Play),
    Pause: createAnimatedIcon('Pause', iconAnimations.Pause),
    Music: createAnimatedIcon('Music', iconAnimations.Music),
    Radio: createAnimatedIcon('Radio', iconAnimations.Radio),
    Waves: createAnimatedIcon('Waves', iconAnimations.Waves),
    Zap: createAnimatedIcon('Zap', iconAnimations.Zap),
    Sparkles: createAnimatedIcon('Sparkles', iconAnimations.Sparkles),
    Cog: createAnimatedIcon('Cog', iconAnimations.Cog),
    ChevronDown: createAnimatedIcon('ChevronDown', iconAnimations.ChevronDown),
};

export {
    LucideLoader as Loader,
    LucideLoader2 as Loader2,
    Upload,
    Pause,
    Play,
    SlidersHorizontal,
    Grid,
    ListMusic,
    Music,
    Zap,
    Gem,
    Home,
    Radio,
    Layers,
    Compass,
    Users,
    Disc,
    Activity,
    Archive,
    Brain,
    Crown,
    Disc3,
    BarChart3,
    Shield,
    LogOut,
    X,
    Orbit,
    ShoppingBag,
    Volume2,
    Target,
    Search,
    Clock,
    CheckCircle,
    AlertCircle,
    MessageCircle,
    Mic,
    Heart,
    Waves,
    Plus,
    Trash2,
    Book,
    KeyRound,
    Facebook,
    Twitter,
    Check,
    Database,
    FileText,
    Cog,
    Sparkles,
    Save,
    Info,
    Eye,
    EyeOff,
    CreditCard,
    Infinity,
    BrainCircuit,
    ChevronDown,
    Palette,
    Spline,
    Cloud,
    CloudSun,
    Snowflake,
    Wind,
    XCircle,
    Guitar,
    Droplets,
    Edit,
    Minus,
    GitBranch,
    Copy,
    Users2,
    Instagram,
    Youtube,
    Link,
    Share2,
    Bookmark,
    Send,
    UserCheck,
    UserPlus,
    Image,
    SkipBack,
    SkipForward,
};

// Aliases
export const HomeIcon = Home;
export const PackIcon = Users;
export const ExploreIcon = Compass;
export const VinylIcon = Disc3;
export const SynthIcon = Waves;
export const BlogIcon = FileText;
export const RoomsIcon = Users2;
export const SearchIcon = Search;
export const BookIcon = Book;

// Custom Spotify Icon
export const Spotify: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    {...props}
  >
    <title>Spotify</title>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.918 17.323c-.24.359-.684.495-.996.255-2.61-1.619-5.88-1.98-9.84-1.08-.359.06-.684-.18-.744-.54s.18-.684.54-.744c4.32-.96 7.92-.54 10.86 1.26.3.18.432.624.18.99zm1.14-2.58c-.3.432-.84.54-1.26.24-2.94-1.8-7.38-2.34-11.22-1.26-.42.12-.9-.12-.96-.54s.12-.9.54-.96c4.2-.96 9.06-.54 12.42 1.5.42.24.54.84.24 1.26zm.12-2.7c-.36.48-.96.6-1.44.24-3.48-2.1-8.76-2.7-12.96-1.44-.48.12-1.02-.18-1.14-.66s.18-1.02.66-1.14c4.68-1.44 10.38-.72 14.28 1.8.48.3.6.9.3 1.44z" />
  </svg>
);
