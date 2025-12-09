import React from 'react';
import { InputManager } from '../services/InputManager';

interface TouchControlsProps {
    inputManager: React.MutableRefObject<InputManager | null>;
}

const TouchButton: React.FC<{
    action: string;
    className: string;
    children: React.ReactNode;
    onPress: (action: string, pressed: boolean) => void;
}> = ({ action, className, children, onPress }) => {
    const ref = React.useRef<HTMLButtonElement>(null);

    React.useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const handleStart = (e: TouchEvent) => {
            e.preventDefault(); // This now works because we attach with passive: false
            onPress(action, true);
        };

        const handleEnd = (e: TouchEvent) => {
            e.preventDefault();
            onPress(action, false);
        };

        // Desktop mouse fallback
        const handleMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            onPress(action, true);
        };
        const handleMouseUp = (e: MouseEvent) => {
            e.preventDefault();
            onPress(action, false);
        };
        const handleMouseLeave = (e: MouseEvent) => {
            onPress(action, false);
        };

        el.addEventListener('touchstart', handleStart, { passive: false });
        el.addEventListener('touchend', handleEnd, { passive: false }); // also catch touchend
        el.addEventListener('touchcancel', handleEnd, { passive: false }); // safety

        el.addEventListener('mousedown', handleMouseDown);
        el.addEventListener('mouseup', handleMouseUp);
        el.addEventListener('mouseleave', handleMouseLeave);
        // Prevent context menu
        el.addEventListener('contextmenu', (e) => e.preventDefault());

        return () => {
            el.removeEventListener('touchstart', handleStart);
            el.removeEventListener('touchend', handleEnd);
            el.removeEventListener('touchcancel', handleEnd);
            el.removeEventListener('mousedown', handleMouseDown);
            el.removeEventListener('mouseup', handleMouseUp);
            el.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [action, onPress]);

    return (
        <button ref={ref} className={className}>
            {children}
        </button>
    );
};

const TouchControls: React.FC<TouchControlsProps> = ({ inputManager }) => {

    // Memoize the callback so useEffect in TouchButton doesn't re-bind constantly
    const handlePress = React.useCallback((action: string, pressed: boolean) => {
        if (inputManager.current) {
            inputManager.current.setTouchState({ [action]: pressed });
        }
    }, [inputManager]);

    const btnClass = "absolute flex items-center justify-center touch-none select-none";

    return (
        <>
            {/* Mobile Controls Overlay - Only visible on small screens (lg:hidden) */}
            <div className="w-full lg:hidden flex justify-between items-end px-2 sm:px-4 pb-4 select-none touch-none">

                <div className="flex justify-between items-end w-full max-w-lg mx-auto">
                    {/* D-Pad (Left Side) */}
                    <div className="relative w-40 h-40 pointer-events-auto opacity-70">
                        {/* Up */}
                        <TouchButton
                            action="up"
                            onPress={handlePress}
                            className={`${btnClass} top-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-slate-700/80 rounded-t-lg border border-slate-500 active:bg-slate-500/80`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                        </TouchButton>

                        {/* Down */}
                        <TouchButton
                            action="down"
                            onPress={handlePress}
                            className={`${btnClass} bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-slate-700/80 rounded-b-lg border border-slate-500 active:bg-slate-500/80`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </TouchButton>

                        {/* Left */}
                        <TouchButton
                            action="left"
                            onPress={handlePress}
                            className={`${btnClass} left-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-slate-700/80 rounded-l-lg border border-slate-500 active:bg-slate-500/80`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </TouchButton>

                        {/* Right */}
                        <TouchButton
                            action="right"
                            onPress={handlePress}
                            className={`${btnClass} right-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-slate-700/80 rounded-r-lg border border-slate-500 active:bg-slate-500/80`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </TouchButton>

                        {/* Center decoration */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-800 rounded-full border border-slate-600"></div>
                    </div>

                    {/* Action Buttons (Right Side) */}
                    <div className="relative w-40 h-40 pointer-events-auto opacity-80">
                        {/* Punch (Action 1) */}
                        <TouchButton
                            action="action1"
                            onPress={handlePress}
                            className={`${btnClass} top-0 right-10 w-16 h-16 bg-red-600/80 rounded-full border-2 border-red-400 active:bg-red-500/80 shadow-lg`}
                        >
                            <span className="font-black text-white text-xl">P</span>
                        </TouchButton>

                        {/* Kick (Action 2) */}
                        <TouchButton
                            action="action2"
                            onPress={handlePress}
                            className={`${btnClass} bottom-8 left-2 w-16 h-16 bg-blue-600/80 rounded-full border-2 border-blue-400 active:bg-blue-500/80 shadow-lg`}
                        >
                            <span className="font-black text-white text-xl">K</span>
                        </TouchButton>

                        {/* Block (Action 3) - Smaller separate button */}
                        <TouchButton
                            action="action3"
                            onPress={handlePress}
                            className={`${btnClass} bottom-0 right-0 w-12 h-12 bg-amber-600/80 rounded-full border-2 border-amber-400 active:bg-amber-500/80 shadow-lg`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </TouchButton>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TouchControls;
