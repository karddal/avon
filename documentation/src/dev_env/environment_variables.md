# Environment variables

You need to set up environment variables for local development.

Create a `.env.dev` file in the `backend` folder, filling in the fields:

```
DATABASE_URL="sqlite:///../sqlite.db"           # the location of the database to access (for local dev, share with frontend)
CORS_ORIGIN=["http://localhost:3000"]           # the cors origins to allow
JWKS_URL="http://localhost:3000/api/auth/jwks"  # jwk url that can be fetched from (get from frontend)
JWT_AUDIENCE="https://localhost:3000"           # jwt audience, set in frontend
JWT_ISSUER="https://localhost:3000"             # jwt issuer, from frontend
```

In the `frontend` folder, create a `.env.development` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8000       # the url of the backend api
ENV=development                                 # environment type
BETTER_AUTH_SECRET={RANDOM SECRET}              # better auth secret to use
BETTER_AUTH_URL=https://localhost:3000          # better auth url to bind to
```
