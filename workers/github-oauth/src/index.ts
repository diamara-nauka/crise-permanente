export interface Env {
  GITHUB_PAT?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Endpoint 1 : /auth
    // Si GITHUB_PAT est configuré, on connecte directement l'utilisateur SANS compte GitHub !
    if (url.pathname === '/auth') {
      if (env.GITHUB_PAT) {
        return renderHandshake({
          status: 'success',
          content: JSON.stringify({
            token: env.GITHUB_PAT,
            provider: 'github',
          }),
        });
      }

      // Fallback si on souhaite utiliser le flux OAuth standard
      if (!env.GITHUB_CLIENT_ID) {
        return new Response('Aucune méthode d’authentification configurée (GITHUB_PAT ou GITHUB_CLIENT_ID).', { status: 500 });
      }

      const scope = url.searchParams.get('scope') || 'repo';
      const authUrl = new URL('https://github.com/login/oauth/authorize');
      authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authUrl.searchParams.set('scope', scope);
      authUrl.searchParams.set('redirect_uri', `${url.origin}/callback`);

      return Response.redirect(authUrl.toString(), 302);
    }

    // Endpoint 2 : Callback GitHub OAuth (fallback)
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      const errorDescription = url.searchParams.get('error_description');

      if (error || !code) {
        return renderHandshake({
          status: 'error',
          content: JSON.stringify({ error: error || 'Code manquant', error_description: errorDescription }),
        });
      }

      try {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'User-Agent': 'Cloudflare-Worker-Decap-OAuth',
          },
          body: JSON.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            client_secret: env.GITHUB_CLIENT_SECRET,
            code,
          }),
        });

        const data: any = await tokenResponse.json();

        if (data.error || !data.access_token) {
          return renderHandshake({
            status: 'error',
            content: JSON.stringify({ error: data.error_description || data.error || 'Échec authentification' }),
          });
        }

        return renderHandshake({
          status: 'success',
          content: JSON.stringify({
            token: data.access_token,
            provider: 'github',
          }),
        });
      } catch (err: any) {
        return renderHandshake({
          status: 'error',
          content: JSON.stringify({ error: err.message || 'Erreur interne du serveur' }),
        });
      }
    }

    return new Response(
      'Cloudflare Worker OAuth / Token Provider pour Decap CMS opérationnel.',
      {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }
    );
  },
};

/**
 * Génère le script HTML postMessage conforme au protocole Netlify / Decap CMS
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
