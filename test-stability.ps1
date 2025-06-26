# Wolfinder Stability Test Script
# Esegui questo script per testare rapidamente le API core

Write-Host "Testing Wolfinder API Stability..."

$baseUrl = "http://localhost:5000"
$tests = @()

# Test 1: Health Check
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "Health Check: OK"
        $tests += "Health Check: PASS"
    } else {
        Write-Host "Health Check: FAILED (Status: $($response.StatusCode))"
        $tests += "Health Check: FAIL"
    }
} catch {
    Write-Host "Health Check: FAILED (Connection Error)"
    $tests += "Health Check: FAIL"
}

# Test 2: Categories
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/categories" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $content = $response.Content | ConvertFrom-Json
        if ($content -and $content.Count -gt 0) {
            Write-Host ("Categories: OK (" + $content.Count + " categories)")
            $tests += "Categories: PASS"
        } else {
            Write-Host "Categories: WARNING (Empty array)"
            $tests += "Categories: WARN"
        }
    } else {
        Write-Host "Categories: FAILED (Status: $($response.StatusCode))"
        $tests += "Categories: FAIL"
    }
} catch {
    Write-Host "Categories: FAILED (Connection Error)"
    $tests += "Categories: FAIL"
}

# Test 3: Search Professionals
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/professionals/search?search=test" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $content = $response.Content | ConvertFrom-Json
        Write-Host ("Search Professionals: OK (Found " + $content.Count + " results)")
        $tests += "Search: PASS"
    } else {
        Write-Host "Search Professionals: FAILED (Status: $($response.StatusCode))"
        $tests += "Search: FAIL"
    }
} catch {
    Write-Host "Search Professionals: FAILED (Connection Error)"
    $tests += "Search: FAIL"
}

# Test 4: Featured Professionals
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/professionals/featured" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $content = $response.Content | ConvertFrom-Json
        if ($content -and $content.Count -gt 0) {
            Write-Host ("Featured Professionals: OK (" + $content.Count + " featured)")
            $tests += "Featured: PASS"
        } else {
            Write-Host "Featured Professionals: WARNING (Empty array)"
            $tests += "Featured: WARN"
        }
    } else {
        Write-Host "Featured Professionals: FAILED (Status: $($response.StatusCode))"
        $tests += "Featured: FAIL"
    }
} catch {
    Write-Host "Featured Professionals: FAILED (Connection Error)"
    $tests += "Featured: FAIL"
}

# Test 5: Single Professional (ID 1)
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/professionals/1" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $content = $response.Content | ConvertFrom-Json
        if ($content.id) {
            Write-Host ("Single Professional: OK (ID: " + $content.id + ")")
            $tests += "Single Pro: PASS"
        } else {
            Write-Host "Single Professional: WARNING (Invalid response)"
            $tests += "Single Pro: WARN"
        }
    } elseif ($response.StatusCode -eq 404) {
        Write-Host "Single Professional: WARNING (Not found - ID 1 doesn't exist)"
        $tests += "Single Pro: WARN"
    } else {
        Write-Host "Single Professional: FAILED (Status: $($response.StatusCode))"
        $tests += "Single Pro: FAIL"
    }
} catch {
    Write-Host "Single Professional: FAILED (Connection Error)"
    $tests += "Single Pro: FAIL"
}

# Summary
Write-Host ""
Write-Host "TEST SUMMARY:"
$passCount = ($tests | Where-Object { $_ -like "*: PASS" }).Count
$warnCount = ($tests | Where-Object { $_ -like "*: WARN" }).Count
$failCount = ($tests | Where-Object { $_ -like "*: FAIL" }).Count

Write-Host ("PASS: " + $passCount)
Write-Host ("WARN: " + $warnCount)
Write-Host ("FAIL: " + $failCount)

if ($failCount -eq 0) {
    Write-Host "ALL CRITICAL TESTS PASSED!"
} else {
    Write-Host "CRITICAL ISSUES DETECTED!"
    Write-Host "Fix the failing tests before committing."
}

Write-Host ""
Write-Host "Detailed Results:"
$tests | ForEach-Object { Write-Host ("  " + $_) } 