CREATE TABLE `authorized_admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`authorizedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `authorized_admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `authorized_admins_email_unique` UNIQUE(`email`)
);
