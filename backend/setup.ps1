# Django Backend Setup Script (PowerShell)
# Run this script to scaffold the entire Django project

Write-Host "Starting Django backend setup..." -ForegroundColor Green

# Get the script's directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Function to create directories and __init__.py files
function New-AppStructure {
    param(
        [string]$AppName,
        [string[]]$SubDirs = @()
    )
    
    $appPath = "apps/$AppName"
    
    if (-not (Test-Path $appPath)) {
        New-Item -ItemType Directory -Path $appPath -Force | Out-Null
        Write-Host "Created directory: $appPath" -ForegroundColor Cyan
    }
    
    # Create __init__.py
    @"
# $AppName application
"@ | Out-File -FilePath "$appPath/__init__.py" -Encoding UTF8
    
    Write-Host "Created $appPath/__init__.py"
    
    # Create subdirectories
    foreach ($subdir in $SubDirs) {
        $subPath = "$appPath/$subdir"
        if (-not (Test-Path $subPath)) {
            New-Item -ItemType Directory -Path $subPath -Force | Out-Null
            Write-Host "Created subdirectory: $subPath" -ForegroundColor Cyan
        }
        
        @"
# $subdir module
"@ | Out-File -FilePath "$subPath/__init__.py" -Encoding UTF8
    }
}

# Create main directories
$mainDirs = @("apps", "config", "ml", "training", "media", "logs", "weights")
foreach ($dir in $mainDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Cyan
    }
}

# Create ml subdirectories
$mlSubDirs = @("inference", "preprocessing", "explainability")
foreach ($subdir in $mlSubDirs) {
    $path = "ml/$subdir"
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Created directory: $path" -ForegroundColor Cyan
    }
    
    @"
# ML $subdir module
"@ | Out-File -FilePath "$path/__init__.py" -Encoding UTF8
}

# Create training subdirectories
$trainSubDirs = @("configs", "notebooks", "logs")
foreach ($subdir in $trainSubDirs) {
    $path = "training/$subdir"
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Created directory: $path" -ForegroundColor Cyan
    }
}

# Create apps
New-AppStructure -AppName "accounts" -SubDirs @()
New-AppStructure -AppName "predictions" -SubDirs @()
New-AppStructure -AppName "models_registry" -SubDirs @()
New-AppStructure -AppName "analytics" -SubDirs @()

# Create apps/__init__.py
@"
# Django applications
"@ | Out-File -FilePath "apps/__init__.py" -Encoding UTF8

# Create config/__init__.py if it doesn't exist
if (-not (Test-Path "config/__init__.py")) {
    @"
from .celery import app as celery_app

__all__ = ('celery_app',)
"@ | Out-File -FilePath "config/__init__.py" -Encoding UTF8
}

# Create manage.py if it doesn't exist
if (-not (Test-Path "manage.py")) {
    @"
#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
"@ | Out-File -FilePath "manage.py" -Encoding UTF8 -NoNewline
}

# Create ml/__init__.py
@"
# ML module
"@ | Out-File -FilePath "ml/__init__.py" -Encoding UTF8

# Create training/__init__.py
@"
# Training module
"@ | Out-File -FilePath "training/__init__.py" -Encoding UTF8

Write-Host "`nAll directories created successfully!" -ForegroundColor Green

# Now run Django project initialization
Write-Host "`nInitializing Django project..." -ForegroundColor Green

# Check if Django is installed
try {
    $pythonCmd = python
    & $pythonCmd -m django --version
} catch {
    Write-Host "Django not found! Installing dependencies..." -ForegroundColor Yellow
    & $pythonCmd -m pip install -r requirements.txt
}

# Check if config/settings.py exists
if (-not (Test-Path "config/settings.py")) {
    Write-Host "Creating Django project configuration..." -ForegroundColor Cyan
    & python config/manage.py django-admin startproject config .
}

# Create .env if it doesn't exist
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env file (copied from .env.example)" -ForegroundColor Cyan
}

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Update .env with your configuration"
Write-Host "2. Run: python manage.py makemigrations"
Write-Host "3. Run: python manage.py migrate"
Write-Host "4. Run: python manage.py runserver"
