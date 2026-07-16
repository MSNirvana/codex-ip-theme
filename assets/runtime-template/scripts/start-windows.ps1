$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Port = if ($env:CODEX_DEBUG_PORT) { [int]$env:CODEX_DEBUG_PORT } else { 9335 }
$StatePath = Join-Path $Root ".runtime\state.json"
if (-not $env:CODEX_DEBUG_PORT -and (Test-Path $StatePath)) {
  try { $Port = [int](Get-Content $StatePath -Raw | ConvertFrom-Json).port } catch {}
}
$Candidates = @(
  $env:CODEX_APP,
  "$env:LOCALAPPDATA\Programs\ChatGPT\ChatGPT.exe",
  "$env:LOCALAPPDATA\Programs\Codex\Codex.exe",
  "$env:ProgramFiles\ChatGPT\ChatGPT.exe",
  "$env:ProgramFiles\Codex\Codex.exe"
) | Where-Object { $_ -and (Test-Path $_) }

if ($Candidates.Count -eq 0 -and (Get-Command Get-AppxPackage -ErrorAction SilentlyContinue)) {
  $Package = Get-AppxPackage OpenAI.Codex | Sort-Object Version -Descending | Select-Object -First 1
  if ($Package) {
    $StoreExe = Join-Path $Package.InstallLocation "app\ChatGPT.exe"
    if (Test-Path $StoreExe) { $Candidates = @($StoreExe) }
  }
}
if ($Candidates.Count -eq 0) { throw "找不到 Codex/ChatGPT.exe；请设置 CODEX_APP。" }
$App = $Candidates[0]
$AppRoot = Split-Path -Parent $App

$NodeCommand = Get-Command node -ErrorAction SilentlyContinue
$NodeCandidates = @(
  $(if ($NodeCommand) { $NodeCommand.Source } else { $null }),
  "$AppRoot\resources\cua_node\node.exe",
  "$AppRoot\resources\cua_node\bin\node.exe"
) | Where-Object { $_ -and (Test-Path $_) }
if ($NodeCandidates.Count -eq 0) { throw "找不到 Node.js 20+ 或应用内置 Node.js。" }
$NodeBin = $NodeCandidates[0]

function Test-Cdp([int]$CandidatePort) {
  try {
    $Targets = Invoke-RestMethod "http://127.0.0.1:$CandidatePort/json/list" -TimeoutSec 1
    return [bool]($Targets | Where-Object { $_.type -eq "page" -and $_.url -like "app://*" })
  } catch { return $false }
}

$Ready = Test-Cdp $Port
if (-not $Ready) {
  while ((Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue) -and $Port -lt 9435) { $Port++ }
  if ($Port -ge 9435) { throw "9335–9435 没有可用端口。" }
  $Running = Get-Process -Name "ChatGPT", "Codex" -ErrorAction SilentlyContinue
  if ($Running) { throw "Codex 已运行但未开放主题端口。请完全退出后重试。" }
  Start-Process -FilePath $App -ArgumentList @(
    "--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=$Port"
  )
}

Set-Location $Root
New-Item -ItemType Directory -Force -Path (Join-Path $Root ".runtime") | Out-Null
@{ port = $Port; updatedAt = (Get-Date).ToString("o") } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $Root ".runtime\state.json") -Encoding utf8
& $NodeBin "src\injector.mjs" --port $Port
exit $LASTEXITCODE
