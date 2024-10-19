CREATE TABLE `users` (
	`user_id` bigint NOT NULL,
	`modrinth_pat` varchar(126) NOT NULL,
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`)
);
