pub mod math_logic; 
use wasm_bindgen::prelude::*; 

#[wasm_bindgen] 
pub fn refine_shader_math(input: &str, profile: &str) -> String { 
    math_logic::refine_shader_math(input, profile).refined_code() 
}
