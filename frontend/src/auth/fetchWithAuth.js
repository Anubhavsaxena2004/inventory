export default async function fetchWithAuth(url, options = {}){
  // If the frontend is served by Vite (default port 5173) the browser
  // origin will be different from the Django backend. When a relative
  // `/api/...` URL is used, prefix it with the Django backend origin so
  // requests reach the API during local development.
  const isApiPath = typeof url === 'string' && url.startsWith('/api/')
  let fullUrl = url
  if (isApiPath) {
    // Default backend origin used by Django runserver
    const backendCandidates = ['http://127.0.0.1:8000', 'http://localhost:8000']
    // If the current origin already hosts the API (same host/port), keep relative
    try {
      const loc = window && window.location
      const currentOrigin = loc.protocol + '//' + loc.hostname + (loc.port ? ':' + loc.port : '')
      // If the dev server is not the backend, pick a backend candidate
      if (!backendCandidates.includes(currentOrigin)) {
        fullUrl = backendCandidates[0] + url
      }
    } catch (e) {
      fullUrl = backendCandidates[0] + url
    }
  }

  const token = localStorage.getItem('token')
  const headers = options.headers ? {...options.headers} : {}
  if(token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch(fullUrl, {...options, headers})
  return res
}
