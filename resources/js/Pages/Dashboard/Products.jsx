import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    ShoppingBag, Package, CheckCircle, Clock, XCircle, Tag,
    ShoppingCart, Info, TrendingUp, Search, Filter, Box, Shield,
    ArrowRight, Check, FileText, Download, ExternalLink, RefreshCw,
    Wallet, CreditCard, ChevronRight, X, AlertCircle, Sparkles
} from 'lucide-react';

export default function Products() {
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'orders'
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [gateways, setGateways] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0);

    const [loading, setLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    // Selected product for Details Modal or Buy Modal
    const [detailProduct, setDetailProduct] = useState(null);
    const [buyProduct, setBuyProduct] = useState(null);

    // Buy Form State
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('wallet');
    const [transactionId, setTransactionId] = useState('');
    const [senderNumber, setSenderNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [purchasing, setPurchasing] = useState(false);
    const [purchaseError, setPurchaseError] = useState('');
    const [purchaseSuccess, setPurchaseSuccess] = useState(null);

    // Selected Order Detail Modal
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [prodRes, gwRes, ordRes] = await Promise.all([
                axios.get('/api/products'),
                axios.get('/api/payment-gateways').catch(() => ({ data: { gateways: [] } })),
                axios.get('/api/product-orders').catch(() => ({ data: { orders: [], wallet_balance: 0 } }))
            ]);

            if (prodRes.data?.success) {
                setProducts(prodRes.data.products || []);
            }
            if (gwRes.data?.success) {
                setGateways(gwRes.data.gateways || []);
            }
            if (ordRes.data?.success) {
                setOrders(ordRes.data.orders || []);
                setWalletBalance(ordRes.data.wallet_balance || 0);
            }
        } catch (err) {
            console.error('Error loading product data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const res = await axios.get('/api/product-orders');
            if (res.data?.success) {
                setOrders(res.data.orders || []);
                setWalletBalance(res.data.wallet_balance || 0);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleOpenBuy = (product) => {
        setBuyProduct(product);
        setQuantity(1);
        setPaymentMethod('wallet');
        setTransactionId('');
        setSenderNumber('');
        setNotes('');
        setPurchaseError('');
        setPurchaseSuccess(null);
    };

    const handlePurchase = async (e) => {
        e.preventDefault();
        if (!buyProduct) return;

        setPurchasing(true);
        setPurchaseError('');

        try {
            const payload = {
                quantity,
                payment_method: paymentMethod,
                transaction_id: transactionId,
                sender_number: senderNumber,
                notes,
            };

            const res = await axios.post(`/api/products/${buyProduct.id}/order`, payload);

            if (res.data?.success) {
                if (res.data.payment_url) {
                    window.location.href = res.data.payment_url;
                    return;
                }
                setPurchaseSuccess(res.data.message || 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!');
                fetchOrders();
                // Close modal after 2.5 seconds
                setTimeout(() => {
                    setBuyProduct(null);
                    setPurchaseSuccess(null);
                    setActiveTab('orders');
                }, 2000);
            } else {
                setPurchaseError(res.data?.message || 'অর্ডার প্রক্রিয়া করতে ব্যর্থ হয়েছে।');
            }
        } catch (err) {
            setPurchaseError(err.response?.data?.message || 'অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
        } finally {
            setPurchasing(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return { bg: 'bg-emerald-100 text-emerald-700', label: 'সম্পন্ন', icon: CheckCircle };
            case 'pending':
                return { bg: 'bg-amber-100 text-amber-700', label: 'পেন্ডিং', icon: Clock };
            case 'processing':
                return { bg: 'bg-blue-100 text-blue-700', label: 'প্রসেসিং', icon: RefreshCw };
            case 'cancelled':
                return { bg: 'bg-rose-100 text-rose-700', label: 'বাতিল', icon: XCircle };
            default:
                return { bg: 'bg-gray-100 text-gray-700', label: status, icon: Info };
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = typeFilter === 'all' || product.type === typeFilter;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <div className="py-16 flex flex-col justify-center items-center">
                <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                <span className="text-gray-500 text-sm font-medium">পণ্যসমূহ লোড হচ্ছে...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shrink-0 shadow-md shadow-blue-500/20">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">পণ্য মার্কেটপ্লেস</h2>
                        <p className="text-xs text-gray-400 mt-0.5 font-light">আমাদের সব প্রিমিয়াম ডিজিটাল ও ফিজিক্যাল প্রোডাক্ট সমাহার</p>
                    </div>
                </div>

                {/* Sub Tab Switcher */}
                <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                    <button
                        onClick={() => setActiveTab('browse')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'browse'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <Package className="h-4 w-4" />
                        সব পণ্য ({products.length})
                    </button>
                    <button
                        onClick={() => { setActiveTab('orders'); fetchOrders(); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'orders'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                        <ShoppingCart className="h-4 w-4" />
                        আমার অর্ডার ({orders.length})
                    </button>
                </div>
            </div>

            {/* BROWSE PRODUCTS TAB */}
            {activeTab === 'browse' && (
                <div className="space-y-6">
                    {/* Filters & Search */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        {/* Search Bar */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="পণ্য খুঁজুন..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Type Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
                            {[
                                { key: 'all', label: 'সব টাইপ' },
                                { key: 'digital', label: 'ডিজিটাল' },
                                { key: 'physical', label: 'ফিজিক্যাল' },
                            ].map(filter => (
                                <button
                                    key={filter.key}
                                    onClick={() => setTypeFilter(filter.key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                        typeFilter === filter.key
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
                            <Box className="h-12 w-12 text-gray-300 mx-auto" />
                            <h3 className="text-base font-bold text-gray-700">কোনো পণ্য পাওয়া যায়নি</h3>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                আপনার ফিল্টার বা অনুসন্ধানের সাথে মিল রেখে কোনো উপাদান পাওয়া যায়নি।
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredProducts.map((product) => {
                                const price = parseFloat(product.actual_price || product.sale_price || product.price || 0);
                                const originalPrice = parseFloat(product.price || 0);
                                const discountPct = product.discount_percentage || 0;
                                const isOutOfStock = product.stock !== null && product.stock <= 0;

                                return (
                                    <div
                                        key={product.id}
                                        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-blue-500/20 transition-all duration-300 group"
                                    >
                                        <div>
                                            {/* Image container */}
                                            <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <Package className="h-10 w-10" />
                                                    </div>
                                                )}

                                                {/* Discount Badge */}
                                                {discountPct > 0 && (
                                                    <div className="absolute top-2.5 left-2.5 bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                                                        {discountPct}% ছাড়
                                                    </div>
                                                )}

                                                {/* Type Badge */}
                                                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                    {product.type === 'digital' ? 'ডিজিটাল' : 'ফিজিক্যাল'}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 space-y-2">
                                                <h3 className="font-bold text-gray-900 text-sm line-clamp-1 group-hover:text-blue-600 transition-colors">
                                                    {product.name}
                                                </h3>

                                                <p className="text-xs text-gray-400 line-clamp-2 min-h-[32px]">
                                                    {product.description || 'কোনো বর্ণনা দেওয়া হয়নি।'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Footer / Price & Action */}
                                        <div className="p-4 pt-0 space-y-3">
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-lg font-extrabold text-gray-900">
                                                    ৳{price.toLocaleString()}
                                                </span>
                                                {discountPct > 0 && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        ৳{originalPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => setDetailProduct(product)}
                                                    className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
                                                >
                                                    বিস্তারিত
                                                </button>
                                                <button
                                                    onClick={() => handleOpenBuy(product)}
                                                    disabled={isOutOfStock}
                                                    className={`w-full py-2 px-3 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 ${
                                                        isOutOfStock
                                                            ? 'bg-gray-300 cursor-not-allowed'
                                                            : 'bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20'
                                                    }`}
                                                >
                                                    <ShoppingCart className="h-3.5 w-3.5" />
                                                    {isOutOfStock ? 'স্টক নেই' : 'কিনুন'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* MY ORDERS TAB */}
            {activeTab === 'orders' && (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800 text-sm">আপনার ক্রয়ের ইতিহাস</h3>
                            <p className="text-xs text-gray-400">আপনার অর্ডারের বর্তমান অবস্থা ও ডিজিটাল এক্সেস তথ্য</p>
                        </div>
                        <button
                            onClick={fetchOrders}
                            disabled={ordersLoading}
                            className="p-2 text-gray-500 hover:text-blue-600 transition-all cursor-pointer"
                        >
                            <RefreshCw className={`h-4 w-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {orders.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto" />
                            <h4 className="text-base font-bold text-gray-700">আপনি এখনও কোনো পণ্য অর্ডার করেননি</h4>
                            <p className="text-xs text-gray-400 max-w-sm mx-auto">
                                পণ্য ব্রাউজ করুন এবং আপনার পছন্দের পণ্য ক্রয় করুন।
                            </p>
                            <button
                                onClick={() => setActiveTab('browse')}
                                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                                পণ্য ব্রাউজ করুন <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-3.5 px-4">অর্ডার নম্বর</th>
                                        <th className="py-3.5 px-4">পণ্য</th>
                                        <th className="py-3.5 px-4 text-center">পরিমাণ</th>
                                        <th className="py-3.5 px-4">মোট টাকা</th>
                                        <th className="py-3.5 px-4">মেথড</th>
                                        <th className="py-3.5 px-4 text-center">স্ট্যাটাস</th>
                                        <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => {
                                        const badge = getStatusBadge(order.status);
                                        const BadgeIcon = badge.icon;
                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                                                    {order.order_number || `#ORD-${order.id}`}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                                                            {order.product?.image ? (
                                                                <img src={order.product.image} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package className="h-4 w-4 text-gray-400 m-auto" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 line-clamp-1">{order.product?.name || 'অজানা পণ্য'}</p>
                                                            <span className="text-[10px] text-gray-400 uppercase">{order.product?.type || 'digital'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-semibold text-gray-700">
                                                    {order.quantity || 1}টি
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-gray-900">
                                                    ৳{parseFloat(order.total || 0).toLocaleString()}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="capitalize font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                                                        {order.payment_method === 'wallet' ? 'ওয়ালেট' : order.payment_method}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.bg}`}>
                                                        <BadgeIcon className="h-3 w-3" />
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[11px] rounded-lg transition-all cursor-pointer"
                                                    >
                                                        বিস্তারিত
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* DETAIL MODAL */}
            {detailProduct && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative">
                        <button
                            onClick={() => setDetailProduct(null)}
                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Product Image */}
                            <div className="space-y-3">
                                <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 relative">
                                    {detailProduct.image ? (
                                        <img src={detailProduct.image} alt={detailProduct.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Package className="h-16 w-16" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="space-y-4 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                                            {detailProduct.type === 'digital' ? 'ডিজিটাল প্রোডাক্ট' : 'ফিজিক্যাল প্রোডাক্ট'}
                                        </span>
                                        {detailProduct.stock !== null && (
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                detailProduct.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            }`}>
                                                {detailProduct.stock > 0 ? `স্টক: ${detailProduct.stock}টি` : 'স্টক শেষ'}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900">{detailProduct.name}</h3>

                                    <div className="flex items-baseline gap-2 pt-1">
                                        <span className="text-2xl font-extrabold text-blue-600">
                                            ৳{parseFloat(detailProduct.actual_price || detailProduct.sale_price || detailProduct.price || 0).toLocaleString()}
                                        </span>
                                        {detailProduct.discount_percentage > 0 && (
                                            <span className="text-sm text-gray-400 line-through">
                                                ৳{parseFloat(detailProduct.price || 0).toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-500 leading-relaxed pt-2">
                                        {detailProduct.description || 'কোনো বর্ণনা পাওয়া যায়নি।'}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex gap-2">
                                    <button
                                        onClick={() => {
                                            const p = detailProduct;
                                            setDetailProduct(null);
                                            handleOpenBuy(p);
                                        }}
                                        disabled={detailProduct.stock !== null && detailProduct.stock <= 0}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        এখনই কিনুন
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* BUY NOW / CHECKOUT MODAL */}
            {buyProduct && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
                        <button
                            onClick={() => setBuyProduct(null)}
                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <ShoppingCart className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">অর্ডার সম্পন্ন করুন</h3>
                                <p className="text-xs text-gray-400">{buyProduct.name}</p>
                            </div>
                        </div>

                        {purchaseSuccess ? (
                            <div className="py-8 text-center space-y-3">
                                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="h-10 w-10" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900">অর্ডার সফল হয়েছে!</h4>
                                <p className="text-xs text-gray-500 max-w-xs mx-auto">{purchaseSuccess}</p>
                            </div>
                        ) : (
                            <form onSubmit={handlePurchase} className="space-y-4">
                                {purchaseError && (
                                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{purchaseError}</span>
                                    </div>
                                )}

                                {/* Summary & Quantity */}
                                <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                                        <span>একক মূল্য:</span>
                                        <span>৳{parseFloat(buyProduct.actual_price || buyProduct.sale_price || buyProduct.price || 0).toLocaleString()}</span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-gray-700">পরিমাণ:</span>
                                        <div className="flex items-center gap-3 bg-white px-3 py-1 rounded-xl border border-gray-200">
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                className="text-gray-500 hover:text-gray-800 font-bold px-1 cursor-pointer"
                                            >
                                                -
                                            </button>
                                            <span className="font-bold text-gray-900 w-4 text-center">{quantity}</span>
                                            <button
                                                type="button"
                                                onClick={() => setQuantity(q => q + 1)}
                                                className="text-gray-500 hover:text-gray-800 font-bold px-1 cursor-pointer"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 pt-2 flex items-center justify-between text-sm font-extrabold text-gray-900">
                                        <span>সর্বমোট:</span>
                                        <span className="text-blue-600">
                                            ৳{(parseFloat(buyProduct.actual_price || buyProduct.sale_price || buyProduct.price || 0) * quantity).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Method Selection */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-gray-700">পেমেন্ট মেথড নির্বাচন করুন</label>

                                    <div className="grid grid-cols-2 gap-2">
                                        {/* Wallet Option */}
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod('wallet')}
                                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                                paymentMethod === 'wallet'
                                                    ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Wallet className="h-4 w-4 text-blue-600" />
                                                <span className="text-xs font-bold text-gray-800">ওয়ালেট ব্যালেন্স</span>
                                            </div>
                                            <span className="text-[11px] text-gray-500 mt-1">
                                                ব্যালেন্স: ৳{walletBalance.toLocaleString()}
                                            </span>
                                        </button>

                                        {/* Manual / Gateway Options */}
                                        {gateways.filter(g => g.is_active).map(gw => (
                                            <button
                                                key={gw.id}
                                                type="button"
                                                onClick={() => setPaymentMethod(gw.key || gw.name)}
                                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                                                    paymentMethod === (gw.key || gw.name)
                                                        ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-xs font-bold text-gray-800">{gw.name}</span>
                                                </div>
                                                <span className="text-[10px] text-gray-400 mt-1 capitalize">{gw.type || 'ম্যানুয়াল'}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                 {/* ZiniPay Notice */}
                                {paymentMethod === 'zinipay' && (
                                    <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-1">
                                        <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                            <Sparkles className="h-4 w-4 text-blue-600" />
                                            অটোমেটিক ZiniPay গেটওয়ে
                                        </p>
                                        <p className="text-[11px] text-blue-700 leading-relaxed">
                                            'অর্ডার নিশ্চিত করুন' এ ক্লিক করলে আপনাকে জেনিপে সেকিউর পেমেন্ট পেজে নিয়ে যাওয়া হবে, সেখানে বিকাশ, নগদ, রকেট বা কার্ড দিয়ে সরাসরি স্বয়ংক্রিয় পেমেন্ট সম্পন্ন করতে পারবেন।
                                        </p>
                                    </div>
                                )}

                                {/* Manual Payment Extra Fields if Manual Gateway */}
                                {paymentMethod !== 'wallet' && paymentMethod !== 'zinipay' && (
                                    <div className="space-y-3 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                                        <p className="text-[11px] text-gray-600">
                                            ম্যানুয়ালি টাকা পাঠানোর পর আপনার তথ্য নিশ্চিত করতে নিচের ঘরগুলো পূরণ করুন:
                                        </p>
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="সেন্ডার নম্বর (যেমন: 017XXXXXXXX)"
                                                value={senderNumber}
                                                onChange={e => setSenderNumber(e.target.value)}
                                                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="ট্রানজেকশন আইডি (TxID)"
                                                value={transactionId}
                                                onChange={e => setTransactionId(e.target.value)}
                                                className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">অতিরিক্ত নোট (ঐচ্ছিক)</label>
                                    <input
                                        type="text"
                                        placeholder="পণ্য ডেলিভারি সংক্রান্ত কোনো তথ্য থাকলে লিখুন..."
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        className="w-full bg-white border border-gray-200 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500 text-gray-800"
                                    />
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={purchasing}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
                                >
                                    {purchasing ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>প্রসেসিং হচ্ছে...</span>
                                        </>
                                    ) : (
                                        <span>অর্ডার নিশ্চিত করুন (৳{(parseFloat(buyProduct.actual_price || buyProduct.sale_price || buyProduct.price || 0) * quantity).toLocaleString()})</span>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ORDER DETAIL MODAL */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                <Package className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">অর্ডার বিবরণী</h3>
                                <p className="text-xs text-gray-400 font-mono">{selectedOrder.order_number || `#ORD-${selectedOrder.id}`}</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-xs">
                            {/* Product Info */}
                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
                                <div className="h-12 w-12 rounded-xl bg-white overflow-hidden shrink-0 border border-gray-200">
                                    {selectedOrder.product?.image ? (
                                        <img src={selectedOrder.product.image} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <Package className="h-6 w-6 text-gray-300 m-auto" />
                                    )}
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-gray-900 text-sm">{selectedOrder.product?.name || 'অজানা পণ্য'}</h4>
                                    <p className="text-gray-500">পরিমাণ: {selectedOrder.quantity || 1}টি • মোট: ৳{parseFloat(selectedOrder.total || 0).toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Access Instructions & Download Link for completed orders */}
                            {selectedOrder.status === 'completed' && (selectedOrder.product?.download_link || selectedOrder.product?.access_instructions) && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                                        <Sparkles className="h-4 w-4" />
                                        <span>ডিজিটাল এক্সেস ও ফাইল</span>
                                    </div>

                                    {selectedOrder.product?.download_link && (
                                        <a
                                            href={selectedOrder.product.download_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                                        >
                                            <Download className="h-4 w-4" />
                                            ফাইল ডাউনলোড করুন
                                        </a>
                                    )}

                                    {selectedOrder.product?.access_instructions && (
                                        <div className="text-emerald-900 bg-white/70 p-3 rounded-xl text-xs space-y-1">
                                            <p className="font-bold text-emerald-950">এক্সেস নির্দেশনা:</p>
                                            <p className="whitespace-pre-line">{selectedOrder.product.access_instructions}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="p-3 bg-gray-50 rounded-xl space-y-0.5">
                                    <span className="text-gray-400 text-[10px]">পেমেন্ট মেথড</span>
                                    <p className="font-bold text-gray-800 capitalize">{selectedOrder.payment_method}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl space-y-0.5">
                                    <span className="text-gray-400 text-[10px]">অর্ডারের তারিখ</span>
                                    <p className="font-bold text-gray-800">
                                        {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('bn-BD') : '—'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
