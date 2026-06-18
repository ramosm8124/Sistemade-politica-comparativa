param([int]$Port = 3000)

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.png'  = 'image/png'
  '.svg'  = 'image/svg+xml'
  '.ico'  = 'image/x-icon'
}

$root = $PSScriptRoot
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host ""
Write-Host "  Servidor iniciado en  http://localhost:$Port" -ForegroundColor Cyan
Write-Host "  Presiona Ctrl+C para detener" -ForegroundColor DarkGray
Write-Host ""

try {
  while ($listener.IsListening) {
    $ctx  = $listener.GetContext()
    $req  = $ctx.Request
    $resp = $ctx.Response

    $urlPath = $req.Url.AbsolutePath
    if ($urlPath -eq '/') { $urlPath = '/index.html' }

    $file = Join-Path $root $urlPath.TrimStart('/')

    if (Test-Path $file -PathType Leaf) {
      $ext  = [System.IO.Path]::GetExtension($file)
      $ct   = if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' }
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $resp.ContentType   = $ct
      $resp.ContentLength64 = $bytes.Length
      $resp.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $resp.StatusCode = 404
      $msg = [System.Text.Encoding]::UTF8.GetBytes("404 - No encontrado")
      $resp.ContentType = 'text/plain'
      $resp.ContentLength64 = $msg.Length
      $resp.OutputStream.Write($msg, 0, $msg.Length)
    }
    $resp.OutputStream.Close()
  }
} finally {
  $listener.Stop()
}
