// Dot-matrix field for the left panel: a soft drifting cloud of dots with an
// "ñ" glyph rendered in denser, darker dots. Static when reduced motion is set.
(function () {
    var canvas = document.getElementById("dots");
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var CELL = 4; // grid spacing, CSS px (3 on narrow screens)
    var DOT = 1.6; // dot size, CSS px
    var FRAME_MS = 50; // ~20fps is plenty for a slow drift
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var narrow = window.matchMedia("(max-width: 767px)");
    var dark = window.matchMedia("(prefers-color-scheme: dark)");

    var cols, rows, hash, blob, glyph, colX, rowY, dotRGB;
    var last = 0;

    function rand(i, j) {
        var s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
        return s - Math.floor(s);
    }

    function setup() {
        var w = canvas.clientWidth;
        var h = canvas.clientHeight;
        if (!w || !h) return false;
        CELL = narrow.matches ? 3 : 4;
        var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        cols = Math.ceil(w / CELL);
        rows = Math.ceil(h / CELL);
        dotRGB = getComputedStyle(document.documentElement).getPropertyValue("--dot").trim();

        // Centre of the art: middle of the left half on desktop, middle of the band on mobile.
        var panelW = narrow.matches ? w : w / 2;
        var cx = panelW / 2;
        var cy = h / 2;
        var radius = Math.min(panelW, h) * 0.55;

        // Rasterise the glyph once and sample its alpha per cell.
        var off = document.createElement("canvas");
        off.width = cols;
        off.height = rows;
        var octx = off.getContext("2d");
        var size = Math.min(panelW, h) * 0.5 / CELL;
        octx.font = "600 " + size + "px -apple-system, system-ui, sans-serif";
        octx.textAlign = "center";
        octx.textBaseline = "middle";
        octx.fillStyle = "#000";
        octx.fillText("ñ", cx / CELL, cy / CELL);
        var alpha = octx.getImageData(0, 0, cols, rows).data;

        var n = cols * rows;
        hash = new Float32Array(n);
        blob = new Float32Array(n);
        glyph = new Float32Array(n);
        for (var j = 0; j < rows; j++) {
            for (var i = 0; i < cols; i++) {
                var k = j * cols + i;
                var dx = (i * CELL - cx) / radius;
                var dy = (j * CELL - cy) / radius;
                hash[k] = rand(i, j);
                blob[k] = Math.exp(-(dx * dx + dy * dy) * 3);
                glyph[k] = alpha[k * 4 + 3] / 255;
            }
        }
        colX = new Float32Array(cols);
        rowY = new Float32Array(rows);
        return true;
    }

    function draw(t) {
        var w = canvas.clientWidth;
        var h = canvas.clientHeight;
        ctx.clearRect(0, 0, w, h);

        // Separable low-frequency wave field gives a slowly drifting cloud texture.
        var s = t / 1000;
        for (var i = 0; i < cols; i++) colX[i] = Math.sin(i * 0.05 + s * 0.35);
        for (var j = 0; j < rows; j++) rowY[j] = Math.sin(j * 0.06 - s * 0.27);

        // Ease the scatter centre toward the pointer and its strength in/out.
        px += (pointer.x - px) * 0.3;
        py += (pointer.y - py) * 0.3;
        force += ((pointer.inside ? 1 : 0) - force) * 0.12;
        if (force < 0.002) force = 0;

        ctx.fillStyle = "rgba(" + dotRGB + ",0.16)";
        for (j = 0; j < rows; j++) {
            for (i = 0; i < cols; i++) {
                var k = j * cols + i;
                if (glyph[k] > 0.35) continue;
                var cloud = 0.5 + 0.5 * colX[i] * rowY[j];
                if (hash[k] < blob[k] * (0.2 + 0.55 * cloud)) dot(i, j, k);
            }
        }

        ctx.fillStyle = "rgba(" + dotRGB + ",0.62)";
        for (j = 0; j < rows; j++) {
            for (i = 0; i < cols; i++) {
                k = j * cols + i;
                var g = glyph[k];
                if (g > 0.35 && hash[k] < 0.55 + 0.35 * g + 0.08 * colX[i]) dot(i, j, k);
            }
        }
    }

    // Draw one dot, pushed away from the pointer (with per-dot jitter) when it is near.
    function dot(i, j, k) {
        var x = i * CELL;
        var y = j * CELL;
        if (force) {
            var dx = x - px;
            var dy = y - py;
            if (dx < RADIUS && dx > -RADIUS && dy < RADIUS && dy > -RADIUS) {
                var d = Math.sqrt(dx * dx + dy * dy);
                if (d < RADIUS) {
                    var f = 1 - d / RADIUS;
                    var push = f * f * force * SCATTER;
                    var h = hash[k];
                    var jx = h - 0.5;
                    var jy = ((h * 7.13) % 1) - 0.5;
                    if (d > 0.001) {
                        x += (dx / d + jx) * push;
                        y += (dy / d + jy) * push;
                    } else {
                        x += jx * 2 * push;
                        y += jy * 2 * push;
                    }
                }
            }
        }
        ctx.fillRect(x, y, DOT, DOT);
    }

    var RADIUS = 110; // scatter reach, CSS px
    var SCATTER = 42; // max displacement, CSS px
    var pointer = { x: -1e4, y: -1e4, inside: false };
    var px = -1e4;
    var py = -1e4;
    var force = 0;

    function onPointer(e) {
        var r = canvas.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        // Snap the eased centre on first entry so dots don't sweep in from offscreen.
        if (!pointer.inside && force === 0) {
            px = x;
            py = y;
        }
        pointer.x = x;
        pointer.y = y;
        pointer.inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
    }
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", function () {
        pointer.inside = false;
    });
    window.addEventListener("blur", function () {
        pointer.inside = false;
    });

    var ready = false;
    var running = false;

    function loop(t) {
        if (reduceMotion.matches) {
            running = false;
            return;
        }
        // Full frame rate while the scatter is active so it tracks the pointer smoothly.
        if (ready && (force || pointer.inside || t - last >= FRAME_MS)) {
            last = t;
            draw(t);
        }
        requestAnimationFrame(loop);
    }

    // (Re)build the grid; draw once if static, otherwise make sure the loop runs.
    function refresh() {
        ready = setup();
        if (!ready) return;
        if (reduceMotion.matches) draw(0);
        else if (!running) {
            running = true;
            requestAnimationFrame(loop);
        }
    }

    var resizeTimer;
    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(refresh, 100);
    }
    if (window.ResizeObserver) new ResizeObserver(onResize).observe(canvas);
    else window.addEventListener("resize", onResize);

    if (dark.addEventListener) dark.addEventListener("change", refresh);
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", refresh);

    refresh();
})();
