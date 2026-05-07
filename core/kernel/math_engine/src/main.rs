mod math_logic;
use std::io::{self, Read};
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let profile = if args.len() > 1 { &args[1] } else { "pc-discrete" };
    let mut buffer = String::new();
    let mut stdin = io::stdin();
    if stdin.read_to_string(&mut buffer).is_ok() {
        let result = math_logic::refine_shader_math(&buffer, profile);
        // NEW 2-SEGMENT PROTOCOL: Code | Boundary | JSON_METADATA
        println!("{}\nRSM_BOUNDARY\n{}", result.refined_code(), result.metadata_json());
    }
}
