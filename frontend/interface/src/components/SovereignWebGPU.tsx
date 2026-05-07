import { useEffect, useRef } from 'react';

export const SovereignWebGPU = ({ code }: { code: string }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const init = async () => {
            if (!canvasRef.current || !(navigator as any).gpu) return;
            const adapter = await (navigator as any).gpu.requestAdapter();
            if (!adapter) return;
            const device = await adapter.requestDevice();
            const canvas = canvasRef.current;
            const context = canvas.getContext('webgpu') as any;
            
            const presentationFormat = (navigator as any).gpu.getPreferredCanvasFormat();
            context.configure({ device, format: presentationFormat, alphaMode: 'premultiplied' });

            // Extract math from refined code (stripping comments for the driver)
            const wgslSource = code.includes('fn main') ? code : `@fragment fn main() -> @location(0) vec4<f32> { return vec4<f32>(1.0, 0.0, 0.0, 1.0); }`;

            const shaderModule = device.createShaderModule({ code: wgslSource });
            const pipeline = device.createRenderPipeline({
                layout: 'auto',
                vertex: {
                    module: device.createShaderModule({
                        code: `@vertex fn main(@builtin(vertex_index) VertexIndex : u32) -> @builtin(position) vec4<f32> {
                            var pos = array<vec2<f32>, 3>(vec2(-1., -1.), vec2(3., -1.), vec2(-1., 3.));
                            return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
                        }`
                    }),
                    entryPoint: 'main',
                },
                fragment: {
                    module: shaderModule,
                    entryPoint: 'main',
                    targets: [{ format: presentationFormat }],
                },
                primitive: { topology: 'triangle-list' },
            });

            const frame = () => {
                const commandEncoder = device.createCommandEncoder();
                const textureView = context.getCurrentTexture().createView();
                const renderPassDescriptor: any = {
                    colorAttachments: [{
                        view: textureView,
                        clearValue: { r: 0, g: 0, b: 0, a: 1 },
                        loadOp: 'clear',
                        storeOp: 'store',
                    }],
                };
                const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
                passEncoder.setPipeline(pipeline);
                passEncoder.draw(3, 1, 0, 0);
                passEncoder.end();
                device.queue.submit([commandEncoder.finish()]);
                requestAnimationFrame(frame);
            };
            requestAnimationFrame(frame);
        };
        init();
    }, [code]);

    return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} width={800} height={600} />;
};
