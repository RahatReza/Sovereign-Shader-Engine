/**
 * RSM SOVEREIGN v1.6.0 - UNIVERSAL GHOST INJECTOR
 * Engineering for zero-collision deployment on any web architecture.
 */

export function injectShader(html: string, shaderCode: string, mode: 'fullscreen' | 'hero' | 'card'): string {
    const boilerPlate = `
    <!-- RSM SOVEREIGN v1.6.0 - GHOST PAYLOAD -->
    <script>
        (function() {
            const shaderSource = \`${shaderCode.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
            const mode = '${mode}';
            
            function initSovereign() {
                const canvas = document.createElement('canvas');
                canvas.id = 'sovereign-quantum-canvas';
                
                // --- ATOMIC CSS SHIELDING ---
                const style = canvas.style;
                style.display = 'block';
                style.margin = '0';
                style.padding = '0';
                style.border = 'none';
                style.boxSizing = 'border-box';
                
                if(mode === 'fullscreen') {
                    style.position = 'fixed';
                    style.top = '0';
                    style.left = '0';
                    style.width = '100vw';
                    style.height = '100vh';
                    style.zIndex = '-1';
                    style.pointerEvents = 'none'; // Critical for background mode
                } else {
                    style.width = '100%';
                    style.height = mode === 'hero' ? '500px' : '300px';
                    style.position = 'relative';
                }
                
                // --- HEURISTIC ANCHOR SEARCH ---
                let anchor = document.querySelector('<!-- SOVEREIGN_CGI -->');
                if(!anchor) {
                    // Search for common Hero/Header patterns
                    anchor = document.querySelector('header') || 
                             document.querySelector('[class*="hero"]') || 
                             document.querySelector('main') || 
                             document.body.firstChild;
                }
                
                if (anchor && mode !== 'fullscreen') {
                    anchor.prepend(canvas);
                } else {
                    document.body.insertBefore(canvas, document.body.firstChild);
                }

                const gl = canvas.getContext('webgl2', { alpha: true, antialias: true });
                if(!gl) return;

                // --- SOVEREIGN PERF-BRIDGE v1.3.5 ---
                function getSovereignPerf(gl) {
                    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_ID) : '';
                    const isMobile = /iPhone|iPad|Android|Mobile/i.test(navigator.userAgent);
                    if (isMobile) return 0.7;
                    return 1.0;
                }
                const perf = getSovereignPerf(gl);

                // --- ATOMIC RESIZE OBSERVER ---
                const observer = new ResizeObserver(() => {
                    canvas.width = canvas.clientWidth * window.devicePixelRatio;
                    canvas.height = canvas.clientHeight * window.devicePixelRatio;
                    gl.viewport(0, 0, canvas.width, canvas.height);
                });
                observer.observe(canvas);

                const vs = "#version 300 es\\nin p;void main(){gl_Position=vec4(p,0,1);}";
                const fs = shaderSource;
                
                const s1 = gl.createShader(gl.VERTEX_SHADER);
                gl.shaderSource(s1, vs); gl.compileShader(s1);
                const s2 = gl.createShader(gl.FRAGMENT_SHADER);
                gl.shaderSource(s2, fs); gl.compileShader(s2);
                
                const prog = gl.createProgram();
                gl.attachShader(prog, s1); gl.attachShader(prog, s2);
                gl.linkProgram(prog); gl.useProgram(prog);

                const buf = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buf);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
                
                function render(t) {
                    gl.uniform1f(gl.getUniformLocation(prog, 'u_time'), t*0.001);
                    gl.uniform2f(gl.getUniformLocation(prog, 'u_resolution'), canvas.width, canvas.height);
                    gl.uniform1f(gl.getUniformLocation(prog, 'u_sovereign_perf'), perf);
                    
                    const p = gl.getAttribLocation(prog, 'p');
                    gl.enableVertexAttribArray(p);
                    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                    requestAnimationFrame(render);
                }
                requestAnimationFrame(render);
            }
            if(document.readyState === 'complete') initSovereign();
            else window.addEventListener('load', initSovereign);
        })();
    </script>
    `;

    // Final Injection
    return html.replace('</body>', `${boilerPlate}</body>`);
}
