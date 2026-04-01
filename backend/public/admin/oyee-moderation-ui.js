/**
 * OYEE Admin Portal - UI Logic
 * Handles declarations, moderation stats, and live status updates
 */

document.addEventListener('DOMContentLoaded', function() {
    // 1. INITIALIZE COMPONENTS
    const detector = new ContentDetector();
    const declarationForm = document.getElementById('new-declaration-form');
    const declareBtn = document.querySelector('.btn-dark'); // The "DECLARE" button in header
    const historyList = document.getElementById('history-list');
    const activeList = document.querySelector('.active-declarations .panel-content');
    const marquee = document.querySelector('.marquee-content');

    // State
    let history = JSON.parse(localStorage.getItem('oyee-decl-history')) || [];
    let activeDeclarations = [];

    // 2. RENDER INITIAL HISTORY
    renderHistory();

    // 3. EVENT LISTENERS
    declareBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleDeclarationSubmit();
    });

    // 4. SUBMIT HANDLER
    function handleDeclarationSubmit() {
        const type = document.getElementById('decl-type').value;
        const title = document.getElementById('decl-title').value.trim();
        const message = document.getElementById('decl-message').value.trim();
        const audience = document.getElementById('decl-audience').value;
        const duration = parseInt(document.getElementById('decl-duration').value);

        if (!title || !message) {
            showNotification('⚠ Title and Message are required', 'error');
            return;
        }

        // Analyze content for violations
        const analysis = detector.analyzeContent(message);
        if (!analysis.isClean) {
            const violation = analysis.violations[0].message;
            showNotification(`⚠ Moderation Flag: ${violation}`, 'error');
            // We allow admins to override, but we show the warning
            if (!confirm('Content detection flagged this message. Send anyway?')) return;
        }

        const declaration = {
            id: Date.now(),
            type,
            title,
            message,
            audience,
            duration,
            timestamp: new Date().toISOString()
        };

        // Add to history
        history.unshift(declaration);
        if (history.length > 20) history.pop();
        localStorage.setItem('oyee-decl-history', JSON.stringify(history));

        // Add to active for a while
        setActiveDeclaration(declaration);

        // Update UI
        renderHistory();
        renderActive();
        clearForm();
        
        showNotification('✅ Declaration Sent Successfully', 'success');
        updateMarquee(`NEW DECLARATION: ${title} - ${message}`);
    }

    // 5. UI UPDATES
    function renderHistory() {
        if (!historyList) return;
        
        if (history.length === 0) {
            historyList.innerHTML = '<p class="panel-sub">// no history yet</p>';
            return;
        }

        historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="meta">
                    <span>${item.type.toUpperCase()} • ${item.audience.toUpperCase()}</span>
                    <span>${formatDate(item.timestamp)}</span>
                </div>
                <div class="title">${item.title}</div>
                <div class="msg">${item.message}</div>
            </div>
        `).join('');
    }

    function renderActive() {
        if (activeDeclarations.length === 0) {
            activeList.innerHTML = '<p>// no active declarations at this moment</p>';
            activeList.classList.add('empty');
            return;
        }

        activeList.classList.remove('empty');
        activeList.innerHTML = activeDeclarations.map(item => `
            <div class="active-item" style="border-left: 3px solid var(--accent-red); padding-left: 15px; margin-bottom: 10px;">
                <div style="font-family: var(--font-heading); color: var(--accent-red);">${item.title}</div>
                <div style="font-size: 11px;">${item.message}</div>
            </div>
        `).join('');
    }

    function setActiveDeclaration(decl) {
        activeDeclarations.push(decl);
        renderActive();

        if (decl.duration > 0) {
            setTimeout(() => {
                activeDeclarations = activeDeclarations.filter(d => d.id !== decl.id);
                renderActive();
            }, decl.duration * 1000);
        }
    }

    function clearForm() {
        document.getElementById('decl-title').value = '';
        document.getElementById('decl-message').value = '';
    }

    function updateMarquee(text) {
        if (marquee) {
            marquee.innerText = `${text} | ${marquee.innerText}`;
        }
    }

    // 6. UTILITIES
    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    }

    function showNotification(msg, type) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${type === 'success' ? '#27ae60' : '#FF4B2B'};
            color: #fff;
            padding: 15px 25px;
            font-family: var(--font-mono);
            font-size: 11px;
            font-weight: 700;
            border: 1px solid #000;
            box-shadow: 6px 6px 0 rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease forwards;
        `;
        notif.innerText = msg;
        document.body.appendChild(notif);

        setTimeout(() => {
            notif.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).onfinish = () => notif.remove();
        }, 4000);
    }

    // Export analytics/debugging
    window.OyeeAdmin = {
        getHistory: () => history,
        clearHistory: () => { history = []; localStorage.removeItem('oyee-decl-history'); renderHistory(); }
    };
});

/* Simple slide-in animation for notifications */
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
