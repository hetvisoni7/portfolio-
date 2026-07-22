/* ==========================================
   Hetvi Soni — App Logic
   Project widgets, maze solver, RL simulator,
   OCR canvas, finance panel, NutriAI scaler
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initMazeWidget();
    initRLWidget();
    initFinanceWidget();
    initNutriWidget();
});

/* ==========================================
   Scroll Reveal
   ========================================== */
function initScrollReveal() {
    const els = document.querySelectorAll('.project-card, .skill-cluster, .achievement-card, .edu-card, .contact-item');
    els.forEach(el => el.classList.add('scroll-reveal'));

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
}

/* ==========================================
   2. Maze Solver & Pathfinding Visualizer
   ========================================== */
const MR = 10, MC = 12;
let mazeData = [];
const mazeStart = [0, 0], mazeEnd = [9, 11];
let mazeRunning = false;

function initMazeWidget() {
    generateMaze();
    renderMaze();

    document.getElementById('maze-randomize').addEventListener('click', () => {
        if (mazeRunning) return;
        generateMaze();
        renderMaze();
        resetMazeStats();
    });

    document.getElementById('maze-solve').addEventListener('click', () => {
        if (mazeRunning) return;
        solveMaze();
    });
}

function generateMaze() {
    mazeData = Array.from({ length: MR }, () => Array.from({ length: MC }, () => 0));
    for (let r = 0; r < MR; r++)
        for (let c = 0; c < MC; c++) {
            if ((r === mazeStart[0] && c === mazeStart[1]) || (r === mazeEnd[0] && c === mazeEnd[1])) continue;
            mazeData[r][c] = Math.random() < 0.25 ? 1 : 0;
        }
}

function renderMaze() {
    const grid = document.getElementById('maze-grid');
    grid.innerHTML = '';
    for (let r = 0; r < MR; r++)
        for (let c = 0; c < MC; c++) {
            const cell = document.createElement('div');
            cell.className = 'maze-cell';
            cell.dataset.r = r; cell.dataset.c = c;
            if (r === mazeStart[0] && c === mazeStart[1]) cell.classList.add('start');
            else if (r === mazeEnd[0] && c === mazeEnd[1]) cell.classList.add('end');
            else if (mazeData[r][c] === 1) cell.classList.add('wall');

            cell.addEventListener('click', () => {
                if (mazeRunning) return;
                if (cell.classList.contains('start') || cell.classList.contains('end')) return;
                mazeData[r][c] = mazeData[r][c] === 1 ? 0 : 1;
                cell.classList.toggle('wall');
                cell.classList.remove('visited', 'path');
            });
            grid.appendChild(cell);
        }
}

function resetMazeStats() {
    document.getElementById('maze-steps').textContent = '—';
    document.getElementById('maze-cost').textContent = '—';
}

function solveMaze() {
    mazeRunning = true;
    // Clear previous visualization
    document.querySelectorAll('.maze-cell').forEach(c => c.classList.remove('visited', 'path'));

    const algo = document.getElementById('maze-algo').value;
    let visitedOrder = [], parent = {}, found = false;

    if (algo === 'BFS' || algo === 'DFS') {
        let queue = [mazeStart];
        let visited = new Set([mazeStart.toString()]);
        while (queue.length > 0) {
            let cur = algo === 'BFS' ? queue.shift() : queue.pop();
            visitedOrder.push(cur);
            if (cur[0] === mazeEnd[0] && cur[1] === mazeEnd[1]) { found = true; break; }
            for (let [dr, dc] of [[-1,0],[0,1],[1,0],[0,-1]]) {
                let nr = cur[0]+dr, nc = cur[1]+dc, nb = [nr, nc];
                if (nr >= 0 && nr < MR && nc >= 0 && nc < MC && mazeData[nr][nc] === 0 && !visited.has(nb.toString())) {
                    visited.add(nb.toString()); parent[nb.toString()] = cur; queue.push(nb);
                }
            }
        }
    } else if (algo === 'AStar') {
        let open = [{ pos: mazeStart, g: 0, f: manhattan(mazeStart, mazeEnd) }];
        let gS = {}; gS[mazeStart.toString()] = 0;
        while (open.length > 0) {
            open.sort((a, b) => a.f - b.f);
            let { pos: cur } = open.shift();
            visitedOrder.push(cur);
            if (cur[0] === mazeEnd[0] && cur[1] === mazeEnd[1]) { found = true; break; }
            for (let [dr, dc] of [[-1,0],[0,1],[1,0],[0,-1]]) {
                let nr = cur[0]+dr, nc = cur[1]+dc, nb = [nr, nc], nbS = nb.toString();
                if (nr >= 0 && nr < MR && nc >= 0 && nc < MC && mazeData[nr][nc] === 0) {
                    let tG = gS[cur.toString()] + 1;
                    if (gS[nbS] === undefined || tG < gS[nbS]) {
                        gS[nbS] = tG; parent[nbS] = cur;
                        open.push({ pos: nb, g: tG, f: tG + manhattan(nb, mazeEnd) });
                    }
                }
            }
        }
    } else {
        // Hill Climbing / Simulated Annealing
        let cur = [...mazeStart];
        let temp = 80, cool = 0.92, steps = 0;
        while (steps < 120) {
            steps++;
            visitedOrder.push([...cur]);
            if (cur[0] === mazeEnd[0] && cur[1] === mazeEnd[1]) { found = true; break; }
            let neighbors = [];
            for (let [dr, dc] of [[-1,0],[0,1],[1,0],[0,-1]]) {
                let nr = cur[0]+dr, nc = cur[1]+dc;
                if (nr >= 0 && nr < MR && nc >= 0 && nc < MC && mazeData[nr][nc] === 0)
                    neighbors.push([nr, nc]);
            }
            if (neighbors.length === 0) break;
            if (algo === 'HillClimbing') {
                let best = null, bestD = manhattan(cur, mazeEnd);
                neighbors.forEach(n => { let d = manhattan(n, mazeEnd); if (d < bestD) { bestD = d; best = n; } });
                if (best) { parent[best.toString()] = cur; cur = best; } else break;
            } else {
                let next = neighbors[Math.floor(Math.random() * neighbors.length)];
                let dE = manhattan(next, mazeEnd) - manhattan(cur, mazeEnd);
                if (dE < 0 || Math.random() < Math.exp(-dE / temp)) {
                    parent[next.toString()] = cur; cur = next;
                }
                temp *= cool;
                if (temp < 0.5) break;
            }
        }
    }

    animateMaze(visitedOrder, parent, found);
}

function manhattan(a, b) { return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]); }

function animateMaze(visited, parent, found) {
    let i = 0;
    function step() {
        if (i < visited.length) {
            let [r, c] = visited[i];
            let cell = document.querySelector(`.maze-cell[data-r="${r}"][data-c="${c}"]`);
            if (cell && !cell.classList.contains('start') && !cell.classList.contains('end'))
                cell.classList.add('visited');
            i++;
            requestAnimationFrame(step);
        } else {
            document.getElementById('maze-steps').textContent = visited.length;
            if (found) {
                let path = [], cur = mazeEnd;
                while (cur && cur.toString() !== mazeStart.toString()) {
                    path.push(cur); cur = parent[cur.toString()];
                }
                path.push(mazeStart); path.reverse();
                document.getElementById('maze-cost').textContent = path.length.toFixed(1);
                let pi = 0;
                function drawPath() {
                    if (pi < path.length) {
                        let [r, c] = path[pi];
                        let cell = document.querySelector(`.maze-cell[data-r="${r}"][data-c="${c}"]`);
                        if (cell && !cell.classList.contains('start') && !cell.classList.contains('end'))
                            cell.classList.add('path');
                        pi++; setTimeout(drawPath, 40);
                    } else { mazeRunning = false; }
                }
                drawPath();
            } else {
                document.getElementById('maze-cost').textContent = '∞';
                mazeRunning = false;
            }
        }
    }
    step();
}

/* ==========================================
   3. RL PPO Agent Simulator
   ========================================== */
function initRLWidget() {
    const rlMap = [
        [0,0,1,0,0,0,0,0,0,0],
        [0,0,1,0,2,0,0,0,0,0],
        [0,0,0,0,0,0,2,0,0,0],
        [0,0,1,1,1,0,0,0,1,3],
        [0,2,0,0,1,0,0,0,0,0],
        [0,0,0,0,1,0,0,0,0,0]
    ];
    const rlRows = 6, rlCols = 10;
    let agentPos = [2, 0];
    let trainingTimer = null;

    function drawRLGrid() {
        const grid = document.getElementById('rl-grid');
        grid.innerHTML = '';
        for (let r = 0; r < rlRows; r++)
            for (let c = 0; c < rlCols; c++) {
                const cell = document.createElement('div');
                cell.className = 'rl-cell';
                if (rlMap[r][c] === 1) cell.classList.add('wall');
                else if (rlMap[r][c] === 2) cell.classList.add('enemy');
                else if (rlMap[r][c] === 3) cell.classList.add('goal');
                if (r === agentPos[0] && c === agentPos[1]) {
                    const dot = document.createElement('div');
                    dot.className = 'agent-dot';
                    cell.appendChild(dot);
                }
                grid.appendChild(cell);
            }
    }
    drawRLGrid();

    document.getElementById('rl-goal').addEventListener('input', e => {
        document.getElementById('rl-goal-val').textContent = `+${e.target.value}`;
    });
    document.getElementById('rl-enemy').addEventListener('input', e => {
        document.getElementById('rl-enemy-val').textContent = e.target.value;
    });

    document.getElementById('rl-reset').addEventListener('click', () => {
        clearInterval(trainingTimer);
        agentPos = [2, 0];
        drawRLGrid();
        document.getElementById('rl-epoch').textContent = '0';
        document.getElementById('rl-reward').textContent = '—';
        document.getElementById('rl-success').textContent = '0%';
        document.getElementById('rl-chart-line').setAttribute('points', '');
        document.getElementById('rl-train').disabled = false;
    });

    document.getElementById('rl-train').addEventListener('click', () => {
        document.getElementById('rl-train').disabled = true;
        let epoch = 0, points = '';
        const goalR = parseInt(document.getElementById('rl-goal').value);
        const enemyR = parseInt(document.getElementById('rl-enemy').value);

        trainingTimer = setInterval(() => {
            epoch += 5;
            if (epoch > 50) { clearInterval(trainingTimer); document.getElementById('rl-train').disabled = false; return; }

            const path = getAgentPath(epoch, rlMap);
            let reward = 0;
            path.forEach(([r, c]) => {
                if (rlMap[r][c] === 2) reward += enemyR;
                else if (rlMap[r][c] === 3) reward += goalR;
                reward -= 1;
            });

            document.getElementById('rl-epoch').textContent = epoch;
            document.getElementById('rl-reward').textContent = reward;
            let sr = Math.min(100, Math.max(0, Math.round((epoch - 10) * 2.5)));
            document.getElementById('rl-success').textContent = `${sr}%`;

            let x = (epoch / 50) * 160;
            let y = 50 - ((reward + 120) / 250) * 50;
            y = Math.max(2, Math.min(48, y));
            points += `${x},${y} `;
            document.getElementById('rl-chart-line').setAttribute('points', points);

            // Animate agent
            let si = 0;
            let walkT = setInterval(() => {
                if (si < path.length) { agentPos = path[si]; drawRLGrid(); si++; }
                else clearInterval(walkT);
            }, 60);
        }, 1500);
    });

    function getAgentPath(epoch, map) {
        if (epoch <= 10) return [[2,0],[2,1],[1,1],[1,2]]; // hits wall
        if (epoch <= 25) return [[2,0],[2,1],[2,2],[2,3],[2,4],[1,4]]; // hits enemy
        if (epoch <= 40) return [[2,0],[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,8],[3,8]]; // hits wall near goal
        return [[2,0],[2,1],[2,2],[2,3],[1,3],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],[0,9],[1,9],[2,9],[2,8],[3,8],[3,9]]; // optimal
    }
}

/* ==========================================
   4. Finance Dashboard
   ========================================== */
function initFinanceWidget() {
    const respBlock = document.getElementById('fin-response');
    const respText = document.getElementById('fin-response-text');

    document.querySelectorAll('.scenario-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const s = btn.dataset.scenario;
            respBlock.classList.remove('hidden');

            if (s === 'food') {
                document.getElementById('fin-bar-food').style.height = '20%';
                document.getElementById('fin-savings').textContent = '$1,390';
                respText.textContent = 'Cutting dining expenses by 50% saves ~$190/month, raising your average savings from $1,200 to $1,390. RAG analysis confirms this won\'t affect essential nutrition spend.';
            } else if (s === 'rent') {
                document.getElementById('fin-bar-rent').style.height = '30%';
                document.getElementById('fin-savings').textContent = '$1,800';
                respText.textContent = 'Splitting rent with a roommate cuts housing costs by 50%, saving $600/month. Your savings jump to $1,800 — a 50% increase in your monthly wealth rate.';
            } else if (s === 'laptop') {
                respText.textContent = 'You can afford a $1,200 laptop this month — it matches exactly one month of savings. Your emergency reserve remains untouched. Transaction analysis confirms no recurring payment conflicts.';
            }
        });
    });
}

/* ==========================================
   5. NutriAI Recipe Scaler
   ========================================== */
function initNutriWidget() {
    const slider = document.getElementById('nutri-slider');
    const countLabel = document.getElementById('nutri-count');

    slider.addEventListener('input', () => { countLabel.textContent = slider.value; });

    const db = {
        gujarati: {
            name: 'Paneer Tikka Masala & Roti',
            ingredients: [
                { item: 'Paneer cubes', qty: 75, unit: 'g' },
                { item: 'Tomato puree', qty: 0.75, unit: 'pcs' },
                { item: 'Fresh cream', qty: 15, unit: 'ml' },
                { item: 'Wheat flour (rotis)', qty: 50, unit: 'g' },
                { item: 'Garam Masala', qty: 1, unit: 'tsp' }
            ],
            steps: ['Marinate paneer in spices and roast until golden.', 'Sauté onion, tomato puree, and spices to prepare gravy.', 'Add cream and roasted paneer, simmer 5 min.', 'Roll wheat dough into circles, puff on griddle.', 'Serve hot with coriander garnish.']
        },
        italian: {
            name: 'Classic Margherita Pasta',
            ingredients: [
                { item: 'Penne pasta', qty: 80, unit: 'g' },
                { item: 'Marinara sauce', qty: 60, unit: 'ml' },
                { item: 'Mozzarella', qty: 25, unit: 'g' },
                { item: 'Fresh basil', qty: 2, unit: 'leaves' },
                { item: 'Olive oil', qty: 5, unit: 'ml' }
            ],
            steps: ['Boil pasta until al dente, drain.', 'Heat olive oil, sauté garlic, add marinara.', 'Toss pasta into sauce, coat evenly.', 'Tear mozzarella over hot pasta.', 'Top with basil and black pepper. Serve.']
        },
        mexican: {
            name: 'Pinto Bean Enchiladas',
            ingredients: [
                { item: 'Tortillas', qty: 1.5, unit: 'pcs' },
                { item: 'Pinto beans', qty: 60, unit: 'g' },
                { item: 'Enchilada sauce', qty: 50, unit: 'ml' },
                { item: 'Cheddar cheese', qty: 20, unit: 'g' },
                { item: 'Onions & peppers', qty: 30, unit: 'g' }
            ],
            steps: ['Sauté onions, peppers, and beans.', 'Fill tortillas, roll tightly, place in tray.', 'Pour enchilada sauce over rolled tortillas.', 'Top with shredded cheddar.', 'Bake 15 min until bubbly. Serve hot.']
        }
    };

    document.getElementById('nutri-generate').addEventListener('click', () => {
        const cuisine = document.getElementById('nutri-cuisine').value;
        const count = parseInt(slider.value);
        const r = db[cuisine];
        if (!r) return;

        document.getElementById('nutri-title').textContent = `${r.name} — for ${count}`;

        const ingList = document.getElementById('nutri-ingredients');
        ingList.innerHTML = '';
        r.ingredients.forEach(ing => {
            const li = document.createElement('li');
            const scaled = (ing.qty * count).toFixed(1).replace(/\.0$/, '');
            li.innerHTML = `<strong>${scaled} ${ing.unit}</strong> ${ing.item}`;
            ingList.appendChild(li);
        });

        const stepList = document.getElementById('nutri-steps');
        stepList.innerHTML = '';
        r.steps.forEach(s => {
            const li = document.createElement('li');
            li.textContent = s;
            stepList.appendChild(li);
        });

        document.getElementById('nutri-output').classList.remove('hidden');
    });
}
