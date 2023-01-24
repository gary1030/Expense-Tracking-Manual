# Expense-tracking Manual

## Getting Started

First, copy `.env.example` and fill in required variables.
```txt
LINE_CHANNEL_ACCESS_TOKEN=

GOOGLE_SHEETS_PRIVATE_KEY=
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_SPREADSHEET_ID=
```


Second, install required packages:

```bash
yarn
```

Third, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Endpoints
This is a line bot server, so only one endpoint is provided.

`/api/line`
Receive message from line and parse it to decide what to do. Then, reply status to client.

## Functions
1. Save Expenses
2. Count today's spending
3. Count this/last month's spending
4. List this/last month's spending

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
