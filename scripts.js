
// инициализация swup (переходы между страницами)
const swup = new Swup({
  containers: ["#swup", "#swup-menu"], // Контейнер, который будет меняться
  plugins: [new SwupHeadPlugin()],
  cache: true
});

// функция инициализации всех скриптов на странице
function initPageScripts() {
  
  // плавный скролл
  const lenis = new Lenis({
    lerp: 0.1, // плавность 
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // скрипт копирования почты
  const emailCard = document.getElementById('emailCard');
  if (emailCard) {
    const emailLabel = emailCard.querySelector('.js-email');
    const originalText = "saltarelllllo@gmail.com";

    emailCard.addEventListener('click', () => {
      if (emailCard.classList.contains('is-copied')) return;

      navigator.clipboard.writeText(originalText).then(() => {
        emailLabel.innerText = "Скопировано!";
        emailCard.classList.add('is-copied');
        
        // Возвращаем текст почты через 2 секунды
        setTimeout(() => {
          emailLabel.style.opacity = '0';
          setTimeout(() => {
            emailLabel.innerText = originalText;
            emailLabel.style.opacity = '1';
            emailCard.classList.remove('is-copied');
          }, 300);
        }, 2000);
      });
    });
  }

  // плавный скролл к якорям
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === "#") return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        lenis.scrollTo(targetElement, { offset: -20 });
      }
    });
  });
}

// запуск при загрузке
initPageScripts();

// перезапуск для новых страниц
// когда Swup заменил контент, мы снова запускаем скрипты для новых элементов
swup.hooks.on('content:replace', () => {
  initPageScripts();
  // прокручиваем страницу вверх при переходе на новый кейс
  window.scrollTo(0, 0);
});

