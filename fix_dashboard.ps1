$file = 'c:\Users\SHRUTI SAHU\OneDrive\Documents\GitHub\tarini\index.html'
$lines = Get-Content $file -Encoding UTF8

# Find the exact line indices
$labelIdx    = -1
$h2Idx       = -1
$subtitleIdx = -1

for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match 'Company Dashboard' -and $lines[$i] -match 'text-\[11px\]') { $labelIdx = $i }
    if ($lines[$i] -match 'company-dashboard-name') { $h2Idx = $i }
    if ($lines[$i] -match 'Manage your jobs and track applications') { $subtitleIdx = $i }
}

Write-Host "labelIdx=$labelIdx  h2Idx=$h2Idx  subtitleIdx=$subtitleIdx"

if ($labelIdx -ge 0) {
    $lines[$labelIdx] = '                        <p class="text-[11px] font-semibold tracking-[0.12em] uppercase mb-1" style="color:#5c51a0">Company Dashboard</p>'
}
if ($h2Idx -ge 0) {
    $lines[$h2Idx] = '                        <h2 class="font-[''Plus_Jakarta_Sans''] text-[26px] font-extrabold tracking-tight text-on-surface leading-tight" id="company-dashboard-name">Welcome</h2>'
}
if ($subtitleIdx -ge 0) {
    $lines[$subtitleIdx] = '                        <p class="text-[13px] font-normal text-on-surface-variant mt-1 leading-relaxed" id="company-dashboard-subtitle">Manage your jobs and track applicants</p>'
}

Set-Content $file -Value $lines -Encoding UTF8
Write-Host 'Done'
