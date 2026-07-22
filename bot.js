/* ==========================================
   Hetvi Soni — AI Twin Chatbot
   Resume-grounded conversational assistant
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('chat-overlay');
    const body = document.getElementById('chat-body');
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');

    // Open chat
    function openChat() {
        overlay.classList.add('open');
        input.focus();
        document.body.style.overflow = 'hidden'; // Prevent body scroll
    }
    function closeChat() {
        overlay.classList.remove('open');
        document.body.style.overflow = ''; // Restore body scroll
    }

    document.getElementById('chat-fab').addEventListener('click', openChat);
    
    // Bind both desktop and mobile nav chat buttons
    const chatBtnD = document.getElementById('nav-chat-btn');
    const chatBtnM = document.getElementById('nav-chat-btn-mobile');
    if (chatBtnD) chatBtnD.addEventListener('click', openChat);
    if (chatBtnM) chatBtnM.addEventListener('click', () => {
        closeMobileMenu();
        openChat();
    });

    document.getElementById('chat-close').addEventListener('click', closeChat);
    window.addEventListener('keydown', e => { if (e.key === 'Escape') closeChat(); });

    // Mobile menu toggle logic
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('nav-toggle');
    
    function toggleMobileMenu() {
        nav.classList.toggle('nav-open');
        if (nav.classList.contains('nav-open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    function closeMobileMenu() {
        nav.classList.remove('nav-open');
        document.body.style.overflow = '';
    }

    if (navToggle) navToggle.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking navigation links
    const navLinks = document.querySelectorAll('#nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Suggestion chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            handleQuery(chip.dataset.q);
        });
    });

    // Form submit
    form.addEventListener('submit', e => {
        e.preventDefault();
        const q = input.value.trim();
        if (!q) return;
        input.value = '';
        handleQuery(q);
    });

    function addMsg(type, content, isHtml) {
        const msg = document.createElement('div');
        msg.className = `msg msg-${type}`;
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        if (isHtml) bubble.innerHTML = content;
        else bubble.textContent = content;
        msg.appendChild(bubble);
        body.appendChild(msg);
        body.scrollTop = body.scrollHeight;
    }

    function showTyping() {
        const msg = document.createElement('div');
        msg.className = 'msg msg-bot typing-msg';
        msg.innerHTML = '<div class="msg-bubble"><div class="typing-anim"><span></span><span></span><span></span></div></div>';
        body.appendChild(msg);
        body.scrollTop = body.scrollHeight;
        return msg;
    }

    function handleQuery(q) {
        addMsg('user', q, false);
        const typing = showTyping();

        setTimeout(() => {
            typing.remove();
            const resp = respond(q);
            addMsg('bot', resp.text, resp.html);
        }, 900 + Math.random() * 400);
    }

    function match(q, words) {
        q = q.toLowerCase();
        return words.some(w => q.includes(w));
    }

    function respond(raw) {
        const q = raw.toLowerCase();

        // --- Who is Hetvi ---
        if (match(q, ['who', 'hetvi', 'about', 'intro', 'profile', 'yourself'])) {
            return { html: true, text: `
                <p><strong>Hetvi Soni</strong> is an AI Engineer based in Ahmedabad, India. She's pursuing an MSc in Artificial Intelligence at St. Xavier's College (expected 2027), with a BCA from Indus University (CGPA 8.80).</p>
                <div class="rich-card">
                    <h4>Key Highlights</h4>
                    <ul>
                        <li>5 end-to-end AI/web projects shipped</li>
                        <li>7 search algorithms benchmarked</li>
                        <li>Custom PPO reward design trained from scratch</li>
                        <li>Full-stack: Python, Django, React, LLM APIs</li>
                    </ul>
                </div>
            `};
        }

        // --- Projects ---
        if (match(q, ['project', 'work', 'built', 'portfolio', 'show'])) {
            if (match(q, ['ocr', 'handwriting', 'trocr', 'recognition'])) {
                return { html: true, text: `<p><strong>Handwriting Recognition System</strong> — Fine-tuned TrOCR on a 25,000-image Kaggle dataset (IMA) with custom preprocessing for messy handwriting. Achieved <strong>96%+ accuracy</strong>. Deployed via Django with no external OCR API.</p>` };
            }
            if (match(q, ['maze', 'path', 'search', 'bfs', 'dfs', 'astar', 'dijkstra'])) {
                return { html: true, text: `<p><strong>Maze Solver & Pathfinding Visualizer</strong> — Compared 7 algorithms (BFS, DFS, DB-DFS, Hill Climbing, Iterative Hill Climbing, Random Walk, Simulated Annealing). Extended with A* and Dijkstra on a real map of India for optimal city routing.</p>` };
            }
            if (match(q, ['rl', 'reinforcement', 'ppo', 'reward', '3d', 'agent'])) {
                return { html: true, text: `<p><strong>RL Agent for 3D Maze Navigation</strong> — Designed a custom reward function and trained a PPO agent across multiple epochs. The agent learns to avoid enemies, break walls, and navigate purely through trial-and-error.</p>` };
            }
            if (match(q, ['finance', 'dashboard', 'bank', 'savings', 'transaction'])) {
                return { html: true, text: `<p><strong>AI-Powered Finance Dashboard</strong> — React/Django platform syncing bank transactions, displaying spending trends and auto-categorized expenses. Includes an LLM chatbot for natural-language "what-if" budgeting questions grounded in user data.</p>` };
            }
            if (match(q, ['nutri', 'recipe', 'diet', 'food', 'planner', 'php'])) {
                return { html: true, text: `<p><strong>NutriAI — Recipe & Diet Planner</strong> — Rule-based recipe chatbot that scales ingredient quantities by number of people. Built in PHP/HTML/CSS, no AI/ML used — purely procedural logic.</p>` };
            }
            return { html: true, text: `
                <p>Hetvi has shipped <strong>5 projects</strong>:</p>
                <div class="rich-card">
                    <ul>
                        <li><strong>Handwriting Recognition</strong> — TrOCR, 96%+ accuracy</li>
                        <li><strong>Maze Solver</strong> — 7 algorithm comparison</li>
                        <li><strong>RL 3D Navigator</strong> — PPO reward training</li>
                        <li><strong>Finance Dashboard</strong> — React + LLM chatbot</li>
                        <li><strong>NutriAI</strong> — rule-based recipe scaler</li>
                    </ul>
                </div>
                <p>Ask about any specific project for details.</p>
            `};
        }

        // --- Skills ---
        if (match(q, ['skill', 'tech', 'language', 'framework', 'stack', 'tool'])) {
            return { html: true, text: `
                <div class="rich-card">
                    <h4>AI/ML</h4>
                    <p>Machine Learning, Deep Learning, Computer Vision, NLP, RL (PPO), Scikit-learn</p>
                    <h4>LLM Tools</h4>
                    <p>OpenAI API, Claude, Gemini, RAG</p>
                    <h4>Full-Stack</h4>
                    <p>Python, Django, React, HTML/CSS/JS, Supabase, Firebase</p>
                </div>
            `};
        }

        // --- Education ---
        if (match(q, ['education', 'college', 'university', 'degree', 'msc', 'bca', 'cgpa', 'study', 'xavier'])) {
            return { html: true, text: `
                <div class="rich-card">
                    <h4>MSc Artificial Intelligence</h4>
                    <p>St. Xavier's College · CGPA 7.89 · Expected 2027</p>
                    <h4>BCA (Computer Applications)</h4>
                    <p>Indus University · CGPA 8.80</p>
                </div>
            `};
        }

        // --- Hackathon ---
        if (match(q, ['hackathon', 'uidai', 'aadhaar', 'nic', 'meity', 'achievement'])) {
            return { html: true, text: `<p><strong>UIDAI Data Hackathon 2026</strong> — National hackathon by the Unique Identification Authority of India (with NIC & MeitY). Hetvi analyzed anonymized Aadhaar enrolment/update datasets, identifying data-quality patterns and submitting a research-based insights report.</p>` };
        }

        // --- Contact ---
        if (match(q, ['contact', 'email', 'phone', 'reach', 'linkedin', 'github', 'connect'])) {
            return { html: true, text: `
                <div class="rich-card">
                    <p>📧 <a href="mailto:hetvisoni40@gmail.com">hetvisoni40@gmail.com</a></p>
                    <p>📞 7801999285</p>
                    <p>📍 Ahmedabad, India</p>
                    <p>🔗 <a href="https://www.linkedin.com/in/soni-hetvi-484516283/" target="_blank">LinkedIn</a> · <a href="https://github.com/HetviSoni" target="_blank">GitHub</a></p>
                </div>
            `};
        }

        // --- Certifications ---
        if (match(q, ['cert', 'kaggle', 'qualification', 'credential'])) {
            return { html: true, text: `
                <p>Kaggle certifications:</p>
                <div class="rich-card">
                    <ul>
                        <li>Introduction to Machine Learning</li>
                        <li>Feature Engineering</li>
                        <li>Data Cleaning</li>
                    </ul>
                </div>
            `};
        }

        // --- Fallback ---
        return { html: true, text: `
            <p>I can only answer from Hetvi's resume. Try asking about:</p>
            <div class="rich-card">
                <ul>
                    <li>"Who is Hetvi?"</li>
                    <li>"Tell me about the maze solver project"</li>
                    <li>"What are her skills?"</li>
                    <li>"How can I contact her?"</li>
                </ul>
            </div>
        `};
    }
});
