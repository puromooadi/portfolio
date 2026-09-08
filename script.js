document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = Array.from(navLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  // Klik "Home" -> scroll ke page pertama, "About Me" -> scroll ke page kedua, dst.
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Highlight nav link sesuai section yang sedang terlihat saat digulir manual
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(section => observer.observe(section));

  // ===== Navbar dock-wave hover effect (seperti macOS dock) =====
  const navLinksContainer = document.getElementById('navLinks');
  const navLinkItems = Array.from(navLinks);
  const DOCK_MAX_SCALE = 0.28;
  const DOCK_SIGMA = 65;
  const DOCK_LIFT = 10;

  if (navLinksContainer) {
    navLinksContainer.addEventListener('mousemove', (e) => {
      const mouseX = e.clientX;
      navLinkItems.forEach(link => {
        const rect = link.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const dist = mouseX - centerX;
        const falloff = Math.exp(-(dist * dist) / (2 * DOCK_SIGMA * DOCK_SIGMA));
        const scale = 1 + DOCK_MAX_SCALE * falloff;
        const lift = DOCK_LIFT * falloff;
        link.style.transform = `translateY(-${lift}px) scale(${scale})`;
      });
    });

    navLinksContainer.addEventListener('mouseleave', () => {
      navLinkItems.forEach(link => {
        link.style.transform = '';
      });
    });
  }

  // ===== Tombol contact yang belum aktif (Email) =====
  // Dipindah dari inline onclick="" ke sini supaya kompatibel dengan CSP script-src 'self'.
  document.querySelectorAll('.contact-btn-disabled').forEach(btn => {
    btn.addEventListener('click', (e) => e.preventDefault());
  });

  // ===== Portfolio modal =====
  const modal = document.getElementById('portfolioModal');
  const modalContent = document.querySelector('.portfolio-modal-content');
  const modalAvatarLink = document.getElementById('modalAvatarLink');
  const modalAvatar = document.getElementById('modalAvatar');
  const modalUsername = document.getElementById('modalUsername');
  const modalRole = document.getElementById('modalRole');
  const modalImages = document.getElementById('modalImages');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  const openModal = (card) => {
    const avatarLink = card.querySelector('.portfolio-avatar-link');
    const avatarSrc = card.querySelector('.portfolio-avatar').getAttribute('src');
    const username = card.querySelector('.portfolio-username');
    const role = card.querySelector('.portfolio-role').textContent;
    const images = card.querySelectorAll('.portfolio-images img');

    const igUrl = avatarLink.getAttribute('href');

    modalAvatarLink.setAttribute('href', igUrl);
    modalAvatar.setAttribute('src', avatarSrc);
    modalAvatar.setAttribute('alt', username.textContent);
    modalUsername.setAttribute('href', igUrl);
    modalUsername.textContent = username.textContent;
    modalRole.textContent = role;

    modalImages.innerHTML = '';
    images.forEach(img => {
      const clone = document.createElement('img');
      clone.src = img.getAttribute('src');
      clone.alt = img.getAttribute('alt');
      modalImages.appendChild(clone);
    });

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Restart animasi bounce-in setiap kali dibuka
    modalContent.classList.remove('pop-out', 'pop-in');
    void modalContent.offsetWidth; // force reflow
    modalContent.classList.add('pop-in');
  };

  const closeModal = () => {
    modalContent.classList.remove('pop-in');
    modalContent.classList.add('pop-out');

    const finishClose = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      modalContent.classList.remove('pop-out');
      modalContent.removeEventListener('animationend', finishClose);
    };
    modalContent.addEventListener('animationend', finishClose);
  };

  portfolioCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Jangan buka popup kalau yang diklik adalah link ke Instagram
      if (e.target.closest('a')) return;
      openModal(card);
    });
  });

  modal.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  // ===== Reveal animation: scroll + load + stagger + wipe =====
  document.querySelectorAll('[data-reveal-stagger]').forEach(group => {
    const items = group.querySelectorAll(':scope > [data-reveal]');
    items.forEach((el, i) => el.style.setProperty('--reveal-delay', `${i * 100}ms`));
  });

  const loadEls = document.querySelectorAll('[data-reveal-when="load"]');
  loadEls.forEach((el, i) => {
    if (!el.style.getPropertyValue('--reveal-delay')) {
      el.style.setProperty('--reveal-delay', `${i * 120}ms`);
    }
  });

  window.addEventListener('load', () => {
    requestAnimationFrame(() => loadEls.forEach(el => el.classList.add('is-visible')));
  });

  const scrollEls = Array.from(document.querySelectorAll('[data-reveal]'))
    .filter(el => el.getAttribute('data-reveal-when') !== 'load');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -10px 0px' });

  scrollEls.forEach(el => revealObserver.observe(el));

  // Fallback pengaman: kalau karena alasan apa pun (timing scroll, dsb.)
  // sebuah elemen belum ke-trigger, paksa tampil supaya tidak ada yang hilang permanen.
  setTimeout(() => {
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(el => {
      el.classList.add('is-visible');
    });
  }, 2500);
});