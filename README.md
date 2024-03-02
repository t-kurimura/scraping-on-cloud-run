# Node.js Scraping Service with Chrome

This project provides a Node.js environment integrated with Google Chrome and Chromedriver for web scraping tasks.

## Structure

Our project lightly follows the principles of Clean Architecture to ensure maintainability, scalability, and testability.

- infrastructure: This is where the tools, frameworks, and libraries are defined and interacted with. It's the outermost layer of the architecture.
- adapters : This layer contains code that converts data between the use cases layer and any external agency such as the database or web.
- use_cases: This layer contains the business rules of the application. All the application's use cases reside here

```

+----------------------+
|     use_cases        |
| (Business Logic)     |
+----------------------+
          ^
          |
+----------------------+
|      adapters        |
| (Interface Adapters) |
+----------------------+
          ^
          |
+----------------------+
|  infrastructure      |
|(Frameworks & Drivers)|
+----------------------+
```

## Docker Overviews

### Node.js

Utilizes Node.js version 18 as the runtime environment.

### Google Chrome

Integrated with a specific version of Google Chrome, installed directly from a ZIP binary.

### Chromedriver

Corresponding version of Chromedriver is set up and made available.

### Port

The service is exposed on port 8080.

### Dependencies

Project dependencies are installed via npm, based on the package.json and package-lock.json (if available).

### TypeScript

The project seems to be written in TypeScript as there's a build step to compile TypeScript code.

### Service Start

The service is initiated using npm start, which would typically start the main application or server.

## Getting Started in your local
Follow the steps below to get this project up and running locally:

### 1. Service Account Creation

Create a new service account for the project.
Grant the service account below the permissions.

- Storage Object Admin
- Cloud Datastore User

### 2. Storing the Service Account Key

After creating the service account, you'll receive a JSON key.
Save this key as service_account_key.json in the root directory of the repository.

### 3. Building the Docker Image

Use the following command to build the Docker image:

```bash
docker build \
  -t scraping_cloud_run \
  --build-arg GOOGLE_APPLICATION_CREDENTIALS_PATH=/usr/app/service_account_key.json \
  --build-arg GOOGLE_CLOUD_PROJECT=google-cloud-project-id \
  .
```

### 4. Running the Container

Once the Docker image is built, you can run the container using:

```bash
docker run \
  -p 8080:8080 \
  -v $(pwd)/dist:/usr/app/dist \
  --name scraping_cloud_run \
  scraping_cloud_run
```

### 5. Hot Reloading during Local Development (Optional)

If you wish to see changes in real-time as you develop, you can enable hot reloading. This feature allows you to immediately visualize any modifications you make to the code without manually rebuilding the Docker container.

To utilize this:

a. Ensure that you have all project dependencies installed locally by running:
```bash
npm install
```

b. Start the development server with hot reloading enabled by executing:
```bash
npm run build
```

c. The server will now automatically refresh and reflect changes you make to the source files. Navigate to http://localhost:8080/{path} in your browser to see updates in real-time as you code.


## GitHub Actions
The .github/workflows/deploy.yml file describes the GitHub Actions workflow for deploying the application to Google Cloud Run.

Replace google-cloud-project-id with your GCP project ID and scraping-app with your Cloud Run application name. Also, set the GCP_SA_KEY secret in your GitHub repository with the content of the GCP Service Account key JSON file.