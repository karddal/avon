# Frontend

Avon's frontend is written in Next.js, a frontend framework by Vercel. We use a customised version of `shadcn/ui` to provide accessible UI components.

## Client and server components

Avon makes heavy and frequent use of a feature of Next.js called Server Components. To clarify, Next.js has two component types, Client Components and Server Components. Client components render on the client, whereas server components render on the server. This means that server components are preferred (in general) because they improve the speed of the app for the end user. However, they are slightly more complicated to work with.

The one exception is that client components are *required* if client-side reactivity is needed, such as a button. This means that the general pattern is that a server-component is used to pull in data from the server, and any use of client-components is limited to small nested components inside the main server-component shell that are for interactivity.

Further, this allows us to pre-render large sections of the app, because anything that doesn't use server data will remain static, speeding up the client experience. The static shell immediately comes in to the client, and any server data will be streamed in to the holes on the page.

In addition, for security, we don't expose the backend to the internet. This means that anything that accesses the server on the frontend, such as for making API calls, must be a server component.

## BetterAuth

Initially, our authentication was custom. However, it became unwieldly quickly, so we decided to migrate to a library called BetterAuth. BetterAuth stores user data for us, and we can use the functions provided by it to log in users. Other features include:

- Session persistence
- Session and refresh tokens
- JWT tokens
- Roles

To check whether the user is authenticated, we can use the `getSession` library function.

When the frontend wishes to authenticate to the backend, a library function `getRequestJWT` that we wrote is called. This checks that the user is authenticated, and if so, creates a JWT containing their user ID and role. This JWT is sent along with the request to the backend.
On receipt, the JWT is decoded, and the backend checks its signature by comparing it with one that has been retrieved from the frontend's certificate server (this is generally cached for speed). If they match, the user is authenticated.

New users are currently initially seeded using a seed script that inserts known values into the database.