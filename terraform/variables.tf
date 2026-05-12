variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region for resources"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "artifact_registry_repository_id" {
  description = "Artifact Registry repository ID"
  type        = string
}

variable "firestore_db_name" {
  description = "Firestore database name"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
}