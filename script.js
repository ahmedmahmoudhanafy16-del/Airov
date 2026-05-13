// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Simple Parallax Effect
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Parallax for hero image
    const heroImg = document.querySelector('.hero-img');
    if (heroImg) {
        heroImg.style.transform = `translateY(${scrollY * 0.4}px) scale(${1 + scrollY * 0.0005})`;
    }

    // Parallax for floating titles
    document.querySelectorAll('.floating-title').forEach(title => {
        const speed = 0.2;
        title.style.transform = `translateX(${-scrollY * speed}px)`;
    });

    // Parallax for elements with data-scroll-speed
    document.querySelectorAll('[data-scroll-speed]').forEach(el => {
        const speed = el.getAttribute('data-scroll-speed');
        el.style.transform = `translateY(${scrollY * speed * 0.1}px)`;
    });
});

// Smooth Intersection Observer for Scroll Reveals
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);

document.querySelectorAll('.asymmetric-grid, .collection-item, .grid-text, .cta-section').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(50px)';
    el.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
    observer.observe(el);
});

// Add a class to handle the reveal
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
