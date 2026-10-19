CREATE TABLE `patients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`search_name` text NOT NULL,
	`cpf` text NOT NULL,
	`birth_date` text NOT NULL,
	`gender` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`address` text,
	`legal_basis` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_by` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `patients_cpf_unique` ON `patients` (`cpf`);--> statement-breakpoint
CREATE INDEX `patients_search_name_index` ON `patients` (`search_name`);