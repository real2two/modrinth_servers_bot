# Unofficial Modrinth Servers bot

This uses public endpoints from the Modrinth Servers API (Pyro Archon API) to work.

The source code for this is horrible and this was made as a quick and fun hobby project with 0 effort put into this.

The endpoints used here are clearly not meant to be "public" in a sense that it's a "public API", so I had to work around with some limitations (ex. connecting to WebSocket to get server stats and send console commands).

---

All commands:

```bash
bun install # install de
bun start # start prod
bun dev # start dev
bun commands # create commands
bun format # format code
bun schema/generate # generate schema
bun schema/migrate # migrate schema
```
