/* ================================================================
   shared.js — loaded on every page
   Handles: nav, footer, theme switching, easter egg, GSAP setup
   ================================================================
   🎨 EASTER EGG: Triple-click the logo to reveal the theme switcher
   ================================================================ */

(function () {

  // ── Base path (root pages vs posts/ subdirectory) ──────────────
  const base = document.currentScript?.dataset.base ?? '';

  // ── Inject Nav ─────────────────────────────────────────────────
  const navMount = document.getElementById('nav-mount');
  if (navMount) {
    navMount.innerHTML = `
      <nav>
        <div class="nav-inner">
          <a href="${base}index.html" class="nav-logo" id="nav-logo">Augment Your Experience</a>
          <div class="nav-links">
            <a href="${base}index.html">Home</a>
            <a href="${base}posts.html">Posts</a>
            <a href="${base}weekly-briefs/index.html">Weekly Briefs</a>
            <a href="${base}intel/index.html">Intel</a>
            <a href="${base}events/index.html">Events</a>
            <a href="${base}about.html">About</a>
            <a href="${base}speaking.html">Speaking</a>
          </div>
          <!-- <a href="${base}index.html#subscribe" class="btn btn-primary btn-sm">Subscribe</a> -->
        </div>
      </nav>`;
  }

  // ── Inject Footer ───────────────────────────────────────────────
  const footerMount = document.getElementById('footer-mount');
  if (footerMount) {
    footerMount.innerHTML = `
      <footer>
        <div class="footer-inner">
          <div>
            <div class="footer-logo">Augment Your Experience</div>
            <div class="footer-tagline">A spatial computing blog by Jenn Lee</div>
          </div>
          <div class="footer-links">
            <a href="https://phoenixjenn.com" target="_blank" rel="noopener">phoenixjenn.com</a>
            <a href="https://survivingthetechnicalinterview.com" target="_blank" rel="noopener">survivingthetechnicalinterview.com</a>
            <a href="https://www.linkedin.com/in/phoenixjenn" target="_blank" rel="noopener">LinkedIn</a>
          </div>
        </div>
      </footer>`;
  }

  // ── Inject Easter Egg Switcher ──────────────────────────────────
  const switcherMount = document.getElementById('switcher-mount');
  if (switcherMount) {
    switcherMount.innerHTML = `
      <div id="switcher">
        <div id="switcher-label">✦ secret mode</div>
        <div id="auto-status"></div>
        <button class="t-btn" id="btn-fuchsia" onclick="AYE.setTheme('fuchsia', true)">
          <span class="swatch" style="background:#FF2D78;"></span>
          CEO Mode <span style="font-size:0.6rem;opacity:0.6;">· weekdays</span>
        </button>
        <button class="t-btn" id="btn-rpr" onclick="AYE.setTheme('rpr', true)">
          <span class="swatch" style="background:#00F5FF;"></span>
          Ready Player Jenn <span style="font-size:0.6rem;opacity:0.6;">· weekends</span>
        </button>
        <button onclick="AYE.setTheme(AYE.getAutoTheme(), false)"
          style="margin-top:0.5rem;width:100%;font-size:0.7rem;cursor:pointer;background:transparent;
                 border:1px dashed var(--border);border-radius:0.375rem;padding:0.35rem;color:var(--text-muted);">
          ↺ auto
        </button>
        <button class="switcher-close" onclick="AYE.hideSwitcher()">✕ close</button>
      </div>`;
  }

  // ── Theme Logic ─────────────────────────────────────────────────
  function getAutoTheme() {
    const day = new Date().getDay(); // 0=Sun, 6=Sat
    return (day === 0 || day === 6) ? 'rpr' : 'fuchsia';
  }

  function setTheme(t, manual) {
    // Remove any existing theme class and apply new one
    document.body.className = document.body.className
      .split(' ')
      .filter(c => !c.startsWith('theme-'))
      .concat('theme-' + t)
      .join(' ')
      .trim();

    // Persist manual override so it survives page navigation
    if (manual) {
      localStorage.setItem('aye-theme-override', t);
    } else {
      localStorage.removeItem('aye-theme-override');
    }

    // Update switcher UI
    document.querySelectorAll('.t-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('btn-' + t);
    if (btn) btn.classList.add('active');

    const status = document.getElementById('auto-status');
    if (status) {
      status.textContent = manual
        ? '✦ manual override'
        : '✦ auto: ' + (t === 'fuchsia' ? 'weekday' : 'weekend');
    }
  }

  function showSwitcher() {
    const sw = document.getElementById('switcher');
    if (!sw) return;
    sw.style.display = 'block';
    if (window.gsap) {
      gsap.fromTo(sw, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    }
  }

  function hideSwitcher() {
    const sw = document.getElementById('switcher');
    if (!sw) return;
    if (window.gsap) {
      gsap.to(sw, {
        opacity: 0, y: 20, duration: 0.3, ease: 'power2.in',
        onComplete: () => { sw.style.display = 'none'; sw.style.opacity = ''; }
      });
    } else {
      sw.style.display = 'none';
    }
  }

  // Apply theme on load (respect stored manual override)
  const override = localStorage.getItem('aye-theme-override');
  setTheme(override || getAutoTheme(), !!override);

  // ── Easter Egg: Triple-click logo ───────────────────────────────
  // Wait a tick for nav HTML to be in the DOM
  setTimeout(() => {
    const logo = document.getElementById('nav-logo');
    if (!logo) return;

    let clickCount = 0, clickTimer;

    logo.addEventListener('click', (e) => {
      e.preventDefault(); // Always intercept — navigate manually after delay
      clickCount++;
      clearTimeout(clickTimer);

      if (clickCount >= 3) {
        clickCount = 0;
        showSwitcher();
        return;
      }

      // Single click navigates after 300ms (window to detect triple-click)
      clickTimer = setTimeout(() => {
        if (clickCount === 1) window.location.href = base + 'index.html';
        clickCount = 0;
      }, 300);
    });
  }, 0);

  // ── GSAP Animations (runs after DOM is ready) ───────────────────
  window.addEventListener('DOMContentLoaded', () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Nav slides down on every page
    gsap.from('nav', {
      y: -70, opacity: 0, duration: 0.7, ease: 'power3.out'
    });

    // Cards stagger up on scroll (homepage and any page with .gsap-fade)
    const cards = document.querySelectorAll('.gsap-fade');
    if (cards.length) {
      gsap.from(cards, {
        scrollTrigger: { trigger: cards[0], start: 'top 88%' },
        opacity: 0, y: 48, duration: 0.6, stagger: 0.1, ease: 'power2.out'
      });
    }

    // About box
    const aboutBox = document.querySelector('.about-box');
    if (aboutBox) {
      gsap.from(aboutBox, {
        scrollTrigger: { trigger: aboutBox, start: 'top 88%' },
        opacity: 0, y: 40, duration: 0.65, ease: 'power3.out'
      });
    }

    // Footer
    gsap.from('footer', {
      scrollTrigger: { trigger: 'footer', start: 'top 95%' },
      opacity: 0, duration: 0.5, ease: 'power1.out'
    });

    // RPR glow orbs
    if (document.getElementById('glow-cyan')) {
      gsap.to('#glow-cyan', { y: 40, x: -25, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      gsap.to('#glow-purple', { y: -35, x: 20, duration: 6.5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });
    }

    // Post page: prose fades in
    const prose = document.querySelector('.prose');
    if (prose) {
      gsap.from(prose, { opacity: 0, y: 30, duration: 0.7, ease: 'power2.out', delay: 0.3 });
    }
  });

  // ── Expose public API ───────────────────────────────────────────
  window.AYE = { setTheme, getAutoTheme, showSwitcher, hideSwitcher };

})();
