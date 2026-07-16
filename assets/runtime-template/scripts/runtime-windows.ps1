function Get-CodexRuntime {
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
  return @{ App = $App; Node = $NodeCandidates[0] }
}
