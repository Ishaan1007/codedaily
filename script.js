// --- State Management ---
const state = {
    view: 'onboarding', // onboarding, input, timer, completed, roadmap
    username: localStorage.getItem('code_daily_username') || '',
    credits: parseInt(localStorage.getItem('code_daily_credits') || '0'),
    taskName: '',
    duration: 600, // seconds
    selectedDuration: 600,
    timeLeft: 600,
    isTimerActive: false,
    timerInterval: null
};

// --- Config ---
const FEATURES = [
    { id: 'deep-focus', title: 'Deep Focus Mode', description: 'Unlock 25m & 60m timer options.', cost: 500, icon: '⏱️' },
    { id: 'zen-audio', title: 'Zen Audio', description: 'Background ambient sounds.', cost: 1000, icon: '🎧' },
    { id: 'dark-mode', title: 'Midnight Theme', description: 'Dark aesthetic for night coding.', cost: 1500, icon: '🌙' }
];

const DURATIONS = [
    { label: '10m', seconds: 600, locked: false },
    { label: '25m', seconds: 1500, locked: true }, 
    { label: '60m', seconds: 3600, locked: true }, 
];

// --- Initialization ---
window.onload = function() {
    if (state.username) {
        state.view = 'input';
    } else {
        state.view = 'onboarding';
    }
    render();
};

// --- Action Handlers ---

window.handleLogin = function(e) {
    e.preventDefault();
    const input = document.getElementById('username-input');
    const name = input.value.trim();
    if (name) {
        state.username = name;
        localStorage.setItem('code_daily_username', name);
        state.view = 'input';
        render();
    }
};

window.handleLogout = function() {
    state.username = '';
    localStorage.removeItem('code_daily_username');
    state.view = 'onboarding';
    render();
};

window.setView = function(viewName) {
    state.view = viewName;
    render();
};

window.selectDuration = function(seconds) {
    state.selectedDuration = seconds;
    render();
};

window.handleStartTask = function(e) {
    e.preventDefault();
    const input = document.getElementById('task-input');
    const taskName = input.value.trim();
    if (taskName) {
        state.taskName = taskName;
        state.duration = state.selectedDuration;
        state.timeLeft = state.selectedDuration;
        state.isTimerActive = true;
        state.view = 'timer';
        render();
        startTimerLoop();
    }
};

window.toggleTimer = function() {
    state.isTimerActive = !state.isTimerActive;
    
    const btn = document.getElementById('btn-pause');
    if (btn) btn.innerText = state.isTimerActive ? 'Pause' : 'Resume';
    if (btn) btn.className = state.isTimerActive 
        ? 'flex-1 py-3 px-4 rounded-xl font-bold text-slate-950 shadow-lg transition-transform active:scale-95 bg-amber-400 hover:bg-amber-500'
        : 'flex-1 py-3 px-4 rounded-xl font-bold text-slate-950 shadow-lg transition-transform active:scale-95 bg-orange-500 hover:bg-orange-600';

    const status = document.getElementById('timer-status');
    if (status) status.innerText = state.isTimerActive ? 'Keep coding...' : 'Paused';

    if (state.isTimerActive) {
        startTimerLoop();
    } else {
        if (state.timerInterval) clearInterval(state.timerInterval);
    }
};

window.cancelTimer = function() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.isTimerActive = false;
    state.taskName = '';
    state.view = 'input';
    render();
};

window.collectReward = function() {
    state.credits += 10;
    localStorage.setItem('code_daily_credits', state.credits.toString());
    state.view = 'input';
    state.taskName = '';
    render();
};

// --- Timer Logic ---

function startTimerLoop() {
    if (state.timerInterval) clearInterval(state.timerInterval);

    state.timerInterval = setInterval(() => {
        if (state.timeLeft > 0) {
            state.timeLeft--;
            
            const display = document.getElementById('timer-display');
            const bar = document.getElementById('timer-bar');
            
            if (display) {
                display.innerText = formatTime(state.timeLeft);
            }
            if (bar) {
                const pct = ((state.duration - state.timeLeft) / state.duration) * 100;
                bar.style.width = `${pct}%`;
            }
        } else {
            clearInterval(state.timerInterval);
            state.isTimerActive = false;
            state.view = 'completed';
            render();
        }
    }, 1000);
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// --- HTML Generators ---

function render() {
    const app = document.getElementById('app');
    
    if (state.view !== 'timer' && state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }

    let html = '';

    if (state.view === 'onboarding') {
        html = getOnboardingHTML();
    } else {
        html += getHeaderHTML();
        html += `<main class="max-w-7xl mx-auto px-4 pt-8 md:pt-12 flex flex-col items-center justify-center min-h-[60vh]">`;
        
        if (state.view === 'input') {
            html += getInputHTML();
        } else if (state.view === 'roadmap') {
            html += getRoadmapHTML();
        } else if (state.view === 'timer') {
            html += getTimerHTML();
        } else if (state.view === 'completed') {
            html += getCompletedHTML();
        }
        
        html += `</main>`;
    }

    app.innerHTML = html;
}

function getHeaderHTML() {
    return `
    <header class="bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-orange-500/40 shadow-[0_0_25px_rgba(249,115,22,0.45)] transition-all duration-300 animate-fade-in">
        <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div class="flex items-center gap-3 cursor-pointer group" onclick="setView('input')">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-xl shadow-[0_0_18px_rgba(249,115,22,0.9)] transform group-hover:rotate-12 transition-transform duration-300">
                    &lt;/&gt;
                </div>
                <div>
                    <h1 class="text-xl md:text-2xl font-bold text-orange-100 tracking-tight font-display">Code Daily</h1>
                    <div class="flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.9)]"></span>
                        <p class="text-xs text-orange-200 font-medium">Hi, ${state.username}</p>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <button onclick="setView('roadmap')" class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-800/80 transition-colors text-xs font-bold text-orange-300 uppercase tracking-wide">
                    <span>🚀</span> Upgrades
                </button>
                <div onclick="setView('roadmap')" class="cursor-pointer hover:opacity-80 transition-opacity">
                   <div class="flex items-center gap-2 bg-slate-900 border border-orange-500/60 px-4 py-1.5 rounded-full shadow-[0_0_18px_rgba(249,115,22,0.7)]">
                      <div class="text-xl">💎</div>
                      <div class="flex flex-col items-start leading-none">
                        <span class="font-bold text-orange-300 font-mono text-lg">${state.credits}</span>
                        <span class="text-[10px] text-orange-400/80 font-bold uppercase tracking-wider">Credits</span>
                      </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
    `;
}

function getOnboardingHTML() {
    return `
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md mx-auto animate-fade-in-up">
            <div class="bg-slate-900 rounded-3xl shadow-[0_0_35px_rgba(249,115,22,0.45)] border border-orange-500/40 p-8 md:p-12 text-center relative overflow-hidden">
                <div class="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-orange-500/20 rounded-full opacity-70 blur-2xl"></div>
                <div class="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-amber-400/20 rounded-full opacity-70 blur-2xl"></div>

                <div class="relative z-10">
                    <div class="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-[0_0_28px_rgba(249,115,22,1)] mb-6 transform -rotate-6">👋</div>
                    <h2 class="text-3xl font-bold text-orange-100 mb-2 font-display">Welcome to Code Daily</h2>
                    <p class="text-slate-300 mb-8">Let&apos;s personalize your focus journey. What should we call you?</p>
                    
                    <form onsubmit="handleLogin(event)" class="space-y-4">
                        <input id="username-input" type="text" placeholder="Enter your name" class="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700 text-orange-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-slate-950 transition-all text-center font-bold text-lg" autofocus required />
                        <button type="submit" class="w-full py-3.5 rounded-xl font-bold text-slate-950 shadow-[0_0_22px_rgba(249,115,22,0.9)] transition-all duration-200 transform bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-500 hover:to-amber-500 hover:scale-[1.02] active:scale-95">Let's Go 🚀</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `;
}

function getInputHTML() {
    const hasDeepFocus = state.credits >= 500;
    
    const buttonsHTML = DURATIONS.map(opt => {
        const isLocked = opt.locked && !hasDeepFocus;
        const isSelected = state.selectedDuration === opt.seconds;
        
        let classes = "relative px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 ";
        if (isLocked) {
            classes += "bg-slate-800 text-slate-500 cursor-not-allowed border border-transparent";
        } else if (isSelected) {
            classes += "bg-slate-900 text-orange-300 border border-orange-500 ring-2 ring-orange-500/40 shadow-[0_0_16px_rgba(249,115,22,0.6)]";
        } else {
            classes += "bg-slate-900 text-slate-300 border border-slate-700 hover:border-orange-500 hover:text-orange-300 cursor-pointer";
        }

        const onclick = isLocked ? '' : `onclick="selectDuration(${opt.seconds})"`;
        const lockIcon = isLocked ? '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>' : '';

        return `<button type="button" ${onclick} class="${classes}">${lockIcon}${opt.label}</button>`;
    }).join('');

    return `
    <div class="w-full animate-fade-in-up">
        <div class="text-center mb-10">
            <h2 class="text-4xl md:text-5xl font-bold text-orange-100 mb-6 leading-tight font-display">Ready to Code, ${state.username}?</h2>
            <p class="text-lg text-slate-300 max-w-2xl mx-auto">Commit to a session. Earn credits to unlock neon-powered tools.</p>
            ${!hasDeepFocus ? `<p class="text-sm text-orange-400/80 mt-2 font-medium">${500 - state.credits} more credits to unlock Deep Focus Mode</p>` : ''}
        </div>
        
        <div class="w-full max-w-2xl mx-auto">
            <form onsubmit="handleStartTask(event)" class="relative">
                <div class="relative group mb-6">
                    <div class="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-400 rounded-2xl blur opacity-40 group-hover:opacity-70 transition duration-200"></div>
                    <div class="relative bg-slate-950 rounded-2xl p-2 shadow-[0_0_32px_rgba(249,115,22,0.35)] flex flex-col md:flex-row items-center gap-2">
                        <input id="task-input" type="text" placeholder="e.g., Refactor Auth Component..." class="flex-1 w-full p-4 text-slate-100 bg-transparent border-none outline-none focus:ring-0 placeholder-slate-500 text-lg font-medium font-sans" autofocus required />
                        <button type="submit" class="px-8 py-4 rounded-xl font-bold text-slate-950 shadow-[0_0_25px_rgba(249,115,22,0.9)] transition-all duration-200 flex items-center justify-center min-w-[160px] font-display bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-500 hover:to-amber-500 hover:scale-[1.02] active:scale-95">Start Code</button>
                    </div>
                </div>

                <div class="flex justify-center gap-4">
                    ${buttonsHTML}
                </div>

                <p class="text-center text-slate-400 mt-4 text-sm font-medium">Set your task and focus for ${state.selectedDuration / 60} minutes.</p>
            </form>
        </div>
        
        <button onclick="setView('roadmap')" class="mt-12 md:hidden text-orange-300 font-bold text-sm flex items-center gap-1 mx-auto">View Feature Roadmap <span class="text-lg">→</span></button>
    </div>
    `;
}

function getTimerHTML() {
    const progress = ((state.duration - state.timeLeft) / state.duration) * 100;

    return `
    <div class="w-full max-w-md mx-auto animate-fade-in-up">
        <div class="bg-slate-950 rounded-3xl shadow-[0_0_40px_rgba(249,115,22,0.4)] border border-orange-500/40 overflow-hidden relative">
            <div id="timer-bar" class="absolute top-0 left-0 h-2 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 transition-all duration-1000 linear" style="width: ${progress}%"></div>
            
            <div class="p-8 flex flex-col items-center text-center">
                <div class="mb-6">
                    <span class="inline-block px-3 py-1 rounded-full bg-slate-900 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2 border border-orange-500/50 shadow-[0_0_16px_rgba(249,115,22,0.6)]">Focus Mode</span>
                    <h2 class="text-2xl font-bold text-slate-50 font-display leading-tight break-words max-w-[300px]">${state.taskName}</h2>
                </div>

                <div class="mb-8 relative flex items-center justify-center h-32 w-full">
                    <div id="timer-display" class="text-8xl font-black text-orange-400 font-mono tracking-tighter tabular-nums leading-none select-none drop-shadow-[0_0_24px_rgba(249,115,22,0.9)]">${formatTime(state.timeLeft)}</div>
                    <p id="timer-status" class="text-orange-300/70 text-sm font-medium absolute -bottom-6 left-0 right-0">${state.isTimerActive ? 'Keep coding...' : 'Paused'}</p>
                </div>

                <div class="flex items-center gap-4 w-full mt-8">
                    <button onclick="cancelTimer()" class="flex-1 py-3 px-4 rounded-xl border-2 border-slate-700 text-slate-300 font-bold hover:bg-slate-900 hover:text-orange-200 transition-colors">Exit</button>
                    <button id="btn-pause" onclick="toggleTimer()" class="flex-1 py-3 px-4 rounded-xl font-bold text-slate-950 shadow-lg transition-transform active:scale-95 bg-amber-400 hover:bg-amber-500">Pause</button>
                </div>
            </div>
        </div>
        <div class="text-center mt-6 text-slate-500 text-sm italic">"One line of code at a time."</div>
    </div>
    `;
}

function getCompletedHTML() {
    return `
    <div class="animate-fade-in-up w-full max-w-md">
        <div class="bg-slate-950 p-8 rounded-3xl shadow-[0_0_40px_rgba(249,115,22,0.4)] border-4 border-orange-500/50 text-center relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-slate-950 -z-10"></div>
            
            <div class="mb-6 relative inline-block">
                <div class="absolute inset-0 bg-orange-400/50 blur-2xl rounded-full opacity-70 animate-pulse-slow"></div>
                <div class="relative text-6xl animate-bounce drop-shadow-[0_0_25px_rgba(249,115,22,1)]">💎</div>
            </div>

            <h2 class="text-3xl font-bold text-orange-100 mb-2 font-display">Awesome, ${state.username}!</h2>
            <p class="text-slate-300 mb-6">You completed <span class="font-bold text-orange-300">${state.taskName}</span>.</p>
            
            <div class="bg-slate-900 rounded-xl p-4 mb-8 border border-orange-500/40">
                <p class="text-sm text-orange-400 font-bold uppercase tracking-wider mb-1">Reward</p>
                <p class="text-4xl font-black text-orange-300 font-mono drop-shadow-[0_0_20px_rgba(249,115,22,0.9)]">+10 Credits</p>
            </div>
            
            <button onclick="collectReward()" class="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-slate-950 font-bold text-lg rounded-xl shadow-[0_0_30px_rgba(249,115,22,0.9)] transform transition-all duration-200 hover:scale-[1.02] active:scale-95">Continue</button>
        </div>
    </div>
    `;
}

function getRoadmapHTML() {
    const nextFeature = FEATURES.find(f => f.cost > state.credits);
    const currentLevelCap = nextFeature ? nextFeature.cost : FEATURES[FEATURES.length - 1].cost;
    const prevLevelCap = FEATURES.reduce((acc, f) => (f.cost <= state.credits && f.cost > acc ? f.cost : acc), 0);
    
    let progressPercent = 100;
    if (nextFeature) {
        progressPercent = Math.max(5, ((state.credits - prevLevelCap) / (currentLevelCap - prevLevelCap)) * 100);
    }

    let featuresHTML = '';
    FEATURES.forEach(feature => {
        const isUnlocked = state.credits >= feature.cost;
        const iconClass = isUnlocked ? 'bg-slate-900 text-orange-300 shadow-[0_0_18px_rgba(249,115,22,0.7)]' : 'bg-slate-800 text-slate-500 grayscale';
        const cardClass = isUnlocked ? 'bg-slate-950 border-orange-500/50 shadow-[0_0_24px_rgba(249,115,22,0.45)]' : 'bg-slate-900 border-slate-700 opacity-80';
        
        featuresHTML += `
        <div class="relative p-6 rounded-2xl border-2 transition-all duration-300 ${cardClass}">
            <div class="flex items-start gap-4">
                <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${iconClass}">${feature.icon}</div>
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <h3 class="text-xl font-bold font-display ${isUnlocked ? 'text-orange-100' : 'text-slate-500'}">${feature.title}</h3>
                        ${isUnlocked 
                            ? '<span class="px-2 py-0.5 bg-slate-900 text-orange-300 text-[10px] font-bold uppercase rounded-full tracking-wide border border-orange-500/60">Unlocked</span>'
                            : `<span class="px-2 py-0.5 bg-slate-800 text-slate-400 text-[10px] font-bold uppercase rounded-full tracking-wide flex items-center gap-1 border border-slate-700">Locked • ${feature.cost}</span>`
                        }
                    </div>
                    <p class="text-slate-300 text-sm leading-relaxed">${feature.description}</p>
                </div>
            </div>
        </div>
        `;
    });

    return `
    <div class="w-full max-w-2xl mx-auto animate-fade-in-up pb-10">
        <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
                <button onclick="setView('input')" class="p-2 rounded-full hover:bg-slate-800 text-orange-300 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </button>
                <h2 class="text-3xl font-bold text-orange-100 font-display">Feature Roadmap</h2>
            </div>
            <button onclick="handleLogout()" class="text-xs font-bold text-orange-300 hover:text-red-400 transition-colors px-3 py-1 rounded-full hover:bg-red-500/10">Not ${state.username}? Sign Out</button>
        </div>

        <div class="bg-slate-950 rounded-3xl shadow-[0_0_35px_rgba(249,115,22,0.5)] border border-orange-500/40 p-8 mb-8 relative overflow-hidden">
            <div class="flex justify-between items-end mb-4">
                <div>
                    <p class="text-orange-400 font-bold uppercase tracking-wider text-xs">Current Balance</p>
                    <p class="text-5xl font-black text-orange-200 font-mono drop-shadow-[0_0_20px_rgba(249,115,22,0.9)]">${state.credits}</p>
                </div>
                <div class="text-right">
                    <p class="text-slate-400 font-medium text-sm">Next Unlock</p>
                    <p class="text-orange-300 font-bold">${nextFeature ? nextFeature.cost + ' Credits' : 'Max Level'}</p>
                </div>
            </div>
            
            <div class="h-4 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 transition-all duration-1000 ease-out relative" style="width: ${progressPercent}%">
                    <div class="absolute top-0 left-0 w-full h-full bg-white/10 animate-pulse"></div>
                </div>
            </div>
            <p class="text-center mt-3 text-sm text-slate-300 font-medium">
                ${nextFeature ? (nextFeature.cost - state.credits) + ' more credits to unlock ' + nextFeature.title : 'You have unlocked everything!'}
            </p>
        </div>

        <div class="space-y-4">
            ${featuresHTML}
        </div>
    </div>
    `;
}