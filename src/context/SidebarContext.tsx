'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Persist state to localStorage
    useEffect(() => {
        const stored = localStorage.getItem('sidebar-collapsed');
        if (stored) {
            setIsCollapsed(stored === 'true');
        }
    }, []);

    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const newState = !prev;
            localStorage.setItem('sidebar-collapsed', String(newState));
            return newState;
        });
    };

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleCollapse }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
