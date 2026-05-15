// Detect mobile
const isMobile = window.matchMedia('(max-width: 768px)').matches;

// Render CMS Data
function renderSiteData() {
    if (typeof siteData === 'undefined') return;

    // Render Hero
    if (document.getElementById('dynamic-slogan')) {
        document.getElementById('dynamic-slogan').innerText = siteData.hero.slogan;
        document.getElementById('dynamic-hero-btn').innerText = siteData.hero.button_text;
        document.getElementById('dynamic-hero-btn').href = siteData.hero.button_link;
        document.getElementById('dynamic-hero-img').src = siteData.hero.image_path;
    }

    // Render Philosophy
    if (document.getElementById('dynamic-phil-img')) {
        document.getElementById('dynamic-phil-est').innerText = siteData.philosophy.established;
        document.getElementById('dynamic-phil-title').innerText = siteData.philosophy.title;
        document.getElementById('dynamic-phil-desc').innerText = siteData.philosophy.description;
        document.getElementById('dynamic-phil-img').src = siteData.philosophy.image_path;
    }

    // Render Lookbook
    const lookbookContainer = document.getElementById('lookbook-container');
    if (lookbookContainer) {
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
        siteData.products.forEach(product => {
            const statusLabel = product.in_stock ? 'View Product' : 'Out of Stock';
            const colorName = product.colors && product.colors.length > 0 ? product.colors[0].name : '';
            productsContainer.innerHTML += `
                <a href="product.html?id=${product.id}" class="collection-item" style="text-decoration: none; color: inherit;">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                    <div class="collection-info">
                        <h3 class="collection-name">${product.name}</h3>
                        <p class="collection-price">${colorName} / ${siteData.brand.currency} ${product.price}</p>
                        <span class="order-btn">${statusLabel}</span>
                    </div>
                </a>
            `;
        });
    }

    // Render Single Product Page (product.html)
    const productContainer = document.getElementById('product-container');
    if (productContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const product = siteData.products.find(p => p.id === productId);

        if (product) {
            document.getElementById('product-title').innerText = product.name;
            document.getElementById('product-breadcrumb-name').innerText = product.name;
            document.getElementById('product-price').innerText = `${siteData.brand.currency} ${product.price}`;
            document.getElementById('product-desc').innerText = product.description;

            // Render Gallery (simple mockup with 3 images of the same product)
            const gallery = document.getElementById('product-gallery');
            gallery.innerHTML = `
                <img src="${product.image}" alt="${product.name} Front" loading="lazy">
                <img src="${product.image}" alt="${product.name} Detail 1" loading="lazy" style="filter: grayscale(1) brightness(0.6);">
                <img src="${product.image}" alt="${product.name} Detail 2" loading="lazy" style="transform: scaleX(-1);">
            `;

            // Render Colors
            const colorSelector = document.getElementById('color-selector');
            const colorTitle = document.getElementById('color-title');
            colorSelector.innerHTML = '';
            if (product.colors && product.colors.length > 0) {
                colorTitle.innerText = `Color: ${product.colors[0].name}`;
                product.colors.forEach((c, index) => {
                    colorSelector.innerHTML += `<button class="color-btn ${index === 0 ? 'active' : ''}" style="background-color: ${c.hex};" onclick="document.getElementById('color-title').innerText='Color: ${c.name}'"></button>`;
                });
            }

            productContainer.style.display = 'grid'; // Show the container
        } else {
            // Product not found, redirect to home
            window.location.href = 'index.html';
        }
    }

    // Update Social Links
    document.querySelectorAll('.dm-link').forEach(el => el.href = siteData.brand.social.order_dm);
}

// Call renderer
renderSiteData();

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
