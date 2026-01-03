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
      email: "admin@university.ac.uk",
      password: "changeme",
      role: "admin",
    },
    {
      name: "Hrushikesh Emkay",
      email: "rsh@bristol.ac.uk",
      password: "changeme",
      role: "user",
    },
    {
      name: "Josh Jenkins",
      email: "j.jenkins@bristol.ac.uk",
      password: "changeme",
      role: "user",
    },
    {
      name: "Yuxuan Wang",
      email: "yuxuan.wang@university.ac.uk",
      password: "changeme",
      role: "user",
    },
    {
      name: "Jack Dempsey",
      email: "jwd@university.ac.uk",
      password: "changeme",
      role: "user",
    },
    {
      name: "Mihaly Toth-Tarsoly",
      email: "mihaly@university.ac.uk",
      password: "changeme",
      role: "user",
    },
    {
      name: "Tilo Burghardt",
      email: "tilo@university.ac.uk",
      password: "changeme",
      role: "lecturer",
    },
  ];
  let createdUsers = [];
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
