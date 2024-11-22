import { useEffect } from 'react';

const STORAGE_KEY = 'lastScrollPosition';

export const useAutoScroll = () => {
    const saveScrollPosition = () => {
        try {
            localStorage.setItem(STORAGE_KEY, window.scrollY.toString());
        } catch (error) {
            console.error('Failed to save scroll position:', error);
        }
    }

    const restoreScrollPosition = () => {
        try {
            const savedPosition = localStorage.getItem(STORAGE_KEY);
            setTimeout(() => {
                window.scrollBy({
                    top: +savedPosition || 0,
                    behavior: 'smooth'
                });
            }, 1000)
        } catch (error) {
            console.error('Failed to restore scroll position:', error);
        }
    };


    useEffect(() => {
        restoreScrollPosition();
        window.addEventListener('scroll', saveScrollPosition);
        return () => {
            window.removeEventListener('scroll', saveScrollPosition);
            window.removeEventListener("load", restoreScrollPosition);
        };
    }, []);
};