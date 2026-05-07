#define ITERATIONS 4
#define INTENSITY 0.5

float utility_calc(float x, float y) {
    return (x * y) + 0.1;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord/u_resolution.xy;
    
    // TMU Coalescing Target
    vec4 tex1 = texture(u_sampler, uv);
    vec4 tex2 = texture(u_sampler, uv);
    
    // ASR & FMA Target
    float d = (uv.x * 2.0) + 0.5;
    float val = d / 5.0;
    
    // Inlining & Register Pressure Target
    float result = 0.0;
    for(int i=0; i < 4; i++) {
        result += utility_calc(val, float(i));
    }
    
    // Logic Mapping Target
    float mask = (result == 1.0) ? 1.0 : 0.0;
    
    fragColor = vec4(tex1.rgb + result + mask, 1.0);
}
