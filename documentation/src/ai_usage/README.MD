# AI Usage Policy

# AI in 2025-ContinuousAssessment

LARGE AI COMMIT: ae98f7d9da427988da0d203176a8f96655d5f770

- Very high usage of AI here to fix the state of the backend/frontend connection due to new Scopes/Seeding issue
- Mechanical refactoring was done here by Codex instead of ourselves
- Stopping the frontend tests from all failing - was causing frontend tests to take 22m.

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

Debugging and setting up deployment - Very helpful when setting up deployment to AWS to explain things like how to setup the connections. A specific example was when I was trying to debug why sql queries weren't working with a cryptic error. With the error message and the code, it identified that in Postges you can't use ? for placeholders, you have to use $1. This is something that I didn't know about and wouldn't have found. It also suggested an improved way of sharing Postgres pools using a global variable.

Used also when debugging and fixing the seed script - example prompt: `What does this error mean? detail: [ { type: 'model_attributes_type', loc: [Array], msg: 'Input should be a valid dictionary or object to extract fields from', input: '{"name":"Year 1 Computer Science 2025-2026","start_date":"2025-09-10","end_date":"2026-05-30"}' } ] Here is the api spec example { "name": "string", "start_date": "2026-02-08", "end_date": "2026-02-08" }`

`How can I clean out a full subgroup in Gitlab without deleting it using the API? So all subgroups and projects in it should be deleted.`

Used for setting up permissions scoping, and for debugging it. Useful because it gave me good ideas for how to do this properly, and how this could be done with fastapi. It suggested something much more complicated than necessary though, and I ended up simplifying it.
Example prompts used here:

- `How can I create a decorator in Python? I'm trying to refactor my backend's auth system and I think that would be the cleanest way of doing it.`
- `The problem is that different functions need different types of auth - how can I be more flexible? Is this where decorators are less beneficial?`
- `What is the scopes pattern and how does it work?`
- `My backend and frontend are separated - my frontend uses betterauth, and the backend is fastapi. Right now, fastapi calls the frontend, verifies the jwt that the frontend sends with requests, and that's how it works. Frontend jwt has a 'role' attribute, but right now that is only really used on the fe for simple things like what pages are shown in the sidebar - the current backend has enrollment tables, and the enrollment has different 'types'. E.g. we have a Unit, and a UnitEnrollment can have type 'lecturer' which means that they can manage the unit. I want to migrate this to use scopes instead. How can I do this?`
- `how can I use this on the fe to decide which ui actions to surface?`
- `Should I allow custom scopes? For example, do I let a lecturer set a specific person to have specific permissions? Or is the roles we have now enough?`
- `How can I write a function that works for different entities, not just units`
- `async function get_cw_update_data( slug: string, scopes: Set<string>, ): Promise<CourseworkUpdateData | undefined> { const token = await getRequestJWT(); console.log(typeof scopes); if (scopes.has("unit:coursework_manage")) { it says scopes.has() is not a function, i can't figure out what I'm doing wrong.`
- `in fastapi dependencies how can I get path parameters?`

I found that it was useful in that it taught me about the pattern and gave me a good foundation code example, but I had to customise what it gave me, for example I ended up not using the decorator pattern that it suggested, but the scopes pattern example code it showed me was very good, and worked well with user types etc.

I also used GH Copilot for autocompletion sometimes to save time.

`How can I clean out a full subgroup in Gitlab without deleting it using the API? So all subgroups and projects in it should be deleted.`


#### Used to design and set up the test running system

I used it to write the dockerfile and script for the test running system, then customised the result. I used it because I am not very familiar with how docker works, and best practices for untrusted code. Me and Josh also used it initially with earlier attempts with Kubernetes, and also to try and architect a better design. We found it helpful because we don't have much experience with this.
Once I had a working script, I was able to modify it for our own purpose. I also used it to help debug and iterate. 

Example prompts:
- ```Sure! What's the cleaner way to do this? It doesn't look like with this setup there is a clean way to git clone the code and then run the lecturer's dockerfile.```
- ```Okay, so how about this, maybe we can just install uv, pip, all 'python' things into a single container, and then this is just a limitation of the system. Then the lecturer can define a series of commands to run in that container, and then we handle logging etc from this. Can you set up the container for this? This sounds clean.```
- ```Yes that sounds important, clean it up, make sure it is as clean and simple and easy to maintain as possible, and prevent exploits. Make no mistakes, you are an expert aws engineer.```
- ```Can i set the ecs task to have a timeout rather than having to do it manually in the python script?```
- ```Can I test this locally @ChatGPT ?```
- ```how can I give perms for the runner to be able to download the projects? Do I use an API key in gitlab?```
- ```How can I use service accounts for this? I can generate a service account and pass it in in the git clone url with the service account token, to authenticate https git clones. Update the script.```
- ```How will s3 and sqs auth work when deployed? How can it log in?```
- ```how do I get the runner.py into the dockerifle? it says it cant find it```
- ```how will I know whether it worked? nothing gets printed out```
- ```How can I troubleshoot aws login etc errors? Can you add code to do that?```
- ```I have an architecture on a VLE where lecturers can pick a base task definition and a tester command, and we have multiple task defs (python, c etc) with different dependencies installed. The runner script in each case git clones student work and runs the tester command. This all runs in an ecs task. What would be a clean db schema for storing test runs? The ecs task updates the backend by sending a sqs notification on finish with the exit code and the s3 url where logs were uploaded, and the fastapi backend consumes this and updates the db. I worked really hard to have this architecture be fault tolerant - so we can handle multiple backends, eg if one dies etc, and data doesn’t get lost.```
- ```Why do we need the sqs table? won’t the unique constraint on test run id be sufficient?```
- ```How do we handle submissions? Right now, we just have a system where lecturers can click 'grade', and we just take the repo url, and git clone from the default branch. Do we need to formalise this? I see you made some submission table - can you explain the logic here?```
- ```Yeah - we have help text on our UI telling students to ensure that when the submission deadline passes, just make sure that the code on their default branch is the code that they want to submit. When this all gets fully set up, we will use GitLab invites, and their access will have an expiration equal to the cw due date. So they lose access to the remote and their submission is set in stone.```
- ```I'd like to use a linux epoch timestamp because I find dealing with different timezones etc difficult. I'm using fastapi - can I just use an int field and use datetime to get the linux epoch?```
- ```okay, so would I just use an sqlmodel datetime type field? What method do I use to get the current time, and then get it back later on? There's so many different ones (now, utcnow etc) and numerous footguns```
- ```don't we need to store things like the task definition used to run the tests, and the tester command?```
- ```yes - the idea is that the admins can define runner images with different dependencies installed, docker build, upload to ecr, and define aws task definition. Then we have a way in our frontend for admins to register them as a BaseImage which a lecturer can select when setting up the test running. I think that we need the task_definition name when running ecs tasks so is that what we should save?```
- ```When it comes to api responses, is it standard to return a HTTPException (error code, detail) or do we have a custom json type with status: error, detail: str?```
- ```Why isn't this formatting properly? Also, how can I display this nicely? This is a start date for a test run to be displayed in a data table. The formatting is just doing iso format which is ugly, not taking effect. CODE HERE```
- ```CODE HERE this just prints DATE HERE in the row field.```

#### Used to design and build the specific test run page
I used AI to build the specific test run page, once I had already built the test runs list, start tests component etc. - it was given a popup set up with the data, and I asked it to build a layout to
display the data nicely. I also asked it to add features like auto refreshing and fix some bugs. This was useful because
it allowed me to quickly iterate the design, and get something that I can build on top of. Helped to overcome the 'blank page' problem.

See the transcript in `transcript.md` in this folder.

### Josh

**Tools used**

- ChatGPT
- Claude
- Gemini

**Where did you use AI tools and why**

Blueprinting / Concepting - I used AI (specifically it's image creation tools) to brainstorm ideas for what the frontend could look like, taking inspiration from some of the components that ChatGPT or Gemini suggested. This allowed me to see how a visual UI change could look like, without the need to code the entire component myself first.

Frontend - TailwindCSS issues and more complex Typescript functions or methods were where I utilised generative AI the most, as I am familiar with Typescript to a certain degree, but not to a stage where I could code these harder functions that would take time away from actually developing. TailwindCSS was also a larger part of the frontend AI use, as CSS doesn't always behave nice, and once again, I used AI to save myself time in development, rather than going through the docs finding the specific Tailwind keyword for positioning items etc. Finally, I used AI as advice for the best way(s) to achieve a layout or feature, as I like to know the most common / industry standard way of developing a feature such as searching through a large number of students before coding the feature. This allowed me to learn and get examples about how to do something, but gives me the freedom to combine pieces of AI's code with my own to create a more readable codebase, as sometimes AI's code works well, but isn't professional or readable when revisiting in the future.

Backend - I have used AI in the backend to produce repeatable pieces of code, saving me time rewriting similar schemas or methods with slightly different variable names and inputs. I also used it to learn more about the frameworks we were using, such as Spring Boot (before switching), and now FastAPI. FastAPI is simple enough, but some features have multiple ways of being implemented, and sometimes the docs aren't helpful. Since my focus on this project has been mainly on the frontend, my AI use in the backend has been lower than the rest of the project.

Added: Have now used Claude to tell me a better way to refactor the Dockerfile creator, and Claude then helped me rewrite some of the code to use this pattern (see `frontend/src/lib/docker`). An example of a prompt I used was: `Is there a better way to find out if the tool/language is a script or package, and can you architect it please.` Also, I have used it for help with the drag and drop style dashboard page - GPT 5.4 was really helpful in coding with me to create a good base/structure of code that allows users to add modules to their dashboard - allowing me to create dashboard modules and have a working prototype that I can style correctly.

Overall, the use of AI for me has been majority frontend, and has been mostly for time-saving reasons, allowing me to focus more on the actual features that require human insight and reasoning, such as the UI flow and accessibility, as well as the actual codebase looking professional and easy to extend.

### Rishi

**Tools used**

- ChatGPT
- Claude
- Perplexity

**Where did you use AI tools and why**
Blueprinting / Concepting - To figure out how to create a concurrent fault tolerant workflow and what I should look for
Frontend - Primarily to fix styling issues in TailwindCSS. To understand concepts in frontend development such as SSR, the use of types and best practises to organise my code. Also used it to refactor code which was not efficient.
Backend - To debug errors esspecially with regards to schemas. To figure out the best way to implement a certain feature and organise the project. Used it to generate fake users to test my database and other test cases.
Git - Just to be sure I don't do anything stupid with my git branch, I often ask an LLM what the right course of action is. A notable use case is when I accidentally committed node_modules in the first commit of my branch. I didn't want to delete the file and make it look like I had 200,000 insertions and deletions. To resolve this, I used Claude to help me figure out how to cherry pick commits onto a new branch so I can keep the timestamps of the work I've done as well.

Overall, I tried my best to limit the use of AI as I wanted to write code myself. AI was primarily used to help me understand the best practises to write code while also acting as a debugger.

### Jack

**Tools used**

- ChatGPT
- Claude
- Gemini

**Where did you use AI tools and why**
Research and architecture best practices - When we were discussing and evaluating the best architecture for the backend, I found AI extremely helpful to gather a broad overview of the pros and cons of the feasible architectures in our case (this was mainly for Java before we switched). Whatsmore, it helped me to find articles on these specific architectures and evaluate whether our designs were industry standard. In terms of general research these tools allowed me to understand certain techniques much faster than just searching on the web.

Frontend - The main area I have used generative AI is when making small adjustments to CSS, as certain fields and tags I just don't know, so AI has helped me easily identify which tags and fields I need to add / change to get the desired design. It has also helped me with searching for the correct components for my situation, for example components provided by Shadcn, of which there is 100s, so I use generative AI to identify the needed one in my case.

Backend - When I need to write repetitive functions that do similar tasks with small differences, such as in model or schema testing I will often use AI to give me a base function in which I can copy and then adjust. Additionally, I will use it to make repetitive changes to a file, for example if I need to change the name of a variable in all functions within a file.

Setup - Certain libraries and tools I'm not familiar with, in these cases I have mainly using their respective docs; however when there is a gap in the areas the docs cover, or I am running into an obscure error I will consult AI and google to learn about this gap that isn't covered and/or fix the error.

Added: Have now used Claude for help with the drag and drop style courseowkr page - it was really helpful to refactor the async components to use the props fed in instaed of calling teh api themselves. It has also helped me do teh editor that allows teh lecturer / admin to edit both student and lecturer views as it came up with a good prototype that I could easily adapt.

Overall, I mainly use AI as a tool for faster, more specific searches for my scenario as opposed to google. I also use it as a tool to do repetitive tasks that would take me an unnecessarily long time to complete.

### Yuxuan

**Tools used**

- ChatGPT(through codex and website)
- Gemini(website)

**Where did you use AI tools and why**

Preliminary study - When we first discussed the technical architecture that our project should use, I found that these AI tools can help me evaluate the advantages and disadvantages of different frameworks and tools more quickly so that we can choose the most suitable technical framework according to these advantages and disadvantages.

Translation - As a student whose first language is not English, sometimes I have some words tha I don't know. I sometimes use these AI tools instead of traditional translators to help me understand and express these words.

Research framework usage - Some technical framework documents are not easy to understand, while others break down the usage of a method into the more basic and advanced usage. If I miss some content, or sometimes I use search to find the content I need in the document, I will find some more simple introductions to the method I want to use. At those situations, AI can help me understand and use these frameworks more correctly.

Bug fix - Sometimes the error message output by the framework we use is not only lengthy but also difficult to understand. At this time, I will use AI to help me analyze the error information, to better locate the cause and location cause the error. At the times without AI, I found difficult to find the specific location cause the error, and the emergence of AI really help me to faster locate bugs.

Merging branch - when package.json in our FE broke in my branch, it is nearly impossible for me to fix by hand so I use Codex to fixit, also when there is complex i.e. two branch change same code that I am not sure how to merge to lose feature from one of the branch

Windows environment - in the run-test-stack part about windows specific environment is suggested by AI as windows use some weird command

Library usage - when I want to find a function from some library that I never used before I will use AI to see the usage of that function. Also when I want a specific function that our current library can not find I will ask AI to suggest some library. 
