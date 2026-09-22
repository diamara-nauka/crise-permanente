export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Endpoint 1 : Début du flux OAuth (/auth)
    // Redirige vers GitHub avec le client_id et les scopes nécessaires (repo)
    if (url.pathname === '/auth') {
      if (!env.GITHUB_CLIENT_ID) {
        return new Response('GITHUB_CLIENT_ID manquant dans l’environnement.', { status: 500 });
      }

      const scope = url.searchParams.get('scope') || 'repo';
      const authUrl = new URL('https://github.com/login/oauth/authorize');
      authUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
      authUrl.searchParams.set('scope', scope);
      authUrl.searchParams.set('redirect_uri', `${url.origin}/callback`);

      return Response.redirect(authUrl.toString(), 302);
    }

    // Endpoint 2 : Callback GitHub (/callback)
    // Reçoit le code, l'échange contre un token, et renvoie le handshake Decap CMS
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

        // Succès : envoi du token dans le format attendu par Decap CMS
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

    // Route racine d'information
    return new Response(
      'Cloudflare Worker OAuth GitHub pour Decap CMS opérationnel. Endpoints disponibles: /auth et /callback.',
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
  <p>Authentification en cours, cette fenêtre va se fermer...</p>
  <script>
    (function() {
      function receiveMessage(e) {
        console.log("receiveMessage %o", e);
        window.opener.postMessage(
          'authorization:github:${result.status}:${result.content}',
          e.origin
        );
        window.removeEventListener("message", receiveMessage, false);
      }
      window.addEventListener("message", receiveMessage, false);
      console.log("Handshake en attente d'autorisation de l'initiateur...");
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
