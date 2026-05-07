import fastify from 'fastify';
import { execSync } from 'child_process';
import cors from '@fastify/cors';
import path from 'path';
import fastifyStatic from '@fastify/static';

const server = fastify({ logger: false });
server.register(cors);

// Path resolution
const ROOT = path.join(__dirname, '..', '..', '..', '..');
const BINARY_PATH = path.join(ROOT, 'core', 'kernel', 'math_engine', 'target', 'release', 'rsm_cli.exe');
const UI_DIST_PATH = path.join(ROOT, 'frontend', 'interface', 'dist');

// 1. Unified Static Asset Serving
server.register(fastifyStatic, {
    root: UI_DIST_PATH,
    prefix: '/', 
});

server.post('/refine', async (req: any, reply: any) => {
    const { shaderCode, profile } = req.body;
    
    // SECURITY: Sanitize profile input (Whitelist)
    const allowedProfiles = ['pc-discrete', 'mobile-low', 'mobile-high'];
    const safeProfile = allowedProfiles.includes(profile) ? profile : 'pc-discrete';

    try {
        const rawOutput = execSync(`"${BINARY_PATH}" ${safeProfile}`, { 
            input: shaderCode, encoding: 'utf-8', maxBuffer: 1024 * 1024 * 10 
        });
        const seg = rawOutput.split('RSM_BOUNDARY');
        
        if (seg.length < 2) throw new Error('Malformed Kernel Output');

        return { 
            refined: seg[0].trim(), 
            meta: JSON.parse(seg[1].trim()),
            status: 'CONSOLIDATED_SEALED' 
        };
    } catch (err: any) { 
        return reply.status(500).send({ error: 'Kernel Execution Fault', detail: err.message }); 
    }
});

// Catch-all to serve index.html for SPA routing
server.setNotFoundHandler((req, reply) => {
    reply.sendFile('index.html');
});

const start = async () => {
    try {
        const port = 8080;
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`================================================`);
        console.log(`   RSM SOVEREIGN CORE v1.0 - UNIFIED APPLIANCE`);
        console.log(`   DEPLOYED AT: http://localhost:${port}`);
        console.log(`================================================`);
    } catch (err) {
        process.exit(1);
    }
};
start();
