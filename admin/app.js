// ==========================================
// AIROV ADMIN DASHBOARD LOGIC
// ==========================================
/* 
    Firebase Integration placeholder:
    To make this truly real-time and store multiple images in the cloud,
    you must create a Firebase Project (firestore & storage) and paste the config here:
    
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
    import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
    
    const firebaseConfig = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "SENDER_ID",
        appId: "APP_ID"
    };
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
*/

// For now, we simulate the database connection using localStorage so you can see the UI working.
let productsDB = JSON.parse(localStorage.getItem('airov_db_products')) || [];

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

// Login Logic (Mock)
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('admin-email').value;
    const pass = document.getElementById('admin-pass').value;
    // Simple mock auth
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
    document.getElementById('image-preview').innerHTML = '';
    document.getElementById('modal-title').innerText = 'Add New Product';
    productModal.classList.remove('hidden');
});

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        productModal.classList.add('hidden');
    });
});

// Image Preview Logic (Simulating multiple uploads)
document.getElementById('prod-images').addEventListener('change', function(e) {
    const previewContainer = document.getElementById('image-preview');
    previewContainer.innerHTML = '';
    
    Array.from(this.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            previewContainer.appendChild(img);
        }
        reader.readAsDataURL(file);
    });
});

// Save Product Logic
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // In a real app, images would be uploaded to Firebase Storage here, returning URLs.
    // We will just use a placeholder image for the local simulation.
    
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
        image: '../assets/black-jacket.png' // Simulated Cloud Storage URL
    };
    
    productsDB.push(newProduct);
    localStorage.setItem('airov_db_products', JSON.stringify(productsDB));
    
    productModal.classList.add('hidden');
    renderProducts();
});

// Render Products Table
function renderProducts() {
    productsTbody.innerHTML = '';
    
    if (productsDB.length === 0) {
        productsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; opacity:0.5;">No products yet. Add one!</td></tr>';
        return;
    }
    
    productsDB.forEach((p, index) => {
        const totalStock = p.stock.S + p.stock.M + p.stock.L + p.stock.XL;
        productsTbody.innerHTML += `
            <tr>
                <td><img src="${p.image}" alt="${p.name}"></td>
                <td>${p.name}</td>
                <td><span style="background:rgba(255,255,255,0.1); padding:0.2rem 0.5rem; border-radius:4px; font-size:0.8rem;">${p.category}</span></td>
                <td>EGP ${p.price}</td>
                <td>${totalStock} Units</td>
                <td>
                    <button class="btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="deleteProduct(${index})">Delete</button>
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
