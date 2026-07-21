import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Book, Download, ShoppingCart, Star, Search, Filter, Loader2, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';
import { useSiteSettings } from '../Contexts/SiteSettingsContext';
import { Link } from 'react-router-dom';
import { useSEO } from '../Utils/seo';

export default function Ebooks() {
    useSEO({
        title: 'ই-বুক লাইব্রেরি',
        description: 'বিভিন্ন বিষয়ের ওপর আমাদের তৈরি করা এক্সক্লুসিভ ই-বুকগুলো ডাউনলোড বা সংগ্রহ করুন।'
    });
    const { user } = useAuth();
    const { settings } = useSiteSettings();
    const isEnabled = settings?.features?.feature_ebooks === '1' || settings?.features?.feature_ebooks === 1 || settings?.features?.feature_ebooks === true;
    
    if (!isEnabled) {
        return (
            <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 border border-red-150 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">মডিউলটি উপলব্ধ নয়</h2>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    ই-বুক মডিউলটি বর্তমানে নিষ্ক্রিয় রয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।
                </p>
                <Link to="/" className="inline-block px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors">
                    হোমপেজে ফিরে যান
                </Link>
            </div>
        );
    }

    const [dbProducts, setDbProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderName, setOrderName] = useState('');
    const [orderPhone, setOrderPhone] = useState('');
    const [orderNotes, setOrderNotes] = useState('');

    useEffect(() => {
        const fetchEbooks = async () => {
            try {
                const response = await axios.get('/api/products?type=digital');
                if (response.data.success) {
                    setDbProducts(response.data.products || []);
                }
            } catch (err) {
                console.error('Error fetching digital products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEbooks();
    }, []);

    // Premium mock e-books to supplement database products
    const mockEbooks = [
        {
            id: 'mock-eb1',
            name: 'Mastering Vibe Coding: AI-Powered Development Blueprint',
            slug: 'mastering-vibe-coding',
            description: 'AI চ্যাট ও কোডিং এজেন্টস ব্যবহার করে দ্রুতগতিতে প্রফেশনাল লেভেলের ওয়েব অ্যাপ্লিকেশন তৈরি করার সম্পূর্ণ গাইডবুক। রিয়্যাক্ট ও লারাভেলের প্র্যাকটিক্যাল প্রজেক্ট উদাহরণ সহ।',
            price: 500,
            sale_price: 350,
            image: null,
            pages: 185,
            rating: 4.9,
            reviewsCount: 38,
            isMock: true,
            format: 'PDF / EPUB',
            download_link: '#',
            features: 'সম্পূর্ণ বাংলা ভাষায় রচিত, ১০টি বাস্তব প্রজেক্ট গাইড, এক্সক্লুসিভ সোর্স কোড সংগ্রহ।'
        },
        {
            id: 'mock-eb2',
            name: 'Laravel 11 & React 19 REST API Security Guide',
            slug: 'laravel-react-security-guide',
            description: 'আপনার ফুলস্ট্যাক অ্যাপ্লিকেশনের সুরক্ষাকে মজবুত করার জন্য JWT, CSRF প্রোটেকশন, সাইনড রাউটস এবং রোল-বেসড অ্যাক্সেস কন্ট্রোলের খুঁটিনাটি সহ কমপ্লিট হ্যান্ডবুক।',
            price: 800,
            sale_price: 490,
            image: null,
            pages: 220,
            rating: 4.8,
            reviewsCount: 24,
            isMock: true,
            format: 'PDF / Kindle',
            download_link: '#',
            features: 'সিকিউরিটি অডিট চেকলিস্ট, ল্যারাভেল গেটওয়ে কনফিগারেশন, কোড রিফ্যাক্টরিং টিপস।'
        },
        {
            id: 'mock-eb3',
            name: 'Tailwind CSS Glassmorphic UI Kit Manual',
            slug: 'tailwind-css-glassmorphic-manual',
            description: 'আধুনিক ওয়েব ডিজাইনের অন্যতম ট্রেন্ড গ্লাস মরফিজম এবং মেটেরিয়াল ইউজার ইন্টারফেস তৈরির জন্য টেইলউইন্ড সিএসএস এর বিভিন্ন ইউটিলিটি ক্লাস ও কাস্টম শ্যাডো ম্যানুয়াল।',
            price: 0, // Free
            sale_price: 0,
            image: null,
            pages: 95,
            rating: 4.7,
            reviewsCount: 52,
            isMock: true,
            format: 'PDF Only',
            download_link: 'https://raw.githubusercontent.com/mrihridoy360/sample-pdfs/main/glassmorphism-manual.pdf',
            features: '২০+ কপি-পেস্ট রেডি কোড কম্পোনেন্ট, ডার্ক মোড অপটিমাইজেশন, রেসপন্সিভ ডিজাইন ফর্মুলা।'
        }
    ];

    // Combine database products (formatted) and mock ebooks
    const allBooks = [
        ...dbProducts.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description || 'VibeThink প্রিমিয়াম লার্নিং অ্যান্ড সার্ভিস ডিজিটাল রিসোর্স প্ল্যান।',
            price: parseFloat(p.price),
            sale_price: p.sale_price ? parseFloat(p.sale_price) : null,
            image: p.image,
            pages: 120, // default placeholder for DB items
            rating: 4.6,
            reviewsCount: 15,
            isMock: false,
            format: 'Digital Access',
            download_link: p.download_link || '',
            features: p.features || 'এক্সক্লুসিভ লাইফটাইম প্ল্যান ও আপডেট।'
        })),
        ...mockEbooks
    ];

    const filteredBooks = allBooks.filter(book => 
        book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOrder = (book) => {
        if (parseFloat(book.price) === 0 && book.download_link && book.download_link !== '#') {
            // Free book - direct download
            window.open(book.download_link, '_blank');
            return;
        }
        setSelectedBook(book);
        setOrderSuccess(false);
        if (user) {
            setOrderName(user.name);
        }
    };

    const submitOrder = async (e) => {
        e.preventDefault();
        try {
            // Log as a support ticket for purchase request
            const ticketData = {
                title: `Digital Product/Ebook Purchase: ${selectedBook.name}`,
                category: 'Billing & Payments',
                message: `Hello Support,\n\nI want to purchase the digital book/resource "${selectedBook.name}".\n\nOrder Info:\nName: ${orderName}\nPhone: ${orderPhone}\nSpecial Notes: ${orderNotes || 'None'}\nPrice: ৳${selectedBook.sale_price || selectedBook.price}\n\nPlease guide me on completing the payment.`,
                priority: 'medium'
            };

            const response = await axios.post('/api/support-tickets', ticketData);
            if (response.data.success) {
                setOrderSuccess(true);
                setTimeout(() => {
                    setSelectedBook(null);
                    setOrderSuccess(false);
                }, 3500);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'অর্ডার করতে একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-12">
            {/* Header Banner */}
            <div className="text-center relative overflow-hidden py-10 md:py-16 px-4 rounded-3xl bg-emerald-50/50 border border-emerald-100/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-100/60 rounded-full blur-3xl -z-10" />
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 leading-tight">
                    প্রিমিয়াম <span className="bg-gradient-to-r from-emerald-600 to-teal-650 bg-clip-text text-transparent">ই-বুক ও রিসোর্সেস</span>
                </h1>
                <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-6 md:mb-8 font-normal px-2">
                    দক্ষতা বাড়ানোর উপযোগী প্রিমিয়াম ই-বুক, রিসোর্স এবং কাস্টম কোড কিটগুলো সংগ্রহ করুন এক জায়গায়।
                </p>

                {/* Search Bar */}
                <div className="max-w-md mx-auto relative">
                    <input
                        type="text"
                        placeholder="বই বা রিসোর্স খুঁজুন..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm bg-white border border-slate-200 focus:outline-none focus:border-emerald-650 focus:ring-2 focus:ring-emerald-600/10 text-slate-800 shadow-sm transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                </div>
            </div>

            {/* Library Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Book className="h-5.5 w-5.5 text-emerald-600" />
                        <h2 className="text-xl font-bold text-slate-800">রিসোর্স ক্যাটালগ</h2>
                    </div>
                    <span className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-650 px-4 py-1.5 rounded-full font-bold shadow-sm">
                        {filteredBooks.length} টি আইটেম পাওয়া গেছে
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white border border-slate-100 shadow-sm h-80 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredBooks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {filteredBooks.map(book => {
                            const isFree = parseFloat(book.price) === 0;
                            const finalPrice = book.sale_price !== null ? book.sale_price : book.price;
                            return (
                                <div key={book.id} className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden p-6 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                                    <div>
                                        {/* Book Cover / Thumbnail Layout */}
                                        <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-6 mb-5 border border-slate-100 relative overflow-hidden shrink-0">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl" />
                                            {book.image ? (
                                                <img src={book.image} alt={book.name} className="h-full w-full object-contain rounded-lg drop-shadow-md group-hover:scale-103 transition-transform" />
                                            ) : (
                                                <div className="flex flex-col items-center text-center space-y-2">
                                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">{book.format}</span>
                                                    <span className="text-xs font-black text-slate-800 line-clamp-2 max-w-[150px]">{book.name}</span>
                                                </div>
                                            )}
                                            <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-[8px] font-bold px-2 py-0.5 rounded text-white tracking-widest">
                                                {book.pages} PAGES
                                            </div>
                                        </div>

                                        {/* Ratings & Reviews */}
                                        <div className="flex items-center gap-1.5 mb-2.5">
                                            <div className="flex items-center text-amber-450">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3.5 h-3.5 fill-current ${i < Math.floor(book.rating) ? 'text-amber-500' : 'text-slate-200'}`} />
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-slate-550 font-bold">{book.rating} ({book.reviewsCount} রিভিউ)</span>
                                        </div>

                                        {/* Text info */}
                                        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 mb-2 group-hover:text-emerald-650 transition-colors">
                                            {book.name}
                                        </h3>
                                        <p className="text-slate-500 text-[11px] leading-relaxed mb-4 line-clamp-2 font-semibold">
                                            {book.description}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-semibold mb-6 border-l-2 border-emerald-500 pl-2 leading-relaxed">
                                            {book.features}
                                        </p>
                                    </div>

                                    {/* Footer / CTA */}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                                        <div>
                                            {isFree ? (
                                                <span className="text-sm font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">সম্পূর্ণ ফ্রি</span>
                                            ) : (
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-base font-extrabold text-slate-900">৳{finalPrice}</span>
                                                    {book.sale_price !== null && (
                                                        <span className="text-xs text-slate-400 line-through">৳{book.price}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleOrder(book)}
                                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all border-none cursor-pointer text-white ${isFree ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10' : 'bg-slate-900 hover:bg-emerald-600'}`}
                                        >
                                            {isFree ? (
                                                <>ডাউনলোড করুন <Download className="w-3.5 h-3.5" /></>
                                            ) : (
                                                <>অর্ডার করুন <ShoppingCart className="w-3.5 h-3.5" /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl shadow-sm">
                        <Book className="h-10 w-10 text-slate-350 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-slate-800">কোনো বই বা রিসোর্স পাওয়া যায়নি</h3>
                        <p className="text-xs text-slate-400 mt-1">অন্য কোনো কিওয়ার্ড দিয়ে আবার চেষ্টা করুন</p>
                    </div>
                )}
            </div>

            {/* E-book Purchase / Order Request Modal */}
            {selectedBook && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-scaleIn">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-650 px-6 py-6 text-white relative">
                            <h3 className="text-lg font-extrabold">রিসোর্স অর্ডার ফর্ম</h3>
                            <p className="text-xs opacity-85 mt-1">{selectedBook.name}</p>
                            <button 
                                onClick={() => setSelectedBook(null)} 
                                className="absolute top-4 right-4 text-white hover:opacity-80 p-1 bg-white/10 rounded-full border-none cursor-pointer"
                            >
                                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {orderSuccess ? (
                            <div className="p-8 text-center space-y-4">
                                <div className="w-12 h-12 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <h4 className="text-base font-bold text-slate-800">অর্ডার সফলভাবে জমা হয়েছে!</h4>
                                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                                    আমাদের টিম থেকে পেমেন্ট ও অ্যাক্সেস সংক্রান্ত পরবর্তী তথ্যের জন্য আপনার সাথে দ্রুত যোগাযোগ করা হবে। (সাপোর্ট টিকিট চেক করুন)
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={submitOrder} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">আপনার নাম <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="আপনার নাম লিখুন"
                                        value={orderName}
                                        onChange={e => setOrderName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-semibold text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">মোবাইল নাম্বার (হোয়াটসঅ্যাপ) <span className="text-red-500">*</span></label>
                                    <input 
                                        type="tel" 
                                        required 
                                        placeholder="01XXXXXXXXX"
                                        value={orderPhone}
                                        onChange={e => setOrderPhone(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-semibold text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">বিশেষ কোন অনুরোধ (যদি থাকে)</label>
                                    <textarea 
                                        placeholder="মেসেজ বা ডেলিভারি বিষয়ক তথ্য"
                                        value={orderNotes}
                                        onChange={e => setOrderNotes(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-semibold text-slate-800 resize-none"
                                    />
                                </div>

                                {!user && (
                                    <div className="flex gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-[10px] font-bold">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>অর্ডার করতে বা ফ্রি বই ডাউনলোড করতে প্রথমে সাইন ইন করুন।</span>
                                    </div>
                                )}

                                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                                    <div className="text-left">
                                        <span className="text-[10px] text-slate-450 block font-bold">মোট দেয় পরিমাণ</span>
                                        <span className="text-base font-black text-slate-800">৳{selectedBook.sale_price !== null ? selectedBook.sale_price : selectedBook.price}</span>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={!user}
                                        className={`px-5 py-3 rounded-xl font-bold text-xs text-white border-none cursor-pointer flex items-center gap-1 shadow transition-all ${user ? 'bg-gradient-to-r from-emerald-600 to-teal-650 hover:brightness-105 shadow-emerald-500/20 active:scale-[0.98]' : 'bg-slate-300 cursor-not-allowed'}`}
                                    >
                                        অর্ডার সম্পন্ন করুন <ShoppingCart className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
