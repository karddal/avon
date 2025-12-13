# Environment variables

You need to set up environment variables for local development.

Create a `.env.dev` file in the `backend` folder, filling in the fields:

```
JWT_SECRET_KEY='{random secret key here}'
ACCESS_TOKEN_EXPIRY_MINUTES=30
DATABASE_URL="sqlite:///{database_name}.db"
CORS_ORIGIN=["http://localhost:3000"]
```

In the `frontend` folder, create a `.env.development` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CDN_URL={redacted}
ENV=development
```