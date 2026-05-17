// ==========================================
// AIROV ADMIN DASHBOARD LOGIC (Local Storage Version)
// ==========================================

// In-memory Database mock
let productsDB = JSON.parse(localStorage.getItem('airov_db_products')) || [];
if (productsDB.length === 0 && typeof siteData !== 'undefined') {
    // Seed from data.js if empty
    productsDB = [...siteData.products];
    localStorage.setItem('airov_db_products', JSON.stringify(productsDB));
}

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

let selectedImageBase64 = '../assets/black-jacket.png'; // Fallback

// Login Logic
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    if (email === 'admin@airov.com' && pass === 'admin123') {
        loginScreen.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        renderProducts();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
});

logoutBtn.addEventListener('click', () => {
    dashboardContainer.classList.add('hidden');
    loginScreen.classList.remove('hidden');
});

// Assuming user is already logged in for development convenience
loginScreen.classList.add('hidden');
dashboardContainer.classList.remove('hidden');
renderProducts();

// Navigation Logic
navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        viewSections.forEach(s => s.classList.add('hidden'));
        
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).classList.remove('hidden');
    });
});

// Modal Logic
showAddProductBtn.addEventListener('click', () => {
    productForm.reset();
    selectedImageBase64 = '../assets/black-jacket.png';
    document.getElementById('image-preview').innerHTML = '';
    document.getElementById('modal-title').innerText = 'Add New Product';
    productModal.classList.remove('hidden');
});

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        productModal.classList.add('hidden');
    });
});

// Image Preview Logic (Convert to Base64 for LocalStorage)
document.getElementById('prod-images').addEventListener('change', function(e) {
    const previewContainer = document.getElementById('image-preview');
    previewContainer.innerHTML = '';
    
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            selectedImageBase64 = e.target.result;
            const img = document.createElement('img');
            img.src = selectedImageBase64;
            previewContainer.appendChild(img);
        }
        reader.readAsDataURL(this.files[0]);
    }
});

// Save Product Logic
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = productForm.querySelector('button[type="submit"]');
    submitBtn.innerText = "Saving...";
    
    setTimeout(() => {
        const newProduct = {
            id: 'prod_' + Date.now(),
            name: document.getElementById('prod-name').value,
            description: document.getElementById('prod-desc').value,
            price: Number(document.getElementById('prod-price').value),
            category: document.getElementById('prod-category').value,
            colors: document.getElementById('prod-colors').value.split(',').map(c => c.trim()),
            stock: {
                S: Number(document.getElementById('qty-S').value),
                M: Number(document.getElementById('qty-M').value),
                L: Number(document.getElementById('qty-L').value),
                XL: Number(document.getElementById('qty-XL').value)
            },
            image: selectedImageBase64,
            in_stock: true
        };
        
        productsDB.push(newProduct);
        localStorage.setItem('airov_db_products', JSON.stringify(productsDB));
        
        productModal.classList.add('hidden');
        renderProducts();
        submitBtn.innerText = "Save Product";
        
        // Dispatch event so index.html knows to update if open in another tab
        window.dispatchEvent(new Event('storage'));
    }, 500); // Simulate network delay
});

// Render Products 
function renderProducts() {
    productsTbody.innerHTML = '';
    
    if (productsDB.length === 0) {
        productsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; opacity:0.5;">No products yet. Add one!</td></tr>';
        return;
    }

    productsDB.forEach((p, index) => {
        let totalStock = 0;
        if (p.stock) {
             totalStock = p.stock.S + p.stock.M + p.stock.L + p.stock.XL;
        } else {
             totalStock = p.in_stock ? 'In Stock' : 'Out of Stock';
        }
        
        productsTbody.innerHTML += `
            <tr>
                <td><img src="${p.image}" alt="${p.name}"></td>
                <td>${p.name}</td>
                <td><span style="background:rgba(255,255,255,0.1); padding:0.2rem 0.5rem; border-radius:4px; font-size:0.8rem;">${p.category || 'misc'}</span></td>
                <td>EGP ${p.price}</td>
                <td>${totalStock} Units</td>
                <td>
                    <button class="btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem; border-color: var(--accent); color: var(--accent);" onclick="deleteProduct(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

// Delete Logic
window.deleteProduct = function(index) {
    if(confirm('Are you sure you want to delete this product?')) {
        productsDB.splice(index, 1);
        localStorage.setItem('airov_db_products', JSON.stringify(productsDB));
        renderProducts();
    }
}
