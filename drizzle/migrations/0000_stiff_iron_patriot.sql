CREATE TABLE `users` (
	`user_id` bigint NOT NULL,
	`modrinth_auth` varchar(126) NOT NULL,
	`modrinth_expires` date NOT NULL,
	`modrinth_refresh_expires` date NOT NULL,
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`)
);
