// Detect mobile
const isMobile = window.matchMedia('(max-width: 768px)').matches;

// Loading Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        document.querySelector('.loader-wrapper').classList.add('hidden');
    }, 1000); // Small delay to let the animation play
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
