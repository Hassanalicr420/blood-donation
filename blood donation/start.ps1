$ErrorActionPreference = "Stop"
$Email = "rifahwelfaresociety@gmail.com"
$ConfigPath = Join-Path $PSScriptRoot ".env"
$RunServer = $false
node .\server.js --needs-admin
if ($LASTEXITCODE -eq 2) {
    Write-Host "First-time setup for $Email"
    $SavedPassword = $null
    if (Test-Path -LiteralPath $ConfigPath) {
        $EncryptedLine = Get-Content -LiteralPath $ConfigPath |
            Where-Object { $_ -match '^INITIAL_ADMIN_PASSWORD_DPAPI=' } |
            Select-Object -First 1
        if ($EncryptedLine) {
            $EncryptedPassword = $EncryptedLine.Substring("INITIAL_ADMIN_PASSWORD_DPAPI=".Length)
            try {
                $SavedPassword = ConvertTo-SecureString $EncryptedPassword
            }
            catch {
                throw "The saved admin password cannot be decrypted for this Windows account."
            }
        }
    }
    if ($SavedPassword) {
        $SecurePassword = $SavedPassword
        Write-Host "Using the DPAPI-encrypted local admin password."
    }
    else {
        $SecurePassword = Read-Host "Enter the admin password you want to use" -AsSecureString
    }
    $PasswordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
    try {
        if (-not $SavedPassword) {
            $EncryptedPassword = ConvertFrom-SecureString $SecurePassword
            @(
                "INITIAL_ADMIN_EMAIL=$Email"
                "INITIAL_ADMIN_PASSWORD_DPAPI=$EncryptedPassword"
            ) | Set-Content -LiteralPath $ConfigPath -Encoding UTF8
        }
        $env:INITIAL_ADMIN_EMAIL = $Email
        $env:INITIAL_ADMIN_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($PasswordPointer)
        node .\server.js --initialize-admin
        if ($LASTEXITCODE -ne 0) {
            throw "Admin account setup failed. Node exited with code $LASTEXITCODE."
        }
        $RunServer = $true
    }
    finally {
        $env:INITIAL_ADMIN_EMAIL = $null
        $env:INITIAL_ADMIN_PASSWORD = $null
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($PasswordPointer)
        $SecurePassword.Dispose()
    }
    if ($RunServer) {
        node .\server.js
    }
}
elseif ($LASTEXITCODE -eq 0) {
    node .\server.js
}
else {
    throw "Could not check admin setup. Node exited with code $LASTEXITCODE."
}
