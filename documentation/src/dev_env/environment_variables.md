# Environment variables

You need to set up environment variables for local development.

Create a `.env.dev` file in the `backend` folder, filling in the fields:

```
ACCESS_TOKEN_EXPIRY_MINUTES=30
DATABASE_URL="sqlite:///../sqlite.db"
CORS_ORIGIN=["http://localhost:3000"]
JWKS_URL="http://localhost:3000/api/auth/jwks"
JWT_AUDIENCE="https://localhost:3000"
JWT_ISSUER="https://localhost:3000"
```

In the `frontend` folder, create a `.env.development` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
ENV=development
BETTER_AUTH_SECRET={RANDOM SECRET}
BETTER_AUTH_URL=https://localhost:3000
```
