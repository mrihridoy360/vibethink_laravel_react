import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    ShoppingBag, Plus, Pencil, Trash2, Search, ExternalLink, X, Loader2,
    CheckCircle, AlertCircle, ToggleLeft, ToggleRight, DollarSign, Package,
    Layers, Link as LinkIcon, FileText, Image as ImageIcon, Upload, Eye, ShoppingCart, Calendar
} from 'lucide-react';

// ── Toast Notification ────────────────────────────────────────────────────────
function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [toast]);
    if (!toast) return null;
    return (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-semibold transition-all animate-fadeIn ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
            {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {toast.message}
            <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
        </div>
    );
}

// ── Product Create/Edit Modal ──────────────────────────────────────────────────
function ProductModal({ mode, product, onClose, onSaved }) {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState({
        name: isEdit ? (product?.name || '') : '',
        slug: isEdit ? (product?.slug || '') : '',
        description: isEdit ? (product?.description || '') : '',
        features: isEdit ? (product?.features || '') : '',
        price: isEdit ? (product?.price || '') : '',
        sale_price: isEdit ? (product?.sale_price || '') : '',
        type: isEdit ? (product?.type || 'digital') : 'digital',
        download_link: isEdit ? (product?.download_link || '') : '',
        access_instructions: isEdit ? (product?.access_instructions || '') : '',
        stock: isEdit ? (product?.stock ?? '') : '',
        is_featured: isEdit ? !!product?.is_featured : false,
        is_active: isEdit ? !!product?.is_active : true,
        order: isEdit ? (product?.order ?? 0) : 0,
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(isEdit ? product?.image : null);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        const formData = new FormData();
        Object.keys(form).forEach(key => {
            if (form[key] !== null && form[key] !== undefined) {
                if (typeof form[key] === 'boolean') {
                    formData.append(key, form[key] ? '1' : '0');
                } else {
                    formData.append(key, form[key]);
                }
            }
        });

        if (imageFile) {
            formData.append('image_file', imageFile);
        }

        try {
            let res;
            if (isEdit) {
                res = await axios.post(`/api/admin/products/${product.id}/update`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                res = await axios.post('/api/admin/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            if (res.data.success) {
                onSaved(res.data.product, isEdit);
            }
        } catch (err) {
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                onSaved(null, isEdit, 'একটি ত্রুটি ঘটেছে। দয়া করে আবার চেষ্টা করুন।');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">
                            {isEdit ? 'পণ্য সংশোধন করুন' : 'নতুন পণ্য যোগ করুন'}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            ডিজিটাল বা ফিজিক্যাল পণ্য যুক্ত করুন
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5 space-y-4">
                    {/* Cover image upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">পণ্যের ইমেজ</label>
                        <div className="flex gap-4 items-center">
                            <div className="h-20 w-28 rounded-xl bg-gray-50 border border-gray-150 overflow-hidden flex items-center justify-center shrink-0">
                                {imagePreview ? (
                                    <img src={imagePreview} className="h-full w-full object-cover" alt="Preview" />
                                ) : (
                                    <ImageIcon className="h-7 w-7 text-gray-300" />
                                )}
                            </div>
                            <div className="flex-1">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current.click()}
                                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-250 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer"
                                >
                                    <Upload className="h-3.5 w-3.5 text-gray-500" /> ইমেজ সিলেক্ট করুন
                                </button>
                                <p className="text-[10px] text-gray-400 mt-1">পরামর্শ: JPG, WebP বা PNG ফরম্যাট (Max: 2MB)</p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image[0]}</p>}
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">পণ্যের নাম <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            placeholder="যেমন: E-Book, React Premium Template"
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
                    </div>

                    {/* Two Column Price & Sale Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">মূল্য (Price) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={form.price}
                                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                            />
                            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ছাড়ের মূল্য (Sale Price)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="ফাঁকা বা নিয়মিত মূল্যের কম"
                                value={form.sale_price}
                                onChange={e => setForm(p => ({ ...p, sale_price: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                            />
                            {errors.sale_price && <p className="text-xs text-red-500 mt-1">{errors.sale_price[0]}</p>}
                        </div>
                    </div>

                    {/* Two Column Type & Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ধরণ (Type) <span className="text-red-500">*</span></label>
                            <select
                                required
                                value={form.type}
                                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-semibold text-gray-700 bg-white"
                            >
                                <option value="digital">Digital (Ebook/Software)</option>
                                <option value="physical">Physical (Books/T-shirts)</option>
                                <option value="service">Service (Consultation/Setup)</option>
                            </select>
                            {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">স্টক পরিমাণ (Stock)</label>
                            <input
                                type="number"
                                min="0"
                                placeholder="ডিজিটাল পণ্যের জন্য আনলিমিটেড"
                                value={form.stock}
                                onChange={e => setForm(p => ({ ...p, stock: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                            />
                            {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock[0]}</p>}
                        </div>
                    </div>

                    {/* Digital specific: Download Link & Access Instructions */}
                    {form.type === 'digital' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ডাউনলোড লিংক (Drive/Zip URL)</label>
                                <input
                                    type="url"
                                    placeholder="https://drive.google.com/..."
                                    value={form.download_link}
                                    onChange={e => setForm(p => ({ ...p, download_link: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                                />
                                {errors.download_link && <p className="text-xs text-red-500 mt-1">{errors.download_link[0]}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">অ্যাক্সেস গাইডলাইন (Access Instructions)</label>
                                <textarea
                                    placeholder="ক্রয় করার পর শিক্ষার্থীরা কীভাবে পণ্যটি পাবে তার সংক্ষিপ্ত গাইড"
                                    rows="2"
                                    value={form.access_instructions}
                                    onChange={e => setForm(p => ({ ...p, access_instructions: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all resize-none"
                                />
                                {errors.access_instructions && <p className="text-xs text-red-500 mt-1">{errors.access_instructions[0]}</p>}
                            </div>
                        </div>
                    )}

                    {/* Two Column Order & Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">ক্রম (Order)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.order}
                                onChange={e => setForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                            />
                            {errors.order && <p className="text-xs text-red-500 mt-1">{errors.order[0]}</p>}
                        </div>
                        {isEdit && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">স্লাগ (Slug)</label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                                />
                                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug[0]}</p>}
                            </div>
                        )}
                    </div>

                    {/* Features (bullet points) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">বৈশিষ্ট্যসমূহ (Features - কমা দিয়ে আলাদা করুন)</label>
                        <input
                            type="text"
                            placeholder="যেমন: Life Time Access, Full Support, HD Videos"
                            value={form.features}
                            onChange={e => setForm(p => ({ ...p, features: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all"
                        />
                        {errors.features && <p className="text-xs text-red-500 mt-1">{errors.features[0]}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">পণ্যের বিস্তারিত বিবরণ</label>
                        <textarea
                            placeholder="পণ্যের বিবরণ লিখুন..."
                            rows="2"
                            value={form.description}
                            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all resize-none"
                        />
                        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description[0]}</p>}
                    </div>

                    {/* Settings Switches */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-2xl">
                        <div className="flex items-center justify-between p-2 bg-white rounded-xl">
                            <div>
                                <span className="text-xs font-bold text-gray-800">ফিচার্ড প্রোডাক্ট</span>
                                <p className="text-[10px] text-gray-400">হোমপেজে দেখাবে</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, is_featured: !p.is_featured }))}
                                className="text-blue-600 focus:outline-none cursor-pointer shrink-0"
                            >
                                {form.is_featured ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-gray-300" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-white rounded-xl">
                            <div>
                                <span className="text-xs font-bold text-gray-800">সক্রিয় স্ট্যাটাস</span>
                                <p className="text-[10px] text-gray-400">শিক্ষার্থীরা দেখতে পাবে</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                                className="text-blue-600 focus:outline-none cursor-pointer shrink-0"
                            >
                                {form.is_active ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8 text-gray-300" />}
                            </button>
                        </div>
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end shrink-0 bg-gray-50 rounded-b-3xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all cursor-pointer">বাতিল</button>
                    <button type="button" onClick={handleSubmit} disabled={saving} className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer">
                        {saving && <Loader2 className="h-3 w-3 animate-spin" />}
                        {isEdit ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Order Edit/Status Modal ───────────────────────────────────────────────────
function OrderModal({ order, onClose, onSaved }) {
    const [status, setStatus] = useState(order?.status || 'pending');
    const [notes, setNotes] = useState(order?.notes || '');
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setError('');

        try {
            const res = await axios.patch(`/api/admin/product-orders/${order.id}/status`, {
                status,
                notes
            });
            if (res.data.success) {
                onSaved(res.data.order);
            }
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে।');
            }
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">অর্ডার স্ট্যাটাস সংশোধন</h2>
                        <p className="text-xs text-gray-400 mt-0.5">অর্ডার নাম্বার: {order.order_number}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto flex-grow px-6 py-5 space-y-4">
                    {error && (
                        <div className="p-3.5 bg-red-50 border border-red-150 text-red-700 rounded-2xl flex items-center gap-2 text-xs font-semibold">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Status selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">স্ট্যাটাস <span className="text-red-500">*</span></label>
                        <select
                            required
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-semibold text-gray-700 bg-white"
                        >
                            <option value="pending">Pending (অপেক্ষমান)</option>
                            <option value="completed">Completed (সম্পন্ন)</option>
                            <option value="cancelled">Cancelled (বাতিল)</option>
                            <option value="refunded">Refunded (রিফান্ডড)</option>
                        </select>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">অ্যাডমিন নোটস (নোট লিখুন)</label>
                        <textarea
                            placeholder="অর্ডার ডেলিভারি বা ক্যানসেল করার কারণ ইত্যাদি..."
                            rows="4"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-sm font-medium transition-all resize-none"
                        />
                    </div>
                </form>

                <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end shrink-0 bg-gray-50 rounded-b-3xl">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all cursor-pointer">বাতিল</button>
                    <button type="button" onClick={handleSubmit} disabled={updating} className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer">
                        {updating && <Loader2 className="h-3 w-3 animate-spin" />}
                        আপডেট করুন
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminProducts() {
    const [activeSubTab, setActiveSubTab] = useState('products'); // products, orders

    // Products states
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [productsPagination, setProductsPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [productsPage, setProductsPage] = useState(1);
    const [productsSearch, setProductsSearch] = useState('');
    const [productsTypeFilter, setProductsTypeFilter] = useState('');

    // Orders states
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [ordersPagination, setOrdersPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [ordersPage, setOrdersPage] = useState(1);
    const [ordersSearch, setOrdersSearch] = useState('');
    const [ordersStatusFilter, setOrdersStatusFilter] = useState('');

    // Modals & Notifications
    const [productModal, setProductModal] = useState({ isOpen: false, mode: 'create', product: null });
    const [orderModal, setOrderModal] = useState({ isOpen: false, order: null });
    const [toast, setToast] = useState(null);

    // Fetch Products
    const fetchProducts = async (page = 1, search = '', type = '') => {
        setProductsLoading(true);
        try {
            const res = await axios.get('/api/admin/products', {
                params: { page, search, type }
            });
            if (res.data.success) {
                setProducts(res.data.products.data);
                setProductsPagination({
                    current_page: res.data.products.current_page,
                    last_page: res.data.products.last_page,
                    total: res.data.products.total
                });
            }
        } catch (err) {
            console.error('Error fetching products', err);
        } finally {
            setProductsLoading(false);
        }
    };

    // Fetch Orders
    const fetchOrders = async (page = 1, search = '', status = '') => {
        setOrdersLoading(true);
        try {
            const res = await axios.get('/api/admin/product-orders', {
                params: { page, search, status }
            });
            if (res.data.success) {
                setOrders(res.data.orders.data);
                setOrdersPagination({
                    current_page: res.data.orders.current_page,
                    last_page: res.data.orders.last_page,
                    total: res.data.orders.total
                });
            }
        } catch (err) {
            console.error('Error fetching orders', err);
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        if (activeSubTab === 'products') {
            fetchProducts(productsPage, productsSearch, productsTypeFilter);
        } else {
            fetchOrders(ordersPage, ordersSearch, ordersStatusFilter);
        }
    }, [activeSubTab, productsPage, productsSearch, productsTypeFilter, ordersPage, ordersSearch, ordersStatusFilter]);

    // Handle Product Saved
    const handleProductSaved = (savedProduct, isEdit, error = null) => {
        if (error) {
            setToast({ type: 'error', message: error });
            return;
        }
        setProductModal({ isOpen: false, mode: 'create', product: null });
        fetchProducts(productsPage, productsSearch, productsTypeFilter);
        setToast({
            type: 'success',
            message: isEdit ? 'পণ্যের তথ্য আপডেট করা হয়েছে!' : 'নতুন পণ্য যুক্ত করা হয়েছে!'
        });
    };

    // Handle Order Saved
    const handleOrderSaved = (savedOrder) => {
        setOrderModal({ isOpen: false, order: null });
        fetchOrders(ordersPage, ordersSearch, ordersStatusFilter);
        setToast({
            type: 'success',
            message: 'অর্ডার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!'
        });
    };

    // Delete Product
    const handleDeleteProduct = async (id) => {
        if (!confirm('আপনি কি নিশ্চিতভাবে এই পণ্যটি মুছে ফেলতে চান?')) return;
        try {
            const res = await axios.delete(`/api/admin/products/${id}`);
            if (res.data.success) {
                fetchProducts(productsPage, productsSearch, productsTypeFilter);
                setToast({ type: 'success', message: res.data.message || 'পণ্যটি মুছে ফেলা হয়েছে!' });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'পণ্যটি মুছতে সমস্যা হয়েছে।' });
        }
    };

    // Quick toggle active status for Product
    const toggleProductActive = async (prod) => {
        try {
            const res = await axios.post(`/api/admin/products/${prod.id}/update`, {
                name: prod.name,
                price: prod.price,
                type: prod.type,
                is_active: !prod.is_active ? '1' : '0',
                is_featured: prod.is_featured ? '1' : '0',
                order: prod.order
            });
            if (res.data.success) {
                fetchProducts(productsPage, productsSearch, productsTypeFilter);
                setToast({ type: 'success', message: 'পণ্যের সক্রিয় স্ট্যাটাস আপডেট হয়েছে!' });
            }
        } catch (err) {
            setToast({ type: 'error', message: 'স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে।' });
        }
    };

    return (
        <div className="space-y-6">
            <Toast toast={toast} onClose={() => setToast(null)} />

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <ShoppingBag className="h-6 w-6 text-blue-600" /> পণ্য ও অর্ডার ম্যানেজমেন্ট
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 font-light">স্টোরে থাকা ডিজিটাল/ফিজিক্যাল প্রোডাক্টসমূহ যুক্ত করুন এবং শিক্ষার্থীদের অর্ডার ট্র্যাক ও মডিফাই করুন</p>
                </div>
                <div className="flex gap-2">
                    {activeSubTab === 'products' && (
                        <button
                            onClick={() => setProductModal({ isOpen: true, mode: 'create', product: null })}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                        >
                            <Plus className="h-4 w-4" /> নতুন পণ্য যোগ করুন
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs & Search Filter Header */}
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                {/* Tabs */}
                <div className="flex bg-white p-1 rounded-2xl border border-gray-150 shadow-sm shrink-0 select-none self-start">
                    <button
                        onClick={() => { setActiveSubTab('products'); setProductsPage(1); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'products' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <ShoppingBag className="h-3.5 w-3.5" /> পণ্য তালিকা
                    </button>
                    <button
                        onClick={() => { setActiveSubTab('orders'); setOrdersPage(1); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'orders' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        <ShoppingCart className="h-3.5 w-3.5" /> অর্ডার সমূহ
                    </button>
                </div>

                {/* Filters */}
                <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-end">
                    {activeSubTab === 'products' ? (
                        <>
                            {/* Search */}
                            <div className="relative min-w-0 sm:max-w-xs flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
                                    value={productsSearch}
                                    onChange={e => { setProductsSearch(e.target.value); setProductsPage(1); }}
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-medium bg-white"
                                />
                            </div>
                            {/* Type Filter */}
                            <select
                                value={productsTypeFilter}
                                onChange={e => { setProductsTypeFilter(e.target.value); setProductsPage(1); }}
                                className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-bold text-gray-600 bg-white"
                            >
                                <option value="">সব ধরণের পণ্য</option>
                                <option value="digital">Digital</option>
                                <option value="physical">Physical</option>
                                <option value="service">Service</option>
                            </select>
                        </>
                    ) : (
                        <>
                            {/* Search */}
                            <div className="relative min-w-0 sm:max-w-xs flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="অর্ডার নাম্বার বা কাস্টমার দিয়ে খুঁজুন..."
                                    value={ordersSearch}
                                    onChange={e => { setOrdersSearch(e.target.value); setOrdersPage(1); }}
                                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-medium bg-white"
                                />
                            </div>
                            {/* Status Filter */}
                            <select
                                value={ordersStatusFilter}
                                onChange={e => { setOrdersStatusFilter(e.target.value); setOrdersPage(1); }}
                                className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-500 text-xs font-bold text-gray-600 bg-white"
                            >
                                <option value="">সব অর্ডার</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </>
                    )}
                </div>
            </div>

            {/* List Containers */}
            {activeSubTab === 'products' ? (
                /* ── PRODUCTS LIST ── */
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {productsLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                            <span className="text-xs font-medium">প্রোডাক্ট লিস্ট লোড হচ্ছে...</span>
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                            <th className="py-4 px-6">পণ্যের তথ্য</th>
                                            <th className="py-4 px-6">ধরণ</th>
                                            <th className="py-4 px-6">মূল্য</th>
                                            <th className="py-4 px-6 text-center">স্টক</th>
                                            <th className="py-4 px-6 text-center">ক্রম (Order)</th>
                                            <th className="py-4 px-6 text-center">স্ট্যাটাস</th>
                                            <th className="py-4 px-6 text-center">অ্যাকশন</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                        {products.map(prod => (
                                            <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                            {prod.image ? (
                                                                <img src={prod.image} className="h-full w-full object-cover" alt={prod.name} />
                                                            ) : (
                                                                <ImageIcon className="h-5 w-5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                                                {prod.name}
                                                                {prod.is_featured && (
                                                                    <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-600 text-[9px] font-extrabold uppercase rounded-md border border-yellow-200">Featured</span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-gray-400 max-w-[240px] truncate mt-0.5" title={prod.description}>{prod.description || 'কোনো বিবরণ নেই।'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-md border border-blue-200">
                                                        {prod.type}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div>
                                                        <span className="font-bold text-gray-900">৳{prod.actual_price}</span>
                                                        {prod.sale_price && (
                                                            <span className="text-[10px] text-gray-400 line-through block">৳{prod.price}</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center font-bold text-gray-600">
                                                    {prod.stock !== null ? (
                                                        prod.stock > 0 ? (
                                                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded-md font-bold border border-emerald-150">{prod.stock} in stock</span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] rounded-md font-bold border border-red-150">Out of Stock</span>
                                                        )
                                                    ) : (
                                                        <span className="text-gray-400">N/A (Unlimited)</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-center font-bold text-gray-600">
                                                    {prod.order}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-center">
                                                        <button
                                                            onClick={() => toggleProductActive(prod)}
                                                            className="focus:outline-none cursor-pointer"
                                                            title={prod.is_active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                                                        >
                                                            {prod.is_active ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold border border-green-200">
                                                                    <CheckCircle className="h-3 w-3" /> active
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold border border-red-150">
                                                                    <X className="h-3 w-3" /> inactive
                                                                </span>
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => setProductModal({ isOpen: true, mode: 'edit', product: prod })}
                                                            className="p-1.5 rounded-lg border border-gray-150 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
                                                            title="এডিট করুন"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(prod.id)}
                                                            className="p-1.5 rounded-lg border border-gray-150 hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                                                            title="মুছে ফেলুন"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {productsPagination.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 bg-gray-50">
                                    <span>সর্বমোট {productsPagination.total} টি পণ্যের মধ্যে পৃষ্ঠা {productsPagination.current_page}/{productsPagination.last_page}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setProductsPage(p => Math.max(1, p - 1))}
                                            disabled={productsPagination.current_page === 1}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                                        >
                                            পূর্ববর্তী
                                        </button>
                                        <button
                                            onClick={() => setProductsPage(p => Math.min(productsPagination.last_page, p + 1))}
                                            disabled={productsPagination.current_page === productsPagination.last_page}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                                        >
                                            পরবর্তী
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-20 text-center text-gray-400">
                            <ShoppingBag className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs font-medium">কোনো পণ্য পাওয়া যায়নি।</p>
                        </div>
                    )}
                </div>
            ) : (
                /* ── PRODUCT ORDERS ── */
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    {ordersLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-gray-400">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                            <span className="text-xs font-medium">অর্ডার সমূহ লোড হচ্ছে...</span>
                        </div>
                    ) : orders.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                            <th className="py-4 px-6">অর্ডার তথ্য</th>
                                            <th className="py-4 px-6">কাস্টমার</th>
                                            <th className="py-4 px-6">প্রোডাক্ট</th>
                                            <th className="py-4 px-6">টোটাল প্রাইস</th>
                                            <th className="py-4 px-6 text-center">স্ট্যাটাস</th>
                                            <th className="py-4 px-6 text-center">তারিখ</th>
                                            <th className="py-4 px-6 text-center">অ্যাকশন</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                        {orders.map(order => (
                                            <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-900">{order.order_number}</div>
                                                    <span className="text-[10px] text-gray-400 font-semibold uppercase">{order.payment_method}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-900">{order.user?.name || 'অজ্ঞাত ব্যবহারকারী'}</div>
                                                    <p className="text-[10px] text-gray-400">{order.user?.email}</p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-10 rounded bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                                                            {order.product?.image ? (
                                                                <img src={order.product.image} className="h-full w-full object-cover" alt="product" />
                                                            ) : (
                                                                <ImageIcon className="h-4 w-4 text-gray-300" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-gray-800 truncate max-w-[150px]" title={order.product?.name}>{order.product?.name || 'মুছে ফেলা পণ্য'}</div>
                                                            <span className="text-[10px] text-gray-400">পরিমাণ: {order.quantity}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-900">৳{order.total}</div>
                                                    <span className="text-[10px] text-gray-400">প্রতিটির মূল্য: ৳{order.price}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-center">
                                                        {order.status === 'completed' && (
                                                            <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[10px] rounded-md font-bold border border-green-200">Completed</span>
                                                        )}
                                                        {order.status === 'pending' && (
                                                            <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] rounded-md font-bold border border-yellow-250">Pending</span>
                                                        )}
                                                        {order.status === 'cancelled' && (
                                                            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded-md font-bold border border-red-150">Cancelled</span>
                                                        )}
                                                        {order.status === 'refunded' && (
                                                            <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[10px] rounded-md font-bold border border-gray-200">Refunded</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center text-gray-500 font-semibold">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                        <span>{new Date(order.created_at).toLocaleDateString('bn-BD')}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <button
                                                        onClick={() => setOrderModal({ isOpen: true, order })}
                                                        className="px-3 py-1 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-600 border border-gray-200 hover:border-blue-200 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                                                    >
                                                        স্ট্যাটাস পরিবর্তন
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {ordersPagination.last_page > 1 && (
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-gray-500 bg-gray-50">
                                    <span>সর্বমোট {ordersPagination.total} টি অর্ডারের মধ্যে পৃষ্ঠা {ordersPagination.current_page}/{ordersPagination.last_page}</span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                            disabled={ordersPagination.current_page === 1}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                                        >
                                            পূর্ববর্তী
                                        </button>
                                        <button
                                            onClick={() => setOrdersPage(p => Math.min(ordersPagination.last_page, p + 1))}
                                            disabled={ordersPagination.current_page === ordersPagination.last_page}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                                        >
                                            পরবর্তী
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-20 text-center text-gray-400">
                            <ShoppingCart className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs font-medium">কোনো অর্ডারের রেকর্ড পাওয়া যায়নি।</p>
                        </div>
                    )}
                </div>
            )}

            {/* Product Modal */}
            {productModal.isOpen && (
                <ProductModal
                    mode={productModal.mode}
                    product={productModal.product}
                    onClose={() => setProductModal({ isOpen: false, mode: 'create', product: null })}
                    onSaved={handleProductSaved}
                />
            )}

            {/* Order Modal */}
            {orderModal.isOpen && (
                <OrderModal
                    order={orderModal.order}
                    onClose={() => setOrderModal({ isOpen: false, order: null })}
                    onSaved={handleOrderSaved}
                />
            )}
        </div>
    );
}
