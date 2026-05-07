self.onmessage = async (e) => {
    const { shaderCode, profile } = e.data;
    try {
        const res = await fetch('http://localhost:8080/refine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shaderCode, profile })
        });
        const data = await res.json();
        self.postMessage({ type: 'SUCCESS', data });
    } catch (err) {
        self.postMessage({ type: 'ERROR', error: (err as any).message || 'Unknown Error' });
    }
};
