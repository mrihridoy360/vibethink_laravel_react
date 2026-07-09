import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Download, ExternalLink, BookOpen, GraduationCap } from 'lucide-react';
import { useAuth } from '../../Contexts/AuthContext';

export default function Certificates() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await axios.get('/api/certificates');
                if (res.data.success) setData(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(n => <div key={n} className="h-44 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
        );
    }

    const certs = data?.certificates || [];
    const completedEnrollments = data?.completed_enrollments || [];

    // Merge: certs first, then completed enrollments that don't have a certificate
    const certCourseIds = certs.map(c => c.course_id);
    const pendingCerts = completedEnrollments.filter(e => !certCourseIds.includes(e.course_id));

    const handlePrint = (cert, courseName) => {
        const printWindow = window.open('', '_blank');
        const now = cert?.issued_at
            ? new Date(cert.issued_at).toLocaleDateString('bn-BD')
            : new Date().toLocaleDateString('bn-BD');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Certificate - ${courseName}</title>
                <meta charset="UTF-8"/>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Inter', sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
                    .certificate { width: 800px; background: white; border: 8px solid #1d4ed8; border-radius: 12px; padding: 60px 80px; text-align: center; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
                    .certificate::before { content: ''; position: absolute; inset: 12px; border: 2px solid #93c5fd; border-radius: 6px; pointer-events: none; }
                    .logo { font-size: 28px; font-weight: 900; color: #1d4ed8; letter-spacing: -1px; margin-bottom: 8px; }
                    .logo span { color: #111827; }
                    .divider { width: 80px; height: 3px; background: linear-gradient(90deg, #1d4ed8, #7c3aed); margin: 16px auto; border-radius: 2px; }
                    .title { font-size: 14px; letter-spacing: 6px; text-transform: uppercase; color: #6b7280; margin-bottom: 24px; }
                    .cert-title { font-family: 'Playfair Display', serif; font-size: 36px; color: #111827; margin-bottom: 12px; }
                    .presented { font-size: 13px; color: #6b7280; margin-bottom: 6px; }
                    .recipient { font-family: 'Playfair Display', serif; font-size: 30px; color: #1d4ed8; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; display: inline-block; margin-bottom: 12px; }
                    .course-label { font-size: 13px; color: #6b7280; margin-bottom: 6px; }
                    .course-name { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 32px; }
                    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; }
                    .sig-line { border-top: 1px solid #d1d5db; width: 160px; padding-top: 6px; font-size: 11px; color: #6b7280; }
                    .cert-id { font-size: 10px; color: #9ca3af; position: absolute; bottom: 20px; right: 30px; }
                    @media print { body { background: white; } .certificate { box-shadow: none; } }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <div class="logo">Vibe<span>Think</span></div>
                    <div class="title">Certificate of Completion</div>
                    <div class="divider"></div>
                    <div class="cert-title">সার্টিফিকেট</div>
                    <div class="presented">এটি প্রমাণ করে যে</div>
                    <div class="recipient">${user?.name || 'Student'}</div>
                    <div class="course-label">সফলভাবে সম্পন্ন করেছেন</div>
                    <div class="course-name">${courseName}</div>
                    <div class="footer">
                        <div class="sig-line">তারিখ: ${now}</div>
                        <div class="sig-line">VibeThink Academy</div>
                    </div>
                    ${cert?.certificate_id ? `<div class="cert-id">ID: ${cert.certificate_id}</div>` : ''}
                </div>
                <script>window.onload = () => { window.print(); }</script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-base font-bold text-gray-900">আমার সার্টিফিকেট</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                    {certs.length}টি সার্টিফিকেট অর্জিত
                    {pendingCerts.length > 0 && `, ${pendingCerts.length}টি প্রক্রিয়াধীন`}
                </p>
            </div>

            {certs.length === 0 && pendingCerts.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100">
                    <div className="p-5 bg-yellow-50 rounded-full mb-4 border border-yellow-100">
                        <GraduationCap className="h-12 w-12 text-yellow-400" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-700">এখনো কোনো সার্টিফিকেট নেই</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">কোর্স ১০০% সম্পন্ন করলে সার্টিফিকেট পাবেন।</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Issued Certificates */}
                    {certs.map(cert => (
                        <div
                            key={cert.id}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 relative overflow-hidden"
                        >
                            {/* Decoration */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/30 rounded-full -translate-y-8 translate-x-8" />
                            <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-200/20 rounded-full translate-y-6 -translate-x-6" />

                            <div className="relative">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2.5 bg-blue-600 rounded-xl shadow-md shadow-blue-500/30">
                                        <Award className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-[9px] font-bold uppercase tracking-wider bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        ✓ অর্জিত
                                    </span>
                                </div>
                                <h3 className="text-xs font-bold text-gray-900 line-clamp-2 mb-1">
                                    {cert.course?.title || 'Course'}
                                </h3>
                                <p className="text-[10px] text-gray-500 mb-4">
                                    প্রদানের তারিখ: {new Date(cert.issued_at).toLocaleDateString('bn-BD')}
                                </p>
                                {cert.certificate_id && (
                                    <p className="text-[9px] text-gray-400 mb-3 font-mono">
                                        ID: {cert.certificate_id}
                                    </p>
                                )}
                                <button
                                    onClick={() => handlePrint(cert, cert.course?.title)}
                                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                                >
                                    <Download className="h-3.5 w-3.5" /> সার্টিফিকেট ডাউনলোড
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Pending certificates (completed but not yet in certificates table) */}
                    {pendingCerts.map(enrollment => (
                        <div
                            key={enrollment.id}
                            className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-5 relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2.5 bg-gray-400 rounded-xl">
                                    <Award className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                    প্রক্রিয়াধীন
                                </span>
                            </div>
                            <h3 className="text-xs font-bold text-gray-700 line-clamp-2 mb-1">
                                {enrollment.course?.title}
                            </h3>
                            <p className="text-[10px] text-gray-400 mb-4">সার্টিফিকেট তৈরি হচ্ছে...</p>
                            <button
                                onClick={() => handlePrint(null, enrollment.course?.title)}
                                className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Download className="h-3.5 w-3.5" /> প্রিন্ট করুন
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
