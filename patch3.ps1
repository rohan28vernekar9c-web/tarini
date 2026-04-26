$file = 'c:\Users\SHRUTI SAHU\OneDrive\Documents\GitHub\tarini\app.js'
$lines = Get-Content $file
$before = $lines[0..2146]   # everything before _renderCourseCards (0-indexed 2147 = line 2148)
$after  = $lines[2227..($lines.Count-1)]  # from openCourseVideo onward (0-indexed 2228 = line 2229)

$newFn = @(
'function _renderCourseCards(courses) {',
'    const container = document.getElementById(''skill-courses-container'');',
'    const empty     = document.getElementById(''skill-empty-state'');',
'    const countEl   = document.getElementById(''skill-courses-count'');',
'    if (!container) return;',
'    if (courses.length === 0) {',
'        container.innerHTML = '''';',
'        if (empty)   empty.classList.remove(''hidden'');',
'        if (countEl) countEl.textContent = '''';',
'        return;',
'    }',
'    if (empty)   empty.classList.add(''hidden'');',
'    if (countEl) countEl.textContent = courses.length + '' course'' + (courses.length !== 1 ? ''s'' : '''');',
'    _renderCourseCardsInto(container, courses);',
'}'
)

$result = $before + $newFn + $after
[System.IO.File]::WriteAllLines($file, $result, [System.Text.UTF8Encoding]::new($false))
Write-Host 'Done. Lines:' $result.Count
