// Detect mobile
const isMobile = window.matchMedia('(max-width: 768px)').matches;

// Global products cache for search/filter without re-fetching
let productsCache = [];

// Render CMS Data
function renderSiteData() {
    // 1. Fetch Products from LocalStorage Database
    productsCache = JSON.parse(localStorage.getItem('airov_db_products')) || [];
    
    // Fallback to local data if localStorage is empty
    if (productsCache.length === 0 && typeof siteData !== 'undefined') {
        productsCache = [...siteData.products];
    }

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
                const statusLabel = product.in_stock ? 'View Product' : 'Out of Stock';
                // Handle different color formats
                let colorName = '';
                if (product.colors && product.colors.length > 0) {
                    colorName = typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].name;
                }
                
                productsContainer.innerHTML += `
                    <a href="product.html?id=${product.id}" class="collection-item" style="text-decoration: none; color: inherit;">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                        <div class="collection-info">
                            <h3 class="collection-name">${product.name}</h3>
                            <p class="collection-price">${colorName} / EGP ${product.price}</p>
                            <span class="order-btn">${statusLabel}</span>
                        </div>
                    </a>
                `;
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

            productContainer.style.display = 'grid';
        }
    }

    // Update Social Links
    if (typeof siteData !== 'undefined') {
        document.querySelectorAll('.dm-link').forEach(el => el.href = siteData.brand.social.order_dm);
    }
}

// Call renderer
renderSiteData();

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

// Checkout via WhatsApp
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return alert('Your cart is empty.');
        let message = "Hello AIROV, I would like to order:\n\n";
        let total = 0;
        cart.forEach(item => {
            message += `- ${item.name} (${item.color}, Size: ${item.size}) x${item.quantity} = EGP ${item.price * item.quantity}\n`;
            total += item.price * item.quantity;
        });
        message += `\nTotal: EGP ${total}\n`;
        const waLink = `https://wa.me/201000000000?text=${encodeURIComponent(message)}`;
        window.open(waLink, '_blank');
    });
}

// Add to Cart from Product Page
const addToCartBtn = document.getElementById('add-to-cart-btn');
if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const product = siteData.products.find(p => p.id === productId);
        
        if (product) {
            // Get selected size
            let selectedSize = 'M'; // Default
            const activeSizeBtn = document.querySelector('.size-btn.active');
            if (activeSizeBtn) selectedSize = activeSizeBtn.innerText;

            // Get selected color
            let selectedColor = product.colors && product.colors.length > 0 ? product.colors[0].name : '';
            const colorTitle = document.getElementById('color-title').innerText;
            if (colorTitle.includes('Color: ')) {
                selectedColor = colorTitle.replace('Color: ', '');
            }

            // Check if already in cart
            const existingItem = cart.find(item => item.id === product.id && item.size === selectedSize && item.color === selectedColor);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    size: selectedSize,
                    color: selectedColor,
                    quantity: 1
                });
            }

            saveCart();
            
            // Show cart and play a small GSAP bounce if available
            toggleCart();
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
