/* ================================================================
   posts.js — /posts.html archive page only
   Handles: fetching posts.json, rendering ALL posts, tag filtering
   ================================================================ */

(function () {

  function loadPosts() {
    const data = window.POSTS_DATA;
    if (!data) { console.warn('POSTS_DATA not loaded'); return; }

    const posts = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const grid = document.getElementById('post-grid');
    const tagFilter = document.getElementById('tag-filter');
    const countEl = document.getElementById('post-count');
    if (!grid) return;

    // Collect all unique tags across ALL posts
    const allTags = new Set(posts.flatMap(p => p.tags));

    // Spatial technology tags — fixed order, shown on a second row
    const SPATIAL_TAGS = ['Spatial Computing', '3D Capture & Create', 'AR', 'VR', 'XR', 'Apple Vision Pro', 'Smart Glasses'];
    const spatialTags = SPATIAL_TAGS.filter(t => allTags.has(t));

    // Conference/event tags — fixed order, shown on a third row
    const EVENT_TAGS = ['Conferences, Events and Experiences', 'CES', 'SXSW', 'AWE', 'Apple WWDC', 'Women Impact Tech'];
    const eventTags = EVENT_TAGS.filter(t => allTags.has(t));

    const parentTags = new Set([...SPATIAL_TAGS, ...EVENT_TAGS]);
    const topicTags = [...allTags].filter(t => !parentTags.has(t)).sort();

    // Build tag filter
    if (tagFilter) {
      const allBtn = document.createElement('button');
      allBtn.className = 'tag-btn active';
      allBtn.textContent = 'All';
      allBtn.dataset.tag = 'all';
      tagFilter.appendChild(allBtn);

      // Row 1 — remaining topic tags, alphabetical
      topicTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-btn';
        btn.textContent = tag;
        btn.dataset.tag = tag;
        tagFilter.appendChild(btn);
      });

      // Force line break before spatial tags
      const spatialBreak = document.createElement('div');
      spatialBreak.style.cssText = 'width:100%;height:0;flex-basis:100%;';
      tagFilter.appendChild(spatialBreak);

      // Row 2 — spatial technology tags, fixed order
      spatialTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'tag-btn';
        btn.textContent = tag;
        btn.dataset.tag = tag;
        tagFilter.appendChild(btn);
      });

      // Force line break before conference/event tags
      const eventBreak = document.createElement('div');
      eventBreak.style.cssText = 'width:100%;height:0;flex-basis:100%;';
      tagFilter.appendChild(eventBreak);

      // Row 3 — conference/event tags, fixed order
      eventTags.forEach(tag => {
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
        filterCards(btn.dataset.tag, countEl, posts.length);
      });
    }

    // Render ALL posts — no featured treatment, clean grid
    posts.forEach(post => {
      grid.appendChild(buildCard(post));
    });

    if (countEl) countEl.textContent = `${posts.length} posts`;

    // Animate cards in — no ScrollTrigger so they're never stuck at opacity:0
    if (window.gsap) {
      gsap.from('.gsap-fade', {
        opacity: 0, y: 30, duration: 0.45, stagger: 0.03,
        ease: 'power2.out', clearProps: 'transform,opacity'
      });
    }
  }

  function buildCard(post) {
    const div = document.createElement('div');
    div.className = 'card gsap-fade';
    div.dataset.tags = JSON.stringify(post.tags);

    const date = new Date(post.date).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const imgPos = post.imagePosition ?? 'center center';
    const cardSrc = post.cardImage !== undefined ? post.cardImage : post.image;
    const imgHTML = cardSrc
      ? `<div class="card-img"><img src="${cardSrc}" alt="${post.title}" loading="lazy" style="object-position:${imgPos};"></div>`
      : '';

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

  function filterCards(tag, countEl, total) {
    let visible = 0;
    document.querySelectorAll('#post-grid .card').forEach(card => {
      if (tag === 'all') {
        card.classList.remove('hidden');
        visible++;
      } else {
        const tags = JSON.parse(card.dataset.tags ?? '[]');
        const show = tags.includes(tag);
        card.classList.toggle('hidden', !show);
        if (show) visible++;
      }
    });
    if (countEl) {
      countEl.textContent = tag === 'all'
        ? `${total} posts`
        : `${visible} post${visible !== 1 ? 's' : ''} tagged "${tag}"`;
    }
  }

  window.addEventListener('DOMContentLoaded', loadPosts);

})();
