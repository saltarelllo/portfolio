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

    initGallerySliders();

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


// Скрипт для галереи-слайдера с адаптивным тач-скроллом
function initGallerySliders() {
  const sliders = document.querySelectorAll('.gallery-slider:not(.is-initialized)');
  
  if (sliders.length === 0) return; 

  sliders.forEach(slider => {
    slider.classList.add('is-initialized'); // Ставим защиту от двойного запуска
    
    const track = slider.querySelector('.gallery-slider__track');
    const slides = slider.querySelectorAll('.gallery-slider__img');
    const btnPrev = slider.querySelector('.gallery-slider__arrow--prev');
    const btnNext = slider.querySelector('.gallery-slider__arrow--next');
    const dotsContainer = slider.querySelector('.gallery-slider__dots');
    const captionContainer = slider.querySelector('.gallery-slider__caption');

    if (!track || slides.length === 0) return;

    let currentIndex = 0;
    const captionNodes = []; 

    // Безопасно очищаем контейнеры (если они есть)
    if (captionContainer) captionContainer.innerHTML = '';
    if (dotsContainer) dotsContainer.innerHTML = '';

    // Генерируем точки и тексты подписей из data-caption
    slides.forEach((slide, index) => {
      
      // 1. Создаем точки
      if (dotsContainer) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.classList.add('gallery-slider__dot');
        dot.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
        
        dot.addEventListener('click', (e) => {
          e.preventDefault();
          goToSlide(index);
        });
        dotsContainer.appendChild(dot);
      }

      // 2. Создаем тексты
      if (captionContainer) {
        const p = document.createElement('p');
        p.className = 'gallery-slider__caption-text';
        p.textContent = slide.getAttribute('data-caption') || '';
        captionContainer.appendChild(p);
        captionNodes.push(p);
      }
    });

    const dots = slider.querySelectorAll('.gallery-slider__dot');

    // Функция обновления состояния элементов слайдера
    function updateSlider(isMobileScroll = false) {
      // На десктопе (>768px) управляем через transform
      if (window.innerWidth > 768) {
        track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;
      } else {
        // На мобилке (если обновление вызвано НЕ ручным скроллом) программно двигаем скролл
        if (!isMobileScroll) {
          const slideWidth = track.clientWidth;
          track.scrollLeft = currentIndex * slideWidth;
        }
      }

      // Переключаем активную точку
      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === currentIndex);
      });

      // Переключаем видимость текста подписей
      captionNodes.forEach((p, index) => {
        if (index === currentIndex) {
          p.classList.add('is-active');
        } else {
          p.classList.remove('is-active');
        }
      });
    }

    function goToSlide(index) {
      currentIndex = index;
      updateSlider();
    }

    // [Свайп пальцем] Отслеживаем ручной скролл на мобильных устройствах
    track.addEventListener('scroll', () => {
      if (window.innerWidth <= 768) {
        const slideWidth = track.clientWidth;
        if (slideWidth === 0) return;

        // Рассчитываем текущий слайд по позиции скролла
        const newIndex = Math.round(track.scrollLeft / slideWidth);

        // Если слайд сменился, обновляем точки и подписи
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < slides.length) {
          currentIndex = newIndex;
          updateSlider(true);
        }
      }
    });

    // Слушатели кнопок-стрелок
    if (btnPrev) {
      btnPrev.addEventListener('click', (e) => {
        e.preventDefault();
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : slides.length - 1;
        updateSlider();
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', (e) => {
        e.preventDefault();
        currentIndex = (currentIndex < slides.length - 1) ? currentIndex + 1 : 0;
        updateSlider();
      });
    }

    // Запуск (показываем первый слайд)
    updateSlider();
  });
}


// скрипт для подсветки ссылок в меню

document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.menu-right__link');
  
  // Автоматически находим блоки на странице, на которые указывают ссылки из меню
  const targets = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Срабатывает, когда блок занимает центр экрана
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('menu-right__link--active');

           if (window.innerWidth <= 768) {
              link.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }

          } else {
            link.classList.remove('menu-right__link--active');
          }
        });
      }
    });
  }, observerOptions);

  targets.forEach(target => observer.observe(target));
});