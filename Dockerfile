# STAGE 1: KERNEL COMPILATION (RUST)
FROM rust:1.75-slim as kernel_builder
WORKDIR /app
COPY core/kernel/math_engine .
RUN cargo build --release --bin rsm_cli

# STAGE 2: BACKEND ARCHITECTURE (NODE)
FROM node:20-slim as backend_builder
WORKDIR /app/backend
COPY backend/services/api_gateway/package*.json ./
RUN npm install
COPY backend/services/api_gateway .
COPY --from=kernel_builder /app/target/release/rsm_cli.exe /app/core/kernel/rsm_cli.exe

# STAGE 3: PRODUCTION RUNTIME
FROM node:20-slim
WORKDIR /app
COPY --from=backend_builder /app/backend ./backend
COPY --from=kernel_builder /app/target/release/rsm_cli.exe /app/core/kernel/rsm_cli.exe
EXPOSE 8080
CMD ["node", "backend/src/index.js"]
