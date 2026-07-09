import React from 'react';

export default function Loader({ size = 'md', text = 'লোড হচ্ছে...', overlay = false }) {
    const sizeClasses = {
        sm: 'h-6 w-6 border-2',
        md: 'h-10 w-10 border-4',
        lg: 'h-16 w-16 border-4',
    };

    const spinner = (
        <div className="flex flex-col items-center justify-center p-6">
            <div className={`border-blue-600 border-t-transparent rounded-full animate-spin ${sizeClasses[size] || sizeClasses.md}`} />
            {text && <span className="text-gray-500 mt-4 text-sm font-medium tracking-wide animate-pulse">{text}</span>}
        </div>
    );

    if (overlay) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm transition-all duration-300">
                {spinner}
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center min-h-[300px]">
            {spinner}
        </div>
    );
}
