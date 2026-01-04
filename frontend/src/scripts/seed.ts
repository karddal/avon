import { auth } from "@/lib/auth";

interface User {
  name: string;
  email: string;
  password: string;
  role: string;
}

async function seed() {
  console.log(process.env);
  const users: User[] = [
    {
      name: "Foo Bar",
      email: "admin@bris.ac.uk",
      password: "changeme",
      role: "admin",
    },
    {
      name: "Rohan Booth (Year 1)",
      email: "rohan@bris.ac.uk",
      password: "changeme",
      role: "user",
    },
    {
      name: "Charles Price (Year 1)",
      email: "charles@bris.ac.uk",
      password: "changeme",
      role: "user",
    },
    {
      name: "Josh Jenkins (Year 2)",
      email: "josh@bris.ac.uk",
      password: "changeme",
      role: "user",
    },
    {
      name: "Jack Dempsey (Year 2)",
      email: "jack@bris.ac.uk",
      password: "changeme",
      role: "user",
    },
    {
      name: "Tilo Burghardt",
      email: "tilo@bris.ac.uk",
      password: "changeme",
      role: "lecturer",
    },
    {
      name: "David Bernhard",
      email: "david@bris.ac.uk",
      password: "changeme",
      role: "lecturer",
    },
    {
      name: "Eddie Jones",
      email: "eddie@bris.ac.uk",
      password: "changeme",
      role: "lecturer",
    },
    {
      name: "Dan Page",
      email: "dan@bris.ac.uk",
      password: "changeme",
      role: "lecturer",
    },
    {
      name: "Sarah Connolly",
      email: "sarah@bris.ac.uk",
      password: "changeme",
      role: "lecturer",
    },
    {
      name: "Steven Ramsay",
      email: "steven@bris.ac.uk",
      password: "changeme",
      role: "lecturer",
    },
    {
      name: "Sion Hannuna",
      email: "sion@bris.ac.uk",
      password: "changeme",
      role: "lecturer",
    },
  ];
  const createdUsers = [];
  for (const user of users) {
    const u = await auth.api.createUser({
      body: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role as
          | "admin"
          | "user"
          | "lecturer"
          | ("admin" | "user" | "lecturer")[]
          | undefined,
      },
    });
    createdUsers.push(u);
  }
  console.log("Seeded DB");
  console.log(JSON.stringify(createdUsers, null, 2));
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
