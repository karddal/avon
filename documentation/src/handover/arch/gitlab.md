# GitLab

GitLab is the Git repo forge that we use to integrate with our system. When courseworks, units and programmes are created, we provision groups on GitLab to give a space to store repos.

Either the Cloud version or the Self-Hosted version can be used.

We communicate with GitLab using either pure API calls, or a wrapper library.

In order to allow authentication, we use Service Accounts. A Service Account is created for the root subgroup, and invited as members to subgroups. Then, authentication tokens can be created for the service account to allow authentication with the GitLab API.