/* ======================================================
   SENTINEL AI — Main Application Logic
   ====================================================== */

(function () {
    'use strict';

    // ============ SHARED DATA ==============
    const THREAT_TYPES = [
        { title: 'SQL Injection Attempt', severity: 'critical', source: '185.220.101.45', target: 'WEB-SRV-01' },
        { title: 'Brute Force SSH Login', severity: 'high', source: '103.214.67.12', target: 'DB-CLUSTER' },
        { title: 'Ransomware Payload Detected', severity: 'critical', source: '91.234.33.78', target: 'ENDPOINT-A' },
        { title: 'Suspicious DNS Query', severity: 'medium', source: '45.33.49.119', target: 'FIREWALL' },
        { title: 'Port Scan Detected', severity: 'high', source: '178.162.210.5', target: 'API-GW' },
        { title: 'Phishing Email Intercepted', severity: 'medium', source: '209.85.220.41', target: 'ENDPOINT-B' },
        { title: 'DDoS Traffic Spike', severity: 'critical', source: '152.89.196.77', target: 'FIREWALL' },
        { title: 'Malware C2 Communication', severity: 'critical', source: '198.51.100.23', target: 'ENDPOINT-C' },
        { title: 'Unauthorized API Access', severity: 'high', source: '203.0.113.42', target: 'API-GW' },
        { title: 'Certificate Anomaly', severity: 'low', source: '10.0.1.55', target: 'WEB-SRV-01' },
        { title: 'Privilege Escalation Attempt', severity: 'critical', source: '172.16.0.99', target: 'DB-CLUSTER' },
        { title: 'Data Exfiltration Detected', severity: 'critical', source: '77.88.55.80', target: 'ENDPOINT-A' },
        { title: 'Anomalous Login Location', severity: 'medium', source: '45.77.65.99', target: 'WEB-SRV-01' },
        { title: 'Outdated TLS Protocol', severity: 'low', source: '10.0.2.30', target: 'API-GW' },
        { title: 'Zero-Day Exploit Attempt', severity: 'critical', source: '89.248.174.22', target: 'FIREWALL' },
        { title: 'Lateral Movement Detected', severity: 'high', source: '192.168.1.105', target: 'ENDPOINT-B' },
        { title: 'Crypto Mining Activity', severity: 'medium', source: '10.0.3.44', target: 'ENDPOINT-C' },
        { title: 'Rogue DHCP Server', severity: 'high', source: '192.168.0.254', target: 'NETWORK' },
    ];

    const AI_ACTIONS = [
        { title: 'Blocked IP 185.220.101.45', detail: 'Auto-blocked after 3 failed intrusion attempts', type: 'block', status: 'executed' },
        { title: 'Quarantined file: trojan_x.exe', detail: 'SHA256 matched known ransomware signature', type: 'quarantine', status: 'executed' },
        { title: 'Initiated deep scan on ENDPOINT-A', detail: 'Anomalous process hierarchy detected', type: 'scan', status: 'pending' },
        { title: 'Patched CVE-2026-44228', detail: 'Auto-deployed critical security patch', type: 'patch', status: 'executed' },
        { title: 'Alert: Unusual egress traffic', detail: '450MB outbound to unknown destination', type: 'alert', status: 'executed' },
        { title: 'Blocked IP 91.234.33.78', detail: 'Known threat actor — APT-29 attribution', type: 'block', status: 'executed' },
        { title: 'Revoked API key: sk-live-xxx', detail: 'Unauthorized usage from unknown region', type: 'block', status: 'executed' },
        { title: 'Isolated ENDPOINT-C from network', detail: 'C2 beacon communication detected', type: 'quarantine', status: 'pending' },
        { title: 'Updated firewall rules', detail: 'Added 17 new IP block rules', type: 'patch', status: 'executed' },
        { title: 'Scanning DB-CLUSTER for injection', detail: 'SQL injection payload detected in logs', type: 'scan', status: 'pending' },
    ];

    const INCIDENTS = [
        { id: 'INC-2847', threat: 'Ransomware Attack', severity: 'critical', status: 'open', time: '2 min ago' },
        { id: 'INC-2846', threat: 'DDoS on Firewall', severity: 'critical', status: 'investigating', time: '14 min ago' },
        { id: 'INC-2845', threat: 'Data Exfiltration', severity: 'high', status: 'investigating', time: '28 min ago' },
        { id: 'INC-2844', threat: 'Brute Force SSH', severity: 'high', status: 'mitigated', time: '1 hr ago' },
        { id: 'INC-2843', threat: 'Phishing Campaign', severity: 'medium', status: 'resolved', time: '2 hr ago' },
        { id: 'INC-2842', threat: 'Port Scan', severity: 'medium', status: 'resolved', time: '3 hr ago' },
        { id: 'INC-2841', threat: 'Certificate Expired', severity: 'low', status: 'resolved', time: '5 hr ago' },
    ];

    const NOTIFICATIONS = [
        { text: 'Critical: Ransomware detected on ENDPOINT-A', time: '2 min ago', type: 'critical', unread: true },
        { text: 'AI Engine blocked 3 malicious IPs automatically', time: '5 min ago', type: 'info', unread: true },
        { text: 'DDoS mitigation activated on FIREWALL', time: '14 min ago', type: 'warning', unread: true },
        { text: 'New vulnerability: CVE-2026-44228 patched', time: '28 min ago', type: 'success', unread: true },
        { text: 'Scheduled scan completed: 0 threats found', time: '1 hr ago', type: 'info', unread: false },
    ];

    // ============ LOGIN PAGE LOGIC ==============
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        initLoginPage();
    }

    // ============ DASHBOARD PAGE LOGIC ==============
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        initDashboard();
    }

    // ==============================
    //  LOGIN PAGE
    // ==============================
    function initLoginPage() {
        const form = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');
        const statusEl = document.getElementById('loginStatus');
        const togglePwd = document.getElementById('togglePassword');
        const pwdInput = document.getElementById('password');
        const tfaToggle = document.getElementById('tfaToggle');
        const tfaGroup = document.getElementById('tfaGroup');
        const fingerprintBtn = document.getElementById('fingerprintBtn');
        const roleTabs = document.querySelectorAll('.role-tab');
        let selectedRole = 'admin';

        // Role tab switching
        roleTabs.forEach((tab) => {
            tab.addEventListener('click', () => {
                roleTabs.forEach((t) => t.classList.remove('active'));
                tab.classList.add('active');
                selectedRole = tab.dataset.role;
            });
        });

        // Password toggle
        if (togglePwd) {
            togglePwd.addEventListener('click', () => {
                const type = pwdInput.type === 'password' ? 'text' : 'password';
                pwdInput.type = type;
                togglePwd.innerHTML = type === 'password'
                    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
                    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
            });
        }

        // 2FA toggle
        if (tfaToggle) {
            tfaToggle.addEventListener('change', () => {
                tfaGroup.style.display = tfaToggle.checked ? 'block' : 'none';
            });
        }

        // Form submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                showStatus(statusEl, 'error', '⚠ ALL FIELDS REQUIRED');
                return;
            }

            // Start loading animation
            loginBtn.classList.add('loading');
            loginBtn.innerHTML = '<span class="spinner"></span> AUTHENTICATING...';

            // Simulate authentication
            setTimeout(() => {
                // Accept any credentials for demo
                showStatus(statusEl, 'success', '✓ ACCESS GRANTED — Initializing secure session...');

                // Store session
                sessionStorage.setItem('sentinel_user', username);
                sessionStorage.setItem('sentinel_role', selectedRole);

                // Redirect after brief delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1200);
            }, 2000);
        });

        // Fingerprint button
        if (fingerprintBtn) {
            fingerprintBtn.addEventListener('click', () => {
                fingerprintBtn.style.borderColor = 'var(--cyan)';
                fingerprintBtn.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.5)';

                setTimeout(() => {
                    showStatus(statusEl, 'success', '✓ BIOMETRIC VERIFIED — Access granted');
                    sessionStorage.setItem('sentinel_user', 'BioUser');
                    sessionStorage.setItem('sentinel_role', 'admin');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1200);
                }, 1500);
            });
        }
    }

    function showStatus(el, type, message) {
        el.className = 'login-status ' + type;
        el.textContent = message;
        el.style.display = 'block';
    }

    // ==============================
    //  DASHBOARD
    // ==============================
    function initDashboard() {
        const user = sessionStorage.getItem('sentinel_user') || 'Admin';
        const role = sessionStorage.getItem('sentinel_role') || 'admin';

        // Set user info
        const avatarEl = document.getElementById('userAvatar');
        const nameEl = document.getElementById('userName');
        const roleEl = document.getElementById('userRole');
        if (avatarEl) avatarEl.textContent = user.substring(0, 2).toUpperCase();
        if (nameEl) nameEl.textContent = user;
        if (roleEl) roleEl.textContent = role.toUpperCase();

        // Update time
        updateDashboardTime();
        setInterval(updateDashboardTime, 1000);

        // Sidebar toggle
        const toggleBtn = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
            });
        }

        // Active nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach((item) => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navItems.forEach((n) => n.classList.remove('active'));
                item.classList.add('active');
            });
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.clear();
                window.location.href = 'index.html';
            });
        }

        // Notifications
        initNotifications();

        // Populate panels
        populateThreatFeed();
        populateAIActions();
        populateIncidents();
        populateHealthMetrics();

        // Advanced features
        initAITerminal();
        populateMitreMatrix();
        populateDarkWebFeed();
        initTrafficChart();

        // Start canvas animations
        if (typeof Charts !== 'undefined') {
            Charts.animateGauge('threatGauge', 72);

            // Network topology animation loop
            function animateNetwork() {
                Charts.drawNetworkTopology('networkCanvas');
                requestAnimationFrame(animateNetwork);
            }
            animateNetwork();

            // Geo map animation loop
            function animateGeo() {
                Charts.drawGeoMap('geoMapCanvas');
                requestAnimationFrame(animateGeo);
            }
            animateGeo();
        }

        // Start live threat feed
        let feedPaused = false;
        const pauseBtn = document.getElementById('pauseFeed');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                feedPaused = !feedPaused;
                pauseBtn.innerHTML = feedPaused
                    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
                    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
            });
        }

        setInterval(() => {
            if (!feedPaused) addRandomThreat();
        }, 4000);

        // Add random AI actions
        setInterval(() => {
            addRandomAIAction();
        }, 7000);

        // Update stats periodically
        setInterval(updateStats, 10000);

        // Animate threat gauge with slight variation
        setInterval(() => {
            const newVal = 65 + Math.floor(Math.random() * 25);
            if (typeof Charts !== 'undefined') {
                Charts.animateGauge('threatGauge', newVal, 800);
            }
            const gaugeValEl = document.getElementById('gaugeValue');
            if (gaugeValEl) {
                gaugeValEl.textContent = newVal + '%';
                if (newVal >= 75) {
                    gaugeValEl.className = 'gauge-value text-red';
                } else if (newVal >= 50) {
                    gaugeValEl.className = 'gauge-value text-orange';
                } else {
                    gaugeValEl.className = 'gauge-value text-lime';
                }
            }
        }, 5000);

        // Global search
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                // Filter threat feed items
                document.querySelectorAll('.threat-item').forEach((item) => {
                    const text = item.textContent.toLowerCase();
                    item.style.display = text.includes(query) ? 'flex' : 'none';
                });
            });
        }

        // Handle window resize for canvases
        window.addEventListener('resize', () => {
            if (typeof Charts !== 'undefined') {
                Charts.drawNetworkTopology('networkCanvas');
                Charts.drawGeoMap('geoMapCanvas');
            }
        });
    }

    function updateDashboardTime() {
        const el = document.getElementById('dashboardTime');
        if (!el) return;
        const now = new Date();
        const utc = now.toISOString().substring(11, 19);
        el.textContent = `SENTINEL AI // LAST SCAN: ${utc} UTC // UPTIME: 99.97%`;
    }

    // ---- Notifications ----
    function initNotifications() {
        const btn = document.getElementById('notifBtn');
        const dropdown = document.getElementById('notifDropdown');
        const list = document.getElementById('notifList');
        const count = document.getElementById('notifCount');
        const markAllBtn = document.getElementById('markAllRead');

        // Populate notifications
        if (list) {
            list.innerHTML = NOTIFICATIONS.map((n) => {
                let iconBg, iconColor;
                switch (n.type) {
                    case 'critical': iconBg = 'var(--red-dim)'; iconColor = 'var(--red)'; break;
                    case 'warning': iconBg = 'var(--orange-dim)'; iconColor = 'var(--orange)'; break;
                    case 'success': iconBg = 'var(--lime-dim)'; iconColor = 'var(--lime)'; break;
                    default: iconBg = 'var(--cyan-dim)'; iconColor = 'var(--cyan)';
                }
                return `
          <div class="notif-item ${n.unread ? 'unread' : ''}">
            <div class="notif-icon" style="background:${iconBg}; color:${iconColor};">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div class="notif-text">
              <p>${n.text}</p>
              <span class="notif-time">${n.time}</span>
            </div>
          </div>
        `;
            }).join('');
        }

        // Toggle dropdown
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!btn.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
        }

        // Mark all read
        if (markAllBtn) {
            markAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.notif-item.unread').forEach((item) => {
                    item.classList.remove('unread');
                });
                if (count) count.style.display = 'none';
            });
        }
    }

    // ---- Threat Feed ----
    function populateThreatFeed() {
        const feed = document.getElementById('threatFeed');
        if (!feed) return;

        // Add initial threats
        const initial = THREAT_TYPES.slice(0, 8);
        initial.forEach((t, i) => {
            const time = `${i + 1} min ago`;
            feed.innerHTML += createThreatItem(t, time);
        });
    }

    function createThreatItem(threat, time) {
        return `
      <div class="threat-item">
        <div class="severity-dot ${threat.severity}"></div>
        <div class="threat-content">
          <div class="threat-title">${threat.title}</div>
          <div class="threat-meta">
            <span>SRC: ${threat.source}</span>
            <span>TGT: ${threat.target}</span>
            <span class="badge ${threat.severity}">${threat.severity}</span>
          </div>
        </div>
        <div class="threat-time">${time}</div>
      </div>
    `;
    }

    function addRandomThreat() {
        const feed = document.getElementById('threatFeed');
        if (!feed) return;

        const threat = THREAT_TYPES[Math.floor(Math.random() * THREAT_TYPES.length)];
        const newItem = document.createElement('div');
        newItem.innerHTML = createThreatItem(threat, 'just now');
        const first = newItem.firstElementChild;

        // Insert at top
        feed.insertBefore(first, feed.firstChild);

        // Remove old items if too many
        while (feed.children.length > 15) {
            feed.removeChild(feed.lastChild);
        }

        // Update stat
        const statEl = document.getElementById('statThreats');
        if (statEl) {
            const current = parseInt(statEl.textContent.replace(/,/g, ''));
            statEl.textContent = (current + 1).toLocaleString();
        }
    }

    // ---- AI Actions ----
    function populateAIActions() {
        const list = document.getElementById('aiActionsList');
        if (!list) return;

        AI_ACTIONS.slice(0, 6).forEach((action) => {
            list.innerHTML += createAIActionItem(action);
        });
    }

    function createAIActionItem(action) {
        const icons = {
            block: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
            quarantine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>',
            scan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
            patch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>',
            alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        };

        return `
      <div class="ai-action-item">
        <div class="ai-action-icon ${action.type}">${icons[action.type] || icons.alert}</div>
        <div class="ai-action-info">
          <div class="ai-action-title">${action.title}</div>
          <div class="ai-action-detail">${action.detail}</div>
        </div>
        <span class="ai-action-status ${action.status}">${action.status}</span>
      </div>
    `;
    }

    function addRandomAIAction() {
        const list = document.getElementById('aiActionsList');
        if (!list) return;

        const action = AI_ACTIONS[Math.floor(Math.random() * AI_ACTIONS.length)];
        const newItem = document.createElement('div');
        newItem.innerHTML = createAIActionItem(action);
        const first = newItem.firstElementChild;
        list.insertBefore(first, list.firstChild);

        while (list.children.length > 8) {
            list.removeChild(list.lastChild);
        }

        // Update stat
        const statEl = document.getElementById('statResponses');
        if (statEl) {
            const current = parseInt(statEl.textContent.replace(/,/g, ''));
            statEl.textContent = (current + 1).toLocaleString();
        }
    }

    // ---- Incidents ----
    function populateIncidents() {
        const tbody = document.getElementById('incidentBody');
        if (!tbody) return;

        INCIDENTS.forEach((inc) => {
            tbody.innerHTML += `
        <tr>
          <td><span class="incident-id">${inc.id}</span></td>
          <td>${inc.threat}</td>
          <td><span class="badge ${inc.severity}">${inc.severity}</span></td>
          <td><span class="status-pill ${inc.status}">${inc.status}</span></td>
          <td style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">${inc.time}</td>
        </tr>
      `;
        });
    }

    // ---- Health Metrics ----
    function populateHealthMetrics() {
        const container = document.getElementById('healthMetrics');
        if (!container) return;

        const metrics = [
            { name: 'CPU Usage', value: 42, unit: '%', status: 'good' },
            { name: 'Memory', value: 67, unit: '%', status: 'good' },
            { name: 'Network I/O', value: 78, unit: '%', status: 'warning' },
            { name: 'Disk', value: 31, unit: '%', status: 'good' },
            { name: 'GPU (AI Engine)', value: 89, unit: '%', status: 'warning' },
            { name: 'Threat DB Sync', value: 96, unit: '%', status: 'good' },
        ];

        container.innerHTML = metrics.map((m) => `
      <div class="health-metric">
        <div class="metric-header">
          <span class="metric-name">${m.name}</span>
          <span class="metric-value">${m.value}${m.unit}</span>
        </div>
        <div class="health-bar">
          <div class="health-bar-fill ${m.value > 80 ? 'danger' : m.value > 60 ? 'warning' : 'good'}" style="width: 0%;" data-target="${m.value}"></div>
        </div>
      </div>
    `).join('');

        // Animate bars on load
        setTimeout(() => {
            container.querySelectorAll('.health-bar-fill').forEach((bar) => {
                bar.style.width = bar.dataset.target + '%';
            });
        }, 300);
    }

    // ---- Update Stats ----
    function updateStats() {
        const blocked = document.getElementById('statBlocked');
        if (blocked) {
            const current = parseInt(blocked.textContent.replace(/,/g, ''));
            blocked.textContent = (current + Math.floor(Math.random() * 5)).toLocaleString();
        }
    }

    // ======================================
    //  ADVANCED: AI Command Terminal
    // ======================================
    const TERMINAL_SCRIPTS = [
        [
            { type: 'cmd', text: 'sentinel --scan-network --deep' },
            { type: 'output', text: '[SCAN] Initiating deep network scan across 247 endpoints...' },
            { type: 'output', text: '[SCAN] Scanning subnet 10.0.1.0/24 ████████████████ 100%' },
            { type: 'info', text: '[INFO] 3 anomalies detected on ENDPOINT-A, ENDPOINT-C, API-GW' },
            { type: 'warning', text: '[WARN] ENDPOINT-C: Suspicious outbound connections to 198.51.100.23' },
            { type: 'ai-thought', text: '>> AI Analysis: Pattern matches APT-29 C2 beacon behavior (confidence: 94.2%)' },
            { type: 'success', text: '[ACTION] Auto-isolating ENDPOINT-C from network segment' },
            { type: 'success', text: '[ACTION] Firewall rule FW-2847 created: BLOCK 198.51.100.0/24' },
        ],
        [
            { type: 'cmd', text: 'sentinel --threat-intel --query "APT-29"' },
            { type: 'output', text: '[INTEL] Querying threat intelligence databases...' },
            { type: 'output', text: '[INTEL] Sources: MITRE ATT&CK, VirusTotal, AlienVault OTX, Mandiant' },
            { type: 'info', text: '[INFO] APT-29 (Cozy Bear) — State-sponsored threat actor' },
            { type: 'output', text: '[INTEL] Known TTPs: T1566 (Phishing), T1059 (Command & Scripting)' },
            { type: 'output', text: '[INTEL] Recent IOCs: 14 IPs, 8 domains, 23 file hashes loaded' },
            { type: 'ai-thought', text: '>> AI Analysis: Cross-referencing IOCs with internal traffic logs...' },
            { type: 'error', text: '[ALERT] 2 IOC matches found in last 24h traffic!' },
            { type: 'success', text: '[ACTION] IOC blocklist updated. 14 IPs added to perimeter firewall.' },
        ],
        [
            { type: 'cmd', text: 'sentinel --ml-model --anomaly-detection --retrain' },
            { type: 'output', text: '[ML] Loading anomaly detection model v3.2.1...' },
            { type: 'output', text: '[ML] Training data: 2,847,321 network events (last 30 days)' },
            { type: 'output', text: '[ML] Feature extraction ████████████████ 100%' },
            { type: 'info', text: '[ML] Model accuracy: 97.3% | False positive rate: 0.8%' },
            { type: 'ai-thought', text: '>> AI Analysis: New attack pattern cluster identified — possible zero-day' },
            { type: 'warning', text: '[WARN] Unknown exploit signature detected in cluster #7' },
            { type: 'success', text: '[ACTION] Zero-day signature added to real-time detection engine' },
            { type: 'success', text: '[ML] Model v3.2.2 deployed successfully' },
        ],
    ];

    const TERMINAL_COMMANDS = {
        'help': [
            { type: 'info', text: 'Available commands:' },
            { type: 'output', text: '  scan      — Run network vulnerability scan' },
            { type: 'output', text: '  status    — Show system & AI engine status' },
            { type: 'output', text: '  threats   — List active threat summary' },
            { type: 'output', text: '  block     — Block suspicious IP address' },
            { type: 'output', text: '  clear     — Clear terminal output' },
            { type: 'output', text: '  help      — Show this help message' },
        ],
        'status': [
            { type: 'info', text: '[ SENTINEL AI STATUS ]' },
            { type: 'success', text: '  Neural Engine:   ONLINE  (v3.2)' },
            { type: 'success', text: '  Threat DB:       SYNCED  (2.1M signatures)' },
            { type: 'success', text: '  ML Pipeline:     ACTIVE  (97.3% accuracy)' },
            { type: 'warning', text: '  Alert Level:     HIGH    (72/100)' },
            { type: 'output', text: '  Uptime:          47d 12h 33m' },
        ],
        'threats': [
            { type: 'error', text: '[ ACTIVE THREATS: 5 ]' },
            { type: 'error', text: '  CRITICAL  Ransomware on ENDPOINT-A       [OPEN]' },
            { type: 'error', text: '  CRITICAL  DDoS on FIREWALL               [INVESTIGATING]' },
            { type: 'warning', text: '  HIGH      Data Exfiltration              [INVESTIGATING]' },
            { type: 'warning', text: '  HIGH      Brute Force SSH                [MITIGATED]' },
            { type: 'output', text: '  MEDIUM    Phishing Campaign              [RESOLVED]' },
        ],
        'scan': [
            { type: 'output', text: '[SCAN] Quick scan initiated...' },
            { type: 'output', text: '[SCAN] Checking 247 endpoints ████████████████ 100%' },
            { type: 'success', text: '[SCAN] Complete. 0 new vulnerabilities found.' },
        ],
        'block': [
            { type: 'info', text: '[FIREWALL] Enter IP to block or use: block <IP>' },
            { type: 'success', text: '[ACTION] IP 91.234.33.78 added to blocklist.' },
        ],
    };

    function initAITerminal() {
        const output = document.getElementById('terminalOutput');
        const input = document.getElementById('terminalInput');
        if (!output || !input) return;

        // Boot sequence
        const bootLines = [
            { type: 'info', text: '╔══════════════════════════════════════════╗' },
            { type: 'info', text: '║   SENTINEL AI — Neural Threat Engine    ║' },
            { type: 'info', text: '║   v3.2.1 | Autonomous Defense Mode      ║' },
            { type: 'info', text: '╚══════════════════════════════════════════╝' },
            { type: 'output', text: '' },
            { type: 'success', text: '[BOOT] All subsystems initialized.' },
            { type: 'output', text: '[INFO] Type "help" for available commands.' },
            { type: 'output', text: '' },
        ];

        bootLines.forEach((line, i) => {
            setTimeout(() => addTerminalLine(output, line), i * 150);
        });

        // Auto-pilot: run scripts automatically
        let scriptIdx = 0;
        function runAutoScript() {
            if (scriptIdx >= TERMINAL_SCRIPTS.length) scriptIdx = 0;
            const script = TERMINAL_SCRIPTS[scriptIdx++];
            script.forEach((line, i) => {
                setTimeout(() => {
                    addTerminalLine(output, line);
                    output.scrollTop = output.scrollHeight;
                }, i * 800);
            });
            // Trim old lines
            setTimeout(() => {
                while (output.children.length > 50) output.removeChild(output.firstChild);
            }, script.length * 800 + 100);
        }

        setTimeout(runAutoScript, bootLines.length * 150 + 2000);
        setInterval(runAutoScript, 15000);

        // User input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = input.value.trim().toLowerCase();
                input.value = '';
                if (!cmd) return;

                addTerminalLine(output, { type: 'cmd', text: cmd, isCmd: true });

                if (cmd === 'clear') {
                    output.innerHTML = '';
                    return;
                }

                const response = TERMINAL_COMMANDS[cmd] || [
                    { type: 'error', text: `Command not found: ${cmd}. Type "help" for commands.` }
                ];
                response.forEach((line, i) => {
                    setTimeout(() => {
                        addTerminalLine(output, line);
                        output.scrollTop = output.scrollHeight;
                    }, (i + 1) * 200);
                });
            }
        });
    }

    function addTerminalLine(container, line) {
        const div = document.createElement('div');
        div.className = 'terminal-line';
        if (line.isCmd || line.type === 'cmd') {
            div.innerHTML = `<span class="prompt">sentinel@ai:~$ </span><span class="cmd">${line.text}</span>`;
        } else {
            div.innerHTML = `<span class="${line.type}">${line.text}</span>`;
        }
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    // ======================================
    //  ADVANCED: MITRE ATT&CK Heatmap
    // ======================================
    function populateMitreMatrix() {
        const grid = document.getElementById('mitreGrid');
        if (!grid) return;

        const tactics = [
            { name: 'Recon', techniques: ['Active Scanning', 'Search Databases', 'Phishing Info', 'Gather Victim Info'] },
            { name: 'Resource Dev', techniques: ['Acquire Infra', 'Compromise Accounts', 'Develop Capabilities'] },
            { name: 'Initial Access', techniques: ['Phishing', 'Exploit Public App', 'Drive-by Compromise', 'Supply Chain'] },
            { name: 'Execution', techniques: ['Command Line', 'PowerShell', 'Scheduled Task', 'User Execution'] },
            { name: 'Persistence', techniques: ['Boot Autostart', 'Create Account', 'Registry Keys', 'Scheduled Task'] },
            { name: 'Privilege Esc', techniques: ['Exploit Vuln', 'Access Token', 'Sudo/Su Abuse', 'DLL Hijacking'] },
            { name: 'Defense Evasion', techniques: ['Obfuscation', 'Rootkits', 'Disable Logging', 'Masquerading'] },
            { name: 'Credential Access', techniques: ['Brute Force', 'Credential Dump', 'Keylogging', 'MFA Theft'] },
            { name: 'Discovery', techniques: ['Network Scan', 'System Info', 'Account Discovery', 'Process List'] },
            { name: 'Lateral Move', techniques: ['RDP', 'SSH Hijack', 'SMB/Admin Share', 'Pass the Hash'] },
            { name: 'Collection', techniques: ['Data Staging', 'Screen Capture', 'Email Collection', 'Clipboard'] },
            { name: 'Exfiltration', techniques: ['Exfil Over C2', 'Exfil Over Web', 'Data Encrypted', 'Transfer Size'] },
        ];

        grid.innerHTML = tactics.map(t => {
            const techHtml = t.techniques.map(() => {
                const heat = Math.random() < 0.15 ? 4 : Math.random() < 0.25 ? 3 : Math.random() < 0.4 ? 2 : Math.random() < 0.6 ? 1 : 0;
                return `<div class="mitre-technique heat-${heat}">${t.techniques[Math.floor(Math.random() * t.techniques.length)]}</div>`;
            }).join('');
            return `<div class="mitre-tactic"><div class="mitre-tactic-header">${t.name}</div>${techHtml}</div>`;
        }).join('');
    }

    // ======================================
    //  ADVANCED: Dark Web Intelligence
    // ======================================
    const DARKWEB_ITEMS = [
        { title: 'Employee credentials listed for sale', source: 'DarkForum', type: 'credential', detail: '247 email/password combos from Q4 breach — includes admin accounts', risk: 'extreme', time: '12 min ago' },
        { title: 'Organization mentioned in APT-29 chatter', source: 'TOR IRC', type: 'mention', detail: 'Threat actors discussing potential targets in financial sector', risk: 'high', time: '28 min ago' },
        { title: 'Exploit kit targeting CVE-2026-44228', source: 'Marketplace', type: 'exploit', detail: 'Zero-day exploit being sold for $45,000 — affects our stack', risk: 'extreme', time: '1 hr ago' },
        { title: 'Internal documents leaked', source: 'PasteBin', type: 'leak', detail: 'Partial network architecture diagrams found on paste site', risk: 'high', time: '2 hr ago' },
        { title: 'Phishing kit mimicking our login page', source: 'DarkMarket', type: 'marketplace', detail: 'Clone of SENTINEL AI login portal with credential harvesting', risk: 'high', time: '3 hr ago' },
        { title: 'Database dump for sale', source: 'RaidForums', type: 'credential', detail: '1.2M records claiming to be from partner organization', risk: 'medium', time: '5 hr ago' },
        { title: 'Ransomware-as-a-Service targeting sector', source: 'TOR Forum', type: 'exploit', detail: 'New RaaS variant specifically targets financial infrastructure', risk: 'extreme', time: '6 hr ago' },
    ];

    function populateDarkWebFeed() {
        const feed = document.getElementById('darkwebFeed');
        if (!feed) return;

        const icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

        feed.innerHTML = DARKWEB_ITEMS.map(item => `
        <div class="darkweb-item">
          <div class="darkweb-icon ${item.type}">${icon}</div>
          <div class="darkweb-content">
            <div class="darkweb-title">${item.title} <span class="darkweb-source">${item.source}</span></div>
            <div class="darkweb-detail">${item.detail}</div>
            <div class="darkweb-meta">
              <span class="darkweb-risk ${item.risk}">${item.risk}</span>
              <span>${item.time}</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    // ======================================
    //  ADVANCED: Traffic Analytics Chart
    // ======================================
    function initTrafficChart() {
        const canvas = document.getElementById('trafficChart');
        if (!canvas) return;

        const dataPoints = 60;
        const inbound = Array.from({ length: dataPoints }, () => 1.5 + Math.random() * 1.5);
        const outbound = Array.from({ length: dataPoints }, () => 1.0 + Math.random() * 1.2);
        const malicious = Array.from({ length: dataPoints }, () => 0.1 + Math.random() * 0.5);

        function draw() {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            const ctx = canvas.getContext('2d');
            const w = canvas.width;
            const h = canvas.height;
            const padding = { top: 20, right: 20, bottom: 30, left: 50 };
            const chartW = w - padding.left - padding.right;
            const chartH = h - padding.top - padding.bottom;
            const maxVal = 4;

            ctx.clearRect(0, 0, w, h);

            // Grid lines
            for (let i = 0; i <= 4; i++) {
                const y = padding.top + (chartH / 4) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(w - padding.right, y);
                ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
                ctx.lineWidth = 1;
                ctx.stroke();
                // Label
                ctx.font = "500 9px 'Share Tech Mono', monospace";
                ctx.fillStyle = 'rgba(136, 146, 164, 0.6)';
                ctx.textAlign = 'right';
                ctx.fillText((maxVal - i).toFixed(0) + ' Gbps', padding.left - 8, y + 3);
            }

            function drawLine(data, color, fillAlpha) {
                const step = chartW / (data.length - 1);
                ctx.beginPath();
                data.forEach((val, i) => {
                    const x = padding.left + i * step;
                    const y = padding.top + chartH - (val / maxVal) * chartH;
                    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                });
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Fill
                const lastX = padding.left + (data.length - 1) * step;
                ctx.lineTo(lastX, padding.top + chartH);
                ctx.lineTo(padding.left, padding.top + chartH);
                ctx.closePath();
                ctx.fillStyle = color.replace(')', `, ${fillAlpha})`).replace('rgb', 'rgba');
                ctx.globalAlpha = fillAlpha;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            drawLine(inbound, 'rgb(0, 240, 255)', 0.08);
            drawLine(outbound, 'rgb(255, 0, 229)', 0.06);
            drawLine(malicious, 'rgb(255, 0, 60)', 0.1);
        }

        // Shift data every second
        setInterval(() => {
            inbound.shift(); inbound.push(1.5 + Math.random() * 1.5);
            outbound.shift(); outbound.push(1.0 + Math.random() * 1.2);
            malicious.shift(); malicious.push(0.1 + Math.random() * 0.5);
            draw();
            // Update labels
            const inEl = document.getElementById('trafficIn');
            const outEl = document.getElementById('trafficOut');
            const malEl = document.getElementById('trafficMal');
            if (inEl) inEl.textContent = inbound[inbound.length - 1].toFixed(1) + ' Gbps';
            if (outEl) outEl.textContent = outbound[outbound.length - 1].toFixed(1) + ' Gbps';
            if (malEl) malEl.textContent = (malicious[malicious.length - 1] * 1000).toFixed(0) + ' Mbps';
        }, 1000);

        draw();
        window.addEventListener('resize', draw);
    }

})();
