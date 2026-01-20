# AI in 2025-ContinuousAssessment

AI tools have been used in the following ways
 - Understanding best practices for architecting systems
 - Used to help with debugging and writing some of the frontend and backend
 - Help with complex SQL queries and how to use FastAPI/SQLModel etc idiomatically, e.g. how to model the domain
 - Template / template script for agendas
 - Used to debug code

AI tools used
 - ChatGPT
 - Claude
 - Gemini
 - Perplexity

## Everyone
- Used when setting up AWS, how to do it, creating Dockerfiles

## Specifics per person
### Mihaly
**Tools used**
- ChatGPT
- Claude
- Gemini

**Where did you use AI tools and why**
Research and architecture best practices - this is one area where they have been really helpful. In areas where I have little konwledge, for example how to set up security properly, how to verify JWTs, how to use Kubernetes and how to write a job description, especially where documentation for libraries is poor. Also helped when architecting the system, how to lay out the project etc.

Frontend - I mostly used AI here for debugging purposes - NextJS can be really complicated, and it often isn't clear why it isn't working. For example, why is this code not working, how do I fix this fetch, etc. AI can help to look and see things that I have missed. In addition, it also helped with telling me the best practices for the application, like when to use client components, how to fetch, etc, as well as debugging these. Also helped with CSS, how to do things like running SQL queries against the BA database, how to set up BetterAuth, how to set up typing for sql, etc. often I will see how it works, and then I have to refine what it gives into something that will work for our situation. It is useful to give me a rough idea though.

Backend - used more rarely here, mostly for architecture deisions. One area where it helped was with debugging SQLModel and how to define relationships between tables, as well as how to fetch these. Helped with complicated SQL queries. Also at the very start, used to debug why pytest wasn't working.

Engine prototyping - For the initial prototype test runner (not merged), used to help design the initial prototype, such as doing research to help me work out the best practice way of doing the test running, due to the very complicated domain area, and implications including security, sandboxing etc. Using it I was able to discover technologies that I haven't heard of before. Because of how complicated Kubernetes is, and the complexity and verbosity of task definitions, as well as how the client libraries I was using are poorly documented, I used it to show me how to run a kubernetes task for the proof of concept, as well as how to use tooling like Dockerfiles and setting up a local kubernetes cluster, and debugging these. I used this, along with an example from Temporal, the scheduler stack I was using, to get a proof of concept working. Without it, I wouldn't have been able to get the proof of concept working because I had little knowledge of this area before. Now that I have a base, I will probably redesign this in a cleaner way for the final product, now that I know that it is feasible.

### Josh

**Tools used**
- ChatGPT
- Claude
- Gemini

**Where did you use AI tools and why**

Blueprinting / Concepting - I used AI (specifically it's image creation tools) to brainstorm ideas for what the frontend could look like, taking inspiration from some of the components that ChatGPT or Gemini suggested. This allowed me to see how a visual UI change could look like, without the need to code the entire component myself first.

Frontend - TailwindCSS issues and more complex Typescript functions or methods were where I utilised generative AI the most, as I am familiar with Typescript to a certain degree, but not to a stage where I could code these harder functions that would take time away from actually developing. TailwindCSS was also a larger part of the frontend AI use, as CSS doesn't always behave nice, and once again, I used AI to save myself time in development, rather than going through the docs finding the specific Tailwind keyword for positioning items etc. Finally, I used AI as advice for the best way(s) to achieve a layout or feature, as I like to know the most common / industry standard way of developing a feature such as searching through a large number of students before coding the feature. This allowed me to learn and get examples about how to do something, but gives me the freedom to combine pieces of AI's code with my own to create a more readable codebase, as sometimes AI's code works well, but isn't professional or readable when revisiting in the future.

Backend - I have used AI in the backend to produce repeatable pieces of code, saving me time rewriting similar schemas or methods with slightly different variable names and inputs. I also used it to learn more about the frameworks we were using, such as Spring Boot (before switching), and now FastAPI. FastAPI is simple enough, but some features have multiple ways of being implemented, and sometimes the docs aren't helpful. Since my focus on this project has been mainly on the frontend, my AI use in the backend has been lower than the rest of the project.

Overall, the use of AI for me has been majority frontend, and has been mostly for time-saving reasons, allowing me to focus more on the actual features that require human insight and reasoning, such as the UI flow and accessibility, as well as the actual codebase looking professional and easy to extend.

### Rishi

**Tools used**
- ChatGPT
- Claude
- Perplexity

**Where did you use AI tools and why**
Blueprinting / Concepting -
Frontend - Primarily to fix styling issues in TailwindCSS. To understand concepts in frontend development such as SSR, the use of types and best practises to organise my code. Also used it to refactor code which was not efficient.
Backend - To debug errors esspecially with regards to schemas. To figure out the best way to implement a certain feature and organise the project. Used it to generate fake users to test my database and other test cases.

Overall, I tried my best to limit the use of AI as I wanted to write code myself. AI was primarily used to help me understand the best practises to write code while also acting as a debugger.
