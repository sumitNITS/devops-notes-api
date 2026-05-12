# DevOps Notes API

A lightweight, serverless REST API built with **FastAPI** and deployed on **Google Cloud Run** using **Cloud Build** (and **Terraform**).

Perfect for DevOps engineers to store and search personal notes, tips, and learnings.

## Features

- Create, list, search, and delete DevOps notes
- Firestore as backend database
- Fully containerized with Docker
- Infrastructure as Code with Terraform
- Automated CI/CD with Cloud Build
- Serverless & auto-scaling on Cloud Run

## Tech Stack

- **Backend**: Python + FastAPI
- **Database**: Google Cloud Firestore
- **Deployment**: Google Cloud Run
- **IaC**: Terraform
- **CI/CD**: Google Cloud Build
- **Container**: Docker

## Prerequisites

1. Google Cloud Account + Project
2. `gcloud` CLI installed and authenticated
3. Terraform installed

## Quick Start

### 1. Clone & Setup

```bash
git clone <your-repo-url>
cd devops-notes-api

# Authenticate with GCP
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2. Local Development

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Enable Firestore API
gcloud services enable firestore.googleapis.com

# Setup Firestore authentication
gcloud auth application-default login

# Create Firestore database (if not already created)
gcloud firestore databases create --database="devops-notes-db" --location=<location>

# Run the application
cd app
uvicorn main:app --reload
```

**Test the API:**
- Health check: http://127.0.0.1:8000/
- List notes: http://127.0.0.1:8000/notes

**Create a note:**
```bash
curl -X POST http://127.0.0.1:8000/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First DevOps Note",
    "content": "Remember to always enable APIs before using them! 🔥",
    "tags": ["gcp", "firestore", "troubleshooting"]
  }'
```

### 3. Deploy to Cloud Run

**Option A: Automatic (Recommended)**
Push code to `main` branch → Cloud Build automatically builds and deploys

**Option B: Manual Deployment**
```bash
gcloud run deploy devops-notes \
  --source . \
  --region <region> \
  --allow-unauthenticated \
  --set-env-vars FIRESTORE_DB_NAME=devops-notes-db
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | / | Health check |
| POST | /notes | Create note |
| GET | /notes | List all notes |
| GET | /notes/search?q=eks | Search notes |
| DELETE | /notes/{id} | Delete note |

## Example Requests

**Create Note:**
```bash
curl -X POST <CLOUD_RUN_URL>/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Reduce EKS Costs",
    "content": "Use Spot instances + Karpenter...",
    "tags": ["aws", "kubernetes", "cost-optimization"]
  }'
```

**Search Notes:**
```bash
curl "<CLOUD_RUN_URL>/notes/search?q=kubernetes"
```

**Delete Note:**
```bash
curl -X DELETE "<CLOUD_RUN_URL>/notes/{note_id}"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FIRESTORE_DB_NAME` | Firestore database name | `devops-notes-db` |
| `ENVIRONMENT` | Deployment environment | `dev` |
| `PORT` | Application port | `8080` |

## Deployment Architecture

```
Git Repository (main branch)
         ↓
    Cloud Build (triggered)
         ↓
    Build Docker Image
         ↓
    Push to Artifact Registry
         ↓
    Deploy to Cloud Run
         ↓
   Firestore Database
```

## Troubleshooting

### Permission Denied for Firestore
```bash
# Grant necessary IAM role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=user:YOUR_EMAIL \
  --role=roles/datastore.owner
```

### Cloud Build fails
```bash
# Grant Cloud Build service account permissions
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)')
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
  --role=roles/run.admin
```

### Local app can't connect to Firestore
```bash
# Ensure authentication is set up
gcloud auth application-default login

# Verify Firestore is enabled
gcloud services enable firestore.googleapis.com
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues and questions, please open an issue on GitHub.