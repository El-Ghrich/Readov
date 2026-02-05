'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

export const QuillCursor = () => {
    const [isHoveringClickable, setIsHoveringClickable] = useState(false);

    // Smooth spring physics for the cursor movement
    const cursorX = useSpring(0, { stiffness: 800, damping: 35 });
    const cursorY = useSpring(0, { stiffness: 800, damping: 35 });

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);

            const target = e.target as HTMLElement;
            // Check if hovering over any clickable element or input
            const isClickable = !!target.closest('footer,a, button, input, textarea, [role="button"], .magic-scroll-zone');
            setIsHoveringClickable(isClickable);
        };

        window.addEventListener("mousemove", moveCursor);
        return () => window.removeEventListener("mousemove", moveCursor);
    }, [cursorX, cursorY]);

    return (
        <motion.div
            style={{
                translateX: cursorX,
                translateY: cursorY,
                position: "fixed",
                top: 0,
                left: 0,
                pointerEvents: "none",
                zIndex: 9999,
            }}
            className="quill-cursor hidden lg:block pointer-events-none"
        >
            <motion.div
                animate={{
                    rotate: isHoveringClickable ? -15 : 0,
                    scale: isHoveringClickable ? 1.2 : 1,
                    x: isHoveringClickable ? -4 : 0,
                    y: isHoveringClickable ? -24 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {/* Quill SVG */}
                <svg
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isHoveringClickable ? "#ffd500" : "#ffffff"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                >
                    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                    <line x1="16" y1="8" x2="2" y2="22" />
                    <line x1="17.5" y1="15" x2="9" y2="15" />
                </svg>
            </motion.div>
        </motion.div>
    );
};
