// AIROV ADMIN DASHBOARD - Firebase Firestore & Auth Version
import { 
  db, 
  auth, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "../firebase-config.js";

// Global lists/caches
let productsList = [];
let ordersList = [];
let couponsList = [];
let editingProductId = null;

// UI Elements
const loginScreen = document.getElementById('login-screen');
const dashboardContainer = document.getElementById('dashboard-container');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

const navBtns = document.querySelectorAll('.nav-btn');
const viewSections = document.querySelectorAll('.view-section');

const productModal = document.getElementById('product-modal');
const showAddProductBtn = document.getElementById('show-add-product');
const closeModalBtns = document.querySelectorAll('.close-modal');
const productForm = document.getElementById('product-form');
const productsTbody = document.getElementById('products-tbody');

const couponModal = document.getElementById('coupon-modal');
const showAddCouponBtn = document.getElementById('show-add-coupon');
const couponForm = document.getElementById('coupon-form');
const couponsTbody = document.getElementById('coupons-tbody');

const ordersTbody = document.getElementById('orders-tbody');

let selectedImageBase64 = '../assets/black-jacket.png'; // Default/Fallback image

// ==========================================
// AUTHENTICATION GUARD
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user && user.email === 'admin@airov.com') {
        // Authenticated admin
        loginScreen.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        initializeDashboard();
    } else {
        // Unauthenticated
        dashboardContainer.classList.add('hidden');
        loginScreen.classList.remove('hidden');
    }
});

// Login Handlers
loginBtn.addEventListener('click', async () => {
    const email = document.getElementById('admin-email').value.trim();
    const pass = document.getElementById('admin-pass').value;
    const loginError = document.getElementById('login-error');
    
    loginError.style.display = 'none';
    loginBtn.innerText = "Logging in...";
    loginBtn.disabled = true;

    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        console.error("Login failed: ", error);
        loginError.innerText = error.message || "Invalid credentials";
        loginError.style.display = 'block';
    } finally {
        loginBtn.innerText = "Login";
        loginBtn.disabled = false;
    }
});

logoutBtn.addEventListener('click', async () => {
    if (confirm("Are you sure you want to logout?")) {
        await signOut(auth);
    }
});

// ==========================================
// DASHBOARD INITIALIZATION & REAL-TIME SYNC
// ==========================================
function initializeDashboard() {
    // 1. Sync Products (Real-time)
    const productsQuery = query(collection(db, "products"), orderBy("created_at", "desc"));
    onSnapshot(productsQuery, (snapshot) => {
        productsList = [];
        snapshot.forEach(docSnap => {
            productsList.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderProductsTable();
        // Check if database needs seeding
        if (productsList.length === 0) {
            autoSeedButtonReveal();
        }
    }, (error) => console.error("Error syncing products:", error));

    // 2. Sync Orders (Real-time)
    const ordersQuery = query(collection(db, "orders"), orderBy("created_at", "desc"));
    onSnapshot(ordersQuery, (snapshot) => {
        ordersList = [];
        snapshot.forEach(docSnap => {
            ordersList.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderOrdersTable();
    }, (error) => console.error("Error syncing orders:", error));

    // 3. Sync Coupons (Real-time)
    const couponsQuery = query(collection(db, "coupons"), orderBy("created_at", "desc"));
    onSnapshot(couponsQuery, (snapshot) => {
        couponsList = [];
        snapshot.forEach(docSnap => {
            couponsList.push({ id: docSnap.id, ...docSnap.data() });
        });
        renderCouponsTable();
    }, (error) => console.error("Error syncing coupons:", error));
}

// Auto Seeding Helper
function autoSeedButtonReveal() {
    if (document.getElementById('seed-btn-container')) return;
    const container = document.createElement('div');
    container.id = 'seed-btn-container';
    container.style.cssText = "background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; border: 1px dashed var(--accent);";
    container.innerHTML = `
        <h3 style="margin-bottom: 0.5rem; color: var(--accent);">Initialize Store Data</h3>
        <p style="font-size: 0.9rem; opacity: 0.7; margin-bottom: 1rem;">It looks like your Firebase database is empty. Would you like to seed the store with initial products from your site configuration?</p>
        <button id="seed-db-btn" class="btn-primary">Seed Store Products</button>
    `;
    document.querySelector('#products-view').prepend(container);
    
    document.getElementById('seed-db-btn').addEventListener('click', async () => {
        const seedBtn = document.getElementById('seed-db-btn');
        seedBtn.innerText = "Seeding...";
        seedBtn.disabled = true;
        
        try {
            // Import original data
            const siteProducts = [
                {
                    name: "Spectrum Hoodie",
                    category: "hoodies",
                    price: 1850,
                    original_price: null,
                    description: "The Spectrum Hoodie features an oversized fit built for urban utility and unmatched comfort. Heavyweight cotton blend with a dropped shoulder design.",
                    image: "../assets/pink-hoodie.png",
                    colors: ["Rose", "Onyx", "Ghost"],
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    stock: { S: 5, M: 12, L: 0, XL: 4, XXL: 0 },
                    badges: ["new", "bestseller"],
                    created_at: new Date()
                },
                {
                    name: "Breathe Windbreaker",
                    category: "jackets",
                    price: 1999,
                    original_price: 2400,
                    description: "Engineered for the elements. The Breathe Windbreaker offers lightweight protection with a sleek, minimalist silhouette.",
                    image: "../assets/black-jacket.png",
                    colors: ["Onyx"],
                    sizes: ["S", "M", "L", "XL"],
                    stock: { S: 2, M: 5, L: 8, XL: 1 },
                    badges: ["sale"],
                    created_at: new Date()
                },
                {
                    name: "Essential Tee",
                    category: "tees",
                    price: 850,
                    original_price: null,
                    description: "Your everyday foundation. Premium midweight cotton cut for a perfect relaxed fit.",
                    image: "../assets/pink-hoodie.png",
                    colors: ["Ghost", "Onyx"],
                    sizes: ["S", "M", "L", "XL", "XXL"],
                    stock: { S: 10, M: 20, L: 15, XL: 5, XXL: 2 },
                    badges: ["trending"],
                    created_at: new Date()
                },
                {
                    name: "C.1 Cargo Pants",
                    category: "bottoms",
                    price: 1600,
                    original_price: null,
                    description: "Tactical utility meets streetwear. Featuring 6 functional pockets and an adjustable ankle cinch.",
                    image: "../assets/hero.png",
                    colors: ["Onyx", "Olive"],
                    sizes: ["S", "M", "L", "XL"],
                    stock: { S: 0, M: 3, L: 4, XL: 0 },
                    badges: ["new", "trending"],
                    created_at: new Date()
                }
            ];

            for (const prod of siteProducts) {
                await addDoc(collection(db, "products"), prod);
            }
            container.remove();
        } catch (err) {
            console.error("Seeding failed:", err);
            alert("Error seeding products: " + err.message);
        }
    });
}

// ==========================================
// NAVIGATION SYSTEM
// ==========================================
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        viewSections.forEach(s => s.classList.add('hidden'));
        
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).classList.remove('hidden');
    });
});

// ==========================================
// PRODUCT MANAGEMENT (ADD / EDIT / DELETE)
// ==========================================

// Image Input Base64 handling
document.getElementById('prod-images').addEventListener('change', function(e) {
    const previewContainer = document.getElementById('image-preview');
    previewContainer.innerHTML = '';
    
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
            selectedImageBase64 = event.target.result;
            const img = document.createElement('img');
            img.src = selectedImageBase64;
            previewContainer.appendChild(img);
        };
        reader.readAsDataURL(this.files[0]);
    }
});

// Modal Toggles
showAddProductBtn.addEventListener('click', () => {
    productForm.reset();
    editingProductId = null;
    selectedImageBase64 = '../assets/black-jacket.png';
    document.getElementById('image-preview').innerHTML = `<img src="${selectedImageBase64}">`;
    document.getElementById('modal-title').innerText = 'Add New Product';
    productModal.classList.remove('hidden');
});

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        productModal.classList.add('hidden');
    });
});

// Form Submit (Save / Update)
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = productForm.querySelector('button[type="submit"]');
    submitBtn.innerText = "Saving...";
    submitBtn.disabled = true;

    const badgesVal = document.getElementById('prod-badges').value;
    const badgesArray = badgesVal ? badgesVal.split(',').map(b => b.trim()).filter(b => b) : [];

    const colorsVal = document.getElementById('prod-colors').value;
    const colorsArray = colorsVal ? colorsVal.split(',').map(c => c.trim()).filter(c => c) : [];

    const price = Number(document.getElementById('prod-price').value);
    const origPriceVal = document.getElementById('prod-original-price').value;
    const original_price = origPriceVal ? Number(origPriceVal) : null;

    const sizes = ["S", "M", "L", "XL"];
    const stock = {
        S: Number(document.getElementById('qty-S').value || 0),
        M: Number(document.getElementById('qty-M').value || 0),
        L: Number(document.getElementById('qty-L').value || 0),
        XL: Number(document.getElementById('qty-XL').value || 0)
    };

    const productData = {
        name: document.getElementById('prod-name').value.trim(),
        description: document.getElementById('prod-desc').value.trim(),
        price: price,
        original_price: original_price,
        category: document.getElementById('prod-category').value,
        colors: colorsArray,
        sizes: sizes,
        stock: stock,
        badges: badgesArray,
        image: selectedImageBase64,
        created_at: new Date()
    };

    try {
        if (editingProductId) {
            // Update
            const docRef = doc(db, "products", editingProductId);
            // Don't overwrite created_at
            delete productData.created_at;
            await updateDoc(docRef, productData);
        } else {
            // Create
            await addDoc(collection(db, "products"), productData);
        }
        productModal.classList.add('hidden');
        productForm.reset();
    } catch (err) {
        console.error("Failed to save product:", err);
        alert("Error saving product: " + err.message);
    } finally {
        submitBtn.innerText = "Save Product";
        submitBtn.disabled = false;
    }
});

// Render Products Table
function renderProductsTable() {
    productsTbody.innerHTML = '';
    
    if (productsList.length === 0) {
        productsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; opacity:0.5; padding: 2rem;">No products found. Click "+ Add Product" to create one.</td></tr>';
        return;
    }

    productsList.forEach(p => {
        let totalStock = 0;
        if (p.stock) {
            totalStock = (p.stock.S || 0) + (p.stock.M || 0) + (p.stock.L || 0) + (p.stock.XL || 0);
        }

        const priceDisplay = p.original_price 
            ? `<span style="text-decoration: line-through; opacity: 0.5; margin-right: 0.5rem;">EGP ${p.original_price}</span>EGP ${p.price}`
            : `EGP ${p.price}`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${p.image}" alt="${p.name}" style="width: 40px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
            <td><strong>${p.name}</strong></td>
            <td><span class="badge" style="background: rgba(255,255,255,0.08); padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.8rem;">${p.category || 'general'}</span></td>
            <td>${priceDisplay}</td>
            <td>${totalStock} Units</td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-secondary edit-btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Edit</button>
                    <button class="btn-secondary delete-btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; color: #ff4d4d; border-color: rgba(255,77,77,0.3);">Delete</button>
                </div>
            </td>
        `;

        // Attach event listeners
        tr.querySelector('.edit-btn').addEventListener('click', () => populateEditForm(p));
        tr.querySelector('.delete-btn').addEventListener('click', () => deleteProduct(p.id));

        productsTbody.appendChild(tr);
    });
}

function populateEditForm(p) {
    editingProductId = p.id;
    document.getElementById('prod-name').value = p.name || '';
    document.getElementById('prod-desc').value = p.description || '';
    document.getElementById('prod-price').value = p.price || 0;
    document.getElementById('prod-original-price').value = p.original_price || '';
    document.getElementById('prod-category').value = p.category || 'hoodies';
    document.getElementById('prod-badges').value = p.badges ? p.badges.join(', ') : '';
    document.getElementById('prod-colors').value = p.colors ? p.colors.join(', ') : '';

    if (p.stock) {
        document.getElementById('qty-S').value = p.stock.S || 0;
        document.getElementById('qty-M').value = p.stock.M || 0;
        document.getElementById('qty-L').value = p.stock.L || 0;
        document.getElementById('qty-XL').value = p.stock.XL || 0;
    }

    selectedImageBase64 = p.image || '../assets/black-jacket.png';
    document.getElementById('image-preview').innerHTML = `<img src="${selectedImageBase64}">`;

    document.getElementById('modal-title').innerText = 'Edit Product';
    productModal.classList.remove('hidden');
}

async function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
        try {
            await deleteDoc(doc(db, "products", id));
        } catch (err) {
            console.error("Failed to delete:", err);
            alert("Error deleting product: " + err.message);
        }
    }
}

// ==========================================
// ORDERS MANAGEMENT
// ==========================================
function renderOrdersTable() {
    ordersTbody.innerHTML = '';
    
    if (ordersList.length === 0) {
        ordersTbody.innerHTML = '<tr><td colspan="7" style="text-align:center; opacity:0.5; padding: 2rem;">No orders placed yet.</td></tr>';
        return;
    }

    ordersList.forEach(o => {
        const orderDate = o.created_at ? new Date(o.created_at.seconds * 1000).toLocaleDateString() : 'N/A';
        const totalDisplay = `EGP ${o.total}`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>#${o.order_number || 'N/A'}</strong></td>
            <td>
                <div><strong>${o.customer_name || 'N/A'}</strong></div>
                <div style="font-size:0.8rem; opacity:0.6;">${o.governorate || ''}, ${o.address || ''}</div>
            </td>
            <td>${o.customer_phone || 'N/A'}</td>
            <td>${totalDisplay}</td>
            <td>
                <select class="status-select" style="background: var(--bg-dark); color: white; border: 1px solid rgba(255,255,255,0.15); padding: 0.3rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">
                    <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>${orderDate}</td>
            <td>
                <button class="btn-secondary view-items-btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Details</button>
            </td>
        `;

        // Update status listener
        tr.querySelector('.status-select').addEventListener('change', async (e) => {
            const newStatus = e.target.value;
            try {
                await updateDoc(doc(db, "orders", o.id), { status: newStatus });
            } catch (err) {
                console.error("Failed to update status:", err);
                alert("Error: " + err.message);
            }
        });

        // Details listener
        tr.querySelector('.view-items-btn').addEventListener('click', () => {
            let itemsList = '';
            if (o.items && Array.isArray(o.items)) {
                itemsList = o.items.map(item => `• ${item.name} (${item.size} / ${item.color}) x${item.quantity}`).join('\n');
            } else {
                itemsList = 'No items found.';
            }
            alert(`Order #${o.order_number}\n\nCustomer: ${o.customer_name}\nAddress: ${o.address}, ${o.governorate}\nPhone: ${o.customer_phone}\n\nItems:\n${itemsList}\n\nNotes: ${o.notes || 'None'}`);
        });

        ordersTbody.appendChild(tr);
    });
}

// ==========================================
// COUPON MANAGEMENT
// ==========================================
showAddCouponBtn.addEventListener('click', () => {
    couponForm.reset();
    couponModal.classList.remove('hidden');
});

couponForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = couponForm.querySelector('button[type="submit"]');
    submitBtn.innerText = "Saving...";
    submitBtn.disabled = true;

    const expiryVal = document.getElementById('coupon-expiry').value;

    const couponData = {
        code: document.getElementById('coupon-code-input').value.toUpperCase().trim(),
        type: document.getElementById('coupon-type').value,
        value: Number(document.getElementById('coupon-value').value),
        expires_at: expiryVal ? new Date(expiryVal) : null,
        is_active: true,
        created_at: new Date()
    };

    try {
        await addDoc(collection(db, "coupons"), couponData);
        couponModal.classList.add('hidden');
        couponForm.reset();
    } catch (err) {
        console.error("Failed to create coupon:", err);
        alert("Error creating coupon: " + err.message);
    } finally {
        submitBtn.innerText = "Save Coupon";
        submitBtn.disabled = false;
    }
});

function renderCouponsTable() {
    couponsTbody.innerHTML = '';
    
    if (couponsList.length === 0) {
        couponsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; opacity:0.5; padding: 2rem;">No coupons created yet. Click "+ Add Coupon".</td></tr>';
        return;
    }

    couponsList.forEach(c => {
        const expiry = c.expires_at ? new Date(c.expires_at.seconds * 1000).toLocaleDateString() : 'Never';
        const valText = c.type === 'percentage' ? `${c.value}%` : `EGP ${c.value}`;
        const statusText = c.is_active ? 'Active' : 'Inactive';
        const statusColor = c.is_active ? '#2ecc71' : '#e74c3c';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${c.code}</strong></td>
            <td>${c.type}</td>
            <td>${valText}</td>
            <td><span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></td>
            <td>${expiry}</td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-secondary toggle-coupon" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Toggle Status</button>
                    <button class="btn-secondary delete-coupon" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; color: #ff4d4d; border-color: rgba(255,77,77,0.3);">Delete</button>
                </div>
            </td>
        `;

        tr.querySelector('.toggle-coupon').addEventListener('click', async () => {
            try {
                await updateDoc(doc(db, "coupons", c.id), { is_active: !c.is_active });
            } catch (err) {
                console.error("Failed to toggle coupon status:", err);
            }
        });

        tr.querySelector('.delete-coupon').addEventListener('click', async () => {
            if (confirm("Delete coupon code?")) {
                try {
                    await deleteDoc(doc(db, "coupons", c.id));
                } catch (err) {
                    console.error("Failed to delete coupon:", err);
                }
            }
        });

        couponsTbody.appendChild(tr);
    });
}
