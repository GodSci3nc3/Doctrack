BEGIN;
ALTER TABLE usuariointerno 
ADD COLUMN google_access_token TEXT NULL,
ADD COLUMN google_refresh_token TEXT NULL,
ADD COLUMN google_token_expiry TIMESTAMP NULL;
COMMIT;