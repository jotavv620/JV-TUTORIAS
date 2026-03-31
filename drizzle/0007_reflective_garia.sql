-- Create syncHistory table
CREATE TABLE IF NOT EXISTS `syncHistory` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `tutoriaId` int NOT NULL,
  `syncType` enum('google_calendar','email_notification') NOT NULL,
  `status` enum('success','error','pending') NOT NULL DEFAULT 'pending',
  `message` text,
  `googleEventId` varchar(255),
  `googleEventLink` text,
  `syncedBy` int,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `syncHistory_tutoriaId_fk` FOREIGN KEY (`tutoriaId`) REFERENCES `tutorias` (`id`) ON DELETE CASCADE,
  CONSTRAINT `syncHistory_syncedBy_fk` FOREIGN KEY (`syncedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create emailLog table
CREATE TABLE IF NOT EXISTS `emailLog` (
  `id` int AUTO_INCREMENT NOT NULL PRIMARY KEY,
  `tutoriaId` int NOT NULL,
  `emailType` enum('tutoria_reminder','sync_notification','error_notification') NOT NULL,
  `recipientEmail` varchar(320) NOT NULL,
  `recipientType` enum('professor','bolsista') NOT NULL,
  `subject` varchar(255) NOT NULL,
  `status` enum('sent','failed','pending') NOT NULL DEFAULT 'pending',
  `errorMessage` text,
  `sentAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `emailLog_tutoriaId_fk` FOREIGN KEY (`tutoriaId`) REFERENCES `tutorias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better query performance
CREATE INDEX `syncHistory_tutoriaId_idx` ON `syncHistory` (`tutoriaId`);
CREATE INDEX `syncHistory_status_idx` ON `syncHistory` (`status`);
CREATE INDEX `syncHistory_createdAt_idx` ON `syncHistory` (`createdAt`);
CREATE INDEX `emailLog_tutoriaId_idx` ON `emailLog` (`tutoriaId`);
CREATE INDEX `emailLog_status_idx` ON `emailLog` (`status`);
CREATE INDEX `emailLog_createdAt_idx` ON `emailLog` (`createdAt`);