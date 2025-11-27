'use client';

import { useTheme } from '../../lib/ThemeContext';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="button button--ghost"
        >
            <img
                src={theme === 'dark' ? '/sun.svg' : '/moon.svg'}
                alt=""
                className="icon icon--adaptive"
            />
        </button>
    );
}
