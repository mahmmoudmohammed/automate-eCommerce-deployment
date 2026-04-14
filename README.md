### Project Name:
Automated E-Commerce Deployment Platform

### Project Idea:
Building a high-availability, zero-downtime infrastructure to automate the deployment and scaling of e-commerce microservices using modern DevOps practices.


### Team member

- **Mahmoud Mohamed Ahmed [Team Lead]** – **Infrastructure & Orchestration**
- **Ahmed Shiref** – **development & Containerization**
- **Youssef Ayman** – **Terraform scripts & cloud services**
- **Huda Atef** – **CI/CD & Automation**


### Project Plan
1. Analysis & Service design
2. Design & Implement Infrastructure & Orchestration
3. Implement CI/CD pipeline
5. Implement Backend features
6. Implement Frontend features
4. Deploy to staging environment
5. End-t-End Testing
6. Deploy to production
6. Final Presentation


## Roles & Responsibilities
- Team Lead `Mahmoud`: Responsible for the overall project design,
- Infrastructure & Orchestration `Mahmoud`: Responsible for the deployment and management of the infrastructure,
- CI/CD & Automation `Huda`: Responsible for the implementation of CI/CD pipelines,
- Development & Containerization `Sherif`: Responsible for the development of the services.
- Terraform scripts & Cloud services `Youssef`: Responsible for the deployment of cloud services,

### KPIs – Metrics
- **Performance:** The time it takes for a user to interact with the application.
- **Scalability:** The ability to handle increased traffic.
- **Reliability:** The ability to handle failures.
- **Cost:** The cost of running the application.

### Instructor
- **Eng.Ahmed Gamil**

## Project Files
The project is structured into multiple services:
- **Frontend**: React-based UI.
- **Backend / API**: Express-based Node.js API service handling business logic.
- **Worker**: Node.js worker service to process background jobs and caching.
- **Nginx**: Reverse proxy to route frontend and backend requests.
- **Postgres**: Primary persistent SQL database.
- **Redis**: In-memory data store / cache.

---

## Getting Started (Local Development)

Follow these steps to set up the project locally on your machine so everyone is on the same page.

### Prerequisites

Make sure you have the following installed on your local machine:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- *Optional:* [Node.js](https://nodejs.org/en/) (if you prefer running locally without docker or need IDE auto-completion).

### Step 1: Clone the Repository

```bash
git clone https://github.com/mahmmoudmohammed/automate-eCommerce-deployment.git
cd automate-eCommerce-deployment
```

### Step 2: Run the Application

Since the entire application is completely containerized for local development, you only need to run a single command to spin up all 6 services (`frontend`, `backend`, `worker`, `nginx`, `postgres`, `redis`).

```bash
docker-compose up -d --build
```

### Step 3: Access the Application

Once the containers are successfully running without errors, open your browser and access the application via Nginx:

- **Web Application:** [http://localhost:3050](http://localhost:3050)

### Step 4: Stopping the Application

```bash
docker-compose stop
```

---

## Development Workflow & Hot-Reloading

Thanks to Docker volumes in `docker-compose.yml`, your local development directories are mapped straight into the containers:

- **Hot Reloading:** Any changes you make to the code inside `./*/src` will automatically trigger. No manual restarts required.
- **Node Modules:** If you install a new dependency (e.g. `npm install ZZZZ`) inside any microservice, you must rebuild its container.
  
  ```bash
  docker-compose down
  docker-compose up --build
  ```

---

## Git Workflow Guidelines

1. **Pull the latest changes:** Always run `git pull origin dev` before any action on your local machine.
2. **Review your diff:** Ensure no Conflicts or errors with remote repository.
3. **Commit & Push:** Once running perfectly locally, push up to the remote repository.
4. **Create a Pull Request:** Once your changes are ready to be merged to dev branch and ensure no conflicts,
