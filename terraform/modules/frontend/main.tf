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

variable "DOMAIN_NAME" {
  type        = string
  description = "Domain name"
}

// FRONTEND BUCKET

resource "google_storage_bucket" "static" {
  name     = var.DOMAIN_NAME
  location = "europe-central2"

  uniform_bucket_level_access = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "index.html"
  }

  force_destroy = true
}

resource "google_storage_bucket_iam_member" "static_policy" {
  bucket = google_storage_bucket.static.name
  role = "roles/storage.legacyObjectReader"
  member = "allUsers"
}

# resource "google_storage_bucket_acl" "image-store-acl" {
#   bucket = google_storage_bucket.static.name

#   predefined_acl = "publicRead"
# }