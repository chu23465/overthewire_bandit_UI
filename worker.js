addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url);
  // If the request is for the proxy root
  if (url.pathname) {
    return await getPage(url.pathname);
  }

}

const originalResources = `<link rel='shortcut icon' href='/img/favicon.ico' />
  <link rel="stylesheet" href="/css/style.css" type="text/css" media="screen" />
  <link href="https://fonts.googleapis.com/css?family=Inconsolata|Pontano+Sans|Maven+Pro&subset=latin,latin-ext" rel='stylesheet' type='text/css'>
  <link rel="stylesheet" href="/css/highlightcode.css">
  <link rel="stylesheet" href="/css/patreon.css">
  <script src="/js/jquery-3.7.1.min.js"></script>
  <script src="/js/mustache-4.0.0.min.js"></script>
  <script src="/js/highlight.min.js"></script>
  <script src="/js/otwcrap.js"></script>
  <script src="/js/updatedmarkers.js"></script>`;
  
const patchedResources = `<link rel='shortcut icon' href='https://overthewire.org/img/favicon.ico' />
  <link rel="stylesheet" href="https://overthewire.org/css/style.css" type="text/css" media="screen" />
  <link href="https://fonts.googleapis.com/css?family=Inconsolata|Pontano+Sans|Maven+Pro&subset=latin,latin-ext" rel='stylesheet' type='text/css' />
  <link rel="stylesheet" href="https://overthewire.org/css/highlightcode.css" />
  <link rel="stylesheet" href="https://overthewire.org/css/patreon.css" />
  <script src="https://overthewire.org/js/jquery-3.7.1.min.js"></script>
  <script src="https://overthewire.org/js/mustache-4.0.0.min.js"></script>
  <script src="https://overthewire.org/js/highlight.min.js"></script>
  <script src="https://overthewire.org/js/otwcrap.js"></script>
  <script src="https://overthewire.org/js/updatedmarkers.js"></script>`;

    
async function getPage(path) {
  let html = (await (await fetch("https://overthewire.org/wargames/bandit" + path)).text())
  .replace(originalResources, patchedResources)
  .replace(`<script async src="https://www.googletagmanager.com/gtag/js?id=G-RD0K2239G0"></script>`, `<script async src="https://cdn.jsdelivr.net/gh/chu23465/overthewire_bandit_UI/script.js"></script>`)
  .replace(`  <script src="/js/updatedmarkers-logic.js"></script>`, "");
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'no-cache'
    }
  })
}