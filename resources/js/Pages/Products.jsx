import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Package, CheckCircle, AlertCircle, Truck, Check, Minus, Plus } from 'lucide-react';
import { useAuth } from '../Contexts/AuthContext';
import { useSiteSettings } from '../Contexts/SiteSettingsContext';
import axios from 'axios';
import { useSEO } from '../Utils/seo';

export default function Products() {
    useSEO({
        title: 'প্রোডাক্টস ও রিসোর্স স্টোর',
        description: 'আপনার কাজের গতি বাড়াতে ও প্রয়োজনীয় প্রজেক্ট ফাইল, সফটওয়্যার বা ফিজিক্যাল প্রোডাক্টস সংগ্রহ করুন।'
    });
    const { user } = useAuth();
    const { settings } = useSiteSettings();
    const isEnabled = settings?.features?.feature_products === '1' || settings?.features?.feature_products === 1 || settings?.features?.feature_products === true;

    if (!isEnabled) {
        return (
            <div className="max-w-md mx-auto px-6 py-20 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 border border-red-150 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">মডিউলটি উপলব্ধ নয়</h2>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    পণ্য মডিউলটি বর্তমানে নিষ্ক্রিয় রয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।
                </p>
                <a href="/" className="inline-block px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors">
                    হোমপেজে ফিরে যান
                </a>
            </div>
        );
    }

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [orderName, setOrderName] = useState('');
    const [orderPhone, setOrderPhone] = useState('');
    const [orderAddress, setOrderAddress] = useState('');
    const [orderQuantity, setOrderQuantity] = useState(1);
    const [orderNotes, setOrderNotes] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/products?type=physical');
                if (response.data.success) {
                    const items = response.data.products;
                    setProducts(Array.isArray(items) ? items : (items && typeof items === 'object' ? Object.values(items) : []));
                }
            } catch (err) {
                console.error('Error fetching physical products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter(p =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const inStock = (p) => p.stock === null || p.stock > 0;
    const priceOf = (p) => (p.sale_price && parseFloat(p.sale_price) > 0 ? parseFloat(p.sale_price) : parseFloat(p.price));
    const hasDiscount = (p) => p.sale_price && parseFloat(p.sale_price) > 0 && parseFloat(p.price) > parseFloat(p.sale_price);

    const openOrder = (product) => {
        setSelectedProduct(product);
        setOrderSuccess(false);
        setOrderQuantity(1);
        if (user) {
            setOrderName(user.name);
        }
    };

    const changeQuantity = (delta) => {
        const max = selectedProduct?.stock && selectedProduct.stock > 0 ? selectedProduct.stock : 99;
        setOrderQuantity((q) => Math.min(max, Math.max(1, q + delta)));
    };

    const submitOrder = async (e) => {
        e.preventDefault();
        try {
            const total = priceOf(selectedProduct) * orderQuantity;
            const ticketData = {
                title: `Physical Product Order: ${selectedProduct.name}`,
                category: 'Billing & Payments',
                message: `Hello Support,\n\nI want to order the physical product "${selectedProduct.name}".\n\nOrder Info:\nName: ${orderName}\nPhone: ${orderPhone}\nDelivery Address: ${orderAddress || 'N/A'}\nQuantity: ${orderQuantity}\nUnit Price: ৳${priceOf(selectedProduct)}\nTotal: ৳${total}\nNotes: ${orderNotes || 'None'}\n\nPlease guide me on delivery and payment.`,
                priority: 'medium'
            };

            const response = await axios.post('/api/support-tickets', ticketData);
            if (response.data.success) {
                setOrderSuccess(true);
                setTimeout(() => {
                    setSelectedProduct(null);
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
            <div className="text-center relative overflow-hidden py-10 md:py-16 px-4 rounded-3xl bg-rose-50/50 border border-rose-100/30">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-rose-100/60 rounded-full blur-3xl -z-10" />
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-900 leading-tight">
                    আমাদের সকল <span className="bg-gradient-to-r from-rose-600 to-pink-650 bg-clip-text text-transparent">পণ্যসমূহ</span>
                </h1>
                <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto mb-6 md:mb-8 font-normal px-2">
                    আপনার প্রয়োজনীয় বই, মার্চেন্ডাইজ ও অন্যান্য ফিজিক্যাল পণ্য এক জায়গা থেকে অর্ডার করুন।
                </p>

                {/* Search Bar */}
                <div className="max-w-md mx-auto relative">
                    <input
                        type="text"
                        placeholder="পণ্য খুঁজুন..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm bg-white border border-slate-200 focus:outline-none focus:border-rose-650 focus:ring-2 focus:ring-rose-600/10 text-slate-800 shadow-sm transition-all"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                </div>
            </div>

            {/* Catalog Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="h-5.5 w-5.5 text-rose-600" />
                        <h2 className="text-xl font-bold text-slate-800">পণ্য ক্যাটালগ</h2>
                    </div>
                    <span className="text-xs bg-rose-50 border border-rose-100 text-rose-650 px-4 py-1.5 rounded-full font-bold shadow-sm">
                        {filteredProducts.length} টি পণ্য পাওয়া গেছে
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="bg-white border border-slate-100 shadow-sm h-96 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {filteredProducts.map((product) => {
                            const stock = inStock(product);
                            const discounted = hasDiscount(product);
                            return (
                                <div key={product.id} className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                    {/* Thumbnail */}
                                    <div className="relative aspect-[16/10] w-full bg-slate-50 overflow-hidden border-b border-slate-100 shrink-0">
                                        {product.image ? (
                                            <img
                                                src={product.image.startsWith('http') ? product.image : `/storage/${product.image}`}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50">
                                                <Package className="h-10 w-10 text-rose-400" />
                                            </div>
                                        )}

                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                            {product.is_featured && (
                                                <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-gradient-to-r from-rose-600 to-pink-650 text-white shadow-sm">
                                                    জনপ্রিয়
                                                </span>
                                            )}
                                            {discounted && (
                                                <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase bg-white/90 text-rose-600 shadow-sm">
                                                    {product.discount_percentage}% ছাড়
                                                </span>
                                            )}
                                        </div>

                                        {/* Stock badge */}
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${stock ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'} shadow-sm`}>
                                                {stock ? 'স্টকে আছে' : 'স্টক শেষ'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-col flex-grow p-5">
                                        <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-2 line-clamp-1 theme-primary-text-hover transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-slate-500 text-xs mb-4 line-clamp-2 font-normal leading-relaxed">
                                            {product.description || 'VibeThink প্রিমিয়াম ফিজিক্যাল পণ্য।'}
                                        </p>

                                        {product.features && (
                                            <div className="flex items-start gap-1.5 text-[11px] text-slate-500 leading-relaxed font-semibold mb-4">
                                                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{product.features}</span>
                                            </div>
                                        )}

                                        {/* Price */}
                                        <div className="flex items-baseline gap-2 mb-5">
                                            <span className="text-lg font-black theme-primary-text text-[#FF5A00]">
                                                ৳{Math.round(priceOf(product))}
                                            </span>
                                            {discounted && (
                                                <span className="text-xs text-slate-400 line-through font-semibold">
                                                    ৳{Math.round(parseFloat(product.price))}
                                                </span>
                                            )}
                                        </div>

                                        {/* Action */}
                                        <button
                                            onClick={() => openOrder(product)}
                                            disabled={!stock}
                                            className={`mt-auto w-full py-3 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer ${stock ? 'theme-primary-bg hover:brightness-95 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                        >
                                            {stock ? (<>অর্ডার করুন <ShoppingBag className="w-3.5 h-3.5" /></>) : 'স্টক শেষ'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl shadow-sm">
                        <ShoppingBag className="h-10 w-10 text-slate-350 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-slate-800">কোনো পণ্য পাওয়া যায়নি</h3>
                        <p className="text-xs text-slate-450 mt-1">অন্য কোনো কিওয়ার্ড দিয়ে আবার চেষ্টা করুন</p>
                    </div>
                )}
            </div>

            {/* Order Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-scaleIn">
                        <div className="bg-gradient-to-r from-rose-600 to-pink-650 px-6 py-6 text-white relative">
                            <h3 className="text-lg font-extrabold">পণ্য অর্ডার ফর্ম</h3>
                            <p className="text-xs opacity-85 mt-1 line-clamp-1">{selectedProduct.name}</p>
                            <button
                                onClick={() => setSelectedProduct(null)}
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
                                    আমাদের টিম থেকে ডেলিভারি ও পেমেন্ট সংক্রান্ত পরবর্তী তথ্যের জন্য আপনার সাথে দ্রুত যোগাযোগ করা হবে। (সাপোর্ট টিকিট চেক করুন)
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={submitOrder} className="p-6 space-y-4">
                                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-rose-800 text-xs font-semibold">
                                    <Truck className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                                    <div>
                                        <p className="font-bold">হোম ডেলিভারি</p>
                                        <p className="opacity-90 mt-0.5">অর্ডার নিশ্চিত করার পর আমাদের টিম আপনার ঠিকানায় পণ্য পৌঁছে দেবে।</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">আপনার নাম <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="আপনার নাম লিখুন"
                                        value={orderName}
                                        onChange={e => setOrderName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-xs font-semibold text-slate-800"
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
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-xs font-semibold text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">ডেলিভারি ঠিকানা <span className="text-red-500">*</span></label>
                                    <textarea
                                        required
                                        placeholder="বাসা/রোড, থানা, জেলা লিখুন"
                                        value={orderAddress}
                                        onChange={e => setOrderAddress(e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-xs font-semibold text-slate-800 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">পরিমাণ</label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => changeQuantity(-1)}
                                            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 border-none cursor-pointer transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm font-black text-slate-800 w-8 text-center">{orderQuantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => changeQuantity(1)}
                                            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 border-none cursor-pointer transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                        {selectedProduct.stock > 0 && (
                                            <span className="text-[10px] text-slate-400 font-bold ml-1">মোট স্টক: {selectedProduct.stock}</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">বিশেষ কোন অনুরোধ (যদি থাকে)</label>
                                    <textarea
                                        placeholder="মেসেজ বা ডেলিভারি বিষয়ক তথ্য"
                                        value={orderNotes}
                                        onChange={e => setOrderNotes(e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 text-xs font-semibold text-slate-800 resize-none"
                                    />
                                </div>

                                {!user && (
                                    <div className="flex gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-[10px] font-bold">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>অর্ডার করতে প্রথমে সাইন ইন করুন।</span>
                                    </div>
                                )}

                                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                                    <div className="text-left">
                                        <span className="text-[10px] text-slate-450 block font-bold">মোট দেয় পরিমাণ</span>
                                        <span className="text-base font-black text-slate-800">৳{Math.round(priceOf(selectedProduct) * orderQuantity)}</span>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!user}
                                        className={`px-5 py-3 rounded-xl font-bold text-xs text-white border-none cursor-pointer flex items-center gap-1 shadow transition-all ${user ? 'bg-gradient-to-r from-rose-600 to-pink-650 hover:brightness-105 shadow-rose-500/20 active:scale-[0.98]' : 'bg-slate-300 cursor-not-allowed'}`}
                                    >
                                        অর্ডার সম্পন্ন করুন <ShoppingBag className="w-4 h-4" />
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
