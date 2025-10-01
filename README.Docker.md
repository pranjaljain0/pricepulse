# Running pricepulse in Docker

This repository includes a Dockerfile and docker-compose.yml to run the Next.js app in a container.

Environment variables required (provide them via .env or your environment):

- INFLUXDB_URL
- INFLUXDB_TOKEN (must have write/delete permissions for hard delete)
- INFLUXDB_ORG
- INFLUXDB_BUCKET

Build and run with Docker:

```bash
# build image
docker build -t pricepulse:latest .

# run container (example)
docker run -p 3000:3000 -e INFLUXDB_URL="..." -e INFLUXDB_TOKEN="..." -e INFLUXDB_ORG="..." -e INFLUXDB_BUCKET="..." pricepulse:latest
```

Or with docker-compose (recommended during local development):

```bash
# create a .env file with the required INFLUX_* variables then
docker compose up --build
```

Notes:

- The Dockerfile uses a multi-stage build. The final image runs the standalone server created by Next.js's build output.
- If you use pnpm locally, replace install steps accordingly or create a lockfile.
- The container expects the environment variables above to be present; without them server initialization will throw.
