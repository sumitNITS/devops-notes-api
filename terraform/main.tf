terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    # Backend configuration is passed via backend.hcl or -backend-config flag
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "enabled_services" {
  for_each = toset([
    "run.googleapis.com",
    "firestore.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com"
  ])
  service            = each.key
  disable_on_destroy = false
}

# Artifact Registry Repository
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = var.artifact_registry_repository_id
  format        = "DOCKER"
  depends_on    = [google_project_service.enabled_services]
}

# Firestore Database
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = var.firestore_db_name
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
  depends_on  = [google_project_service.enabled_services]
}

# Cloud Run Service
resource "google_cloud_run_service" "devops_notes" {
  name     = var.app_name
  location = var.region
  project  = var.project_id

  template {
    spec {
      containers {

        # Placeholder image that always exists (Google's hello-world)
        image = "us-docker.pkg.dev/cloudrun/container/hello"

        # resources {
        #   limits = {
        #     cpu    = "1000m"
        #     memory = "512Mi"
        #   }
        # }
        
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [google_project_service.enabled_services]
}

# IAM - Allow unauthenticated access (for demo)
resource "google_cloud_run_service_iam_member" "all_users" {
  service  = google_cloud_run_service.devops_notes.name
  location = var.region
  project  = var.project_id
  role     = "roles/run.invoker"
  member   = "allUsers"
}