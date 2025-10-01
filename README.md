This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## InfluxDB v2 setup

This project includes a small InfluxDB v2 helper and a test API route to validate the connection.

- Add your credentials to `.env.local` (already added in this repo for your provided values):

```env
INFLUXDB_URL=http://100.77.165.98:8086
INFLUXDB_TOKEN=my-super-secret-token
INFLUXDB_ORG=my-org
INFLUXDB_BUCKET=my-bucket
```

- Install the project dependencies (if you didn't already):

```bash
npm install
```

- Start the dev server and visit the test API:

```bash
npm run dev
# then open http://localhost:3000/api/influx-test in your browser
```

The endpoint writes a test point and returns recent rows for quick verification.
# pricepulse
