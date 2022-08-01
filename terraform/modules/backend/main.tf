terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "4.30.0"
    }
  }
}

variable "PROJECT_ID" {
  type        = string
  description = "GCP Project ID"
}

// SCRAPE FUNCTION

resource "google_storage_bucket" "bucket" {
  name     = "${var.PROJECT_ID}_function-bucket"
  location = "europe-central2"
}

data "archive_file" "function_zip" {
  type        = "zip"
  source_dir  = "../backend/lib"
  output_path = "./function.zip"
}

resource "google_storage_bucket_object" "archive" {
  name   = "index.zip"
  bucket = google_storage_bucket.bucket.name
  source = data.archive_file.function_zip.output_path
}

resource "google_cloudfunctions_function" "function" {
  name        = "scrape"
  description = "Scrape lesson plan and save it to a bucket."
  runtime     = "nodejs16"

  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.bucket.name
  source_archive_object = google_storage_bucket_object.archive.name
  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = "projects/${var.PROJECT_ID}/topics/scrape-topic"
  }
  entry_point = "event"

  environment_variables = {
    BUCKET_NAME = google_storage_bucket.lesson_plan.name
  }
}

// SCRAPE TOPIC
resource "google_pubsub_topic" "topic" {
  name = "scrape-topic"
}

// LESSON PLAN BUCKET

resource "google_storage_bucket" "lesson_plan" {
  name     = "${var.PROJECT_ID}_lesson-plan"
  location = "europe-central2"

  force_destroy = true
}

// SCHEDULER

resource "google_cloud_scheduler_job" "job" {
  name        = "${var.PROJECT_ID}_scrape-job"
  description = "Scrape lesson plan and save it to a bucket every 1 hour."
  schedule    = "0 * * * *"

  pubsub_target {
    topic_name = google_pubsub_topic.topic.id
    data       = base64encode("{}")
  }
}
