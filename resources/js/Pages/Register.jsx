import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Contexts/AuthContext';
import { GraduationCap, Mail, Lock, User as UserIcon, Phone, AlertCircle } from 'lucide-react';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState({});
    const [errorMsg, setErrorMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setErrorMsg('');
        setSubmitting(true);

        if (password !== passwordConfirmation) {
            setErrors({ password: ['Passwords do not match'] });
            setSubmitting(false);
            return;
        }

        try {
            const res = await register(name, email, phone, password, passwordConfirmation);
            if (res.success) {
                navigate('/');
            } else {
                setErrorMsg(res.message || 'Registration failed');
            }
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setErrorMsg(err.response?.data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md w-full mx-auto px-6 py-12 flex flex-col justify-center min-h-[85vh]">
            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/10 rounded-full blur-2xl -z-10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -z-10" />

                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-3 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-2xl shadow-lg mb-4">
                        <GraduationCap className="h-7 w-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Create Account</h2>
                    <p className="text-sm text-gray-400 mt-1.5 font-light">Join VibeThink LMS to start learning</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                        <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                            Full Name
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`glass-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm ${errors.name ? 'border-red-500' : ''}`}
                                placeholder="John Doe"
                            />
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.name && <span className="text-[10px] text-red-400 mt-1 block">{errors.name[0]}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`glass-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm ${errors.email ? 'border-red-500' : ''}`}
                                placeholder="name@example.com"
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.email && <span className="text-[10px] text-red-400 mt-1 block">{errors.email[0]}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                            Phone Number
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="glass-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm"
                                placeholder="+1 (555) 000-0000"
                            />
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`glass-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm ${errors.password ? 'border-red-500' : ''}`}
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {errors.password && <span className="text-[10px] text-red-400 mt-1 block">{errors.password[0]}</span>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                required
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                className="glass-input w-full pl-11 pr-4 py-2.5 rounded-xl text-sm"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="glass-btn-primary w-full py-3 rounded-xl font-bold text-sm shadow-lg shadow-purple-500/15"
                    >
                        {submitting ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                {/* Switch link */}
                <div className="text-center mt-6 text-xs text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                        Sign in here
                    </Link>
                </div>
            </div>
        </div>
    );
}
