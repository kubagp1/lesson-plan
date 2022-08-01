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

provider "google" {
  project = var.PROJECT_ID
  region  = "europe-central2"
  zone    = "europe-central2-c"
}

terraform {
  backend "gcs" {}
}

data "terraform_remote_state" "state" {
  backend = "gcs"
  config = {
    bucket = "${var.PROJECT_ID}_tfstate" // This is overwritten in cloudbuild.yaml
    prefix = "dev"
  }
}

// MODULES

module "backend" {
  source = "./modules/backend"

  PROJECT_ID = var.PROJECT_ID
}

module "frontend" {
  source = "./modules/frontend"

  PROJECT_ID  = var.PROJECT_ID
  DOMAIN_NAME = var.DOMAIN_NAME
}
