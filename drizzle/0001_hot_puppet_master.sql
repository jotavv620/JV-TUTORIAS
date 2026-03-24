CREATE TABLE `checkins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tutoriaId` int NOT NULL,
	`timestamp` varchar(50) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `checkins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `disciplinas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `disciplinas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `feedbacks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tutoriaId` int NOT NULL,
	`pontualidade` int NOT NULL,
	`audio` int NOT NULL,
	`conteudo` int NOT NULL,
	`comentarios` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `feedbacks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `instituicoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `instituicoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `professores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `professores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tutorias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`disciplina` varchar(255) NOT NULL,
	`professor` varchar(255) NOT NULL,
	`instituicao` varchar(255) NOT NULL,
	`tutor` varchar(255) NOT NULL,
	`data` varchar(10) NOT NULL,
	`horario` varchar(5) NOT NULL,
	`horarioTermino` varchar(5) NOT NULL,
	`status` enum('scheduled','in_progress','completed') NOT NULL DEFAULT 'scheduled',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tutorias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `checkins` ADD CONSTRAINT `checkins_tutoriaId_tutorias_id_fk` FOREIGN KEY (`tutoriaId`) REFERENCES `tutorias`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `disciplinas` ADD CONSTRAINT `disciplinas_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feedbacks` ADD CONSTRAINT `feedbacks_tutoriaId_tutorias_id_fk` FOREIGN KEY (`tutoriaId`) REFERENCES `tutorias`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instituicoes` ADD CONSTRAINT `instituicoes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `professores` ADD CONSTRAINT `professores_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tutorias` ADD CONSTRAINT `tutorias_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;