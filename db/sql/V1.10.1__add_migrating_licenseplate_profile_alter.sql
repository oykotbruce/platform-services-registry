BEGIN TRANSACTION;

ALTER TABLE profile 
ADD COLUMN IF NOT EXISTS migrating_licenseplate VARCHAR(32);

END TRANSACTION;
