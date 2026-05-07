export class SovereignContext {
    private static instance: SovereignContext;
    public gl: WebGL2RenderingContext;
    private canvas: HTMLCanvasElement;
    private programs: Map<string, WebGLProgram> = new Map();

    private constructor() {
        this.canvas = document.createElement('canvas');
        this.gl = this.canvas.getContext('webgl2', {
            antialias: false,
            alpha: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance"
        })!;
        console.log('--- SOVEREIGN CONTEXT SINGLETON ANCHORED ---');
    }

    public static getInstance(): SovereignContext {
        if (!SovereignContext.instance) {
            SovereignContext.instance = new SovereignContext();
        }
        return SovereignContext.instance;
    }

    public getProgram(id: string, fsSource: string): WebGLProgram {
        if (this.programs.has(id)) return this.programs.get(id)!;

        const gl = this.gl;
        const vs = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vs, '#version 300 es\nin vec4 position;void main(){gl_Position=position;}');
        gl.compileShader(vs);

        const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fs, fsSource);
        gl.compileShader(fs);

        const prog = gl.createProgram()!;
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        
        this.programs.set(id, prog);
        return prog;
    }
}
