// Focus management - Only show focus outlines for keyboard navigation
(function() {
    let hadKeyboardEvent = false;

    const detectKeyboard = (e) => {
        // Tab, arrow keys, enter, space, etc.
        if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
            e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
            hadKeyboardEvent = true;
            document.documentElement.classList.add('js-focus-visible');
        }
    };

    const detectMouse = () => {
        hadKeyboardEvent = false;
        document.documentElement.classList.remove('js-focus-visible');
    };

    // Listen for keyboard navigation
    document.addEventListener('keydown', detectKeyboard, true);
    
    // Listen for mouse/touch interactions
    document.addEventListener('mousedown', detectMouse, true);
    document.addEventListener('pointerdown', detectMouse, true);
    document.addEventListener('touchstart', detectMouse, true);
    
    // Also detect focus events
    document.addEventListener('focus', (e) => {
        if (hadKeyboardEvent) {
            e.target.classList.add('focus-visible');
        } else {
            e.target.classList.remove('focus-visible');
        }
    }, true);
    
    document.addEventListener('blur', (e) => {
        e.target.classList.remove('focus-visible');
    }, true);
})();

// Theme Toggle Functionality
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Function to get system theme preference
function getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}

// Check for saved theme preference, system preference, or default to light theme
const currentTheme = localStorage.getItem('theme') || getSystemTheme();
html.setAttribute('data-theme', currentTheme);

// Update theme toggle icon
function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

updateThemeIcon(currentTheme);

// Theme toggle event listener
themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

// Listen for system theme changes
if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
        // Only update if user hasn't manually set a theme preference
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
            updateThemeIcon(newTheme);
        }
    });
}

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => {
    n.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 70;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Optimized scroll handling - combine navbar and navigation highlighting
let ticking = false;

function handleScroll() {
    const scrollY = window.scrollY;
    
    // Navbar background on scroll
    const navbar = document.querySelector('.navbar');
    if (scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Active navigation link highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionHeight = section.offsetHeight;
        
        if (sectionTop <= 100 && sectionTop + sectionHeight > 100) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
    
    // Back to top button
    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
        if (scrollY > 300) {
            backToTopButton.style.display = 'flex';
        } else {
            backToTopButton.style.display = 'none';
        }
    }
    
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
    }
});

// Scroll Reveal Animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Add fade-in class to elements you want to animate
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.about-content, .skill-category, .project-card, .contact-content');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});

// Contact Form Handling
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent default form submission
        
        // Get form data
        const formData = new FormData(this);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Basic validation
        if (!name || !email || !subject || !message) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }
        
        if (!isValidEmail(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Submit to Formspree using fetch
            const response = await fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Success - show notification and clear form
                showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
                this.reset(); // Clear all form fields
            } else {
                // Error from Formspree
                showNotification('Oops! There was a problem sending your message. Please try again.', 'error');
            }
        } catch (error) {
            // Network error
            showNotification('Network error. Please check your connection and try again.', 'error');
        } finally {
            // Re-enable button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
      // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        padding: 1.2rem 1.8rem;
        border-radius: 12px;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 350px;
        font-weight: 500;
        font-size: 0.95rem;
        border: 2px solid ${type === 'success' ? '#065f46' : type === 'error' ? '#991b1b' : '#1e40af'};
        animation: slideInBounce 0.5s ease;
    `;
    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';        style.textContent = `
            @keyframes slideInBounce {
                0% {
                    transform: translateX(100%) scale(0.8);
                    opacity: 0;
                }
                60% {
                    transform: translateX(-10px) scale(1.05);
                    opacity: 1;
                }
                100% {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%) scale(0.8);
                    opacity: 0;
                }
            }
            
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
      // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
    
    // Auto remove after 5 seconds with slide out animation
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Typing Animation for Hero Section - DISABLED to prevent layout conflicts
// The CSS animations handle the hero section presentation
/*
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}
*/

// Initialize typing animation when page loads - DISABLED
/*
document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 50);
    }
});
*/

// Skills Animation on Scroll
const skillsSection = document.querySelector('#skills');
let skillsAnimated = false;

const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !skillsAnimated) {
            animateSkills();
            skillsAnimated = true;
        }
    });
}, { threshold: 0.5 });

if (skillsSection) {
    skillsObserver.observe(skillsSection);
}

function animateSkills() {
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.transform = 'scale(1.05)';
            setTimeout(() => {
                item.style.transform = 'scale(1)';
            }, 200);
        }, index * 100);
    });
}

// Project Card Tilt Effect REMOVED (was distracting)
// Replaced with simple focus accessibility enhancement
// document.querySelectorAll('.project-card').forEach(card => { /* removed tilt logic */ });

document.querySelectorAll('.project-card').forEach(card => {
    // Add focus style support for keyboard navigation
    card.addEventListener('focusin', () => card.classList.add('focus-visible-card'));
    card.addEventListener('focusout', () => card.classList.remove('focus-visible-card'));
});

// Copy Email to Clipboard
document.addEventListener('DOMContentLoaded', () => {
    const emailElement = document.querySelector('.contact-item span');
    if (emailElement && emailElement.textContent.includes('@')) {
        emailElement.style.cursor = 'pointer';
        emailElement.title = 'Click to copy email';
        
        emailElement.addEventListener('click', () => {
            const email = emailElement.textContent;
            navigator.clipboard.writeText(email).then(() => {
                showNotification('Email copied to clipboard!', 'success');
            }).catch(() => {
                showNotification('Failed to copy email', 'error');
            });
        });
    }
});

// Loading Screen (Optional)
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }
});

// Back to Top Button
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.className = 'back-to-top';
backToTopButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    box-shadow: var(--shadow-medium);
    transition: all 0.3s ease;
    z-index: 1000;
`;

document.body.appendChild(backToTopButton);

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Console message for developers
console.log('%c👋 Hello Developer!', 'color: #3b82f6; font-size: 20px; font-weight: bold;');
console.log('%cThanks for checking out the code! If you have any questions, feel free to reach out.', 'color: #6b7280; font-size: 14px;');

// Enhanced Animations and Interactive Effects

// Page entrance animation - DISABLED to let CSS animations handle hero section
document.addEventListener('DOMContentLoaded', () => {
    // CSS animations handle hero content timing and effects
    // JavaScript hero animations disabled to prevent conflicts
    /*
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroDescription = document.querySelector('.hero-description');
    const heroButtons = document.querySelector('.hero-buttons');
    const heroImage = document.querySelector('.hero-image');

    if (heroTitle) {
        setTimeout(() => heroTitle.classList.add('animate-fade-in-up'), 100);
        setTimeout(() => heroSubtitle.classList.add('animate-fade-in-up'), 300);
        setTimeout(() => heroDescription.classList.add('animate-fade-in-up'), 500);
        setTimeout(() => heroButtons.classList.add('animate-fade-in-up'), 700);
        setTimeout(() => heroImage.classList.add('animate-fade-in-right'), 900);
    }
    */

    // Add initial animation classes to elements
    const animatedElements = document.querySelectorAll('.skill-category, .project-card');
    animatedElements.forEach(el => el.classList.add('animate-on-scroll'));
});

// Enhanced scroll animations with staggered effects
const createAdvancedObserver = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, index * 100); // Stagger animation
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe skill categories and project cards
    document.querySelectorAll('.skill-category').forEach((el, index) => {
        el.style.setProperty('--stagger-delay', `${index * 0.1}s`);
        observer.observe(el);
    });

    document.querySelectorAll('.project-card').forEach((el, index) => {
        el.style.setProperty('--stagger-delay', `${index * 0.15}s`);
        observer.observe(el);
    });
};

// Initialize advanced animations
createAdvancedObserver();

// Add floating animation to hero image
const heroImage = document.querySelector('.hero-img-placeholder');
if (heroImage) {
    heroImage.classList.add('animate-float');
}

// Profile image cursor-following reveal effect
const heroImg = document.querySelector('.hero-img');
if (heroImg) {
    // Check if device supports hover (desktop)
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    
    if (supportsHover) {
        let animationFrame;
        
        heroImg.addEventListener('mousemove', (e) => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            
            animationFrame = requestAnimationFrame(() => {
                const rect = heroImg.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const mouseX = e.clientX;
                const mouseY = e.clientY;
                
                // Calculate offset from center (normalized to -1 to 1)
                const offsetX = (mouseX - centerX) / (rect.width / 2);
                const offsetY = (mouseY - centerY) / (rect.height / 2);
                
                // Subtle movement - only 5px max in each direction
                const moveX = offsetX * 5;
                const moveY = offsetY * 5;
                
                // Apply the transform while maintaining the hover state
                heroImg.style.transform = `translateY(-8px) scale(1.03) translate(${moveX}px, ${moveY}px)`;
            });
        });
        
        heroImg.addEventListener('mouseleave', () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            // Reset to normal hover state
            heroImg.style.transform = 'translateY(-8px) scale(1.03)';
        });
        
        heroImg.addEventListener('mouseenter', () => {
            // Set initial hover state
            heroImg.style.transform = 'translateY(-8px) scale(1.03)';
        });
    } else {
        // Mobile: simpler transform on touch
        heroImg.addEventListener('touchstart', () => {
            heroImg.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        heroImg.addEventListener('touchend', () => {
            heroImg.style.transform = 'translateY(0) scale(1)';
        });
    }
}

// Parallax effect removed for better user experience

// Add magnetic effect to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transform = `translateY(-2px) translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0) translate(0, 0)';
    });
});

// Add glow effect to social links and resume button on hover
document.querySelectorAll('.social-link, .resume-button').forEach(link => {
    link.addEventListener('mouseenter', () => {
        link.classList.add('animate-glow');
    });
    
    link.addEventListener('mouseleave', () => {
        link.classList.remove('animate-glow');
    });
});

// Smooth reveal animation for sections
const revealSections = () => {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        // Set initial state
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease-out';
        
        observer.observe(section);
    });
};

// Initialize section reveals (skip hero section)
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(revealSections, 1000);
});
