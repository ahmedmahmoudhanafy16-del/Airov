import { db, storage } from '../firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

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

let selectedFiles = [];

// Login Logic (Mock for now, can use Firebase Auth later)
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
    selectedFiles = [];
    document.getElementById('image-preview').innerHTML = '';
    document.getElementById('modal-title').innerText = 'Add New Product';
    productModal.classList.remove('hidden');
});

closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        productModal.classList.add('hidden');
    });
});

// Image Preview Logic
document.getElementById('prod-images').addEventListener('change', function(e) {
    const previewContainer = document.getElementById('image-preview');
    previewContainer.innerHTML = '';
    selectedFiles = Array.from(this.files);
    
    selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            previewContainer.appendChild(img);
        }
        reader.readAsDataURL(file);
    });
});

// Save Product Logic (Uploads to Firebase)
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = productForm.querySelector('button[type="submit"]');
    submitBtn.innerText = "Uploading...";
    submitBtn.disabled = true;

    try {
        let imageUrl = '../assets/black-jacket.png'; // Fallback
        
        // Upload first image to Firebase Storage if selected
        if (selectedFiles.length > 0) {
            const file = selectedFiles[0];
            const storageRef = ref(storage, 'products/' + Date.now() + '_' + file.name);
            await uploadBytes(storageRef, file);
            imageUrl = await getDownloadURL(storageRef);
        }

        const newProduct = {
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
            image: imageUrl,
            in_stock: true,
            createdAt: new Date()
        };
        
        // Add to Firestore
        await addDoc(collection(db, "products"), newProduct);
        
        productModal.classList.add('hidden');
        renderProducts();
    } catch (error) {
        console.error("Error adding document: ", error);
        alert("Failed to upload product. Check Firebase keys and rules.");
    } finally {
        submitBtn.innerText = "Save Product";
        submitBtn.disabled = false;
    }
});

// Render Products from Firestore
async function renderProducts() {
    productsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading products from Database...</td></tr>';
    
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        productsTbody.innerHTML = '';
        
        if (querySnapshot.empty) {
            productsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; opacity:0.5;">No products yet. Add one!</td></tr>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const p = docSnap.data();
            const pid = docSnap.id;
            const totalStock = p.stock ? (p.stock.S + p.stock.M + p.stock.L + p.stock.XL) : 0;
            productsTbody.innerHTML += `
                <tr>
                    <td><img src="${p.image}" alt="${p.name}"></td>
                    <td>${p.name}</td>
                    <td><span style="background:rgba(255,255,255,0.1); padding:0.2rem 0.5rem; border-radius:4px; font-size:0.8rem;">${p.category}</span></td>
                    <td>EGP ${p.price}</td>
                    <td>${totalStock} Units</td>
                    <td>
                        <button class="btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="deleteProduct('${pid}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Error getting documents: ", error);
        productsTbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Database Connection Error. Did you add the API Keys?</td></tr>';
    }
}

// Delete Logic
window.deleteProduct = async function(pid) {
    if(confirm('Are you sure you want to delete this product from the database?')) {
        try {
            await deleteDoc(doc(db, "products", pid));
            renderProducts();
        } catch(error) {
            console.error("Error deleting document: ", error);
            alert("Error deleting product.");
        }
    }
}
