CREATE TABLE `share` (
	`user_id` bigint NOT NULL,
	`server_id` varchar(126) NOT NULL,
	`access_user_id` bigint NOT NULL,
	`can_send_commands` boolean NOT NULL DEFAULT false,
	`can_start_server` boolean NOT NULL DEFAULT false,
	`can_restart_server` boolean NOT NULL DEFAULT false,
	`can_stop_server` boolean NOT NULL DEFAULT false,
	`can_kill_server` boolean NOT NULL DEFAULT false,
	CONSTRAINT `characters_pk` PRIMARY KEY(`user_id`,`access_user_id`)
);
