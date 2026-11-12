CREATE TABLE `items` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE `punishments` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `user_punishments` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`punishmentId` integer NOT NULL,
	`userId` text NOT NULL,
	`status` text NOT NULL,
	`strikeNumber` integer NOT NULL,
	`assignedAt` integer NOT NULL,
	`completedAt` integer,
	CONSTRAINT `fk_user_punishments_punishmentId_punishments_id_fk` FOREIGN KEY (`punishmentId`) REFERENCES `punishments`(`id`),
	CONSTRAINT `fk_user_punishments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`userId` text NOT NULL,
	`itemId` integer NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`content` text,
	`reviewedBy` text,
	`date` text NOT NULL,
	CONSTRAINT `fk_user_items_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_user_items_itemId_items_id_fk` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY,
	`points` integer DEFAULT 0,
	`strikes` integer DEFAULT 0,
	`skips` integer DEFAULT 2
);
