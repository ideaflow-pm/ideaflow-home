// ============ 進場動畫 ============
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ============ EmailJS 初始化 ============
const EMAILJS_PUBLIC_KEY = 'PmFGU8-RZq1evVe5N';
const EMAILJS_SERVICE_ID = 'service_doaswj9';
const EMAILJS_TEMPLATE_ID = 'template_80bgax5';

document.addEventListener('DOMContentLoaded', () => {
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    } else {
        console.error('EmailJS not loaded');
    }
});

// ============ 諮詢表單 ============
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (typeof emailjs === 'undefined') {
            showNotification('郵件服務未載入，請重新整理頁面後再試。', 'error');
            return;
        }

        const data = {
            user_name: form.user_name.value.trim(),
            user_email: form.user_email.value.trim(),
            user_phone: form.user_phone.value.trim() || '未提供',
            service_type: form.service_type.value,
            message: form.message.value.trim()
        };

        if (!data.user_name) return showNotification('請填寫姓名', 'error');
        if (!data.user_email) return showNotification('請填寫電子郵件', 'error');
        if (!data.service_type) return showNotification('請選擇服務類型', 'error');
        if (!data.message) return showNotification('請簡單描述您的需求', 'error');

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '送出中…';

        const params = {
            ...data,
            sent_at: new Date().toLocaleString('zh-TW', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            })
        };

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
            .then(() => {
                showNotification('已收到您的訊息，我們會盡快與您聯繫！', 'success');
                form.reset();
            })
            .catch((error) => {
                console.error('EmailJS error:', error?.status, error?.text || error);
                showNotification('送出失敗，請稍後再試，或直接來信 ideaflow.pm@gmail.com。', 'error');
            })
            .finally(() => {
                btn.disabled = false;
                btn.textContent = originalText;
            });
    });
});

// ============ 通知 ============
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = `notification notification-${type}`;
    el.innerHTML = `
        <div class="notification-content">
            <span></span>
            <button class="notification-close" aria-label="關閉">&times;</button>
        </div>
    `;
    el.querySelector('span').textContent = message;
    document.body.appendChild(el);

    requestAnimationFrame(() => el.classList.add('show'));

    const dismiss = () => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 300);
    };
    el.querySelector('.notification-close').addEventListener('click', dismiss);
    setTimeout(dismiss, 5000);
}
