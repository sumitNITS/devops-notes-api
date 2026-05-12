output "cloud_run_url" {
  value       = google_cloud_run_service.devops_notes.status[0].url
  description = "URL of the deployed Cloud Run service"
}

output "cloud_run_service_name" {
  value       = google_cloud_run_service.devops_notes.name
  description = "Cloud Run service name"
}

output "firestore_database" {
  value       = google_firestore_database.database.name
  description = "Firestore database name"
}

output "artifact_registry_repository" {
  value       = google_artifact_registry_repository.repo.repository_id
  description = "Artifact Registry repository ID"
}

output "artifact_registry_url" {
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}"
  description = "Artifact Registry repository URL"
}