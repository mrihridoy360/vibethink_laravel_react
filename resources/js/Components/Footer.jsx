import React from 'react';

export default function Footer() {
    return (
        <footer className="w-full mt-auto py-8 px-6 border-t border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-slate-400 text-xs">
                    &copy; {new Date().getFullYear()} VibeThink LMS. All rights reserved.
                </div>
                <div className="flex gap-6 text-xs text-slate-400">
                    <span className="hover:text-purple-600 cursor-pointer transition-colors">Privacy Policy</span>
                    <span className="hover:text-purple-600 cursor-pointer transition-colors">Terms of Service</span>
                    <span className="hover:text-purple-600 cursor-pointer transition-colors">Support</span>
                </div>
            </div>
        </footer>
    );
}
