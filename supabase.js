/* ============================================
   Supabase API - مجوهرات أبو علي (v2)
   ============================================ */

const SUPABASE_URL = "https://fznqaowmsuzleyqdjlej.supabase.co";
const SUPABASE_KEY = "sb_publishable_REUQsvL8ihc1b-kPLQQV5Q_i1PLNyCx";

async function sb(path, options = {}) {
    const url = SUPABASE_URL + "/rest/v1" + path;
    const headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": "Bearer " + SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
        ...(options.headers || {})
    };
    try {
        const res = await fetch(url, { ...options, headers });
        const text = await res.text();
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.substring(0, 150)}`);
        return text ? JSON.parse(text) : null;
    } catch (err) {
        console.error("❌ Supabase:", err);
        throw err;
    }
}

/* ========== الأقسام ========== */
const Categories = {
    async list() { return await sb("/categories?select=*&order=created_at.asc"); },
    async create(d) {
        return await sb("/categories", { method: "POST", body: JSON.stringify({
            name: d.name, description: d.description || null, icon: d.icon || "📂"
        })});
    },
    async update(id, d) {
        return await sb(`/categories?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({
            name: d.name, description: d.description || null, icon: d.icon || "📂"
        })});
    },
    async remove(id) { return await sb(`/categories?id=eq.${id}`, { method: "DELETE" }); }
};

/* ========== المنتجات ========== */
const Products = {
    async list() { return await sb("/products?select=*&order=created_at.desc"); },
    async create(d) {
        return await sb("/products", { method: "POST", body: JSON.stringify({
            name: d.name,
            description: d.description || null,
            price: parseFloat(d.price) || 0,
            old_price: parseFloat(d.old_price) || 0,
            category_id: d.category_id || null,
            icon: d.icon || "💎",
            image_url: d.image_url || null,
            images: d.images || [],
            featured: !!d.featured,
            types: d.types || [],
            colors: d.colors || [],
            code: d.code || null
        })});
    },
    async update(id, d) {
        return await sb(`/products?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({
            name: d.name,
            description: d.description || null,
            price: parseFloat(d.price) || 0,
            old_price: parseFloat(d.old_price) || 0,
            category_id: d.category_id || null,
            icon: d.icon || "💎",
            image_url: d.image_url || null,
            images: d.images || [],
            featured: !!d.featured,
            types: d.types || [],
            colors: d.colors || [],
            code: d.code || null
        })});
    },
    async remove(id) { return await sb(`/products?id=eq.${id}`, { method: "DELETE" }); }
};

/* ========== العملاء ========== */
const Customers = {
    async list() { return await sb("/customers?select=*&order=created_at.desc"); },
    async findByPhone(phone) {
        const clean = (phone||"").replace(/\D/g,"");
        const rows = await sb(`/customers?phone=eq.${clean}&select=*`);
        return rows?.[0] || null;
    },
    async signup(data) {
        return await sb("/customers", { method: "POST", body: JSON.stringify({
            name: data.name,
            phone: (data.phone||"").replace(/\D/g,""),
            password: data.password,
            city: data.city || null,
            address: data.address || null
        })});
    },
    async update(id, data) {
        return await sb(`/customers?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({
            name: data.name,
            city: data.city || null,
            address: data.address || null
        })});
    },
    async changePassword(id, newPassword) {
        return await sb(`/customers?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({
            password: newPassword
        })});
    }
};

/* ========== الطلبات ========== */
const Orders = {
    async list() { return await sb("/orders?select=*&order=created_at.desc"); },
    async create(d) {
        return await sb("/orders", { method: "POST", body: JSON.stringify({
            order_number: d.order_number,
            customer_id: d.customer_id || null,
            customer_name: d.customer_name,
            customer_phone: d.customer_phone,
            customer_city: d.customer_city,
            customer_address: d.customer_address || null,
            notes: d.notes || null,
            items: d.items,
            total: d.total || 0,
            status: "new"
        })});
    },
    async updateStatus(id, status) {
        return await sb(`/orders?id=eq.${id}`, { method: "PATCH", body: JSON.stringify({ status })});
    },
    async remove(id) { return await sb(`/orders?id=eq.${id}`, { method: "DELETE" }); }
};

/* ========== المشرفين ========== */
const Admins = {
    async list() { return await sb("/admins?select=*&order=created_at.asc"); },
    async findByUsername(username) {
        const rows = await sb(`/admins?username=eq.${encodeURIComponent(username)}&select=*`);
        return rows?.[0] || null;
    },
    async create(d) {
        return await sb("/admins", { method: "POST", body: JSON.stringify({
            name: d.name,
            username: d.username,
            password: d.password,
            permissions: d.permissions || [],
            is_master: !!d.is_master
        })});
    },
    async update(id, d) {
        const payload = {
            name: d.name,
            username: d.username,
            permissions: d.permissions || []
        };
        if (d.password) payload.password = d.password;
        return await sb(`/admins?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(payload)});
    },
    async remove(id) { return await sb(`/admins?id=eq.${id}`, { method: "DELETE" }); }
};

/* ========== الإعدادات ========== */
const Settings = {
    async get() {
        const rows = await sb("/settings?id=eq.1&select=*");
        return rows?.[0] || {};
    },
    async update(d) {
        const payload = {
            store_name: d.store_name,
            whatsapp: d.whatsapp,
            currency: d.currency,
            description: d.description
        };
        if (d.logo_url !== undefined) payload.logo_url = d.logo_url || null;
        return await sb("/settings?id=eq.1", { method: "PATCH", body: JSON.stringify(payload)});
    }
};

/* ========== ضغط الصور ========== */
function compressImage(file, maxWidth = 800, quality = 0.75) {
    return new Promise((resolve) => {
        if (file.size <= 200 * 1024) { resolve(file); return; }
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        const canvas = document.createElement("canvas");
                        let w = img.width, h = img.height;
                        if (w > maxWidth) {
                            h = Math.round(h * maxWidth / w);
                            w = maxWidth;
                        }
                        canvas.width = w; canvas.height = h;
                        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
                        if (typeof canvas.toBlob === "function") {
                            canvas.toBlob((blob) => resolve(blob || file), "image/jpeg", quality);
                        } else {
                            resolve(file);
                        }
                    } catch(err) { resolve(file); }
                };
                img.onerror = () => resolve(file);
                img.src = e.target.result;
            };
            reader.onerror = () => resolve(file);
            reader.readAsDataURL(file);
        } catch(err) { resolve(file); }
    });
}

/* ========== رفع الصور ========== */
async function uploadImage(fileOrBlob, originalName = "image.jpg") {
    let blob = fileOrBlob;
    if (fileOrBlob instanceof File) {
        originalName = fileOrBlob.name || "image.jpg";
        try { blob = await compressImage(fileOrBlob, 800, 0.75); }
        catch(err) { blob = fileOrBlob; }
    }
    const nameParts = originalName.split(".");
    let ext = nameParts.length > 1 ? nameParts.pop().toLowerCase() : "jpg";
    const allowedExts = ["jpg","jpeg","png","webp","gif"];
    if (!allowedExts.includes(ext)) ext = "jpg";
    
    const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/product-images/${filename}`;
    
    const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY,
            "Content-Type": blob.type || "image/jpeg",
            "x-upsert": "false"
        },
        body: blob
    });
    
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`فشل الرفع (${res.status}): ${errText.slice(0, 100)}`);
    }
    
    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${filename}`;
}

/* ========== رفع شعار المتجر ========== */
async function uploadLogo(file) {
    const blob = await compressImage(file, 400, 0.85);
    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const filename = `logo-${Date.now()}.${ext}`;
    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/product-images/${filename}`;
    
    const res = await fetch(uploadUrl, {
        method: "POST",
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY,
            "Content-Type": blob.type || "image/png",
            "x-upsert": "false"
        },
        body: blob
    });
    
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`فشل رفع الشعار: ${errText.slice(0, 100)}`);
    }
    
    return `${SUPABASE_URL}/storage/v1/object/public/product-images/${filename}`;
}

/* ========== استخراج اللون السائد من صورة (للبحث بالصورة) ========== */
function getDominantColor(imgEl) {
    const canvas = document.createElement("canvas");
    const size = 50;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgEl, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
        // تجاهل البكسلات الشفافة
        if (data[i+3] < 128) continue;
        r += data[i];
        g += data[i+1];
        b += data[i+2];
        count++;
    }
    if (count === 0) return { r: 128, g: 128, b: 128 };
    return { r: Math.round(r/count), g: Math.round(g/count), b: Math.round(b/count) };
}

/* ========== حساب المسافة بين لونين ========== */
function colorDistance(c1, c2) {
    return Math.sqrt(
        Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2)
    );
}

/* ========== تصدير ========== */
window.SB = {
    Categories,
    Products,
    Customers,
    Orders,
    Admins,
    Settings,
    uploadImage,
    uploadLogo,
    compressImage,
    getDominantColor,
    colorDistance,
    sb
};

console.log("✅ supabase.js v2 محمّل");
