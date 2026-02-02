// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .advantage-item, .about-text, .contact-info');
    animatedElements.forEach(el => observer.observe(el));
});

// Initialize EmailJS（僅初始化，不在頁面載入時寄出測試信）
document.addEventListener('DOMContentLoaded', function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init("PmFGU8-RZq1evVe5N");
        console.log('EmailJS initialized successfully');
    } else {
        console.error('EmailJS not loaded');
    }
});

// Form submission handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('#contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 檢查 EmailJS 是否已初始化
            if (typeof emailjs === 'undefined') {
                showNotification('郵件服務未載入，請刷新頁面重試。', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 發送中...';
            
            // 驗證表單資料
            const formData = {
                user_name: contactForm.user_name.value.trim(),
                user_email: contactForm.user_email.value.trim(),
                user_phone: contactForm.user_phone.value.trim() || '未提供',
                service_type: contactForm.service_type.value,
                message: contactForm.message.value.trim()
            };
            
            // 檢查必填欄位
            if (!formData.user_name) {
                showNotification('請填寫姓名', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }
            
            if (!formData.user_email) {
                showNotification('請填寫電子郵件', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }
            
            if (!formData.service_type) {
                showNotification('請選擇服務類型', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }
            
            if (!formData.message) {
                showNotification('請填寫需求描述', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                return;
            }
            
            // Prepare email parameters
            const templateParams = {
                user_name: formData.user_name,
                user_email: formData.user_email,
                user_phone: formData.user_phone,
                service_type: formData.service_type,
                message: formData.message,
                sent_at: new Date().toLocaleString('zh-TW', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
            };
            
            console.log('Form validation passed');
            console.log('Sending email with params:', templateParams);
            
            // Send email using EmailJS
            console.log('Attempting to send email...');
            emailjs.send('service_doaswj9', 'template_80bgax5', templateParams)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    showNotification('感謝您的諮詢！我們會盡快與您聯繫。', 'success');
                    contactForm.reset();
                }, function(error) {
                    console.error('=== EmailJS Error Details ===');
                    console.error('Full Error Object:', error);
                    console.error('Error Status:', error.status);
                    console.error('Error Text:', error.text);
                    console.error('Error Message:', error.message);
                    console.error('Template Params Sent:', templateParams);
                    console.error('Service ID:', 'service_doaswj9');
                    console.error('Template ID:', 'template_80bgax5');
                    console.error('Public Key:', 'PmFGU8-RZq1evVe5N');
                    console.error('================================');
                    
                    let errorMessage = '發送失敗，請稍後再試或直接聯繫我們。';
                    let detailedError = '';
                    
                    if (error.status === 400) {
                        errorMessage = '表單資料有誤，請檢查填寫內容。';
                        detailedError = '400 Bad Request - 可能是模板變數不匹配或資料格式錯誤';
                    } else if (error.status === 401) {
                        errorMessage = '服務設定有誤，請聯繫技術支援。';
                        detailedError = '401 Unauthorized - Public Key 可能不正確';
                    } else if (error.status === 403) {
                        errorMessage = '權限不足，請檢查 EmailJS 設定。';
                        detailedError = '403 Forbidden - 帳號權限不足';
                    } else if (error.status === 404) {
                        errorMessage = '服務或模板不存在，請檢查設定。';
                        detailedError = '404 Not Found - Service ID 或 Template ID 不正確';
                    } else if (error.status === 500) {
                        errorMessage = '伺服器錯誤，請稍後再試。';
                        detailedError = '500 Internal Server Error - EmailJS 伺服器問題';
                    } else {
                        detailedError = `未知錯誤 (${error.status}): ${error.text || error.message}`;
                    }
                    
                    console.error('Detailed Error:', detailedError);
                    showNotification(errorMessage, 'error');
                })
                .finally(function() {
                    // Reset button state
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                });
        });
    } else {
        console.error('Contact form not found');
    }
});

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
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    const backgroundColor = type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${backgroundColor};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const elements = document.querySelectorAll('.element');
    
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
    
    elements.forEach((element, index) => {
        const rate = scrolled * (0.1 + index * 0.05);
        element.style.transform = `translateY(${rate}px) rotate(${rate * 0.1}deg)`;
    });
});

// Hero title is now displayed directly without animation

// Counter animation for stats（可保留後綴 + 或 %）
function animateCounter(element, target, suffix = '', duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + suffix;
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + suffix;
        }
    }
    
    updateCounter();
}

// Trigger counter animation when about section is visible（右側 .stat-item h3）
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const runCounter = (el) => {
                const raw = el.textContent;
                const target = parseInt(raw, 10);
                if (target && !el.classList.contains('animated')) {
                    el.classList.add('animated');
                    const suffix = raw.includes('+') ? '+' : raw.includes('%') ? '%' : '';
                    animateCounter(el, target, suffix);
                }
            };
            entry.target.querySelectorAll('.stat-item h3').forEach(runCounter);
        }
    });
}, { threshold: 0.5 });

const aboutSection = document.querySelector('#about');
if (aboutSection) {
    statsObserver.observe(aboutSection);
}

// Add hover effects to service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0) scale(1)';
    });
});

// Add click effects to buttons
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Lazy loading for images (if any are added later)
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
});

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

// Add loading state to form submission
function addLoadingState(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 處理中...';
    
    // Remove loading state after 2 seconds (in real app, this would be after server response)
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }, 2000);
}

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    // Scroll-based animations and effects
    const scrolled = window.pageYOffset;
    const navbar = document.querySelector('.navbar');
    
    if (scrolled > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close mobile menu
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        
        // Close notifications
        const notification = document.querySelector('.notification');
        if (notification) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }
});

// Add focus management for accessibility
document.querySelectorAll('a, button, input, select, textarea').forEach(element => {
    element.addEventListener('focus', () => {
        element.style.outline = '2px solid #4A90E2';
        element.style.outlineOffset = '2px';
    });
    
    element.addEventListener('blur', () => {
        element.style.outline = 'none';
    });
});

console.log('思程科技 ideaFlow 網站已載入完成！');