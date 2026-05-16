// 1. Инициализируем Lenis один раз и вешаем в window, чтобы он был доступен везде
window.lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
});

function raf(time) {
    window.lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. Swup Инициализация
const swup = new Swup({
    containers: ["#swup", "#swup-menu"],
    plugins: [new SwupHeadPlugin()],
    cache: true
});

// 3. Функция для оживления элементов на каждой странице
function initPageScripts() {
    console.log("Скрипты инициализированы");

    // Логика копирования почты
    const emailCard = document.getElementById('emailCard');
    if (emailCard) {
        const emailLabel = emailCard.querySelector('.js-email');
        const originalText = emailLabel?.innerText;

        emailCard.onclick = () => {
            if (emailCard.classList.contains('is-copied')) return;
            navigator.clipboard.writeText(originalText).then(() => {
                emailLabel.innerText = "Скопировано!";
                emailCard.classList.add('is-copied');
                setTimeout(() => {
                    emailLabel.innerText = originalText;
                    emailCard.classList.remove('is-copied');
                }, 2000);
            });
        };
    }

// Глобальный перехват кликов по локальным якорям (#)
// Работает в фазе capture, чтобы сработать ДО того, как клик поймает Swup
window.addEventListener('click', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    
    // Проверяем, что ссылка начинается именно с # (локальный якорь на текущей странице)
    if (href && href.startsWith('#')) {
        const targetElement = document.querySelector(href);
        if (targetElement) {
            e.preventDefault();
            e.stopPropagation(); // Важно: Swup больше не увидит этот клик!
            
            // Плавно скроллим с помощью Lenis
            window.lenis.scrollTo(targetElement, { offset: -20 });
        }
    }
}, { capture: true }); // Включаем фазу захвата
}

// 4. События Swup
swup.hooks.on('content:replace', () => {
    initPageScripts(); 
    window.lenis.scrollTo(0, { immediate: true });
});

// 5. Первая загрузка
window.addEventListener('load', () => {
    const loader = document.getElementById('site-loader');
    if (loader) loader.classList.add('site-loader--hidden');
    initPageScripts();
});

// Логика поп-апа (срабатывает только один раз при посещении)
document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('welcome-popup');
    if (popup && !sessionStorage.getItem('portfolioPopupSeen')) {
        setTimeout(() => popup.classList.remove('popup--hidden'), 1000);
        
        const closeBtn = document.getElementById('close-popup');
        const okBtn = document.getElementById('ok-popup');
        
        const hidePopup = () => {
            popup.classList.add('popup--hidden');
            sessionStorage.setItem('portfolioPopupSeen', 'true');
        };

        closeBtn?.addEventListener('click', hidePopup);
        okBtn?.addEventListener('click', hidePopup);
    }
});