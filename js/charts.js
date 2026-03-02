/* ======================================================
   Chart Utilities — Canvas-based gauges & charts
   ====================================================== */

const Charts = {
    /**
     * Draw a radial threat gauge
     */
    drawGauge(canvasId, value, maxValue = 100) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h - 10;
        const radius = Math.min(cx, cy) - 20;
        const startAngle = Math.PI;
        const endAngle = 2 * Math.PI;
        const pct = Math.min(value / maxValue, 1);
        const sweepAngle = startAngle + pct * Math.PI;

        ctx.clearRect(0, 0, w, h);

        // Background arc
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.lineWidth = 14;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineCap = 'round';
        ctx.stroke();

        // Colored arc — gradient based on value
        let color;
        if (pct < 0.3) color = '#39ff14';
        else if (pct < 0.5) color = '#ffe600';
        else if (pct < 0.75) color = '#ff6a00';
        else color = '#ff003c';

        const gradient = ctx.createLinearGradient(0, cy, w, cy);
        gradient.addColorStop(0, '#39ff14');
        gradient.addColorStop(0.4, '#ffe600');
        gradient.addColorStop(0.7, '#ff6a00');
        gradient.addColorStop(1, '#ff003c');

        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, sweepAngle);
        ctx.lineWidth = 14;
        ctx.strokeStyle = gradient;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glow effect
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, sweepAngle);
        ctx.lineWidth = 20;
        ctx.strokeStyle = color.replace(')', ', 0.15)').replace('rgb', 'rgba').replace('#', '');
        // Simplified glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Tick marks
        for (let i = 0; i <= 10; i++) {
            const angle = startAngle + (i / 10) * Math.PI;
            const inner = radius - 24;
            const outer = radius - 18;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
            ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;
            ctx.stroke();
        }

        // Needle
        const needleAngle = startAngle + pct * Math.PI;
        const needleLen = radius - 30;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
            cx + Math.cos(needleAngle) * needleLen,
            cy + Math.sin(needleAngle) * needleLen
        );
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Center dot
        ctx.beginPath();
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    },

    /**
     * Animate gauge from 0 to target value
     */
    animateGauge(canvasId, targetValue, duration = 1500) {
        const start = performance.now();
        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = Math.round(targetValue * eased);
            this.drawGauge(canvasId, current);
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    },

    /**
     * Draw network topology graph on canvas
     */
    drawNetworkTopology(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const w = canvas.width;
        const h = canvas.height;

        // Define nodes
        const nodes = [
            { x: w * 0.5, y: h * 0.12, label: 'FIREWALL', type: 'firewall', color: '#ff003c' },
            { x: w * 0.25, y: h * 0.35, label: 'WEB-SRV-01', type: 'server', color: '#00f0ff' },
            { x: w * 0.5, y: h * 0.35, label: 'SENTINEL AI', type: 'ai', color: '#ff00e5' },
            { x: w * 0.75, y: h * 0.35, label: 'DB-CLUSTER', type: 'database', color: '#ffe600' },
            { x: w * 0.15, y: h * 0.6, label: 'ENDPOINT-A', type: 'endpoint', color: '#39ff14' },
            { x: w * 0.38, y: h * 0.6, label: 'ENDPOINT-B', type: 'endpoint', color: '#39ff14' },
            { x: w * 0.62, y: h * 0.6, label: 'ENDPOINT-C', type: 'endpoint', color: '#39ff14' },
            { x: w * 0.85, y: h * 0.6, label: 'API-GW', type: 'server', color: '#00f0ff' },
            { x: w * 0.3, y: h * 0.85, label: 'IOT-SENSOR-1', type: 'iot', color: '#a855f7' },
            { x: w * 0.5, y: h * 0.85, label: 'IOT-SENSOR-2', type: 'iot', color: '#a855f7' },
            { x: w * 0.7, y: h * 0.85, label: 'CLOUD-BACKUP', type: 'cloud', color: '#00f0ff' },
        ];

        // Define edges (from → to by index)
        const edges = [
            [0, 1], [0, 2], [0, 3],
            [1, 4], [1, 5], [2, 5], [2, 6],
            [3, 6], [3, 7],
            [4, 8], [5, 9], [6, 9],
            [7, 10],
        ];

        // Clear
        ctx.clearRect(0, 0, w, h);

        // Draw edges
        edges.forEach(([from, to]) => {
            const a = nodes[from];
            const b = nodes[to];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Animate data packet
            const time = (Date.now() % 3000) / 3000;
            const px = a.x + (b.x - a.x) * time;
            const py = a.y + (b.y - a.y) * time;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
            ctx.fill();
        });

        // Draw nodes
        nodes.forEach((node) => {
            // Outer glow
            ctx.beginPath();
            ctx.arc(node.x, node.y, 22, 0, Math.PI * 2);
            ctx.fillStyle = node.color.replace(')', ', 0.1)').includes('rgba')
                ? node.color
                : `${node.color}18`;
            ctx.fill();

            // Node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(10, 14, 26, 0.9)';
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 2;
            ctx.fill();
            ctx.shadowColor = node.color;
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Inner icon dot
            ctx.beginPath();
            ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.fill();

            // Label
            ctx.font = "600 9px 'Share Tech Mono', monospace";
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(224, 230, 240, 0.7)';
            ctx.fillText(node.label, node.x, node.y + 32);
        });
    },

    /**
     * Draw world map with attack markers
     */
    drawGeoMap(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Draw simplified world map outline (stylized dots)
        this._drawWorldDots(ctx, w, h);

        // Attack origin points
        const attacks = [
            { lat: 55.75, lon: 37.62, label: 'Moscow', severity: 'critical' },
            { lat: 39.9, lon: 116.4, label: 'Beijing', severity: 'high' },
            { lat: 35.68, lon: 139.69, label: 'Tokyo', severity: 'medium' },
            { lat: 37.57, lon: -122.0, label: 'Silicon Valley', severity: 'low' },
            { lat: 1.35, lon: 103.82, label: 'Singapore', severity: 'high' },
            { lat: -33.87, lon: 151.21, label: 'Sydney', severity: 'medium' },
            { lat: 51.51, lon: -0.13, label: 'London', severity: 'critical' },
            { lat: 48.86, lon: 2.35, label: 'Paris', severity: 'low' },
            { lat: 28.61, lon: 77.21, label: 'New Delhi', severity: 'high' },
            { lat: -23.55, lon: -46.63, label: 'São Paulo', severity: 'medium' },
            { lat: 40.71, lon: -74.01, label: 'New York', severity: 'critical' },
            { lat: 25.28, lon: 55.3, label: 'Dubai', severity: 'high' },
        ];

        const time = Date.now();

        attacks.forEach((atk) => {
            // Convert lat/lon to canvas coords (Mercator-ish)
            const x = ((atk.lon + 180) / 360) * w;
            const y = ((90 - atk.lat) / 180) * h;

            let color;
            switch (atk.severity) {
                case 'critical': color = '#ff003c'; break;
                case 'high': color = '#ff6a00'; break;
                case 'medium': color = '#ffe600'; break;
                default: color = '#39ff14';
            }

            // Pulsing ring
            const pulse = (Math.sin(time / 600 + atk.lon) + 1) / 2;
            const ringRadius = 8 + pulse * 12;
            ctx.beginPath();
            ctx.arc(x, y, ringRadius, 0, Math.PI * 2);
            ctx.strokeStyle = color.replace(')', `, ${0.3 - pulse * 0.25})`);
            ctx.strokeStyle = color + Math.round((0.3 - pulse * 0.25) * 255).toString(16).padStart(2, '0');
            ctx.lineWidth = 1;
            ctx.stroke();

            // Center dot
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Label
            ctx.font = "600 8px 'Share Tech Mono', monospace";
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(224, 230, 240, 0.5)';
            ctx.fillText(atk.label.toUpperCase(), x, y - 14);
        });

        // Draw attack lines to center (our location)
        const centerX = w * 0.5;
        const centerY = h * 0.45;

        // Draw "HQ" marker
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = "700 9px 'Share Tech Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00f0ff';
        ctx.fillText('HQ', centerX, centerY - 12);

        attacks.forEach((atk) => {
            if (atk.severity === 'critical' || atk.severity === 'high') {
                const x = ((atk.lon + 180) / 360) * w;
                const y = ((90 - atk.lat) / 180) * h;

                // Animated dash
                const dashOffset = (time / 50) % 20;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(centerX, centerY);
                ctx.setLineDash([4, 8]);
                ctx.lineDashOffset = -dashOffset;
                ctx.strokeStyle = atk.severity === 'critical' ? 'rgba(255, 0, 60, 0.2)' : 'rgba(255, 106, 0, 0.15)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.setLineDash([]);
            }
        });
    },

    /**
     * Draw stylized world map dots
     */
    _drawWorldDots(ctx, w, h) {
        // Simplified continent outlines as dot clusters
        const continents = [
            // North America
            ...this._generateDots(w * 0.08, w * 0.3, h * 0.15, h * 0.45, 60),
            // South America
            ...this._generateDots(w * 0.18, w * 0.32, h * 0.5, h * 0.85, 40),
            // Europe
            ...this._generateDots(w * 0.42, w * 0.55, h * 0.12, h * 0.35, 45),
            // Africa
            ...this._generateDots(w * 0.42, w * 0.58, h * 0.35, h * 0.7, 50),
            // Asia
            ...this._generateDots(w * 0.55, w * 0.85, h * 0.1, h * 0.45, 70),
            // Australia
            ...this._generateDots(w * 0.78, w * 0.92, h * 0.6, h * 0.78, 25),
        ];

        continents.forEach((dot) => {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 1, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
            ctx.fill();
        });
    },

    _generateDots(x1, x2, y1, y2, count) {
        const dots = [];
        for (let i = 0; i < count; i++) {
            dots.push({
                x: x1 + Math.random() * (x2 - x1),
                y: y1 + Math.random() * (y2 - y1),
            });
        }
        return dots;
    },
};
