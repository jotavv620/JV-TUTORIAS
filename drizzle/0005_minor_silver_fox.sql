CREATE TABLE `bolsistas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bolsistas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `professores` ADD `email` varchar(320);--> statement-breakpoint
ALTER TABLE `bolsistas` ADD CONSTRAINT `bolsistas_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;