import { useEffect, useRef, useState } from 'react';

export const SovereignRenderer = ({ code }: any) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderRef = useRef<number | null>(null);
    const mousePos = useRef({ x: 0, y: 0, z: 0, w: 0 });
    const [isWarmed, setIsWarmed] = useState(false);
    const [compileTime, setCompileTime] = useState(0);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
                mousePos.current.x = e.clientX - rect.left;
                mousePos.current.y = rect.height - (e.clientY - rect.top);
            }
        };
        window.addEventListener('mousemove', handleMouseMove);

        if (!code || code.trim() === '') {
            setError(null);
            setIsWarmed(false);
            return;
        }
        const canvas = canvasRef.current!;
        const gl = canvas.getContext('webgl2')!;
        setError(null);

        let prog: WebGLProgram | null = null;
        let vs: WebGLShader | null = null;
        let fs: WebGLShader | null = null;
        let buf: WebGLBuffer | null = null;

        try {
            const start = performance.now();
            vs = gl.createShader(gl.VERTEX_SHADER)!;
            gl.shaderSource(vs, '#version 300 es\nin vec4 p; void main(){gl_Position=p;}');
            gl.compileShader(vs);

            fs = gl.createShader(gl.FRAGMENT_SHADER)!;
            let fullSource = '';
            
            if (code.includes('RSM SOVEREIGN')) {
                // Precision must come before 'out' declarations
                fullSource = code.replace('precision highp float;', 'precision highp float;\nout vec4 c;');
                fullSource += '\nvoid main(){vec4 color; mainImage(color,gl_FragCoord.xy); c = color;}';
            } else {
                fullSource = `#version 300 es\n\
precision highp float;\n\
uniform float u_time;\n\
uniform vec2 u_resolution;\n\
uniform vec4 u_mouse;\nuniform float u_sovereign_perf;\n\
uniform sampler2D iChannel0;\n\
uniform sampler2D iChannel1;\n\
uniform sampler2D iChannel2;\n\
uniform sampler2D iChannel3;\n\
#define iTime u_time\n\
#define iResolution u_resolution\n\
#define iMouse u_mouse\n\
#define texture2D texture\n\
#define textureCube texture\n\
out vec4 c;\n\
${code}\n\
void main(){vec4 color; mainImage(color,gl_FragCoord.xy); c = color;}`;
            }

            gl.shaderSource(fs, fullSource);
            gl.compileShader(fs);

            if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
                throw new Error(gl.getShaderInfoLog(fs) || "Fragment Shader Compilation Failed");
            }

            prog = gl.createProgram()!;
            gl.attachShader(prog, vs); gl.attachShader(prog, fs);
            gl.linkProgram(prog);

            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                throw new Error(gl.getProgramInfoLog(prog) || "Program Linking Failed");
            }
            
            // --- SOVEREIGN GHOST-FRAME (SPE) ---
            gl.useProgram(prog);
            gl.viewport(0, 0, 1, 1);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.flush();
            
            const end = performance.now();
            setCompileTime(end - start);
            setIsWarmed(true);

            const vertices = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
            buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

            const render = () => {
                if (!prog) return;
                gl.useProgram(prog);
                gl.viewport(0, 0, canvas.width, canvas.height);
                gl.uniform1f(gl.getUniformLocation(prog, 'u_time'), performance.now() * 0.001);
                gl.uniform2f(gl.getUniformLocation(prog, 'u_resolution'), canvas.width, canvas.height);
                gl.uniform4f(gl.getUniformLocation(prog, 'u_mouse'), mousePos.current.x, mousePos.current.y, 0, 0);
                gl.uniform1f(gl.getUniformLocation(prog, 'u_sovereign_perf'), 1.0);
                const pos = gl.getAttribLocation(prog, "p");
                gl.enableVertexAttribArray(pos);
                gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                renderRef.current = requestAnimationFrame(render);
            };
            render();
        } catch (e: any) {
            console.error("WebGL Error:", e.message);
            setError(e.message);
        }

        // CLEANUP: Prevents Memory Leaks & Loop Collisions
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (renderRef.current) cancelAnimationFrame(renderRef.current);
            if (prog) gl.deleteProgram(prog);
            if (vs) gl.deleteShader(vs);
            if (fs) gl.deleteShader(fs);
            if (buf) gl.deleteBuffer(buf);
        };
    }, [code]);

    return (
        <div style={{width:'100%', height:'100%', position:'relative', background: '#000'}}>
            <canvas ref={canvasRef} width={800} height={600} style={{width:'100%', height:'100%', opacity: error ? 0.2 : 1}}/>
            {error && <div className="renderer-error">GPU_FAULT: {error}</div>}
            <div className="spe-telemetry">
                DRIVER_WARM: {isWarmed ? 'TRUE' : 'WAIT'} | JANK_SAVED: {compileTime.toFixed(2)}ms
            </div>
        </div>
    );
};
