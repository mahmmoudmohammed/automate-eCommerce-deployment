# 🚀 Automated E-Commerce Deployment Platform

**Overview:** Building a high-availability, zero-downtime infrastructure to automate the deployment and scaling of e-commerce microservices using modern DevOps practices.

---

## 👥 The Team

* **Mahmoud Mohamed Ahmed [Team Lead]** – **Infrastructure & Orchestration**
* **Ahmed Shiref** – **CI/CD & Automation**
* **Youssef Ayman** – **Terraform scripts for cloud services**
* **Huda Atef** – **Backend & Containerization**

---

## 🏗️ Architecture

The project is structured into multiple services:
- **Frontend**: React-based UI.
- **Backend / API**: Express-based Node.js API service handling business logic.
- **Worker**: Node.js worker service to process background jobs and caching.
- **Nginx**: Reverse proxy to route frontend and backend requests.
- **Postgres**: Primary persistent SQL database.
- **Redis**: In-memory data store / cache.

---

## 💻 Getting Started (Local Development)

Follow these steps to set up the project locally on your machine so everyone is on the same page.

### Prerequisites

Make sure you have the following installed on your local machine:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- *Optional:* [Node.js](https://nodejs.org/en/) (if you prefer running locally without docker or need IDE auto-completion).

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd automate-eCommerce-deployment
```

### Step 2: Run the Application

Since the entire application is completely containerized for local development, you only need to run a single command to spin up all 6 services (`frontend`, `backend`, `worker`, `nginx`, `postgres`, `redis`).

```bash
docker-compose up --build
```

> **Note:** The `--build` flag ensures that the Docker images are built from scratch, grabbing the latest `package.json` dependencies. After the first time, you can usually just run `docker-compose up`.

If you prefer to run it in detached mode (background), use:
```bash
docker-compose up -d --build
```

### Step 3: Access the Application

Once the containers are successfully running without errors, open your browser and access the application via Nginx:

- **Web Application:** [http://localhost:3050](http://localhost:3050)

### Step 4: Stopping the Application

To shut down all running containers securely, press `Ctrl + C` in your terminal or open a new terminal in the project directory and run:

```bash
docker-compose down
```

---

## 🛠️ Development Workflow & Hot-Reloading

Thanks to Docker volumes in `docker-compose.yml`, your local development directories are mapped straight into the containers:

- **Hot Reloading:** Any changes you make to the code inside `./frontend/src`, `./backend/src`, or `./worker/src` will automatically trigger a local hot-reload inside the Docker container. No manual restarts required!
- **Node Modules:** The `node_modules` folders reside separately inside the Docker environment. If you install a **new** dependency (e.g. `npm install axios` inside `/frontend`), you must rebuild the containers to pick it up:
  
  ```bash
  docker-compose down
  docker-compose up --build
  ```

---

## 📋 Git Workflow Guidelines

1. **Pull the latest changes:** Always run `git pull origin main` before starting new work.
2. **Review your diff:** Ensure no extra debug lines are mixed in.
3. **Commit & Push:** Once running perfectly locally, push up to the remote repository.
