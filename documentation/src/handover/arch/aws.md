# AWS

AWS is the main backbone of the Avon Platform. To understand how Avon works, you must understand the structure of the AWS setup. 

The region where Avon is hosted is `eu-north-1` or Stockholm.
The ECS cluster is called `wubble` (currently).
The AWS Application is called `Avon-Production`.

A [CloudFormation](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/Welcome.html) stack will be provided, but it is recommended to learn the structure of the project incase you need to debug/change key functionality of Avon.

Contents:
- [AWS](#aws)
  - [VPC](#vpc)
    - [Subnets](#subnets)
    - [Route Tables](#route-tables)
    - [Security Groups](#security-groups)
  - [ECS](#ecs)
    - [Task Definitions](#task-definitions)
    - [ECR](#ecr)
    - [Load Balancing](#load-balancing)
      - [Target Groups](#target-groups)
  - [RDS](#rds)
  - [AWS Secrets Manager](#aws-secrets-manager)
  - [S3](#s3)
  - [Cloudfront](#cloudfront)
  - [IAM](#iam)
    - [Users](#users)
    - [Roles](#roles)
    - [Identity Providers](#identity-providers)
  - [SQS](#sqs)
  - [Architecture Structure (Application)](#architecture-structure-application)
    - [Public ALB](#public-alb)
    - [Frontend](#frontend)
    - [Internal ALB](#internal-alb)
    - [Backend](#backend)
    - [RDS](#rds-1)
    - [Summary](#summary)
  - [Architecture Structure (Testing Engine)](#architecture-structure-testing-engine)

## VPC

AWS [VPC (Virtual Private Cloud)](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html) is how all parts of the Avon AWS system exist on the same (virtual) network. This allows the different components of the platform to easily connect/work with one another.

The name of the Avon VPC is `avon-vpc`.

### Subnets

A subnet is a range of IP addresses. You create AWS resources, EC2 instances in Avon's case, in specific subnets, to route them as needed.

The `avon-vpc` has 4 subnets (2 in each [availability zone](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html#concepts-availability-zones)).

In availabilty zone `eu-north-1a`, there is a **public** and a **private** subnet.

In availabilty zone `eu-north-1b`, there is a **public** and a **private** subnet.

### Route Tables

A [route table](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Route_Tables.html) is a way to direct traffic from a **subnet** to a **network gateway**.

In Avon's case, it allows our public subnets to reach the `avon-igw` [**internet gateway**](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Internet_Gateway.html).

Route tables also allow connection to [S3](https://aws.amazon.com/s3/), a object-based storage bucket, via `avon-vpce-s3`.

### Security Groups

[Security Groups](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html) control the traffic that is allowed to reach and leave the resources contained in it.

List of Avon's security groups:
- `avon-alb-public`
- `avon-frontend-sg`
- `avon-alb-internal`
- `avon-backend-sg`
- `avon-database-sg`
- `avon-runners-sg`

For example, the database should only accept traffic on port 5432 (PostgreSQL) from the backend service, and so the `avon-database-sg` will have an inbound rule to only accept on port 5432 from `avon-backend-sg`.

For Avon, this allows Security Group chaining, which allows the traffic to enter through the Public ALB (Application Load Balancer), and follow a straight, protected, path through the system. More will be mentioned later about this in the TODO section.

## ECS

Avon is hosted completely on AWS via the [ECS (Elastic Container Service)](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html).

The highest level of the ECS configuration is the ECS Cluster. This is where the services of Avon live, specifically the Frontend (AvonFrontend) and Backend (AvonBackend) services.  

### Task Definitions

Services are created via [Task Definitions](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_definitions.html). These are blueprints for services that you run on ECS, and is how Avon deploys to ECS via Github CD workflows in [.github/workflows](../../../../.github/workflows/).

Avon's task definitions are stored in [.aws/](../../../../.aws/).

### ECR

AWS ECR (Elastic Container Registry) is where all the related [Docker](https://docker.com) images are uploaded to, and pulled from by the Task Definitions. 

There are 3 main repositories inside Avon's ECR:
- **avon/frontend**
  - frontend docker images
- **avon/backend**
  - backend docker images
- **avon-runners/\***
  - runners for coursework tests 
  - **\*** is the name of the predetermined runner e.g. `python-runner` being the python based coursework runner

### Load Balancing

Avon's goal is to be fully implemented, and so we have followed industry standard paradigms. One way we did this is by using [ALB (Application Load Balancer)'s](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html).

Avon uses two ALB's:
- `avon-public-alb` 
  - public facing ALB that is the entrypoint of traffic (from users of Avon).
  - meaning that the Frontend doesn't *directly* receive traffic, rather it goes via the ALB beforehand, keeping sure that there is enough instances of the Frontend to serve all users.
- `avon-internal-alb`
  - internal ALB between the Frontend and Backend services.
  - ensures that if there is too many requests going to the backend, more can be created.
  - meaning that the Frontend service doesn't *directly* talk to the Backend service.

#### Target Groups

Load balancers talk to the Frontend and Backend services via [Target Groups](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html), routing requests to the registered targets.

Avon uses two Target Groups:
- `avon-frontend-targets` - points to the Frontend EC2 service.
- `avon-backend-targets` - points to the Backend EC2 service.

## RDS

AWS [RDS (Relational Database Service)](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html) is a service to host databases directly via AWS, rather than creating a database inside an EC2 instance for example. It allows easier set-up of a database, and also provides features such as auto-scaling, backups, logging etc.

Avon uses RDS to host it's PostgreSQL database, which *currently* stores both the [BetterAuth](https://better-auth.com) tables, as well as the actual data created by the [FastAPI](https://fastapi.tiangolo.com/) backend.

Most of the features that increase cost are disabled in Avon's case.

The RDS instance is inside the `avon-database-sg` security group, and *currently* allows connection from other areas (such as a SQL client on your computer) via a username and password. 

To obtain these credentials, follow these steps:

1. Login to the AWS console.
2. Navigate to the databases tab, and select `avon-database`.
3. Select Modify.
4. Create a new Master Password (or use [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html)).
5. Replace the DB_URL in [AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html) to ensure that it matches.

> [!TIP]
> For number 5, the DB_URL should look like this: `postgresql://username:password@host:5432/database_name`
> The default username is `postgres`.
> 
> The host is the url of the RDS instance, will look similar to this: `avon-database.???.eu-north-1.rds.amazonaws.com`

## AWS Secrets Manager

[AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html) is a way to store environment variables that are required during the **runtime** of any services. Note that this does not include variables that are required at **build time** as those are needed to be set in the Dockerfile(s) before building (e.g. the CDN url).

The secrets that are currently stored are:
- `gitlab-avon-sa-secret` - the [GitLab](https://gitlab.com) service account token, for communicating with the GitLab API.
- `GITLAB_ROOT_ID` - the id of the root group where student repositories will be stored.
- `GITLAB_BASE_URL` - the url of the GitLab instance. If you plan to use a self-hosted instance, your url will be set here, otherwise it's set to GitLab's API url.
- `backend-db` - the RDS PostgreSQL connection string.
- `db_url` - duplicate of above.
- `BA_SECRET` - the [BetterAuth](https://better-auth.com) secret.

## S3

AWS [S3 (Simple Storage Service)](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html) is an object storage service.

Avon uses S3 to store images, test logs, and other assets needed for Avon to function.

List of active buckets:
- `avon-cdn-bucket` - hosts images such as the logo, background(s) and other svg assets.
- `avon-testing-bucket` - logs relating to tests ran on Avon.

## Cloudfront

AWS [Cloudfront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html) is a way to speed up distribution of static (and dynamic) web content. In Avon's case, it is used to serve images. These images are stored in S3, under the `avon-cdn-bucket`.

The url for Avon's CDN is `https://cdn.avon.ac`, and allows users to get the required assets to show when visiting `https://avon.ac`. Cloudfront also allows caching, which improves image loading times, and removes unneeded requests to the CDN.

## IAM

AWS [IAM](https://docs.aws.amazon.com/whitepapers/latest/introduction-aws-security/identity-and-access-control.html) is the role system to manage access to AWS Resources. 

### Users

The user(s) of AWS will have a specific user account, with permission policies that allow them to do certain things in relation to the AWS system.

To run Avon locally, you will need to run commands like `aws login` and `aws configure`. `aws configure` requires an [Access Key](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) from your AWS IAM User account.

### Roles

Roles allow short-term identities to be created that have specific permissions. Avon uses the role system (`AVON_WORKER_ROLE`) to allow the testing functionality to work correctly, having the permissions to access S3 and SQS.

### Identity Providers

Identity Providers (IDP) allow you to manage your user identities outside of AWS. For example, Avon has an [OIDC (OpenID Connect)](https://www.microsoft.com/en-gb/security/business/security-101/what-is-openid-connect-oidc) IDP for Github, allowing Github actions to run actions that will directly affect AWS.

## SQS

AWS [SQS (Simple Queue Service)](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html) is a queue service. SQS is used in Avon to store results as the tests are running in their containers, and the backend can read those results from the queue and store them in the database.

The queue used by Avon is `build-notifications`.

## Architecture Structure (Application)

Now you know about all of the components, we can provide the high-level structure of Avon.

The entire AWS structure is encapsulated by the `avon-vpc` VPC (as you already know).

### Public ALB

When a user connects to `https://avon.ac`, the traffic will go to the `avon-public-alb`, which is in the `avon-alb-public` security group. 
This security group allows inbound HTTP and HTTPS from all traffic `0.0.0.0/0`, meaning the user can connect. The traffic will then travel through the ALB and point towards the `avon-frontend-targets`, reaching the Frontend service. 

### Frontend

The Frontend service is inside the `avon-frontend-sg` security group, meaning it only accepts inbound connections on port 3000 (Next.js port) from the `avon-alb-public` security group **only**.

Once a request to access data from the backend is made, the frontend will make a request to the `avon-internal-alb`.

### Internal ALB

The internal ALB only accepts traffic on port 80 (HTTP port) from the `avon-frontend-sg` **only**.
The ALB will then forward that traffic towards the `avon-backend-targets`, reaching the Backend service.

### Backend

The Backend service is inside the `avon-backend-sg` security group, meaning that it only accepts inbound connections on port 8000 (FastAPI port) from the `avon-alb-internal` security group **only**.
The backend will run the API request, requiring data from the database, meaning it will send traffic to the `avon-database` RDS instance.

### RDS

The PostgreSQL RDS database is inside the `avon-database-sg` security group, meaning that it will accept traffic from the `avon-backend-sg` **only**.

> RDS currently accepts traffic from anywhere on port 5432 for connections from SQL clients, if you don't want this, remove the inbound rule on `avon-database-sg` that allows all traffic.

### Summary

This is the main structure of the application (ignoring the testing functionality), allowing the user to connect to Avon and permit their traffic to travel through cleanly and reach the database. All sections of Avon are ordered and do not allow traffic to intercept the chaining, meaning that traffic between instances/resources is protected by the VPC.

## Architecture Structure (Testing Engine)

Avon's testing engine is the main functionality that makes Avon stand out when compared to other competitors. It allows lecturers to run tests on their student's code.

