param(
  [ValidateSet('preview','dev','build','test')][string]$Mode = 'preview',
  [int]$Port = 5083,
  [string]$WorkspaceRoot = ''
)
$ErrorActionPreference = 'Stop'
$appRoot = (Resolve-Path -LiteralPath $PSScriptRoot).ProviderPath
if (-not $WorkspaceRoot) {
  $parentPath = Split-Path -Parent $appRoot
  $WorkspaceRoot = if (Test-Path -LiteralPath (Join-Path $parentPath '.codex-work')) { $parentPath } else { $appRoot }
}
$projectRoot = (Resolve-Path -LiteralPath $WorkspaceRoot).ProviderPath
if (-not $projectRoot -or [System.IO.Path]::GetPathRoot($projectRoot) -eq 'C:\') { throw 'Choose a project root outside C: before running.' }
if ($appRoot -ne $projectRoot -and -not $appRoot.StartsWith($projectRoot + '\',[System.StringComparison]::OrdinalIgnoreCase)) { throw 'The application must be inside WorkspaceRoot.' }
if ($Port -lt 1 -or $Port -gt 65535) { throw 'Port must be between 1 and 65535.' }
$workRoot = Join-Path $projectRoot '.codex-work'
$env:TEMP = Join-Path $workRoot 'tmp'
$env:TMP = $env:TEMP
$env:TMPDIR = $env:TEMP
$env:XDG_CACHE_HOME = Join-Path $workRoot 'cache'
$env:PIP_CACHE_DIR = Join-Path $env:XDG_CACHE_HOME 'pip'
$env:UV_CACHE_DIR = Join-Path $env:XDG_CACHE_HOME 'uv'
$env:npm_config_cache = Join-Path $env:XDG_CACHE_HOME 'npm'
$env:npm_config_devdir = Join-Path $env:XDG_CACHE_HOME 'node-gyp'
$env:npm_config_global = 'false'
$env:npm_config_update_notifier = 'false'
$env:PYTHONPYCACHEPREFIX = Join-Path $env:XDG_CACHE_HOME 'python'
$env:NODE_COMPILE_CACHE = Join-Path $env:XDG_CACHE_HOME 'node-compile'
$env:COREPACK_HOME = Join-Path $env:XDG_CACHE_HOME 'corepack'
$env:YARN_CACHE_FOLDER = Join-Path $env:XDG_CACHE_HOME 'yarn'
$env:PNPM_STORE_DIR = Join-Path $env:XDG_CACHE_HOME 'pnpm'
$env:PSModuleAnalysisCachePath = Join-Path $env:XDG_CACHE_HOME 'powershell\ModuleAnalysisCache'
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path $env:XDG_CACHE_HOME 'playwright-browsers'
$env:PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = '1'
$env:GOMROK_WORKSPACE_ROOT = $projectRoot
$env:GOMROK_PORT = [string]$Port
foreach ($storagePath in @($env:TEMP,$env:XDG_CACHE_HOME,(Join-Path $workRoot 'logs'))) {
  $candidate = [System.IO.DirectoryInfo]::new($storagePath)
  while ($null -ne $candidate -and $candidate.FullName.StartsWith($projectRoot,[System.StringComparison]::OrdinalIgnoreCase)) {
    if ($candidate.Exists -and ($candidate.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) { throw ('Linked storage is not allowed: ' + $candidate.FullName) }
    $candidate = $candidate.Parent
  }
  [System.IO.Directory]::CreateDirectory($storagePath) | Out-Null
}
$nodeCommand = (Get-Command node -CommandType Application | Select-Object -First 1).Source
Set-Location -LiteralPath $appRoot
if ($Mode -eq 'preview' -and (Test-Path -LiteralPath '.\dist\index.html')) {
  & $nodeCommand '.\scripts\serve-built.mjs' --port $Port
  exit $LASTEXITCODE
}
$npmCommand = (Get-Command npm.cmd -CommandType Application | Select-Object -First 1).Source
if (-not (Test-Path -LiteralPath '.\node_modules\vite\bin\vite.js')) {
  & $npmCommand ci --no-audit --no-fund --cache $env:npm_config_cache
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
if ($Mode -eq 'dev') { & $nodeCommand '.\node_modules\vite\bin\vite.js' --host 127.0.0.1 --port $Port --strictPort; exit $LASTEXITCODE }
if ($Mode -eq 'build') { & $npmCommand run build; exit $LASTEXITCODE }
if ($Mode -eq 'preview') {
  & $npmCommand run build
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
  & $nodeCommand '.\scripts\serve-built.mjs' --port $Port
  exit $LASTEXITCODE
}
& $npmCommand test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$ownedServer = $null
try {
  $url = 'http://127.0.0.1:' + $Port + '/'
  $ready = $false
  try { $existing = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2; if (-not $existing.Content.Contains('گمرک‌دات‌کام')) { throw 'Port is occupied by another application.' }; $ready = $true } catch { if ($null -ne $existing) { throw } }
  if (-not $ready) {
    $ownedServer = Start-Process -FilePath $nodeCommand -ArgumentList @('node_modules\vite\bin\vite.js','--host','127.0.0.1','--port',[string]$Port,'--strictPort') -WorkingDirectory $appRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $workRoot 'logs\gomrok-tests-vite.out.log') -RedirectStandardError (Join-Path $workRoot 'logs\gomrok-tests-vite.err.log') -PassThru
    for ($attempt = 0; $attempt -lt 40 -and -not $ready; $attempt++) { try { $ready = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 1).StatusCode -eq 200 } catch { Start-Sleep -Milliseconds 250 } }
    if (-not $ready) { throw 'Test server did not start.' }
  }
  & $nodeCommand '.\node_modules\@playwright\test\cli.js' test
  $testExit = $LASTEXITCODE
} finally { if ($null -ne $ownedServer -and -not $ownedServer.HasExited) { Stop-Process -Id $ownedServer.Id } }
exit $testExit
