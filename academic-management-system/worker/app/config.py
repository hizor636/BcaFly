"""
BcaFly Python Worker — Database Configuration
Connects to the same PostgreSQL instance used by the Spring Boot backend.
"""
import os

DB_CONFIG = {
    "host": os.getenv("BCAFLY_DB_HOST", "localhost"),
    "port": int(os.getenv("BCAFLY_DB_PORT", "5432")),
    "dbname": os.getenv("BCAFLY_DB_NAME", "bcafly_db"),
    "user": os.getenv("BCAFLY_DB_USER", "bcafly_app"),
    "password": os.getenv("BCAFLY_DB_PASSWORD", "bcafly_secret"),
}

STORAGE_BASE = os.getenv("BCAFLY_STORAGE", "/opt/bcafly/storage")
UPLOAD_DIR = os.path.join(STORAGE_BASE, "uploads")
REPORT_DIR = os.path.join(STORAGE_BASE, "reports")
EXPORT_DIR = os.path.join(STORAGE_BASE, "exports")
BACKUP_DIR = os.path.join(STORAGE_BASE, "backups")
