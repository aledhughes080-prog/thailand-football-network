/* ============================================================
   PLAYER VOICES — player review cards on the homepage
   Players who have made the move share their experience of playing
   professionally in Asia. Each player gets a card (photo, details and
   five questions & answers that open one at a time).

   To add a player: copy one entry in PLAYERS below, change the details,
   add their photo to assets/, and keep the same five questions.
   Optional: photoPosition (how the photo is cropped), photoCaption (if the
   photo shows a different club from their current one), playedIn.
   Age is worked out from `dob`, so it stays correct every year.
   ============================================================ */
(function () {
  'use strict';

  const PLAYERS = [
    {
      name: 'Vincent Boesen',
      dob: '1998-09-23',
      nationality: 'German',
      position: 'Centre forward',
      team: 'Samui United FC',
      league: 'Thai League 3',
      photo: 'assets/vincent-boesen.jpg',
      photoAlt: 'Vincent Boesen running with the ball in a white Samui United kit',
      playedIn: 'Thailand',
      previously: 'Eintracht Trier, Alemannia Aachen, Rot-Weiss Oberhausen',
      answers: [
        'The connection came through a German coach who had previously tried to bring me to Thailand, two years ago. I wanted to have a completely new experience and grow as a person, far away from home.',
        'It’s difficult to compare football here with that in Europe. For example the weather, the pitches, away trips, the food before the matches. You have to adapt, but I’m very happy to be playing for Samui. The club’s facilities are definitely top-tier. I actually spend most of my time with Tommy and Eman, which makes things a lot easier for me.',
        'For me personally, moving to Thailand was definitely the best decision I’ve made so far. I’m very happy here, the quality of life on Samui is incredible. To be honest, I’d imagined it would be more difficult. My highlights so far have definitely been our home matches, the cup match against Chainat on my birthday – when I also scored – and our trip to Bangkok for a cup match.',
        'Absolutely, especially for players who feel they’ve been stuck in a situation where they can’t progress any higher in their country or league. I felt the same way and would now like to take this opportunity, as I feel that my style of play could make me an interesting player here.',
        'If you get the chance, go for it! Even if I had to leave Thailand again tomorrow, I can say it was the best decision of my life!'
      ]
    },
    {
      name: 'Marko Ivanović',
      dob: '1995-06-30',
      nationality: 'Montenegrin',
      position: 'Centre back',
      team: 'Club Eagles',
      league: 'Dhivehi Premier League, Maldives',
      photo: 'assets/marko-ivanovic.jpg',
      photoPosition: 'center 15%',
      photoCaption: 'Gresik United · Indonesia',
      photoAlt: 'Marko Ivanović in a yellow Gresik United kit',
      playedIn: 'Maldives, Cambodia, Nepal, Bhutan, Indonesia',
      previously: 'Paro FC (Bhutan), PSIS Semarang (Indonesia), Swieqi United (Malta)',
      answers: [
        'I was playing for many years in Malta, and I was looking to move on. I was really interested in moving to Asia, so I started contacting agents to try to get something. My first move in Asia was actually to Mongolia, with champions FC Ulaanbaatar City, but because of COVID I never travelled there. A couple of months later I got the opportunity to play in the Maldives Premier League and I took it. It definitely wasn’t easy: a new culture and a new view on football, but I adapted quickly. After that I continued my journey in Asia in Cambodia, Nepal, Bhutan and Indonesia.',
        'As a foreigner in Asia, you have more responsibility and more pressure. In most countries the foreign-player quota is limited, so you need to show and prove every day that you deserve to be there. The level of football can’t really be described, because it’s a totally different style from what we are used to in Europe. The tactical approach, tempo, positioning, defensive organisation and decision-making are not always the same as in European football. What works in Europe doesn’t necessarily work in Asia, and players need to get used to that so they can succeed and stay here for a long time if they like it. I like the lifestyle here, as it’s more relaxed, and the weather is definitely better than in most countries in Europe.',
        'I definitely enjoy my time in Asia. There have been many ups and downs, but overall I’m happy. My biggest highlight for sure was playing in the AFC Challenge League with Paro FC, the first time in the history of the club, and of the country as well.',
        'Yes. But I would definitely explain the advantages and disadvantages, because it’s important that players have at least some idea of where they are going. I think this is really important.',
        'Come with an open mind and be ready to adapt. The football culture, tactics and the way the game is played can be very different from Europe, so don’t expect everything to work the same way. Show respect for the local players, the culture and the country that welcomes you. Support your teammates, share your experience, and understand that you are not here just to make yourself better, but to help everyone around you improve. And one last thing: the memories you create, the people you meet and the experiences you gain along the way are treasures that football will give you long after your career is over.'
      ]
    }
  ];

  // The same five questions are asked of every player.
  const QUESTIONS = [
    ['How did your move to Asia come about?', 'The opportunity, how they found the club, and what made them take the leap.'],
    ['What’s life really like as a foreign footballer in Asia?', 'The football, the standard of the league, lifestyle, culture and routine.'],
    ['Are you enjoying it, and has it lived up to your expectations?', 'Plus the biggest highlight so far.'],
    ['Would you recommend playing football in Asia to other players?', ''],
    ['What advice would you give a player considering the move?', '']
  ];

  const root = document.getElementById('player-voices');
  if (!root) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const age = (dob) => {
    const b = new Date(dob + 'T00:00:00'), t = new Date();
    let a = t.getFullYear() - b.getFullYear();
    if (t.getMonth() < b.getMonth() || (t.getMonth() === b.getMonth() && t.getDate() < b.getDate())) a--;
    return a;
  };

  const card = (p, i) => `
    <article class="voice-card" aria-label="${esc(p.name)}">
      <figure class="voice-photo"><img src="${esc(p.photo)}" alt="${esc(p.photoAlt)}" loading="lazy"${p.photoPosition ? ` style="object-position:${esc(p.photoPosition)}"` : ''}><figcaption>${esc(p.photoCaption || p.team)}</figcaption></figure>
      <div class="voice-body">
        <div class="voice-kicker">Player story ${String(i + 1).padStart(2, '0')}</div>
        <h3>${esc(p.name)}</h3>
        <dl class="voice-facts">
          <div><dt>Age</dt><dd>${age(p.dob)}</dd></div>
          <div><dt>Nationality</dt><dd>${esc(p.nationality)}</dd></div>
          <div><dt>Position</dt><dd>${esc(p.position)}</dd></div>
          <div><dt>Current team</dt><dd>${esc(p.team)}${p.league ? `<small>${esc(p.league)}</small>` : ''}</dd></div>
        </dl>
        ${p.playedIn ? `<p class="voice-played"><span>Played in Asia</span>${p.playedIn.split(/,\s*/).map((c) => `<b>${esc(c)}</b>`).join('')}</p>` : ''}
        ${p.previously ? `<p class="voice-prev">Previously: ${esc(p.previously)}</p>` : ''}
        <div class="voice-qa">
          ${QUESTIONS.map(([q, hint], n) => `
            <details${n === 0 ? ' open class="is-open"' : ''}>
              <summary><span>${String(n + 1).padStart(2, '0')}</span>${esc(q)}</summary>
              <div class="voice-ans">
                ${hint ? `<p class="voice-hint">${esc(hint)}</p>` : ''}
                <blockquote>“${esc(p.answers[n])}”</blockquote>
              </div>
            </details>`).join('')}
        </div>
      </div>
    </article>`;

  const next = `
    <article class="voice-card voice-next">
      <div>
        <div class="voice-kicker">More stories coming</div>
        <h3>Played in Asia?<br><em>Share your story.</em></h3>
        <p>We’re collecting honest accounts from players who have made the move, to help the next player decide.</p>
        <button type="button" class="btn ghost" data-open="General Enquiry">Get in touch <span class="arrow">↗</span></button>
      </div>
    </article>`;

  root.innerHTML = `
    <div class="voices-head">
      <div>
        <div class="hero-kicker eyebrow"><span class="kicker-rule"></span> PLAYER VOICES</div>
        <h2>Life in Asia, <em>in their words.</em></h2>
      </div>
      <div class="voices-nav">
        <button type="button" class="voices-arrow" data-dir="-1" aria-label="Previous player">←</button>
        <button type="button" class="voices-arrow" data-dir="1" aria-label="Next player">→</button>
      </div>
    </div>
    <div class="voices-track" tabindex="0" aria-label="Player stories, scroll sideways for more">
      ${PLAYERS.map(card).join('')}${next}
    </div>`;

  const track = root.querySelector('.voices-track');
  const arrows = root.querySelectorAll('.voices-arrow');
  const step = () => (track.querySelector('.voice-card') || {}).offsetWidth + 16 || 300;
  arrows.forEach((b) => b.addEventListener('click', () => track.scrollBy({ left: step() * Number(b.dataset.dir), behavior: 'smooth' })));
  const update = () => {
    arrows[0].disabled = track.scrollLeft <= 4;
    arrows[1].disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  };
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  // Answers slide open and closed smoothly. Only one answer is open at a
  // time per card, so opening a question slides the previous one shut.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function slide(d, open) {
    const body = d.querySelector('.voice-ans');
    // Start from the answer's current height, so a click mid-slide reverses smoothly.
    const from = d.open ? body.getBoundingClientRect().height : 0;
    if (d._slide) d._slide.cancel();
    d.open = true; // must be open to measure the full height
    d.classList.toggle('is-open', open); // turns the + into a − straight away
    if (reduceMotion) { d.open = open; return; }
    const to = open ? body.scrollHeight : 0;
    const anim = body.animate(
      [{ height: from + 'px', opacity: open && !from ? 0 : 1 }, { height: to + 'px', opacity: open ? 1 : 0 }],
      // A closing answer holds at zero height until it is hidden, so it never flashes back open.
      { duration: open ? 380 : 280, easing: 'cubic-bezier(.25,.8,.25,1)', fill: open ? 'none' : 'forwards' }
    );
    d._slide = anim;
    anim.onfinish = () => { d._slide = null; if (!open) { d.open = false; anim.cancel(); } };
  }
  root.querySelectorAll('.voice-qa').forEach((qa) => qa.addEventListener('click', (e) => {
    const summary = e.target.closest('summary');
    if (!summary || !qa.contains(summary)) return;
    e.preventDefault(); // we open/close it ourselves so it can slide
    const d = summary.parentElement;
    const opening = !d.classList.contains('is-open');
    if (opening) qa.querySelectorAll('details.is-open').forEach((o) => { if (o !== d) slide(o, false); });
    slide(d, opening);
  }));
})();
