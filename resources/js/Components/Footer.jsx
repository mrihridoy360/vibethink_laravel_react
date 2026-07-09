import React from 'react';

export default function Footer() {
    return (
        <footer className="w-full mt-auto py-8 px-6 border-t border-white/5 bg-[#070a13]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-gray-500 text-xs">
                    &copy; {new Date().getFullYear()} VibeThink LMS. All rights reserved.
                </div>
                <div className="flex gap-6 text-xs text-gray-500">
                    <span className="hover:text-purple-400 cursor-pointer transition-colors">Privacy Policy</span>
                    <span className="hover:text-purple-400 cursor-pointer transition-colors">Terms of Service</span>
                    <span className="hover:text-purple-400 cursor-pointer transition-colors">Support</span>
                </div>
            </div>
        </footer>
    );
}
