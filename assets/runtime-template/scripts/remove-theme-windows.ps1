$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
. (Join-Path $PSScriptRoot "runtime-windows.ps1")
$Runtime = Get-CodexRuntime
$Port = if ($env:CODEX_DEBUG_PORT) { [int]$env:CODEX_DEBUG_PORT } else { 9335 }
$StatePath = Join-Path $Root ".runtime\state.json"
if (Test-Path $StatePath) { $Port = [int](Get-Content $StatePath -Raw | ConvertFrom-Json).port }
Set-Location $Root
& $Runtime.Node "src\injector.mjs" --port $Port --remove --once
exit $LASTEXITCODE
