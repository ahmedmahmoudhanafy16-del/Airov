import { db, collection, onSnapshot, query, orderBy } from "./firebase-config.js";

// Detect mobile
const isMobile = window.matchMedia('(max-width: 768px)').matches;

// Global products cache for search/filter without re-fetching
let productsCache = [];

// Render CMS Data
function renderSiteData() {
    // Note: productsCache is now populated dynamically via Firestore real-time listener!

    // Render Hero (from siteData fallback or hardcoded for now)
    if (document.getElementById('dynamic-slogan') && typeof siteData !== 'undefined') {
        document.getElementById('dynamic-slogan').innerText = siteData.hero.slogan;
        document.getElementById('dynamic-hero-btn').innerText = siteData.hero.button_text;
        document.getElementById('dynamic-hero-btn').href = siteData.hero.button_link;
        document.getElementById('dynamic-hero-img').src = siteData.hero.image_path;
    }

    // Render Philosophy
    if (document.getElementById('dynamic-phil-img') && typeof siteData !== 'undefined') {
        document.getElementById('dynamic-phil-est').innerText = siteData.philosophy.established;
        document.getElementById('dynamic-phil-title').innerText = siteData.philosophy.title;
        document.getElementById('dynamic-phil-desc').innerText = siteData.philosophy.description;
        document.getElementById('dynamic-phil-img').src = siteData.philosophy.image_path;
    }

    // Render Lookbook
    const lookbookContainer = document.getElementById('lookbook-container');
    if (lookbookContainer && typeof siteData !== 'undefined') {
        lookbookContainer.innerHTML = '';
        siteData.lookbook.forEach(imgPath => {
            lookbookContainer.innerHTML += `
                <div class="ed-item">
                    <img src="${imgPath}" alt="Lookbook Image" loading="lazy">
                </div>
            `;
        });
    }

    function getProductCardHTML(product, customBadge = '') {
        const statusLabel = product.in_stock ? 'View Product' : 'Out of Stock';
        let colorName = product.colors && product.colors.length > 0 ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name) : '';
        
        let badgeHTML = '';
        if (customBadge === 'new') badgeHTML = `<div style="position: absolute; top: 10px; left: 10px; background: var(--primary); color: var(--bg-dark); padding: 2px 8px; font-size: 0.6rem; font-weight: bold; text-transform: uppercase; z-index: 2;">NEW</div>`;
        else if (customBadge === 'bestseller') badgeHTML = `<div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.2); color: var(--primary); padding: 4px 10px; font-size: 0.6rem; font-weight: bold; text-transform: uppercase; z-index: 2;">#1 Bestseller</div>`;
        else if (customBadge === 'trending') badgeHTML = `<div style="position: absolute; top: 10px; left: 10px; background: var(--accent-pink); color: var(--bg-dark); padding: 4px 10px; font-size: 0.6rem; font-weight: bold; text-transform: uppercase; z-index: 2;">Trending</div>`;

        let ratingHTML = '';
        if (product.reviews && product.reviews.length > 0) {
            const avgRating = (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1);
            ratingHTML = `<div style="font-size: 0.7rem; color: #f39c12; margin-top: 5px;"><i class="fas fa-star"></i> ${avgRating} (${product.reviews.length})</div>`;
        }

        return `
            <div class="collection-item" style="position: relative;">
                ${badgeHTML}
                <button class="wishlist-btn" onclick="toggleWishlist('${product.id}')" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; z-index: 2; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                    <i class="far fa-heart"></i>
                </button>
                <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit; display: block;">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" style="width: 100%; aspect-ratio: 3/4; object-fit: cover;">
                </a>
                <div class="quick-add-overlay" style="position: absolute; bottom: 80px; left: 0; width: 100%; padding: 0 10px; opacity: 0; transition: opacity 0.3s; pointer-events: none;">
                    <button onclick="openQuickAdd('${product.id}')" class="btn-large" style="width: 100%; padding: 0.5rem; font-size: 0.8rem; pointer-events: auto;">Quick Add</button>
                </div>
                <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit; display: block;">
                    <div class="collection-info" style="padding-top: 1rem;">
                        <h3 class="collection-name">${product.name}</h3>
                        <p class="collection-price">${colorName} / EGP ${product.price}</p>
                        ${ratingHTML}
                    </div>
                </a>
            </div>
        `;
    }

    // Render Products (Index page)
    const productsContainer = document.getElementById('products-container');
    if (productsContainer) {
        window.renderProducts = function(filterCategory = 'all') {
            productsContainer.innerHTML = '';
            
            const filteredProducts = filterCategory === 'all' 
                ? productsCache 
                : productsCache.filter(p => p.category === filterCategory);

            if (filteredProducts.length === 0) {
                productsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; opacity:0.5; padding: 2rem;">No products found in this category.</p>';
            }

            filteredProducts.forEach(product => {
                productsContainer.innerHTML += getProductCardHTML(product);
            });
            
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        };

        // Initial render
        renderProducts('all');

        // Filter button listeners
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                renderProducts(e.target.getAttribute('data-filter'));
            });
        });
    }

    // Render Single Product Page (product.html)
    const productContainer = document.getElementById('product-container');
    if (productContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        let product = productsCache.find(p => p.id === productId);

        if (product) {
            document.getElementById('product-title').innerText = product.name;
            document.getElementById('product-breadcrumb-name').innerText = product.name;
            document.getElementById('product-price').innerText = `EGP ${product.price}`;
            document.getElementById('product-desc').innerText = product.description;

            const gallery = document.getElementById('product-gallery');
            gallery.innerHTML = `
                <img src="${product.image}" alt="${product.name} Front" loading="lazy">
                <img src="${product.image}" alt="${product.name} Detail 1" loading="lazy" style="filter: grayscale(1) brightness(0.6);">
                <img src="${product.image}" alt="${product.name} Detail 2" loading="lazy" style="transform: scaleX(-1);">
            `;

            const colorSelector = document.getElementById('color-selector');
            const colorTitle = document.getElementById('color-title');
            colorSelector.innerHTML = '';
            if (product.colors && product.colors.length > 0) {
                const firstColor = typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name;
                colorTitle.innerText = `Color: ${firstColor}`;
                product.colors.forEach((c, index) => {
                    const cName = typeof c === 'string' ? c : c.name;
                    const cHex = typeof c === 'string' ? '#333' : c.hex;
                    colorSelector.innerHTML += `<button class="color-btn ${index === 0 ? 'active' : ''}" style="background-color: ${cHex};" onclick="document.getElementById('color-title').innerText='Color: ${cName}'"></button>`;
                });
            }

            // Sizes
            const sizeSelector = document.querySelector('.size-selector');
            if (sizeSelector) {
                sizeSelector.innerHTML = '';
                if (product.sizes) {
                    product.sizes.forEach(size => {
                        const isOutOfStock = product.stock && product.stock[size] === 0;
                        const btn = document.createElement('button');
                        btn.className = `size-btn ${isOutOfStock ? 'disabled' : ''}`;
                        if (isOutOfStock) {
                            btn.style.opacity = '0.3';
                            btn.style.textDecoration = 'line-through';
                            btn.disabled = true;
                        } else {
                            btn.onclick = (e) => {
                                document.querySelectorAll('.size-selector .size-btn').forEach(b => b.classList.remove('active'));
                                e.target.classList.add('active');
                            };
                        }
                        btn.innerText = size;
                        sizeSelector.appendChild(btn);
                    });
                    // Auto select first available size
                    const firstAvailable = sizeSelector.querySelector('.size-btn:not(.disabled)');
                    if (firstAvailable) firstAvailable.classList.add('active');
                }
            }

            // Wishlist Button on Product Page
            const btnWishlist = document.querySelector('.btn-wishlist');
            if (btnWishlist) {
                btnWishlist.setAttribute('onclick', `toggleWishlist('${product.id}')`);
                btnWishlist.classList.add('wishlist-btn');
                btnWishlist.innerHTML = `<i class="far fa-heart" style="font-size: 1.2rem;"></i>`;
            }

            // Reviews
            if (product.reviews && product.reviews.length > 0) {
                const avgRating = (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1);
                document.getElementById('product-rating-summary').innerHTML = `
                    <i class="fas fa-star"></i> ${avgRating} out of 5 (${product.reviews.length} reviews)
                `;
                const reviewsList = document.getElementById('product-reviews-list');
                reviewsList.innerHTML = '';
                product.reviews.forEach(review => {
                    let starsHTML = '';
                    for(let i=0; i<5; i++) {
                        if(i < review.rating) starsHTML += '<i class="fas fa-star" style="color: #f39c12;"></i>';
                        else starsHTML += '<i class="far fa-star" style="color: rgba(255,255,255,0.2);"></i>';
                    }
                    reviewsList.innerHTML += `
                        <div style="background: var(--bg-dark); padding: 1.5rem; border: 1px solid rgba(255,255,255,0.1);">
                            <div style="margin-bottom: 0.5rem;">${starsHTML}</div>
                            <h4 style="margin-bottom: 0.5rem; font-family: var(--font-sans);">${review.name} <span style="font-size: 0.7rem; opacity: 0.5;">- ${review.date}</span></h4>
                            <p style="font-size: 0.9rem; opacity: 0.8; line-height: 1.5;">${review.text}</p>
                        </div>
                    `;
                });
            } else {
                document.getElementById('product-rating-summary').innerHTML = 'No reviews yet.';
            }

            // Related Products
            const relatedContainer = document.getElementById('related-products-container');
            if (relatedContainer) {
                relatedContainer.innerHTML = '';
                const related = productsCache.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
                related.forEach(relProd => {
                    relatedContainer.innerHTML += getProductCardHTML(relProd);
                });
            }

            productContainer.style.display = 'grid';
        }
    }

    // Update Social Links
    if (typeof siteData !== 'undefined') {
        document.querySelectorAll('.dm-link').forEach(el => el.href = siteData.brand.social.order_dm);
    }

    // Render New Arrivals
    const newArrivalsContainer = document.getElementById('new-arrivals-container');
    if (newArrivalsContainer) {
        newArrivalsContainer.innerHTML = '';
        const newProducts = productsCache.filter(p => p.badges && p.badges.includes('new'));
        newProducts.forEach(product => {
            let cardHTML = getProductCardHTML(product, 'new');
            // override flex class for strip
            cardHTML = cardHTML.replace('class="collection-item"', 'class="collection-item" style="flex: 0 0 280px; scroll-snap-align: start;"');
            newArrivalsContainer.innerHTML += cardHTML;
        });
    }

    // Render Bestsellers
    const bestsellersContainer = document.getElementById('bestsellers-container');
    if (bestsellersContainer) {
        bestsellersContainer.innerHTML = '';
        const bestProducts = productsCache.filter(p => p.badges && p.badges.includes('bestseller'));
        bestProducts.forEach(product => {
            bestsellersContainer.innerHTML += getProductCardHTML(product, 'bestseller');
        });
    }

    // Render Trending Now
    const trendingContainer = document.getElementById('trending-container');
    if (trendingContainer) {
        trendingContainer.innerHTML = '';
        const trendingProducts = productsCache.filter(p => p.badges && p.badges.includes('trending'));
        trendingProducts.forEach(product => {
            trendingContainer.innerHTML += getProductCardHTML(product, 'trending');
        });
    }
}

// Start Real-time Firestore sync
function startRealtimeSync() {
    const productsQuery = query(collection(db, "products"), orderBy("created_at", "desc"));
    onSnapshot(productsQuery, (snapshot) => {
        productsCache = [];
        snapshot.forEach(docSnap => {
            productsCache.push({ id: docSnap.id, ...docSnap.data() });
        });
        
        // Fallback to local siteData for preview/robustness if database is empty
        if (productsCache.length === 0 && typeof siteData !== 'undefined') {
            productsCache = [...siteData.products];
        }
        
        // Re-render site UI with fresh data
        renderSiteData();
    }, (error) => {
        console.error("Firestore sync failed, falling back to local siteData: ", error);
        if (typeof siteData !== 'undefined') {
            productsCache = [...siteData.products];
            renderSiteData();
        }
    });
}

startRealtimeSync();

// ==========================================
// CART SYSTEM
// ==========================================
let cart = JSON.parse(localStorage.getItem('airov_cart')) || [];

function saveCart() {
    localStorage.setItem('airov_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    // Update Badge
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('#cart-count, #cart-count-prod').forEach(el => el.innerText = count);

    // Render Items
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="opacity:0.5; text-align:center;">Your cart is empty.</p>';
    } else {
        cart.forEach((item, index) => {
            total += item.price * item.quantity;
            cartItemsContainer.innerHTML += `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>${item.color} | Size: ${item.size}</p>
                        <p>${item.quantity} x EGP ${item.price}</p>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
                </div>
            `;
        });
    }

    document.getElementById('cart-total-price').innerText = `EGP ${total}`;
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    saveCart();
};

// Cart Toggle Logic
const cartOverlay = document.getElementById('cart-overlay');
const cartPanel = document.getElementById('cart-panel');
const closeCartBtn = document.getElementById('close-cart');
const cartToggleBtns = document.querySelectorAll('.cart-toggle-btn');

function toggleCart() {
    if(!cartOverlay) return;
    cartOverlay.classList.toggle('active');
    cartPanel.classList.toggle('active');
    document.body.style.overflow = cartPanel.classList.contains('active') ? 'hidden' : '';
}

cartToggleBtns.forEach(btn => btn.addEventListener('click', toggleCart));
if(closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
if(cartOverlay) cartOverlay.addEventListener('click', toggleCart);

// Remove WhatsApp checkout listener completely as it is handled by HTML onclick

window.addToCart = function(productId, size, color) {
    const product = productsCache.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId && item.size === size && item.color === color);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: size,
            color: color,
            quantity: 1
        });
    }
    
    saveCart();
    
    // Optional: Auto open cart
    if (cartOverlay && !cartOverlay.classList.contains('active')) {
        toggleCart();
    }
};

// Add to Cart from Product Page
const addToCartBtn = document.getElementById('add-to-cart-btn');
if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const product = productsCache.find(p => p.id === productId);
        
        if (product) {
            // Get selected size
            let selectedSize = null;
            const activeSizeBtn = document.querySelector('.size-btn.active');
            if (activeSizeBtn) selectedSize = activeSizeBtn.innerText;

            if (!selectedSize && product.sizes && product.sizes.length > 0) {
                alert('Please select a size before adding to cart.');
                return;
            }

            // Get selected color
            let selectedColor = product.colors && product.colors.length > 0 ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name) : '';
            const colorTitle = document.getElementById('color-title');
            if (colorTitle && colorTitle.innerText.includes('Color: ')) {
                selectedColor = colorTitle.innerText.split('Color: ')[1];
            }

            addToCart(productId, selectedSize || 'One Size', selectedColor);

            // Show cart and play a small GSAP bounce if available
            if (typeof gsap !== 'undefined') {
                gsap.fromTo('.cart-panel', { x: 50 }, { x: 0, duration: 0.4, ease: "back.out(1.5)" });
            }
        }
    });
}

// Handle Size Selection Highlighting
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
    });
});

// Handle Color Selection Highlighting
document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
    });
});

// Initialize Cart UI on load
updateCartUI();

// ==========================================
// ANIMATIONS & MENUS
// ==========================================
// Loading Screen & Initial Animations
window.addEventListener('load', () => {
    if (typeof gsap !== 'undefined') {
        const tl = gsap.timeline();
        
        // Hide loader
        tl.to('.loader-wrapper', {
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
            onComplete: () => {
                const loader = document.querySelector('.loader-wrapper');
                if(loader) loader.style.display = 'none';
            }
        });
        
        // Animate Hero Elements
        if (document.querySelector('.hero-logo-large')) {
            tl.fromTo('.hero-logo-large', 
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
                "-=0.5"
            )
            .fromTo('.hero-slogan',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
                "-=0.7"
            )
            .fromTo('.hero .btn-large',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
                "-=0.8"
            );
        }
    } else {
        setTimeout(() => {
            const loader = document.querySelector('.loader-wrapper');
            if(loader) loader.classList.add('hidden');
        }, 1000);
    }
});

// Custom Cursor (Desktop Only)
if (!isMobile) {
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    let posX = 0, posY = 0;
    let mouseX = 0, mouseY = 0;
    
    // Track mouse
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.left = mouseX + 'px';
        cursor.style.top = mouseY + 'px';
    });
    
    // Smooth follower
    setInterval(() => {
        posX += (mouseX - posX) / 6;
        posY += (mouseY - posY) / 6;
        follower.style.left = posX + 'px';
        follower.style.top = posY + 'px';
    }, 16);
    
    // Hover effects
    document.querySelectorAll('a, button, .collection-item, .ed-item').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
}

// Hamburger Menu Logic
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-links a, .dm-link');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('open');
        document.body.classList.toggle('menu-open');
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('open');
            document.body.classList.remove('menu-open');
        });
    });
}

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Parallax Effect - DESKTOP ONLY (smoother mobile experience)
if (!isMobile) {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // Parallax for hero image
        const heroImg = document.querySelector('.hero-img');
        if (heroImg) {
            heroImg.style.transform = `translateY(${scrollY * 0.3}px) scale(${1 + scrollY * 0.0003})`;
        }

        // Parallax for floating titles
        document.querySelectorAll('.floating-title').forEach(title => {
            title.style.transform = `translateX(${-scrollY * 0.15}px)`;
        });

        // Parallax for elements with data-scroll-speed
        document.querySelectorAll('[data-scroll-speed]').forEach(el => {
            const speed = el.getAttribute('data-scroll-speed');
            el.style.transform = `translateY(${scrollY * speed * 0.08}px)`;
        });
    });
}

// Scroll Reveal Animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -30px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Stagger animation for collection items
            const delay = entry.target.classList.contains('collection-item')
                ? index * 100
                : 0;

            setTimeout(() => {
                entry.target.classList.add('revealed');
            }, delay);
        }
    });
}, observerOptions);

// Set initial hidden state
document.querySelectorAll('.asymmetric-grid, .collection-item, .grid-text, .cta-section').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = isMobile ? 'translateY(30px)' : 'translateY(50px)';
    el.style.transition = isMobile
        ? 'opacity 0.6s ease, transform 0.6s ease'
        : 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
});

// Reveal class
const style = document.createElement('style');
style.innerHTML = `
    .revealed {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// Smooth scroll for anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        e.preventDefault();
        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ==========================================
// WISHLIST SYSTEM
// ==========================================
let wishlist = JSON.parse(localStorage.getItem('airov_wishlist')) || [];

function saveWishlist() {
    localStorage.setItem('airov_wishlist', JSON.stringify(wishlist));
}

function updateWishlistUI() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const productId = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (wishlist.includes(productId)) {
            btn.classList.add('active');
            btn.querySelector('i').classList.remove('far');
            btn.querySelector('i').classList.add('fas');
        } else {
            btn.classList.remove('active');
            btn.querySelector('i').classList.remove('fas');
            btn.querySelector('i').classList.add('far');
        }
    });
}

window.toggleWishlist = function(productId) {
    // Prevent event bubbling if clicked inside an anchor tag
    if (window.event) window.event.preventDefault();

    if (wishlist.includes(productId)) {
        wishlist = wishlist.filter(id => id !== productId);
    } else {
        wishlist.push(productId);
    }
    saveWishlist();
    updateWishlistUI();
};

// Initial Wishlist UI update
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateWishlistUI, 500); // Wait for products to render
});

// ==========================================
// QUICK ADD SYSTEM
// ==========================================
let quickAddSelectedSize = null;
let quickAddSelectedColor = null;

window.openQuickAdd = function(productId) {
    if (window.event) window.event.preventDefault();
    
    const product = productsCache.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('qa-title').innerText = product.name;
    
    // Render Sizes
    const sizesContainer = document.getElementById('qa-sizes');
    sizesContainer.innerHTML = '';
    quickAddSelectedSize = null;
    if (product.sizes) {
        product.sizes.forEach((size, index) => {
            const isOutOfStock = product.stock && product.stock[size] === 0;
            const btn = document.createElement('button');
            btn.className = `size-btn ${isOutOfStock ? 'disabled' : ''}`;
            if (isOutOfStock) {
                btn.style.opacity = '0.3';
                btn.style.textDecoration = 'line-through';
                btn.disabled = true;
            } else {
                btn.onclick = (e) => {
                    document.querySelectorAll('#qa-sizes .size-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    quickAddSelectedSize = size;
                };
            }
            btn.innerText = size;
            btn.style.padding = '0.5rem 1rem';
            btn.style.border = '1px solid rgba(255,255,255,0.2)';
            btn.style.background = 'transparent';
            btn.style.color = 'white';
            sizesContainer.appendChild(btn);
        });
    }

    // Render Colors
    const colorsContainer = document.getElementById('qa-colors');
    colorsContainer.innerHTML = '';
    quickAddSelectedColor = null;
    if (product.colors && product.colors.length > 0) {
        product.colors.forEach((c, index) => {
            const cName = typeof c === 'string' ? c : c.name;
            const cHex = typeof c === 'string' ? '#333' : c.hex;
            const btn = document.createElement('button');
            btn.className = 'color-btn';
            btn.style.backgroundColor = cHex;
            btn.style.width = '30px';
            btn.style.height = '30px';
            btn.style.borderRadius = '50%';
            btn.style.border = '2px solid transparent';
            btn.onclick = (e) => {
                document.querySelectorAll('#qa-colors .color-btn').forEach(b => b.style.borderColor = 'transparent');
                e.target.style.borderColor = 'white';
                quickAddSelectedColor = cName;
            };
            if (index === 0) {
                btn.style.borderColor = 'white';
                quickAddSelectedColor = cName;
            }
            colorsContainer.appendChild(btn);
        });
    }

    // Setup Add Button
    const addBtn = document.getElementById('qa-add-btn');
    addBtn.onclick = () => {
        if (product.sizes && product.sizes.length > 0 && !quickAddSelectedSize) {
            alert('Please select a size');
            return;
        }
        addToCart(productId, quickAddSelectedSize, quickAddSelectedColor);
        closeQuickAdd();
    };

    document.getElementById('quick-add-modal').classList.add('active');
};

window.closeQuickAdd = function() {
    document.getElementById('quick-add-modal').classList.remove('active');
};

// ==========================================
// SEARCH & SORT SYSTEM
// ==========================================

// Search Toggle
const searchToggleBtn = document.getElementById('search-toggle-btn');
const searchModal = document.getElementById('search-modal');
if (searchToggleBtn && searchModal) {
    searchToggleBtn.addEventListener('click', () => {
        searchModal.classList.add('active');
        document.getElementById('search-input').focus();
    });
}

// Search Logic
const doSearchBtn = document.getElementById('do-search-btn');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

function performSearch() {
    if (!searchInput || !searchResults) return;
    const query = searchInput.value.toLowerCase().trim();
    if (query === '') {
        searchResults.innerHTML = '<p>Please enter a search term.</p>';
        return;
    }
    
    const results = productsCache.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        (p.description && p.description.toLowerCase().includes(query))
    );

    searchResults.innerHTML = '';
    if (results.length === 0) {
        searchResults.innerHTML = '<p>No products found.</p>';
        return;
    }

    results.forEach(product => {
        searchResults.innerHTML += getProductCardHTML(product);
    });
}

if (doSearchBtn) doSearchBtn.addEventListener('click', performSearch);
if (searchInput) searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

// Sort Logic update for renderProducts
const sortSelect = document.getElementById('sort-select');
let currentSort = 'newest';

if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        const activeFilter = document.querySelector('.filter-sidebar .filter-btn.active');
        const filterVal = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
        renderProducts(filterVal);
    });
}

// Update the renderProducts function to support sorting
if (typeof renderProducts === 'function') {
    window.renderProducts = function(filterCategory = 'all') {
        const productsContainer = document.getElementById('products-container');
        if (!productsContainer) return;
        productsContainer.innerHTML = '';
        
        let filteredProducts = filterCategory === 'all' 
            ? [...productsCache] 
            : productsCache.filter(p => p.category === filterCategory);

        // Apply Sorting
        if (currentSort === 'price-low') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (currentSort === 'price-high') {
            filteredProducts.sort((a, b) => b.price - a.price);
        } else if (currentSort === 'bestsellers') {
            filteredProducts.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
        } else if (currentSort === 'newest') {
            // Assume the order in data.js is newest first, or we check badges
            filteredProducts.sort((a, b) => {
                const aNew = a.badges && a.badges.includes('new') ? 1 : 0;
                const bNew = b.badges && b.badges.includes('new') ? 1 : 0;
                return bNew - aNew;
            });
        }

        if (filteredProducts.length === 0) {
            productsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center; opacity:0.5; padding: 2rem;">No products found in this category.</p>';
        }

        filteredProducts.forEach(product => {
            productsContainer.innerHTML += getProductCardHTML(product);
        });
        
        setTimeout(updateWishlistUI, 100);
        
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    };
}

// Expose globals to window so inline onclick handlers in HTML continue working seamlessly with ES module script
window.openQuickAdd = openQuickAdd;
window.closeQuickAdd = closeQuickAdd;
window.toggleWishlist = toggleWishlist;
window.removeFromCart = removeFromCart;
window.addToCart = addToCart;
window.renderProducts = renderProducts;

// Dynamic getters/setters for global state compatibility
Object.defineProperty(window, 'productsCache', {
    get: () => productsCache,
    set: (val) => { productsCache = val; }
});
Object.defineProperty(window, 'wishlist', {
    get: () => wishlist,
    set: (val) => { wishlist = val; }
});
Object.defineProperty(window, 'cart', {
    get: () => cart,
    set: (val) => { cart = val; }
});
Object.defineProperty(window, 'getProductCardHTML', {
    get: () => (product, customBadge = '') => {
        // Expose internal function helper
        const statusLabel = product.in_stock ? 'View Product' : 'Out of Stock';
        let colorName = product.colors && product.colors.length > 0 ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name) : '';
        
        let badgeHTML = '';
        if (customBadge === 'new') badgeHTML = `<div style="position: absolute; top: 10px; left: 10px; background: var(--primary); color: var(--bg-dark); padding: 2px 8px; font-size: 0.6rem; font-weight: bold; text-transform: uppercase; z-index: 2;">NEW</div>`;
        else if (customBadge === 'bestseller') badgeHTML = `<div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.2); color: var(--primary); padding: 4px 10px; font-size: 0.6rem; font-weight: bold; text-transform: uppercase; z-index: 2;">#1 Bestseller</div>`;
        else if (customBadge === 'trending') badgeHTML = `<div style="position: absolute; top: 10px; left: 10px; background: var(--accent-pink); color: var(--bg-dark); padding: 4px 10px; font-size: 0.6rem; font-weight: bold; text-transform: uppercase; z-index: 2;">Trending</div>`;

        let ratingHTML = '';
        if (product.reviews && product.reviews.length > 0) {
            const avgRating = (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1);
            ratingHTML = `<div style="font-size: 0.7rem; color: #f39c12; margin-top: 5px;"><i class="fas fa-star"></i> ${avgRating} (${product.reviews.length})</div>`;
        }

        return `
            <div class="collection-item" style="position: relative;">
                ${badgeHTML}
                <button class="wishlist-btn" onclick="toggleWishlist('${product.id}')" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; z-index: 2; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
                    <i class="far fa-heart"></i>
                </button>
                <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit; display: block;">
                    <img src="${product.image}" alt="${product.name}" loading="lazy" style="width: 100%; aspect-ratio: 3/4; object-fit: cover;">
                </a>
                <div class="quick-add-overlay" style="position: absolute; bottom: 80px; left: 0; width: 100%; padding: 0 10px; opacity: 0; transition: opacity 0.3s; pointer-events: none;">
                    <button onclick="openQuickAdd('${product.id}')" class="btn-large" style="width: 100%; padding: 0.5rem; font-size: 0.8rem; pointer-events: auto;">Quick Add</button>
                </div>
                <a href="product.html?id=${product.id}" style="text-decoration: none; color: inherit; display: block;">
                    <div class="collection-info" style="padding-top: 1rem;">
                        <h3 class="collection-name">${product.name}</h3>
                        <p class="collection-price">${colorName} / EGP ${product.price}</p>
                        ${ratingHTML}
                    </div>
                </a>
            </div>
        `;
    }
});
