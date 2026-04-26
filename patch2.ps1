$file = 'c:\Users\SHRUTI SAHU\OneDrive\Documents\GitHub\tarini\app.js'
$lines = Get-Content $file

# ── 1. Replace _skillCategories (lines 2069..2079, 0-indexed 2068..2078) ──
$catStart = 2068
$catEnd   = 2078

# ── 2. Replace _allCourses (lines 2080..2094, 0-indexed 2079..2093) ──
$courseStart = 2079
$courseEnd   = 2093

# ── 3. Replace _renderSkillCategories + filterBySkillCategory + openAllCategories + initSkillsPage
#       lines 2264..2320, 0-indexed 2263..2319 ──
$renderStart = 2263
$renderEnd   = 2319

$newCats = @'
const _skillCategories = [
    { name:'Design',        icon:'palette',           color:'#5c51a0', bg:'rgba(92,81,160,0.12)',   grad:'linear-gradient(135deg,#5c51a0,#c8bfff)' },
    { name:'Development',   icon:'code',              color:'#4d41df', bg:'rgba(77,65,223,0.12)',   grad:'linear-gradient(135deg,#4d41df,#675df9)' },
    { name:'Marketing',     icon:'campaign',          color:'#875041', bg:'rgba(135,80,65,0.12)',   grad:'linear-gradient(135deg,#875041,#feb5a2)' },
    { name:'Finance',       icon:'payments',          color:'#276749', bg:'rgba(45,106,79,0.12)',   grad:'linear-gradient(135deg,#276749,#74c69d)' },
    { name:'Communication', icon:'forum',             color:'#675df9', bg:'rgba(103,93,249,0.12)',  grad:'linear-gradient(135deg,#675df9,#c4c0ff)' },
    { name:'Business',      icon:'business_center',   color:'#c77dff', bg:'rgba(199,125,255,0.12)', grad:'linear-gradient(135deg,#c77dff,#e5deff)' },
    { name:'Basics',        icon:'lightbulb',         color:'#e63946', bg:'rgba(230,57,70,0.10)',   grad:'linear-gradient(135deg,#e63946,#ffb3b8)' },
    { name:'Smartphone',    icon:'smartphone',        color:'#4d41df', bg:'rgba(77,65,223,0.12)',   grad:'linear-gradient(135deg,#4d41df,#5c51a0)' },
];
'@

$newCourses = @'
const _allCourses = [
    { id:1,  ytId:'dU1xS07N-FA', title:'Figma for Beginners',              instructor:'DesignCraft',   category:'Design',        level:'Beginner',     durLabel:'1.5h',  durKey:'short',  type:'Free', rating:4.8, enrolled:3200, desc:'Learn UI design fundamentals using Figma from wireframes to polished prototypes.' },
    { id:2,  ytId:'w7ejDZ8SWv8', title:'React.js Essentials',              instructor:'CodeNest',      category:'Development',   level:'Intermediate', durLabel:'4h',    durKey:'medium', type:'Free', rating:4.7, enrolled:5100, desc:'Build modern web apps with React hooks, components, and state management.' },
    { id:3,  ytId:'nU-IIXBWlS4', title:'Digital Marketing Masterclass',    instructor:'GrowthLab',     category:'Marketing',     level:'Beginner',     durLabel:'3h',    durKey:'medium', type:'Paid', rating:4.6, enrolled:2800, desc:'Master SEO, social media, email campaigns, and paid ads from scratch.' },
    { id:4,  ytId:'HQzoZfc3GwQ', title:'Personal Finance Basics',          instructor:'MoneyWise',     category:'Finance',       level:'Beginner',     durLabel:'1h',    durKey:'short',  type:'Free', rating:4.9, enrolled:7400, desc:'Understand budgeting, savings, investments, and financial planning for everyday life.' },
    { id:5,  ytId:'tShavGuo0_E', title:'Public Speaking Confidence',       instructor:'SpeakUp India', category:'Communication', level:'Beginner',     durLabel:'2h',    durKey:'short',  type:'Free', rating:4.5, enrolled:1900, desc:'Overcome stage fear and communicate with clarity, confidence, and impact.' },
    { id:6,  ytId:'Fqch5OrUPvA', title:'Business Plan Writing',            instructor:'StartupSchool', category:'Business',      level:'Intermediate', durLabel:'2.5h',  durKey:'medium', type:'Paid', rating:4.7, enrolled:1500, desc:'Write a compelling business plan that attracts investors and guides your startup.' },
    { id:7,  ytId:'1Rs2ND1ryYc', title:'Advanced CSS and Animations',      instructor:'PixelWorks',    category:'Development',   level:'Advanced',     durLabel:'6h',    durKey:'long',   type:'Paid', rating:4.6, enrolled:2100, desc:'Deep-dive into CSS Grid, Flexbox, custom animations, and responsive design patterns.' },
    { id:8,  ytId:'p7HKvqRI_Bo', title:'Stock Market for Women',           instructor:'InvestHer',     category:'Finance',       level:'Beginner',     durLabel:'3h',    durKey:'medium', type:'Paid', rating:4.8, enrolled:3300, desc:'Demystify the stock market and learn how to invest smartly and build long-term wealth.' },
    { id:9,  ytId:'0JCUH5daCCE', title:'Brand Identity Design',            instructor:'DesignCraft',   category:'Design',        level:'Intermediate', durLabel:'5h',    durKey:'long',   type:'Paid', rating:4.7, enrolled:1800, desc:'Create powerful brand identities with logos, colour palettes, typography, and style guides.' },
    { id:10, ytId:'r-uWLhO2v9U', title:'Python for Data Analysis',         instructor:'DataSeva',      category:'Development',   level:'Intermediate', durLabel:'8h',    durKey:'long',   type:'Free', rating:4.9, enrolled:6200, desc:'Use Python, Pandas, and Matplotlib to analyse real-world datasets and visualise insights.' },
    { id:11, ytId:'sPW9r5NDLSE', title:'Effective Email Writing',          instructor:'SpeakUp India', category:'Communication', level:'Beginner',     durLabel:'45min', durKey:'short',  type:'Free', rating:4.4, enrolled:980,  desc:'Write professional emails that get responses - structure, tone, and etiquette covered.' },
    { id:12, ytId:'ZpL0oGFBsDg', title:'Entrepreneurship 101',             instructor:'StartupSchool', category:'Business',      level:'Beginner',     durLabel:'4h',    durKey:'medium', type:'Free', rating:4.6, enrolled:4100, desc:'From idea to execution - learn the mindset, tools, and steps to launch your own venture.' },
    { id:13, ytId:'Ks-_Mh1QhMc', title:'How to Use a Smartphone',         instructor:'TechSaathi',    category:'Smartphone',    level:'Beginner',     durLabel:'30min', durKey:'short',  type:'Free', rating:4.9, enrolled:8200, desc:'Simple step-by-step guide to using a smartphone - calls, messages, apps, and internet.' },
    { id:14, ytId:'mP_ZMmgFHPY', title:'Internet Basics for Beginners',   instructor:'TechSaathi',    category:'Basics',        level:'Beginner',     durLabel:'25min', durKey:'short',  type:'Free', rating:4.8, enrolled:6100, desc:'Learn what the internet is, how to browse safely, and use Google and WhatsApp.' },
    { id:15, ytId:'VvCytJvd4H0', title:'Basic Computer Skills',            instructor:'DigiLearn',     category:'Basics',        level:'Beginner',     durLabel:'40min', durKey:'short',  type:'Free', rating:4.7, enrolled:5400, desc:'Learn to use a computer from scratch - typing, files, and basic applications.' },
    { id:16, ytId:'eIho2S0ZahI', title:'How to Start a Small Business',    instructor:'StartupSchool', category:'Basics',        level:'Beginner',     durLabel:'35min', durKey:'short',  type:'Free', rating:4.8, enrolled:4900, desc:'Simple guide to starting your own small business with little money and big ideas.' },
    { id:17, ytId:'9bZkp7q19f0', title:'Simple Communication Skills',      instructor:'SpeakUp India', category:'Basics',        level:'Beginner',     durLabel:'20min', durKey:'short',  type:'Free', rating:4.6, enrolled:3800, desc:'Learn to speak clearly and confidently in everyday situations at home and work.' },
    { id:18, ytId:'kqtD5dpn9C8', title:'WhatsApp and Video Calls Guide',   instructor:'TechSaathi',    category:'Smartphone',    level:'Beginner',     durLabel:'20min', durKey:'short',  type:'Free', rating:4.9, enrolled:7100, desc:'Learn to use WhatsApp, make video calls, and share photos with family and friends.' },
    { id:19, ytId:'2ePf9rue1Ao', title:'Save Money Every Day',             instructor:'MoneyWise',     category:'Finance',       level:'Beginner',     durLabel:'18min', durKey:'short',  type:'Free', rating:4.7, enrolled:5200, desc:'Easy tips to save money from your daily income and build a small emergency fund.' },
    { id:20, ytId:'dQw4w9WgXcQ', title:'Basic Sewing and Tailoring',       instructor:'CraftIndia',    category:'Basics',        level:'Beginner',     durLabel:'45min', durKey:'short',  type:'Free', rating:4.8, enrolled:4300, desc:'Learn basic hand stitching and simple tailoring skills to make and repair clothes.' },
];
'@

$newRender = @'
function _renderSkillCategories() {
    const container = document.getElementById('skill-categories-container');
    if (!container) return;
    container.innerHTML = _skillCategories.slice(0, 6).map(c => `
        <div onclick="openSkillCategory('${c.name}')"
            style="flex-shrink:0;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;width:68px">
            <div style="width:60px;height:60px;border-radius:50%;background:${c.bg};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px -4px rgba(77,65,223,0.15);transition:transform 0.15s,box-shadow 0.15s"
                onmouseenter="this.style.transform='scale(1.08)';this.style.boxShadow='0 8px 20px -4px rgba(77,65,223,0.22)'"
                onmouseleave="this.style.transform='';this.style.boxShadow='0 4px 12px -4px rgba(77,65,223,0.15)'"
                ontouchstart="this.style.transform='scale(0.94)'" ontouchend="this.style.transform=''">
                <span class="material-symbols-outlined" style="font-size:26px;color:${c.color};font-variation-settings:'FILL' 1">${c.icon}</span>
            </div>
            <p style="font-size:11px;font-weight:600;color:#1b1b24;text-align:center;line-height:1.3;word-break:break-word">${c.name}</p>
        </div>`).join('');
}

function openSkillCategory(name) {
    const cat = _skillCategories.find(c => c.name === name);
    const courses = _allCourses.filter(c => c.category === name);
    // Update category page header
    const titleEl = document.getElementById('skill-cat-page-title');
    const iconEl  = document.getElementById('skill-cat-page-icon');
    const countEl = document.getElementById('skill-cat-page-count');
    if (titleEl) titleEl.textContent = name;
    if (iconEl && cat) {
        iconEl.style.background = cat.bg;
        iconEl.querySelector('span').style.color = cat.color;
        iconEl.querySelector('span').textContent = cat.icon;
    }
    if (countEl) countEl.textContent = courses.length + ' course' + (courses.length !== 1 ? 's' : '');
    // Render filtered cards into category page container
    const container = document.getElementById('skill-cat-courses-container');
    if (container) {
        if (courses.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:48px 0"><span class="material-symbols-outlined text-outline-variant" style="font-size:48px">search_off</span><p class="text-on-surface-variant font-semibold mt-2">No courses in this category yet</p></div>';
        } else {
            _renderCourseCardsInto(container, courses);
        }
    }
    navigateTo('skill-categories');
}
window.openSkillCategory = openSkillCategory;

function filterBySkillCategory(name) {
    _skillFilters.cat.clear();
    _skillFilters.cat.add(name);
    document.querySelectorAll('.skill-chip[data-sf="cat"]').forEach(b => {
        const on = b.getAttribute('data-sv') === name;
        b.style.background = on ? 'rgba(77,65,223,0.15)' : '';
        b.style.color      = on ? '#4d41df' : '';
        b.style.fontWeight = on ? '700' : '';
    });
    applySkillFilters();
    document.getElementById('skill-courses-container')?.scrollIntoView({ behavior:'smooth', block:'start' });
}
window.filterBySkillCategory = filterBySkillCategory;

function openAllCategories() {
    const grid = document.getElementById('all-categories-grid');
    if (grid) {
        grid.innerHTML = _skillCategories.map(c => {
            const count = _allCourses.filter(x => x.category === c.name).length;
            return `
            <div onclick="openSkillCategory('${c.name}')"
                style="display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;padding:12px 4px;border-radius:16px;transition:background 0.15s"
                onmouseenter="this.style.background='rgba(77,65,223,0.05)'"
                onmouseleave="this.style.background=''">
                <div style="width:64px;height:64px;border-radius:50%;background:${c.bg};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px -4px rgba(77,65,223,0.15)">
                    <span class="material-symbols-outlined" style="font-size:28px;color:${c.color};font-variation-settings:'FILL' 1">${c.icon}</span>
                </div>
                <p style="font-size:12px;font-weight:600;color:#1b1b24;text-align:center;line-height:1.3">${c.name}</p>
                <p style="font-size:10px;color:#9e9bb8">${count} course${count !== 1 ? 's' : ''}</p>
            </div>`;
        }).join('');
    }
    // Show all-categories grid on the skill-categories screen (not a category detail)
    const titleEl = document.getElementById('skill-cat-page-title');
    const iconEl  = document.getElementById('skill-cat-page-icon');
    const countEl = document.getElementById('skill-cat-page-count');
    const container = document.getElementById('skill-cat-courses-container');
    if (titleEl) titleEl.textContent = 'All Categories';
    if (iconEl)  iconEl.style.display = 'none';
    if (countEl) countEl.textContent = '';
    if (container) container.innerHTML = '';
    document.getElementById('all-categories-grid').style.display = 'grid';
    document.getElementById('skill-cat-courses-container').style.display = 'none';
    navigateTo('skill-categories');
}
window.openAllCategories = openAllCategories;

// Shared helper: render course cards into any container element
function _renderCourseCardsInto(container, courses) {
    const levelColor = l => l === 'Beginner'     ? 'background:rgba(45,106,79,0.10);color:#276749'
                          : l === 'Intermediate' ? 'background:rgba(77,65,223,0.10);color:#4d41df'
                          :                        'background:rgba(135,80,65,0.10);color:#875041';
    const typeColor  = t => t === 'Free' ? 'background:rgba(45,106,79,0.10);color:#276749'
                          :                'background:rgba(92,81,160,0.10);color:#5c51a0';
    const stars = r => {
        const full = Math.floor(r);
        return Array.from({length:5}, (_,i) =>
            `<span class="material-symbols-outlined" style="font-size:13px;color:${i < full ? '#f59e0b' : '#d1d5db'};font-variation-settings:'FILL' 1">star</span>`
        ).join('');
    };
    container.innerHTML = courses.map(c => {
        const catMeta = _skillCategories.find(x => x.name === c.category) || { bg:'rgba(77,65,223,0.12)', color:'#4d41df', icon:'school' };
        const enrolled = JSON.parse(localStorage.getItem('tarini_enrolled') || '[]').includes(c.id);
        // Try hqdefault first, fall back to mqdefault via onerror
        const thumbHq = 'https://img.youtube.com/vi/' + c.ytId + '/hqdefault.jpg';
        const thumbMq = 'https://img.youtube.com/vi/' + c.ytId + '/mqdefault.jpg';
        return `
        <div style="background:#fff;border-radius:20px;overflow:hidden;border:1px solid #eae6f3;box-shadow:0 2px 12px -4px rgba(77,65,223,0.08);transition:transform 0.15s,box-shadow 0.15s"
            onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px -4px rgba(77,65,223,0.14)'"
            onmouseleave="this.style.transform='';this.style.boxShadow='0 2px 12px -4px rgba(77,65,223,0.08)'"
            ontouchstart="this.style.transform='scale(0.98)'" ontouchend="this.style.transform=''">
            <div onclick="openCourseVideo(${c.id})" style="position:relative;width:100%;height:160px;cursor:pointer;overflow:hidden;background:${catMeta.bg}">
                <img src="${thumbHq}" alt="${c.title}"
                    style="width:100%;height:100%;object-fit:cover;display:block"
                    onerror="this.src='${thumbMq}';this.onerror=function(){this.style.display='none';this.nextElementSibling.style.display='flex'}"/>
                <div style="display:none;width:100%;height:100%;background:${catMeta.bg};align-items:center;justify-content:center;position:absolute;inset:0">
                    <span class="material-symbols-outlined" style="font-size:40px;color:${catMeta.color};font-variation-settings:'FILL' 1">${catMeta.icon}</span>
                </div>
                <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.22);transition:background 0.2s"
                    onmouseenter="this.style.background='rgba(0,0,0,0.38)'" onmouseleave="this.style.background='rgba(0,0,0,0.22)'">
                    <div style="width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.28);transition:transform 0.15s"
                        onmouseenter="this.style.transform='scale(1.1)'" onmouseleave="this.style.transform=''">
                        <span class="material-symbols-outlined" style="font-size:26px;color:#4d41df;font-variation-settings:'FILL' 1;margin-left:3px">play_arrow</span>
                    </div>
                </div>
                <span style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,0.72);color:#fff;font-size:10px;font-weight:700;padding:2px 7px;border-radius:6px">${c.durLabel}</span>
                ${enrolled ? '<span style="position:absolute;top:8px;left:8px;background:rgba(45,106,79,0.90);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px">Enrolled</span>' : ''}
            </div>
            <div style="padding:14px 16px 16px">
                <div style="display:flex;align-items:flex-start;gap:10px">
                    <div style="width:36px;height:36px;border-radius:10px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:${catMeta.bg}">
                        <span class="material-symbols-outlined" style="font-size:18px;color:${catMeta.color};font-variation-settings:'FILL' 1">${catMeta.icon}</span>
                    </div>
                    <div style="flex:1;min-width:0">
                        <p style="font-size:14px;font-weight:700;color:#1b1b24;line-height:1.3">${c.title}</p>
                        <p style="font-size:12px;color:#777587;margin-top:2px">${c.instructor} &bull; ${c.category}</p>
                    </div>
                </div>
                <p style="font-size:12px;color:#464555;margin-top:8px;line-height:1.5">${c.desc}</p>
                <div style="display:flex;align-items:center;gap:6px;margin-top:8px;flex-wrap:wrap">
                    <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;${levelColor(c.level)}">${c.level}</span>
                    <span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;${typeColor(c.type)}">${c.type}</span>
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px">
                    <div style="display:flex;align-items:center;gap:4px">
                        ${stars(c.rating)}
                        <span style="font-size:12px;font-weight:700;color:#1b1b24;margin-left:2px">${c.rating}</span>
                        <span style="font-size:11px;color:#9e9bb8">(${c.enrolled.toLocaleString('en-IN')})</span>
                    </div>
                    <button onclick="openCourseVideo(${c.id})" style="height:34px;padding:0 14px;border-radius:10px;border:none;background:linear-gradient(135deg,#4d41df,#5c51a0);color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:'Poppins',sans-serif;display:flex;align-items:center;gap:5px;transition:opacity 0.15s" onmouseenter="this.style.opacity='0.88'" onmouseleave="this.style.opacity='1'">
                        <span class="material-symbols-outlined" style="font-size:14px;font-variation-settings:'FILL' 1">play_circle</span>Watch
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}
window._renderCourseCardsInto = _renderCourseCardsInto;

function initSkillsPage() {
    _renderSkillCategories();
    applySkillFilters();
}
window.initSkillsPage = initSkillsPage;
'@

# Build result: before cats + new cats + new courses + middle section + new render + after
$before      = $lines[0..($catStart-1)]
$middleStart = $courseEnd + 1   # lines between courses end and render start
$middle      = $lines[$middleStart..($renderStart-1)]
$after       = $lines[($renderEnd+1)..($lines.Count-1)]

$result = $before +
          $newCats.Split([System.Environment]::NewLine) +
          $newCourses.Split([System.Environment]::NewLine) +
          $middle +
          $newRender.Split([System.Environment]::NewLine) +
          $after

[System.IO.File]::WriteAllLines($file, $result, [System.Text.UTF8Encoding]::new($false))
Write-Host 'Done. Lines:' $result.Count
