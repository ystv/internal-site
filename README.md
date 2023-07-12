# Alpha Test Internal Site

## Getting Started
First, install the dependencies:

```bash
yarn
```

Next, generate the prisma schema:

```bash
yarn prisma:generate
```

Finally, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Structure
- app/ - pages
- app/api/ - api routes (trpc and REST)
- features/ - business logic functinality
- lib/ - low level utilities (auth, db, etc.)