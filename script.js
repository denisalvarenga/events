/* ============================================================
   MAURA — DIA DAS MÃES  |  script.js
   ============================================================ */

/* ============================================================
   1. INTERSECTION OBSERVER
   ============================================================ */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.player-card, .letter, .gallery-header, .gallery-item')
  .forEach(el => io.observe(el));

/* ============================================================
   2. PLAYER DE ÁUDIO
   ============================================================ */
const audio         = document.getElementById('audioEl');
const playBtn       = document.getElementById('playBtn');
const playIcon      = document.getElementById('playIcon');
const playerFill    = document.getElementById('playerFill');
const playerThumb   = document.getElementById('playerThumb');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl   = document.getElementById('totalTime');
const playerBar     = document.getElementById('playerBar');
const playerWave    = document.getElementById('playerWave');

for (let i = 0; i < 12; i++) {
  const bar = document.createElement('div');
  bar.className = 'bar';
  playerWave.appendChild(bar);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + s.toString().padStart(2, '0');
}

function updateProgress() {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  playerFill.style.width = pct + '%';
  playerThumb.style.left = pct + '%';
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

playerBar.addEventListener('click', (e) => {
  const rect = playerBar.getBoundingClientRect();
  const pct  = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});

/* ============================================================
   3. CARROSSEL
   captionEl declarado ANTES do new Swiper — corrige o erro
   "Cannot access before initialization"
   ============================================================ */
const captionEl = document.getElementById('carouselCaption');

function updateCaption() {
  if (!captionEl) return;
  const activeSlide = document.querySelector('.swiper-slide-active');
  if (!activeSlide) return;
  const cap = activeSlide.getAttribute('data-caption') || '';
  captionEl.style.opacity = '0';
  setTimeout(function() {
    captionEl.textContent = cap;
    captionEl.style.opacity = '1';
  }, 300);
}

function handleSlideVideo() {
  document.querySelectorAll('.swiper-slide video').forEach(function(v) {
    v.pause();
    v.currentTime = 0;
    var wrap = v.closest('.slide-media--video');
    if (wrap) wrap.classList.remove('playing');
  });

  var activeVid = document.querySelector('.swiper-slide-active video');
  if (!activeVid) return;
  activeVid.muted = true;
  activeVid.playsInline = true;
  activeVid.play()
    .then(function() {
      var wrap = activeVid.closest('.slide-media--video');
      if (wrap) wrap.classList.add('playing');
    })
    .catch(function() {
      activeVid.addEventListener('click', function() { activeVid.play(); }, { once: true });
    });
}

var swiper = new Swiper('.mainSwiper', {
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
    slideChangeTransitionEnd: handleSlideVideo,
  },
});

swiper.on('afterInit', function() { setTimeout(handleSlideVideo, 400); });

document.querySelectorAll('.slide-media--video').forEach(function(wrap) {
  wrap.addEventListener('click', function() {
    var vid = wrap.querySelector('video');
    if (!vid) return;
    if (vid.paused) {
      vid.play().then(function() { wrap.classList.add('playing'); }).catch(function(){});
    } else {
      vid.pause();
      wrap.classList.remove('playing');
    }
  });
});

/* ============================================================
   4. GALERIA — MODAL
   ============================================================ */
var modal      = document.getElementById('modal');
var modalInner = document.getElementById('modalInner');
var modalClose = document.getElementById('modalClose');

document.querySelectorAll('.gallery-item').forEach(function(item) {
  item.addEventListener('click', function() {
    var src  = item.getAttribute('data-src');
    var type = item.getAttribute('data-type');
    modalInner.innerHTML = '';

    if (type === 'image') {
      var img = document.createElement('img');
      img.src = src;
      img.alt = 'Memória';
      modalInner.appendChild(img);
    } else {
      var vid = document.createElement('video');
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
  setTimeout(function() { modalInner.innerHTML = ''; }, 350);
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeModal(); });

/* ============================================================
   5. SMOOTH ANCHOR
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(function(a) {
  a.addEventListener('click', function(e) {
    var target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});
