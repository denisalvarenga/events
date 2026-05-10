/* ============================================================
   MAURA — DIA DAS MÃES
   script.js
   ============================================================ */

/* ============================================================
   1. INTERSECTION OBSERVER — reveal on scroll
   ============================================================ */
const observeEls = document.querySelectorAll(
  '.player-card, .letter, .gallery-header, .gallery-item'
);

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

observeEls.forEach(el => io.observe(el));

/* ============================================================
   2. PLAYER DE ÁUDIO
   ============================================================ */
const audio      = document.getElementById('audioEl');
const playBtn    = document.getElementById('playBtn');
const playIcon   = document.getElementById('playIcon');
const playerFill = document.getElementById('playerFill');
const playerThumb= document.getElementById('playerThumb');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl   = document.getElementById('totalTime');
const playerBar  = document.getElementById('playerBar');
const playerWave = document.getElementById('playerWave');

/* Criar barras de onda */
for (let i = 0; i < 12; i++) {
  const bar = document.createElement('div');
  bar.className = 'bar';
  playerWave.appendChild(bar);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function updateProgress() {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  playerFill.style.width  = pct + '%';
  playerThumb.style.left  = pct + '%';
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

audio.addEventListener('loadedmetadata', () => {
  totalTimeEl.textContent = formatTime(audio.duration);
});
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => {
  playIcon.className = 'fa-solid fa-play';
  playerWave.classList.remove('playing');
});

/* Play / Pause */
playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
    playIcon.className = 'fa-solid fa-pause';
    playerWave.classList.add('playing');
  } else {
    audio.pause();
    playIcon.className = 'fa-solid fa-play';
    playerWave.classList.remove('playing');
  }
});

/* Seek na barra */
playerBar.addEventListener('click', (e) => {
  const rect = playerBar.getBoundingClientRect();
  const pct  = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});

/* ============================================================
   3. CARROSSEL — SWIPER.JS
   ============================================================ */
const swiper = new Swiper('.mainSwiper', {
  loop: true,
  speed: 1100,
  effect: 'fade',
  fadeEffect: { crossFade: true },
  autoplay: {
    delay: 5500,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  },
  navigation: {
    nextEl: '.carousel-nav--next',
    prevEl: '.carousel-nav--prev',
  },
  pagination: {
    el: '.carousel-pagination',
    clickable: true,
  },
  on: {
    slideChange: updateCaption,
    afterInit:   updateCaption,
  },
});

/* Atualizar legenda */
const captionEl = document.getElementById('carouselCaption');

function updateCaption() {
  const activeSlide = document.querySelector('.swiper-slide-active');
  if (!activeSlide) return;
  const cap = activeSlide.getAttribute('data-caption') || '';
  captionEl.style.opacity = '0';
  setTimeout(() => {
    captionEl.textContent = cap;
    captionEl.style.opacity = '1';
  }, 300);
}

/* Auto-play vídeos no slide ativo */
function handleSlideVideo() {
  // Pausa todos os vídeos primeiro
  document.querySelectorAll('.swiper-slide video').forEach(v => {
    v.pause();
    v.currentTime = 0;
  });

  // Play no slide ativo
  const activeVid = document.querySelector('.swiper-slide-active video');
  if (activeVid) {
    activeVid.muted = true;
    activeVid.playsInline = true;
    const playPromise = activeVid.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          activeVid.closest('.slide-media--video')?.classList.add('playing');
        })
        .catch(() => {
          // Tenta de novo com interação
          activeVid.addEventListener('click', () => activeVid.play(), { once: true });
        });
    }
  }
}

swiper.on('slideChangeTransitionEnd', handleSlideVideo);
// Também tenta ao iniciar
swiper.on('afterInit', () => setTimeout(handleSlideVideo, 400));

// Clique no slide de vídeo para forçar play (mobile)
document.querySelectorAll('.slide-media--video').forEach(wrap => {
  wrap.addEventListener('click', () => {
    const vid = wrap.querySelector('video');
    if (vid) {
      if (vid.paused) {
        vid.play().then(() => wrap.classList.add('playing')).catch(() => {});
      } else {
        vid.pause();
        wrap.classList.remove('playing');
      }
    }
  });
});

/* ============================================================
   4. GALERIA — MODAL
   ============================================================ */
const modal      = document.getElementById('modal');
const modalInner = document.getElementById('modalInner');
const modalClose = document.getElementById('modalClose');

document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const src  = item.getAttribute('data-src');
    const type = item.getAttribute('data-type');
    modalInner.innerHTML = '';

    if (type === 'image') {
      const img = document.createElement('img');
      img.src = src;
      img.alt = 'Memória';
      modalInner.appendChild(img);
    } else {
      const vid = document.createElement('video');
      vid.src = src;
      vid.controls = true;
      vid.autoplay = true;
      vid.playsInline = true;
      modalInner.appendChild(vid);
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { modalInner.innerHTML = ''; }, 350);
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* ============================================================
   5. SMOOTH ANCHOR — botão "Nossa história"
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
