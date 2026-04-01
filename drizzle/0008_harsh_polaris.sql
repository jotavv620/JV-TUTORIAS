-- Add multiple reminder tracking fields to tutorias table
ALTER TABLE `tutorias` ADD COLUMN `reminder_24h_sent` boolean NOT NULL DEFAULT false;
ALTER TABLE `tutorias` ADD COLUMN `reminder_12h_sent` boolean NOT NULL DEFAULT false;
ALTER TABLE `tutorias` ADD COLUMN `reminder_1h_sent` boolean NOT NULL DEFAULT false;