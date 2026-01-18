CREATE TABLE `coaching_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`coaching_date` date NOT NULL,
	`tip` text,
	`category` enum('protein','carbs','fat','calories','motivation','general'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`tracking_date` date NOT NULL,
	`total_calories` int DEFAULT 0,
	`total_protein` decimal(6,2) DEFAULT '0',
	`total_carbs` decimal(6,2) DEFAULT '0',
	`total_fat` decimal(6,2) DEFAULT '0',
	`meal_count` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`meal_type` enum('breakfast','lunch','dinner','snack','other'),
	`name` text,
	`description` text,
	`calories` int NOT NULL,
	`protein` decimal(6,2) NOT NULL,
	`carbs` decimal(6,2) NOT NULL,
	`fat` decimal(6,2) NOT NULL,
	`image_url` text,
	`ai_estimated` boolean DEFAULT false,
	`meal_date` date NOT NULL,
	`meal_time` varchar(5),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`goal` enum('bulk','lose','lean') NOT NULL,
	`age` int,
	`gender` enum('male','female','other'),
	`height` decimal(5,2),
	`weight` decimal(6,2),
	`activity_level` enum('sedentary','light','moderate','active','very_active'),
	`target_calories` int,
	`target_protein` decimal(6,2),
	`target_carbs` decimal(6,2),
	`target_fat` decimal(6,2),
	`timezone` varchar(64) DEFAULT 'UTC',
	`onboarding_complete` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`)
);
