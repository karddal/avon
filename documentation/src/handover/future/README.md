# Future work

Although this is the 'final release', the product we have is currently an MVP. There is a long road to complete adoption and use in actual coursework. 

**We believe that the following need to be done in order to beta release it on first year students:**
- Rate-limit testing
- Analytics for tests
- Making the product secure
- Making the product compliant to university standards
- Access to OAuth
- Intensive testing 
- Optimising cloud infrastructure to lower costs
- Better error handling for API calls and complex routes/workflows 
    - e.g. when batch creating a entire programme from a programme catalogue link, errors can happen anywhere and there is no indication where they came from

**Further extensions that would be nice to have:**
- Add support for extensions for individual students
- Allow students to run tests on their own repos
- Allowing the students to take quizzes
- Integration of LTI to use adjacent software
- Guaranteeing repository provisioning in fault tolerant using Temporal etc
- Allowing other file formats (.docx, .xlsx, .pdf, .ppt)
- Allowing integration with Overleaf
- Decoupling the testing engine from main product
- Refactoring the code using either TRPC, FastAPI SDK, GitLab SDK (python-gitlab)
- Achieving higher accessibility scores for the UI
- Better logging system across both backend and frontend (consider using something such as PostHog)
- Better error handling for API calls and complex routes/workflows 
    - e.g. when batch creating a entire programme from a programme catalogue link, errors can happen anywhere and there is no indication where they came from
- Access to OAuth
- Students should be able to mark their own responses


# Vision
The current version of Avon solves the problem of testing the closed-ended portion. Although useful, this has only solved the minor inconvenience of downloading zip files and running tests. The vast majority of the time is spent on assessing the open-ended portions which includes making sure it compiles, testing the open ended portion, and evaluating it based on strict rubrics. **Our vision is to automate the entire marking pipeline which consists of the following steps:**
- Submission (Currently handles codebases with git, should extend to other formats)
- Closed-ended marking (Currently handles select codebases, can be extend to others)
- Open-ended marking (Not handled)
- Feedback (Not handled)
- Integrate to LTI and mark-handling systems (Not handled)
- Analytics for Lecturers (Not handled)
- Appeal system (Not handled)

While the prospect of open-ended marking seems uneasy, we must recognise that marking does not have to be a black box. AI marking should be explicit and lecturers should be able to clearly see where marks have been given and taken away. The mark provided need not be final and a heauristic (within 3 points) can be used where the lecturer gives the final mark. Open ended marking is also the sort of problem LLMs are designed to solve as there is a clear rubric specified and there are years of data (submissions and rubrics) to use for testing the agent. Marking **will** be automated in the future and we must not shy away from automating something highly repetitve as computer scientists.