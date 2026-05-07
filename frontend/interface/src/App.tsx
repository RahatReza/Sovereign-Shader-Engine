import { useState } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import { SovereignRenderer } from './components/SovereignRenderer';
import { Zap, Shield, Activity, BarChart } from 'lucide-react';
import { injectShader } from './components/SovereignInjector';
import './App.css';

export default function App() {
    const [source, setSource] = useState('');
    const [refined, setRefined] = useState('');
    const [meta, setMeta] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [viewMode, setViewMode] = useState<'edit' | 'refine'>('edit');

    const executeRefinement = async () => {
        setIsProcessing(true);
        const res = await fetch('http://localhost:8080/refine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shaderCode: source, profile: 'mobile-low' })
        });
        const data = await res.json();
        setRefined(data.refined);
        setMeta(data.meta);
        setIsProcessing(false);
        setViewMode('refine');
    };

    const copyToClipboard = () => {
        if (!refined) return;
        navigator.clipboard.writeText(refined);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const [deploymentMode, setDeploymentMode] = useState<'fullscreen' | 'hero' | 'card'>('fullscreen');
    
    const handleDeploy = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !refined) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const html = event.target?.result as string;
            const injectedHtml = injectShader(html, refined, deploymentMode);
            
            // Trigger Download
            const blob = new Blob([injectedHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sovereign_${file.name}`;
            a.click();
            URL.revokeObjectURL(url);
            
            alert(`Sovereign Deployment Complete: sovereign_${file.name} is ready.`);
        };
        reader.readAsText(file);
    };

    return (
        <div className="sovereign-app">
            <nav className="sovereign-nav">
                <div className="brand"><Shield size={20} color="#00ff41"/> RSM EXECUTIVE HUD v60.0</div>
                <div className="status-badge">SYSTEM: {viewMode === 'edit' ? 'STANDBY' : 'GHOST SEALED'}</div>
                <div className="nav-actions">
                    <select 
                        value={deploymentMode} 
                        onChange={(e) => setDeploymentMode(e.target.value as any)}
                        className="mode-select"
                    >
                        <option value="fullscreen">MODE: FULLSCREEN</option>
                        <option value="hero">MODE: HERO BANNER</option>
                        <option value="card">MODE: INTERACTIVE CARD</option>
                    </select>
                    <label className="btn-secondary">
                        INJECT HTML
                        <input type="file" accept=".html" onChange={handleDeploy} style={{display: 'none'}} />
                    </label>
                    {viewMode === 'refine' && (
                        <button onClick={() => setViewMode('edit')} className="btn-secondary">BACK TO EDITOR</button>
                    )}
                    {refined && viewMode === 'refine' && (
                        <button onClick={copyToClipboard} className="btn-secondary">
                            {isCopied ? 'COPIED TO CLIPBOARD' : 'COPY REFINED CODE'}
                        </button>
                    )}
                    <button onClick={executeRefinement} className="btn-primary" disabled={isProcessing}>
                        {isProcessing ? <Activity className="pulse"/> : <Zap size={14}/>} {isProcessing ? 'CONSOLIDATING...' : 'EXECUTE FINAL REFINEMENT'}
                    </button>
                </div>
            </nav>
            <main className="sovereign-workspace">
                <section className="editor-zone">
                    {viewMode === 'edit' ? (
                        <Editor
                            value={source}
                            onChange={(val: string | undefined) => setSource(val || '')}
                            theme="vs-dark"
                            language="cpp"
                            options={{ fontSize: 12, minimap: { enabled: false } }}
                        />
                    ) : (
                        <DiffEditor 
                            original={source} 
                            modified={refined} 
                            theme="vs-dark" 
                            options={{ fontSize: 11, readOnly: true }} 
                        />
                    )}
                </section>
                <section className="preview-pane">
                    <div className="executive-telemetry">
                        <div className="hud-box"><span>ALU GAIN</span>{meta?.alu_savings || 0}%</div>
                        <div className="hud-box"><span>FIDELITY</span>{meta?.fidelity || 0}%</div>
                        <div className="hud-box"><span>OCCUPANCY</span>+{meta?.occupancy_gain || 0}%</div>
                        <div className="hud-box"><span>REUSE</span>{meta?.reuse_ratio || 0}%</div>
                    </div>
                    <div className="renderer-box">
                        {viewMode === 'edit' ? (
                            <SovereignRenderer code={source} />
                        ) : (
                            <div className="dual-view">
                                <div className="view-slot">
                                    <div className="slot-label">RAW</div>
                                    <SovereignRenderer code={source} />
                                </div>
                                <div className="view-slot">
                                    <div className="slot-label accent">SOVEREIGN</div>
                                    <SovereignRenderer code={refined} />
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="master-audit">
                        <div className="zone-header"><BarChart size={14}/> GLOBAL PIPELINE AUDIT</div>
                        {meta?.audit_log.map((log: string, i: number) => (
                            <div key={i} className="audit-line">{">> "} {log}</div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
