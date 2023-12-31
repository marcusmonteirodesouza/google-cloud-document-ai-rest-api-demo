locals {
  kms_crypto_key_rotation_period = "7776000s" # 90 days
}

data "google_storage_project_service_account" "gcs_sa" {
}

resource "google_kms_key_ring" "keyring" {
  name     = "api-${var.region}-key-ring"
  location = var.region

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key" "api" {
  name            = "api-key"
  key_ring        = google_kms_key_ring.keyring.id
  rotation_period = local.kms_crypto_key_rotation_period

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key_iam_member" "cloud_run_service_agent_api" {
  crypto_key_id = google_kms_crypto_key.api.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${local.cloud_run_service_agent_email}"
}

resource "google_kms_key_ring" "doc_ai_keyring_single_region" {
  name     = "doc-ai-${local.doc_ai_single_region}-keyring"
  location = local.doc_ai_single_region

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key" "doc_ai_single_region" {
  name            = "doc-ai-key"
  key_ring        = google_kms_key_ring.doc_ai_keyring_single_region.id
  rotation_period = local.kms_crypto_key_rotation_period

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key_iam_member" "doc_ai_sa_doc_ai_single_region" {
  crypto_key_id = google_kms_crypto_key.doc_ai_single_region.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${local.doc_ai_sa}"
}

resource "google_kms_crypto_key_iam_member" "gcs_sa_doc_ai_single_region" {
  crypto_key_id = google_kms_crypto_key.doc_ai_single_region.id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${data.google_storage_project_service_account.gcs_sa.email_address}"
}