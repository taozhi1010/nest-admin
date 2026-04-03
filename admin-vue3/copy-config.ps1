# Copy config files to root directory
# Usage: .\copy-config.ps1

Write-Host "Copying config files..." -ForegroundColor Green

# Format config
Write-Host "Copying format config..." -ForegroundColor Yellow
Copy-Item "config\dev\.prettierrc" ".prettierrc" -Force
Copy-Item "config\dev\.prettierignore" ".prettierignore" -Force

# Dev environment config
Write-Host "Copying dev environment config..." -ForegroundColor Yellow
Copy-Item "config\dev\eslint.config.js" "eslint.config.js" -Force
Copy-Item "config\dev\tsconfig.json" "tsconfig.json" -Force

# Runtime environment config
Write-Host "Copying runtime environment config..." -ForegroundColor Yellow
Copy-Item "config\env\.env.development" ".env.development" -Force
Copy-Item "config\env\.env.production" ".env.production" -Force
Copy-Item "config\env\.env.staging" ".env.staging" -Force

# Ops config
Write-Host "Copying ops config..." -ForegroundColor Yellow
Copy-Item "config\ops\Dockerfile" "Dockerfile" -Force
Copy-Item "config\ops\nginx.conf" "nginx.conf" -Force

Write-Host "Config files copied successfully!" -ForegroundColor Green
