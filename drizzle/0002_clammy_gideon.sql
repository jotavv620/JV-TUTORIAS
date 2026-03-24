CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`professorName` varchar(255) NOT NULL,
	`achievementType` enum('first_tutoria','ten_tutorias','fifty_tutorias','perfect_rating','consistency','rising_star','master_teacher','legendary') NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(50) NOT NULL,
	`pointsReward` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leaderboard` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`professorName` varchar(255) NOT NULL,
	`rank` int NOT NULL,
	`totalPoints` int NOT NULL,
	`tutoriasCompleted` int NOT NULL,
	`averageRating` varchar(10) NOT NULL,
	`currentMedal` enum('none','bronze','silver','gold','platinum') NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `leaderboard_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`professorName` varchar(255) NOT NULL,
	`medalType` enum('bronze','silver','gold','platinum') NOT NULL,
	`pointsRequired` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `professorPoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`professorName` varchar(255) NOT NULL,
	`totalPoints` int NOT NULL DEFAULT 0,
	`tutoriasCompleted` int NOT NULL DEFAULT 0,
	`averageRating` varchar(10) NOT NULL DEFAULT '0.0',
	`currentMedal` enum('none','bronze','silver','gold','platinum') NOT NULL DEFAULT 'none',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `professorPoints_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `achievements` ADD CONSTRAINT `achievements_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `leaderboard` ADD CONSTRAINT `leaderboard_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `medals` ADD CONSTRAINT `medals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `professorPoints` ADD CONSTRAINT `professorPoints_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;