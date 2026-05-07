# SOVEREIGN UNIFIED ORCHESTRATOR v1.0
Set-Location "C:\REFINEDSHADDERMATHFORTRADITIONALWEBSITE"
$PROJECT_ROOT = "C:\REFINEDSHADDERMATHFORTRADITIONALWEBSITE"

Write-Host "[SYSTEM] Launching Sovereign Unified Appliance..." -ForegroundColor Cyan

# Port cleanup
$Port = 8080
$Process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
if ($Process) { Stop-Process -Id $Process -Force }

# Launch Unified Server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PROJECT_ROOT\backend\services\api_gateway'; npm run dev"

Write-Host "[SUCCESS] Sovereign Engine is live at http://localhost:8080" -ForegroundColor Green
