// Cloudflare Worker para servir arquivos do R2 publicamente
// Deploy este código no Cloudflare Workers

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname
  
  // Configurações do R2
  const R2_BUCKET = 'boodesk-cdn'
  
  try {
    // Buscar arquivo do R2
    const object = await BUCKET.get(path.substring(1)) // Remove a barra inicial
    
    if (object === null) {
      return new Response('Arquivo não encontrado', { status: 404 })
    }
    
    // Configurar headers para download
    const headers = new Headers()
    headers.set('Content-Type', getContentType(path))
    headers.set('Content-Length', object.size)
    headers.set('Cache-Control', 'public, max-age=3600')
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, HEAD')
    headers.set('Access-Control-Allow-Headers', '*')
    
    // Se for um executável, forçar download
    if (path.endsWith('.exe')) {
      headers.set('Content-Disposition', `attachment; filename="${path.split('/').pop()}"`)
    }
    
    return new Response(object.body, {
      headers: headers,
      status: 200
    })
    
  } catch (error) {
    return new Response(`Erro: ${error.message}`, { status: 500 })
  }
}

function getContentType(path) {
  if (path.endsWith('.exe')) return 'application/octet-stream'
  if (path.endsWith('.zip')) return 'application/zip'
  if (path.endsWith('.txt')) return 'text/plain'
  return 'application/octet-stream'
}



