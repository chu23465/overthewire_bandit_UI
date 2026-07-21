/* ---------- 1. EXTRACT ORIGINAL CONTENT (works with any level, no manual edits) ---------- */
    const levelMatch = location.pathname.match(/bandit(\d+)\.html/);
    const IS_INDEX = !levelMatch;
    const LEVEL = levelMatch ? parseInt(levelMatch[1]) : null;
    const MAX_LEVEL = 34;
    let GITHUB = true;
    if (GITHUB === true) {
        document.head.innerHTML.replaceAll("https://overthewire.org", "https://cdn.jsdelivr.net/gh/chu23465/overthewire_bandit_UI");
    }
    /* grab sidemenu level links before wiping the page (present on index + level pages) */
    const sideLinks = [...document.querySelectorAll('a[href*="bandit"]')]
        .filter(a => /bandit\d+\.html$/.test(a.getAttribute('href') || ''))
        .reduce((map, a) => {
            const n = parseInt(a.getAttribute('href').match(/bandit(\d+)\.html/)[1]);
            if (!(n in map)) map[n] = a.getAttribute('href');
            return map;
        }, {});

    const origH2s = [...document.querySelectorAll('h1,h2,h3,h4')];

    function sectionAfter(heading) {
        const h = origH2s.find(h => h.textContent.trim().toLowerCase() === heading);
        if (!h) return null;
        let out = [],
            n = h.nextElementSibling;
        while (n && !/^H[1-4]$/.test(n.tagName)) {
            out.push(n);
            n = n.nextElementSibling;
        }
        return out;
    }

    function sectionContaining(partial) {
        const h = origH2s.find(h => h.textContent.trim().toLowerCase().includes(partial));
        if (!h) return null;
        let out = [],
            n = h.nextElementSibling;
        while (n && !/^H[1-4]$/.test(n.tagName)) {
            out.push(n);
            n = n.nextElementSibling;
        }
        return out;
    }
    const goalNodes = sectionAfter('level goal');
    const cmdNodes = sectionAfter('commands you may need to solve this level');
    const readNodes = sectionAfter('helpful reading material');
    const beginnerHTML = `
<p>This game is organized in levels. You start at Level 0 and try to "beat" it. Finishing a level results in info to beat the next consecutive level. Access points for all the levels are linked below this page.</p>
<p>You will encounter many situations in which you have no idea what you are supposed to do. Don't panic! Don't give up! The purpose of this game is for you to learn the basics. Part of learning the basics, is reading a lot of new information. If you've never used the command line before, a good first read is this <a href="https://manpages.ubuntu.com/manpages/noble/man1/intro.1.html" target="_blank">introduction to user commands</a>.</p>
<p>There are several things you can try when you are unsure how to continue:</p>
<ul>
<li>First, if you know a command, but don't know how to use it, try the manual (<a href="https://en.wikipedia.org/wiki/Man_page" target="_blank">man page</a>) by entering man &lt;command&gt;. For example, "man ls" to learn about the "ls" command. The "man" command also has a manual, try it! When using man, press <code>q</code> to quit (you can also use <code>/</code> and <code>n</code> and <code>N</code> to search).</li>
<li>Second, if there is no man page, the command might be a shell built-in. In that case use the "help &lt;X&gt;" command. E.g. "help cd".</li>
<li>Also, your favorite search-engine is your friend. Learn how to use it! but using ai will result in termination.</li>
</ul>
<p>You're ready to start! Good luck!</p>
<p><b>Note for VMs:</b> You may fail to connect to overthewire.org via SSH with a "broken pipe error" when the network adapter for the VM is configured to use NAT mode. Adding the setting <code>IPQoS throughput</code> to <code>/etc/ssh/ssh_config</code> should resolve the issue. If this does not solve your issue, the only option then is to change the adapter to Bridged mode.</p>`;

    const goalHTML = goalNodes ? goalNodes.map(n => n.outerHTML).join('') : '';
    const cmdLinks = cmdNodes ? [...cmdNodes].flatMap(n => [...n.querySelectorAll('a')]) : [];
    const readLinks = readNodes ? [...readNodes].flatMap(n => [...n.querySelectorAll('a')]) : [];

    /* ---------- 1b. TEXT-GEN ANIMATION ENGINE (chatgpt/claude-style streaming) ---------- */
    function typeChildren(nodes, destParent, cb, speed, cursor) {
        if (!nodes.length) {
            cb();
            return;
        }
        const [first, ...rest] = nodes;
        typeNode(first, destParent, () => {
            if (cursor) destParent.appendChild(cursor);
            typeChildren(rest, destParent, cb, speed, cursor);
        }, speed, cursor);
    }

    function typeNode(src, destParent, cb, speed, cursor) {
        if (src.nodeType === 3) {
            const text = src.textContent,
                span = document.createElement('span');
            destParent.appendChild(span);
            if (cursor) destParent.appendChild(cursor);
            let j = 0;
            (function step() {
                if (j >= text.length) {
                    cb();
                    return;
                }
                span.textContent += text[j];
                j++;
                if (cursor) destParent.appendChild(cursor);
                setTimeout(step, speed);
            })();
        } else if (src.nodeType === 1) {
            const clone = document.createElement(src.tagName);
            for (const a of src.attributes) clone.setAttribute(a.name, a.value);
            destParent.appendChild(clone);
            if (cursor) destParent.appendChild(cursor);
            typeChildren([...src.childNodes], clone, cb, speed, null);
        } else cb();
    }

    function typewriter(container, speed) {
        const original = [...container.childNodes];
        container.innerHTML = '';
        const cursor = document.createElement('span');
        cursor.className = 'gits-cursor';
        typeChildren(original, container, () => cursor.remove(), speed, cursor);
    }

    function staggerIn(selector) {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.style.animationDelay = (i * 0.01) + 's';
        });
    }
    document.head.querySelectorAll('link[rel=stylesheet]').forEach(l => l.remove());
    document.body.innerHTML = '';

    const style = document.createElement('style');
    style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
:root{--bg:#050a08;--line:#1c3a30;--neon:#00ffc8;--neon-dim:#0a8f6f;--ghost:#7fffd4;--text:#c8f5e6;--muted:#4d7d6e;}
*{box-sizing:border-box;}
html,body{background:var(--bg);color:var(--text);font-family:'Share Tech Mono',monospace;margin:0;min-height:100vh;}
canvas#gits-matrix{position:fixed;inset:0;z-index:0;opacity:.22;}
.gits-scan{position:fixed;inset:0;z-index:1;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,255,200,.03) 0,rgba(0,255,200,.03) 1px,transparent 2px,transparent 3px);}
.gits-wrap{position:relative;z-index:2;max-width:900px;margin:0 auto;padding:28px 20px 80px;}
.gits-brand{font-family:'Orbitron',sans-serif;font-weight:900;font-size:13px;letter-spacing:4px;color:var(--neon-dim);}
.gits-wrap h1{font-family:'Orbitron',sans-serif;font-weight:700;font-size:34px;color:var(--neon);text-shadow:0 0 12px var(--neon-dim);letter-spacing:2px;margin:4px 0;}
.gits-wrap h1 span{color:var(--ghost);opacity:.7;}
.gits-sub{color:var(--muted);font-size:13px;margin-bottom:14px;}
.gits-sub::before{content:"> ";color:var(--neon);}
.gits-panel{border:1px solid var(--line);background:linear-gradient(180deg,rgba(0,255,200,.03),transparent);border-radius:3px;padding:20px 22px;margin-bottom:20px;position:relative;}
.gits-panel::before{content:"";position:absolute;top:0;left:0;width:24px;height:1px;background:var(--neon);box-shadow:0 0 6px var(--neon);}
.gits-title{font-family:'Orbitron',sans-serif;font-size:14px;letter-spacing:3px;color:var(--neon);margin-bottom:14px;display:flex;gap:10px;}
.gits-title::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--line),transparent);align-self:center;}
.gits-panel p{line-height:1.8;font-size:15px;}
.gits-panel code{color:var(--neon);background:rgba(0,255,200,.08);padding:1px 6px;border-radius:2px;border:1px solid var(--line);}
.gits-panel a,.gits-panel a:visited{color:var(--ghost);}
.gits-panel a:hover{color:var(--neon);}
.gits-chips{display:flex;flex-wrap:wrap;gap:10px;}
.gits-chips a{border:1px solid var(--line);padding:8px 14px;font-size:13px;color:var(--ghost);border-radius:2px;text-decoration:none;background:rgba(0,255,200,.02);}
.gits-chips a:hover{border-color:var(--neon);color:var(--neon);box-shadow:0 0 10px rgba(0,255,200,.25);}
.gits-links a{display:block;color:var(--ghost);font-size:13px;text-decoration:none;border-bottom:1px dashed var(--neon-dim);width:max-content;margin-bottom:6px;}
.gits-links a:hover{color:var(--neon);border-bottom-color:var(--neon);}
.gits-notes{width:100%;min-height:140px;background:rgba(0,0,0,.4);border:1px solid var(--line);color:var(--text);font-family:inherit;font-size:14px;padding:14px;border-radius:2px;resize:vertical;outline:none;}
.gits-notes:focus{border-color:var(--neon);box-shadow:0 0 10px rgba(0,255,200,.15);}
.gits-foot{display:flex;justify-content:space-between;margin-top:10px;font-size:11px;color:var(--muted);}
.gits-status.saved{color:var(--neon);}
.gits-nav{display:flex;justify-content:space-between;margin-top:26px;}
.gits-nav a{border:1px solid var(--line);color:var(--muted);padding:10px 18px;font-size:12px;letter-spacing:2px;text-decoration:none;border-radius:2px;}
.gits-nav a:hover{color:var(--neon);border-color:var(--neon-dim);}
.gits-nav a.disabled{opacity:.3;pointer-events:none;}
.gits-intro p{line-height:1.8;font-size:14px;color:var(--muted);margin-bottom:10px;}
.gits-levelgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:10px;}
.gits-levelgrid a{border:1px solid var(--line);color:var(--ghost);text-decoration:none;text-align:center;padding:14px 6px;border-radius:2px;font-family:'Orbitron',sans-serif;font-size:13px;background:rgba(0,255,200,.02);}
.gits-levelgrid a:hover{border-color:var(--neon);color:var(--neon);box-shadow:0 0 10px rgba(0,255,200,.25);}
.gits-ssh{display:flex;gap:24px;flex-wrap:wrap;}
.gits-ssh div{font-size:14px;}
.gits-ssh b{color:var(--muted);font-weight:400;font-size:11px;letter-spacing:2px;display:block;margin-bottom:4px;}
.gits-ssh code{color:var(--neon);background:rgba(0,255,200,.08);padding:3px 8px;border-radius:2px;border:1px solid var(--line);}
@keyframes gits-in{0%{opacity:0;transform:translateY(10px);}100%{opacity:1;transform:translateY(0);}}
.gits-panel,.gits-nav,header{opacity:0;animation:gits-in .5s ease-out forwards;}
@keyframes gits-blink{0%,49%{opacity:1;}50%,100%{opacity:0;}}
.gits-cursor{display:inline-block;width:8px;height:1em;background:var(--neon);margin-left:2px;vertical-align:text-bottom;box-shadow:0 0 6px var(--neon);animation:gits-blink 1s step-end infinite;}
@keyframes gits-glow{0%,100%{text-shadow:0 0 12px var(--neon-dim),0 0 2px var(--neon);}50%{text-shadow:0 0 20px var(--neon),0 0 4px var(--neon);}}
.gits-wrap h1{animation:gits-glow 3s ease-in-out infinite;}
.gits-panel:hover{box-shadow:0 0 16px rgba(0,255,200,0.08);transition:box-shadow .3s;}
.gits-chips a,.gits-links a,.gits-levelgrid a{opacity:0;animation:gits-in .35s ease-out forwards;}
`;
    document.head.appendChild(style);

    const c = document.createElement('canvas');
    c.id = 'gits-matrix';
    document.body.appendChild(c);
    const scan = document.createElement('div');
    scan.className = 'gits-scan';
    document.body.appendChild(scan);

    const wrap = document.createElement('div');
    wrap.className = 'gits-wrap';

    const sshPanel = `
<div class="gits-panel"><div class="gits-title">:: SSH ACCESS</div>
  <div class="gits-ssh">
    <div><b>HOST</b><code>bandit.labs.overthewire.org</code></div>
    <div><b>PORT</b><code>2220</code></div>
  </div>
</div>`;

    let gridHTML = `<a href="/" style="border-color:var(--neon);color:var(--neon);box-shadow:0 0 10px rgba(0,255,200,.25)"><b>MAIN PAGE</b></a>
    <a href="https://tldr.inbrowser.app/pages/common/ls" style="border-color:var(--neon);color:var(--neon);box-shadow:0 0 10px rgba(0,255,200,.25)" rel="noopener noreferrer" target="_blank"><b>MANUALS</b></a>
    <a href="https://explainshell.com/" style="border-color:var(--neon);color:var(--neon);box-shadow:0 0 10px rgba(0,255,200,.25)" rel="noopener noreferrer" target="_blank"><b>EXPLAIN COMMAND</b></a>
    `;
    for (let i = 0; i <= MAX_LEVEL; i++) {
        const href = sideLinks[i] || `bandit${i}.html`;
        const cur = (!IS_INDEX && i === LEVEL) ? ' style="border-color:var(--neon);color:var(--neon);box-shadow:0 0 10px rgba(0,255,200,.25)"' : '';
        gridHTML += `<a href="${href}"${cur}>LEVEL ${String(i).padStart(2,'0')}</a>`;
    }
    const accessPanel = `<div class="gits-panel"><div class="gits-title">:: ACCESS POINTS</div>
  <div class="gits-levelgrid">${gridHTML}</div>
</div>`;

    if (IS_INDEX) {
        /* ---------- 2b. INDEX PAGE: level-select grid ---------- */
        wrap.innerHTML = `
<header>
  <div class="gits-brand">OVERTHEWIRE // SPYRA_BRAINDRIVE_INTERFACE</div>
  <h1>BANDIT 😸<span>::WARGAME</span></h1>
  <div class="gits-sub">select access point to begin infiltration</div>
</header>
<div class="gits-panel gits-intro"><div class="gits-title">00 :: BRIEFING</div>
  <p>Beginner-level wargame. Start at level 0, escalate access one level at a time.
  Each level page holds the info needed to reach the next.</p>
</div>
${sshPanel}
<div class="gits-panel"><div class="gits-title">:: NOTE FOR BEGINNERS</div>${beginnerHTML}</div>
${accessPanel}`;
        document.body.appendChild(wrap);
        typewriter(document.querySelector('.gits-intro'), 3);
        const beginnerBox = wrap.querySelectorAll('.gits-panel')[2];
        typewriter(beginnerBox, 0.125);
        staggerIn('.gits-levelgrid a');

    } else {
        /* ---------- 2a. LEVEL PAGE ---------- */
        const prevLevel = LEVEL > 0 ? (sideLinks[LEVEL - 1] || `bandit${LEVEL-1}.html`) : '/';
        const nextLevel = sideLinks[LEVEL + 1] || `bandit${LEVEL+1}.html`;

        wrap.innerHTML = `
<header>
  <div class="gits-brand">OVERTHEWIRE // GHOST_SHELL_INTERFACE</div>
  <h1>BANDIT 😸<span>::${String(LEVEL).padStart(2,'0')}</span></h1>
  <div class="gits-sub">session_target: level ${LEVEL} recon</div>
</header>
<div class="gits-panel"><div class="gits-title">01 :: LEVEL GOAL</div>${goalHTML}</div>
${sshPanel}
<div class="gits-panel"><div class="gits-title">02 :: TOOLS AVAILABLE</div>
  <div class="gits-chips" id="gits-cmds"></div></div>
<div class="gits-panel"><div class="gits-title">03 :: RECON LINKS</div>
  <div class="gits-links" id="gits-reads"></div></div>
<div class="gits-panel"><div class="gits-title">04 :: OPERATOR NOTES</div>
  <textarea class="gits-notes" id="gits-notes" placeholder="log commands, hints, cracked passwords..."></textarea>
  <div class="gits-foot"><span>persists per level</span><span class="gits-status" id="gits-status">idle</span></div>
</div>
${accessPanel}
<div class="gits-nav">
  <a href="${prevLevel}">&lt; PREV_LEVEL</a>
  <a href="${nextLevel}">NEXT_LEVEL &gt;</a>
</div>`;
        document.body.appendChild(wrap);
        typewriter(wrap.querySelectorAll('.gits-panel')[0], 6);

        document.getElementById('gits-cmds').append(...cmdLinks.map(a => {
            a.target = '_blank';
            return a;
        }));
        document.getElementById('gits-reads').append(...readLinks.map(a => {
            a.target = '_blank';
            return a;
        }));
        staggerIn('.gits-chips a');
        staggerIn('.gits-links a');
        staggerIn('.gits-levelgrid a');

        /* per-level notes, localStorage keyed by level */
        const KEY = `bandit_notes_${LEVEL}`;
        const notesEl = document.getElementById('gits-notes');
        const statusEl = document.getElementById('gits-status');
        notesEl.value = localStorage.getItem(KEY) || '';
        let saveT;
        notesEl.addEventListener('input', () => {
            statusEl.textContent = 'writing...';
            statusEl.classList.remove('saved');
            clearTimeout(saveT);
            saveT = setTimeout(() => {
                localStorage.setItem(KEY, notesEl.value);
                statusEl.textContent = 'saved';
                statusEl.classList.add('saved');
            }, 500);
        });
    }

    /* ---------- 4. MATRIX RAIN ---------- */
    const ctx = c.getContext('2d');

    function resize() {
        c.width = innerWidth;
        c.height = innerHeight;
    }
    resize();
    addEventListener('resize', resize);
    const chars = "01アイウエオカキクケコﾊﾟｽﾜｰﾄﾞ";
    const fontSize = 14;
    let drops = Array(Math.floor(innerWidth / fontSize)).fill(0.1);
    setInterval(() => {
        ctx.fillStyle = 'rgba(5,10,8,0.08)';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = '#00ffc8';
        ctx.font = fontSize + 'px monospace';
        drops.forEach((y, i) => {
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * fontSize, y * fontSize);
            if (y * fontSize > c.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        });
    }, 50);  
