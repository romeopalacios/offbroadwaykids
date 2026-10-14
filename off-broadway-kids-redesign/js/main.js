const header = document.querySelector('[data-header]');
const toggle = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-mobile-menu]');

if (header) {
  const socialLinks = [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/offbroadwaykids?mibextid=wwXIfr',
      icon: '<path d="M14.5 8.1h3V4.3c-.5-.1-2.2-.2-4.2-.2-4.1 0-6.9 2.5-6.9 7.2v4H2v4.3h4.4V30h5.4V19.6h4.5l.7-4.3h-5.2v-3.6c0-1.3.4-3.6 2.7-3.6Z"/>'
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/offbroadwaykids?igsh=NTc4MTIwNjQ2YQ%3D%3D&utm_source=qr',
      icon: '<rect x="5" y="5" width="22" height="22" rx="6"/><circle cx="16" cy="16" r="5.3"/><circle class="icon-fill" cx="23.5" cy="8.7" r="1.2"/>'
    },
    {
      name: 'TikTok',
      url: 'https://www.tiktok.com/@off.broadway.kids?lang=en',
      icon: '<path d="M19 4c.5 3.4 2.5 5.4 6 5.7v4.5c-2.3.1-4.3-.7-5.9-2v8.1a7.2 7.2 0 1 1-6.2-7.1v4.6a2.8 2.8 0 1 0 1.8 2.6V4H19Z"/>'
    }
  ];
  const socialNav = document.createElement('nav');
  socialNav.className = 'header-socials';
  socialNav.setAttribute('aria-label', 'Social media');
  socialNav.innerHTML = socialLinks.map(({ name, url, icon }) => `<a href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${name}"><svg viewBox="0 0 32 32" aria-hidden="true">${icon}</svg></a>`).join('');
  header.querySelector('.header-cta, .menu-toggle')?.before(socialNav);
}

const shouldOpenCurtain = document.querySelector('.hero')
  && matchMedia('(max-width: 640px)').matches
  && !matchMedia('(prefers-reduced-motion: reduce)').matches;

if (shouldOpenCurtain) {
  const entrance = document.createElement('div');
  entrance.className = 'site-opening-curtain';
  entrance.setAttribute('aria-hidden', 'true');
  entrance.innerHTML = '<div class="opening-valance"></div><div class="opening-curtain opening-curtain-left"></div><div class="opening-curtain opening-curtain-right"></div><div class="opening-curtain-tie"></div>';
  document.body.prepend(entrance);
  document.body.classList.add('curtain-opening');
  requestAnimationFrame(() => requestAnimationFrame(() => entrance.classList.add('is-open')));
  setTimeout(() => {
    entrance.remove();
    document.body.classList.remove('curtain-opening');
  }, 2100);
}

const onScroll = () => header?.classList.toggle('scrolled', scrollY > 24);
onScroll();
addEventListener('scroll', onScroll, { passive: true });

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

const lightbox = document.querySelector('[data-lightbox]');
const lightboxImg = document.querySelector('[data-lightbox-image]');
const closeBox = () => {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

document.querySelector('[data-lightbox-close]')?.addEventListener('click', closeBox);
lightbox?.addEventListener('click', event => {
  if (event.target === lightbox) closeBox();
});

const slideshow = document.querySelector('[data-slideshow]');
if (slideshow) {
  const slides = [...slideshow.querySelectorAll('.gallery-item')];
  const dots = slideshow.querySelector('[data-slide-dots]');
  let activeIndex = 0;
  let autoplay;

  const showSlide = index => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      slide.tabIndex = active ? 0 : -1;
    });
    [...dots.children].forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
      dot.setAttribute('aria-current', dotIndex === activeIndex ? 'true' : 'false');
    });
  };

  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show photo ${index + 1}`);
    dot.addEventListener('click', () => showSlide(index));
    dots.append(dot);
    slide.addEventListener('click', () => {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = slide.dataset.src;
      lightboxImg.alt = slide.querySelector('img').alt;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  const restartAutoplay = () => {
    clearInterval(autoplay);
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      autoplay = setInterval(() => showSlide(activeIndex + 1), 6000);
    }
  };
  slideshow.querySelector('[data-slide-prev]').addEventListener('click', () => { showSlide(activeIndex - 1); restartAutoplay(); });
  slideshow.querySelector('[data-slide-next]').addEventListener('click', () => { showSlide(activeIndex + 1); restartAutoplay(); });
  slideshow.addEventListener('mouseenter', () => clearInterval(autoplay));
  slideshow.addEventListener('mouseleave', restartAutoplay);
  let touchStartX = 0;
  slideshow.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches[0].clientX;
    clearInterval(autoplay);
  }, { passive: true });
  slideshow.addEventListener('touchend', event => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) showSlide(activeIndex + (distance < 0 ? 1 : -1));
    restartAutoplay();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearInterval(autoplay);
    else restartAutoplay();
  });
  showSlide(0);
  restartAutoplay();
}

addEventListener('keydown', event => {
  if (event.key === 'Escape') closeBox();
  if (!slideshow || lightbox?.classList.contains('open')) return;
  if (event.key === 'ArrowLeft') slideshow.querySelector('[data-slide-prev]').click();
  if (event.key === 'ArrowRight') slideshow.querySelector('[data-slide-next]').click();
});
