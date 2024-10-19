import env from "./env";
import { AutoRouter } from "itty-router";
import { client } from "./client";

const router = AutoRouter();

router.post("/interaction", (req, _, ctx) => {
  return client.handleInteractionsRequest(req, ctx);
});

export default {
  port: env.PORT,
  fetch: router.fetch,
};
