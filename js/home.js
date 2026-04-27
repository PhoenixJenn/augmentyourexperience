/* ================================================================
   home.js — homepage only
   Handles: fetching posts.json, rendering post grid, tag filtering,
            hero animations
   ================================================================ */

(function () {

  // ── Render the post feed from posts.json ───────────────────────
  function loadPosts() {
    const data = window.POSTS_DATA;
    if (!data) { console.warn('POSTS_DATA not loaded'); return; }

    const posts = data.posts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3); // Homepage shows 3 most recent posts
    const grid = document.getElementById('post-grid');
    const tagFilter = document.getElementById('tag-filter');
    if (!grid) return;

    // Collect all unique tags across all posts
    const allTags = [...new Set(posts.flatMap(p => p.tags))].sort();

    // Build tag filter buttons
    if (tagFilter) {
      const allBtn = document.createElement('button');
      allBtn.className = 'tag-btn active';
      allBtn.textContent = 'All';
      allBtn.dataset.tag = 'all';
      tagFilter.appendChild(allBtn);

      allTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-btn';
        btn.textContent = tag;
        btn.dataset.tag = tag;
        tagFilter.appendChild(btn);
      });

      tagFilter.addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-btn');
        if (!btn) return;
        document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterCards(btn.dataset.tag);
      });
    }

    // Render cards
    posts.forEach((post, i) => {
      // First post is always the featured full-width card
      const card = buildCard(post, i === 0);
      grid.appendChild(card);
    });

    // Animate cards in on load — no ScrollTrigger to avoid stuck opacity:0
    if (window.gsap) {
      gsap.from('.gsap-fade', {
        opacity: 0, y: 30, duration: 0.5, stagger: 0.08,
        ease: 'power2.out', clearProps: 'transform,opacity'
      });
    }
  }

  function buildCard(post, featured) {
    const div = document.createElement('div');
    div.className = 'card gsap-fade' + (featured ? ' card-featured' : '');
    div.dataset.tags = JSON.stringify(post.tags);

    const date = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const imgPos = post.imagePosition ?? 'center center';
    const cardSrc = post.cardImage !== undefined ? post.cardImage : post.image;
    const imgHTML = cardSrc
      ? `<div class="card-img"><img src="${cardSrc}" alt="${post.title}" loading="lazy" style="object-position:${imgPos};"></div>`
      : (featured ? `<div class="card-img"></div>` : '');

    div.innerHTML = `
      ${imgHTML}
      <div class="card-body">
        <div class="card-meta-row">
          <span class="card-tag">${post.tags[0] ?? ''}</span>
          ${post.readTime ? `<span class="card-pill">${post.readTime} min read</span>` : ''}
        </div>
        <h3 class="card-title">${post.title}</h3>
        <p class="card-excerpt">${post.excerpt}</p>
        <div class="card-footer">
          <span class="card-date">${date}</span>
          <a href="${post.slug}" class="card-read">Read →</a>
        </div>
      </div>`;

    return div;
  }

  function filterCards(tag) {
    document.querySelectorAll('#post-grid .card').forEach(card => {
      if (tag === 'all') {
        card.classList.remove('hidden');
        return;
      }
      const tags = JSON.parse(card.dataset.tags ?? '[]');
      card.classList.toggle('hidden', !tags.includes(tag));
    });
  }

  // ── Hero animations ────────────────────────────────────────────
  function initHeroAnimations() {
    if (!window.gsap) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const tl = gsap.timeline({ delay: 0.3 });

    tl.from('#hero-tag',      { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out' })
      .from('#hero-h1 .line', { y: '105%', opacity: 0, duration: 0.65, stagger: 0.12, ease: 'power3.out' }, '-=0.2')
      .from('#hero-sub',      { opacity: 0, y: 20, duration: 0.55, ease: 'power2.out' }, '-=0.3')
      .from('#hero-btns .btn',{ opacity: 0, y: 16, duration: 0.45, stagger: 0.1, ease: 'power2.out', clearProps: 'all' }, '-=0.3')
      .from('#hero-photo',    { opacity: 0, x: 50, duration: 0.7, ease: 'power3.out' }, '-=0.7');

    // Section header fade
    gsap.from('.section-header', {
      scrollTrigger: { trigger: '.section-header', start: 'top 88%' },
      opacity: 0, y: 24, duration: 0.55, ease: 'power2.out'
    });
  }

  // ── Init ───────────────────────────────────────────────────────
  window.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    initHeroAnimations();
  });

})();
