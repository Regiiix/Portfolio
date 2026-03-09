// Register Service Worker for efficient caching
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered:', registration.scope);
            })
            .catch((error) => {
                console.log('SW registration failed:', error);
            });
    });
}

// Update year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile menu toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isOpen);
        navLinks.classList.toggle('open');
    });
    
    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.setAttribute('aria-expanded', 'false');
            navLinks.classList.remove('open');
        });
    });
}

// Active nav highlighting
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

const observeActive = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navItems.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
            });
        }
    });
}, { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' });

sections.forEach(section => observeActive.observe(section));

// Scroll animations
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    elements.forEach(el => observer.observe(el));
};

// fade-in class to animatable elements
document.querySelectorAll('.section-header, .project-card, .about-text, .about-stats, .contact-content, .skill-category')
    .forEach(el => el.classList.add('fade-in'));

animateOnScroll();

// Count-up animation for stats
const countUp = () => {
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const text = el.textContent;
                const match = text.match(/(\d+)/);
                if (match) {
                    const target = parseInt(match[1]);
                    const suffix = text.replace(/\d+/, '');
                    let current = 0;
                    const duration = 1500;
                    const step = target / (duration / 30);
                    
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        el.textContent = Math.floor(current) + suffix;
                    }, 30);
                }
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));
};

countUp();

// Lightbox for achievement and project images
const modal = document.getElementById('image-modal');
const modalImg = modal?.querySelector('#lightbox-img');
const modalOverlay = modal?.querySelector('.modal-overlay');
const modalClose = modal?.querySelector('.modal-close');

document.querySelectorAll('.achievement-item img, .project-image img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
        if (!modal || !modalImg) return;
        modalImg.src = img.src;
        modalImg.alt = img.alt || '';
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    });
});

const closeLightbox = () => {
    if (!modal) return;
    modal.classList.remove('open');
    document.body.style.overflow = '';
    if (modalImg) modalImg.src = '';
};

modalOverlay?.addEventListener('click', closeLightbox);
modalClose?.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
});

// Smooth scroll for nav links
document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });
});

// Pause marquee on hover
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) {
    marqueeTrack.addEventListener('mouseenter', () => {
        marqueeTrack.style.animationPlayState = 'paused';
    });
    marqueeTrack.addEventListener('mouseleave', () => {
        marqueeTrack.style.animationPlayState = 'running';
    });
}

// Back to top button
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Typed text effect for hero tagline
const typedElement = document.querySelector('.hero-tagline');
if (typedElement) {
    const originalText = typedElement.innerHTML;
    const textContent = typedElement.textContent;
    typedElement.innerHTML = '';
    typedElement.style.minHeight = '3em';
    
    let i = 0;
    const typeWriter = () => {
        if (i < textContent.length) {
            typedElement.textContent += textContent.charAt(i);
            i++;
            setTimeout(typeWriter, 30);
        } else {
            typedElement.innerHTML = originalText + '<span class="typed-cursor">|</span>';
            setTimeout(() => {
                const cursor = typedElement.querySelector('.typed-cursor');
                if (cursor) cursor.remove();
            }, 3000);
        }
    };
    
    // Start typing after a short delay
    setTimeout(typeWriter, 500);
}
