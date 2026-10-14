const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],R=matchMedia('(prefers-reduced-motion:reduce)').matches;
const go=p=>false?(location.hash='#/'+p):(location.href=p=='home'?'/':'/'+p);

/* ── Common Footer (Web Component) ───────────────────── */
class SiteFooter extends HTMLElement{
  connectedCallback(){
    this.innerHTML=`<footer>
<div class="footer-inner">
  <div class="footer-col">
    <a class="footer-brand" href="/">
      <img src="/assets/Fluxer%20circle%20logo%20White.svg" alt="Fluxer" class="brand-logo">
    </a>
    <p class="footer-tagline">Bigger and Practical.</p>
  </div>
  <div class="footer-col">
    <h4>Products</h4>
    <ul>
      <li><a href="/products"><span class="mf">MyFestivo</span> <span class="tag">Live</span></a></li>
    </ul>
  </div>
  <div class="footer-col">
    <h4>Services</h4>
    <ul>
      <li><a href="/services">Data Analysis</a></li>
      <li><a href="/services">Web Development</a></li>
      <li><a href="/services">ML Models</a></li>
      <li><a href="/services">Automation</a></li>
      <li><a href="/services">RAG Pipelines</a></li>
    </ul>
  </div>
  <div class="footer-col">
    <h4>Company</h4>
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/founders">Founders</a></li>
      <li><a href="/contact">Contact</a></li>
    </ul>
  </div>
</div>
<div class="footer-bar">
  <span>© 2026 Fluxer Solutions Private Limited</span>
  <span class="footer-social">
    <a href="mailto:support@fluxer.co.in" aria-label="Email us" class="footer-icon-link" title="support@fluxer.co.in">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
    </a>
    <a href="https://www.linkedin.com/company/fluxersolutions/" target="_blank" rel="noopener noreferrer" aria-label="Fluxer on LinkedIn" class="footer-icon-link" title="LinkedIn">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
    </a>
    <a href="/contact">Start a chat</a>
  </span>
</div></footer>`;
  }
}
customElements.define('site-footer',SiteFooter);


/* ── Audio helpers ────────────────────────────────────── */
const AC=window.AudioContext||window.webkitAudioContext;
let ac;
function getAC(){
  if(!ac&&AC){
    ac=new AC();
    const res = () => { if(ac.state==='suspended') ac.resume(); };
    document.addEventListener('click', res, {once:true});
    document.addEventListener('keydown', res, {once:true});
  }
  if(ac && ac.state==='suspended') ac.resume().catch(()=>{});
  return ac;
}

/** Subtle 'pop' for chat bubbles: short sine blip */
function playChatPop(){
  try{
    const ctx=getAC();if(!ctx)return;
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.connect(g);g.connect(ctx.destination);
    o.type='sine';o.frequency.setValueAtTime(520,ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(260,ctx.currentTime+0.08);
    g.gain.setValueAtTime(0.12,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.12);
    o.start();o.stop(ctx.currentTime+0.13);
  }catch(e){}
}

/** Typewriter key click for a single character */
function playKeyClick(){
  try{
    const ctx=getAC();if(!ctx)return;
    const buf=ctx.createBuffer(1,ctx.sampleRate*0.04,ctx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,6)*0.35;
    const src=ctx.createBufferSource(),g=ctx.createGain();
    src.buffer=buf;src.connect(g);g.connect(ctx.destination);
    g.gain.setValueAtTime(0.55,ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.04);
    src.start();
  }catch(e){}
}

/* ── Chat Thread Persistence ──────────────────────────── */
if ((performance.getEntriesByType("navigation")[0] && performance.getEntriesByType("navigation")[0].type === 'reload') ||
    (performance.navigation && performance.navigation.type === 1)) {
  sessionStorage.removeItem('wz_thread');
  sessionStorage.removeItem('wz_hero_done');
}

const threadStore = {
  get: () => {
    try { return JSON.parse(sessionStorage.getItem('wz_thread')) || []; }
    catch(e) { return []; }
  },
  add: (t, me) => {
    const list = threadStore.get();
    list.push({t, me});
    sessionStorage.setItem('wz_thread', JSON.stringify(list));
  },
  restore: () => {
    const box = $('#thread');
    if(!box) return false;
    const list = threadStore.get();
    if(list.length === 0) return false;
    
    $$('[data-p=home] .seq').forEach(e => {
       e.classList.add('in');
       e.style.transition = 'none';
    });
    
    list.forEach(msg => {
      const d = document.createElement('div');
      d.className = 'b' + (msg.me ? ' me' : '');
      d.textContent = msg.t;
      box.append(d);
    });
    return true;
  }
};

function say(t,me,box,sfx,skipSave){
  const d=document.createElement('div');
  d.className='b pop'+(me?' me':'');
  d.textContent=t;
  box.append(d);
  if(sfx&&!R) playChatPop();
  if(!skipSave && box.id==='thread') threadStore.add(t, me);
}

let hd=0;
function hero(){
  const s=$$('[data-p=home] .seq');
  if(hd||!s.length)return;hd=1;
  const restored = threadStore.restore();
  // If thread was restored (user interacted before), skip animation
  if(R || restored)return s.forEach(e=>e.classList.add('in'));
  // If we already ran the intro this session (user navigated away and back
  // without interacting), skip straight to final state — don't replay
  if(sessionStorage.getItem('wz_hero_done'))return s.forEach(e=>e.classList.add('in'));
  // First visit this session — run the animation and mark it done
  sessionStorage.setItem('wz_hero_done','1');
  s.forEach((e,i)=>setTimeout(()=>{
    if(e.id=='q'){
      const t=document.createElement('div');t.className='b typing pop';
      t.innerHTML='<i></i><i></i><i></i>';e.before(t);
      setTimeout(()=>{t.remove();e.classList.add('in');if(!R)playChatPop()},750);
    } else {
      e.classList.add('in');
      if(!R&&e.classList.contains('b'))playChatPop();
    }
  },300+i*700+(e.id=='chips'?750:0)));
}

/* ── Contact page typewriter effect ──────────────────── */
function initTypewriter(){
  const ta=$('#ms');
  if(!ta)return;
  // play key clicks on typing inside the message textarea
  ta.addEventListener('keydown',()=>{if(!R)playKeyClick()});
  // also wire name + email inputs for feel
  $$('.pg[data-p=contact] input').forEach(inp=>{
    inp.addEventListener('keydown',()=>{if(!R)playKeyClick()});
  });
}

/* ── MyFestivo brand wrapper ───────────────────────────── */
/* Walk every text node in <body> and wrap bare "MyFestivo"
   occurrences in <span class="mf"> so CSS can lock the casing. */
function wrapMyFestivo(){
  const WORD='MyFestivo';
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
    acceptNode(node){
      // skip script/style/already-wrapped spans
      const p=node.parentElement;
      if(p&&(p.tagName==='SCRIPT'||p.tagName==='STYLE'))return NodeFilter.FILTER_REJECT;
      if(p&&p.classList.contains('mf'))return NodeFilter.FILTER_REJECT;
      // skip nodes already inside a .g gradient span — they render correctly as gradient text
      if(p&&p.classList.contains('g'))return NodeFilter.FILTER_REJECT;
      return node.textContent.includes(WORD)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;
    }
  });
  const hits=[];
  let n;while((n=walker.nextNode()))hits.push(n);
  hits.forEach(node=>{
    const parts=node.textContent.split(WORD);
    if(parts.length<2)return;
    const frag=document.createDocumentFragment();
    parts.forEach((part,i)=>{
      if(part)frag.appendChild(document.createTextNode(part));
      if(i<parts.length-1){
        const sp=document.createElement('span');
        sp.className='mf';sp.textContent=WORD;
        frag.appendChild(sp);
      }
    });
    node.parentNode.replaceChild(frag,node);
  });
}

/* ── Services page: open accordion from URL hash ─────── */
/* Hash format: /services#data-analysis  (summary text lowercased, spaces→hyphens) */
function initServices(){
  const pg=$('[data-p=services]');
  if(!pg)return;
  const hash=location.hash.slice(1); // e.g. "data-analysis"
  if(!hash)return;
  $$('[data-p=services] details').forEach(d=>{
    const key=d.querySelector('summary').textContent.trim().toLowerCase().replace(/\s+/g,'-');
    if(key===hash){
      d.open=true;
      // Scroll to it after layout settles
      setTimeout(()=>d.scrollIntoView({behavior:'smooth',block:'start'}),200);
    }
  });
}

/* ── Hamburger nav toggle ──────────────────────────────── */
function initHamburger(){
  const btn=$('#nav-toggle');
  const nav=$('#main-nav');
  if(!btn||!nav)return;

  // Ensure backdrop overlay element exists
  let overlay=$('#nav-overlay');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='nav-overlay';
    document.body.appendChild(overlay);
  }

  let _scrollY=0;
  function setOpen(isOpen){
    nav.classList.toggle('open',isOpen);
    btn.setAttribute('aria-expanded',isOpen?'true':'false');
    btn.setAttribute('aria-label',isOpen?'Close navigation menu':'Open navigation menu');
    overlay.classList.toggle('active',isOpen);
    if(isOpen){
      _scrollY=window.scrollY;
      document.documentElement.classList.add('nav-open');
      document.body.style.cssText=`position:fixed;top:-${_scrollY}px;left:0;right:0;overflow-y:scroll;`;
    } else {
      document.documentElement.classList.remove('nav-open');
      // Suppress smooth-scroll BEFORE releasing the fixed-body lock.
      // Without this, scrollTo(0, _scrollY) animates from 0→_scrollY visibly (the bounce).
      document.documentElement.style.scrollBehavior='auto';
      document.body.style.cssText='';
      window.scrollTo(0,_scrollY);
      // Restore smooth scroll after the position has been applied.
      requestAnimationFrame(()=>{
        document.documentElement.style.scrollBehavior='';
      });
    }
  }

  btn.onclick=(e)=>{
    e.stopPropagation();
    const isOpen=!nav.classList.contains('open');
    setOpen(isOpen);
  };

  // Close when tapping the overlay backdrop
  overlay.addEventListener('click',()=>setOpen(false));

  // Close when any nav link is clicked
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    setOpen(false);
  }));

  // Keyboard accessibility: Close on Escape key
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&nav.classList.contains('open')){
      setOpen(false);
      btn.focus();
    }
  });

  // Close on outside tap if clicked outside nav and toggle button
  document.addEventListener('click',e=>{
    if(nav.classList.contains('open')&&!btn.contains(e.target)&&!nav.contains(e.target)){
      setOpen(false);
    }
  });
}

function init(){
  wrapMyFestivo();

  $$('.pg>*:not(.seq)').forEach((e,i)=>e.style.animationDelay=Math.min(i,6)*70+'ms');
  $$('[data-say]').forEach(c=>c.onclick=()=>{
    say(c.dataset.say,1,$('#thread'),true);
    setTimeout(()=>{
      say(c.dataset.re,0,$('#thread'),true);
      if(c.dataset.go){
        const slug=c.dataset.slug||'';
        // Wait ~2s after the bot reply appears so the user can read it
        setTimeout(()=>{
          const dest=c.dataset.go==='home'?'/':`/${c.dataset.go}`+(slug?`#${slug}`:'');
          location.href=dest;
        },1250);
      }
    },500);
  });
  $$('[role=tab]').forEach(t=>t.onclick=()=>$$('[role=tab]').forEach(x=>{
    const on=x==t;x.setAttribute('aria-selected',on);$('#'+x.dataset.p).hidden=!on;
  }));
  // ── Contact form: validation + abuse filter + clear on send ────────
  const ABUSIVE_WORDS = [
    'fuck','shit','bitch','asshole','bastard','cunt','dick','pussy','cock',
    'whore','slut','nigger','nigga','faggot','retard','damn','hell','crap',
    'piss','ass','motherfucker','bullshit','jackass','dumbass','idiot',
    'moron','imbecile','stupid','loser','scum','jerk','twat','wanker'
  ];

  function wordCount(str){
    return str.trim().split(/\s+/).filter(w=>w.length>0).length;
  }

  function hasAbusiveWords(str){
    const lower=str.toLowerCase();
    return ABUSIVE_WORDS.some(w=>new RegExp('\\b'+w+'\\b','i').test(lower));
  }

  function showFormError(msg){
    let err=$('#f-error');
    if(!err){
      err=document.createElement('p');
      err.id='f-error';
      err.style.cssText='color:#ff6b6b;font-size:.875rem;margin:.5rem 0 0;font-weight:500;';
      const btn=$('#f .btn[type=submit]');
      if(btn) btn.before(err);
    }
    err.textContent=msg;
    err.style.display='block';
  }

  function clearFormError(){
    const err=$('#f-error');
    if(err) err.style.display='none';
  }

  const WEB3FORMS_KEY = '570b8caf-778b-4c2a-a9be-1a3b56700fce'; // ← replace after signing up at web3forms.com

  const f=$('#f');
  if(f)f.onsubmit=e=>{
    e.preventDefault();
    const msgEl=$('#ms');
    const nmEl=$('#nm');
    const emEl=$('#em');
    const selEl=f.querySelector('select');
    const submitBtn=f.querySelector('.btn[type=submit]');
    const msgText=msgEl.value.trim();
    const wc=wordCount(msgText);

    // Word count validation
    if(wc<15){
      showFormError(`Message is too short (${wc} word${wc===1?'':'s'}). Please write at least 15 words.`);
      msgEl.focus();
      return;
    }
    if(wc>150){
      showFormError(`Message is too long (${wc} words). Please keep it under 150 words.`);
      msgEl.focus();
      return;
    }

    // Abusive language filter
    if(hasAbusiveWords(msgText)){
      showFormError('Please keep your message respectful. Remove any offensive language and try again.');
      msgEl.focus();
      return;
    }

    clearFormError();

    const n=nmEl.value.trim().split(' ')[0];
    const bx=$('#done');

    // Show user's message as chat bubble immediately
    say(msgText,1,bx,true);
    f.hidden=true;
    if(submitBtn) submitBtn.disabled=true;

    // POST to Web3Forms → delivers to support@fluxer.co.in
    fetch('https://api.web3forms.com/submit',{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `[Fluxer.co.in] ${selEl?selEl.value:'New message'} — from ${nmEl.value.trim()}`,
        from_name: nmEl.value.trim(),
        email: emEl.value.trim(),
        replyto: emEl.value.trim(),
        message: msgText,
        topic: selEl?selEl.value:'',
        botcheck: (document.getElementById('botcheck')||{}).checked||false
      })
    })
    .then(r=>r.json())
    .then(data=>{
      setTimeout(()=>{
        if(data.success){
          say('Thanks'+(n?', '+n:'')+'. We got your message and will reply soon.',0,bx,true);
        } else {
          say('Something went wrong sending your message. Please email us directly at support@fluxer.co.in.',0,bx,true);
          f.hidden=false;
        }
        if(submitBtn) submitBtn.disabled=false;
      },700);
    })
    .catch(()=>{
      setTimeout(()=>{
        say('Could not send your message right now. Please email us at support@fluxer.co.in.',0,bx,true);
        f.hidden=false;
        if(submitBtn) submitBtn.disabled=false;
      },700);
    });

    // Clear all fields
    f.reset();

    // Re-show form after a short delay
    setTimeout(()=>{
      bx.innerHTML='';
      f.hidden=false;
    },5500);
  };
  initTypewriter();
  initServices();
  initHamburger();
}
// TODO: wire the contact form to email or a backend (Formspree, Resend) before launch.
if(false){const show=()=>{const p=location.hash.slice(2)||'home';$$('.pg').forEach(x=>x.hidden=x.dataset.p!=p);$$('nav a').forEach(a=>a.toggleAttribute('aria-current',a.dataset.p==p));scrollTo(0,0);$$('.pg:not([hidden])>*:not(.seq)').forEach((e,i)=>{e.style.animation='none';e.offsetWidth;e.style.animation='';e.style.animationDelay=Math.min(i,6)*70+'ms'});if(p=='home')hero()};init();addEventListener('hashchange',show);show()}else{init();hero()}