import type { APIRoute } from 'astro';

// Exécuté à la volée côté serveur (Worker Cloudflare)
export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  // Récupération de GITHUB_PAT depuis l'environnement Cloudflare
  const runtime = (locals as any)?.runtime;
  const env = runtime?.env || process.env;
  const token = env?.GITHUB_PAT;

  if (!token) {
    return new Response('Secret GITHUB_PAT manquant dans l’environnement Cloudflare.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const result = {
    status: 'success',
    content: JSON.stringify({
      token,
      provider: 'github',
    }),
  };

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
};
