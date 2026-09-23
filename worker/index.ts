export interface Env {
  ASSETS: Fetcher;
  GITHUB_PAT?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. Endpoint /auth pour Decap CMS
    if (url.pathname === '/auth') {
      if (!env.GITHUB_PAT) {
        return new Response('Secret GITHUB_PAT non configuré dans le Worker.', { status: 500 });
      }

      return renderHandshake({
        status: 'success',
        content: JSON.stringify({
          token: env.GITHUB_PAT,
          provider: 'github',
        }),
      });
    }

    // 2. Endpoint /callback pour Decap CMS (au cas où)
    if (url.pathname === '/callback') {
      if (!env.GITHUB_PAT) {
        return renderHandshake({
          status: 'error',
          content: JSON.stringify({ error: 'Secret GITHUB_PAT manquant' }),
        });
      }

      return renderHandshake({
        status: 'success',
        content: JSON.stringify({
          token: env.GITHUB_PAT,
          provider: 'github',
        }),
      });
    }

    // 3. Toutes les autres requêtes servent les fichiers statiques Astro & Decap CMS (/admin)
    return env.ASSETS.fetch(request);
  },
};

/**
 * Handshake postMessage Decap CMS
 */
function renderHandshake(result: { status: 'success' | 'error'; content: string }): Response {
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Authentification Decap CMS</title>
</head>
<body>
  <p>Connexion en cours, cette fenêtre va se fermer...</p>
  <script>
    (function() {
      function receiveMessage(e) {
        window.opener.postMessage(
          'authorization:github:${result.status}:${result.content}',
          e.origin
        );
        window.removeEventListener("message", receiveMessage, false);
      }
      window.addEventListener("message", receiveMessage, false);
      window.opener.postMessage("authorizing:github", "*");
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
