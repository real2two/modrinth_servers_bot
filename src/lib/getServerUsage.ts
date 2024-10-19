import type { ServerState } from "../types";

export function getServerUsage(
  wsUrl: string,
  wsToken: string,
): Promise<{
  power: ServerState;
  cpu_percent: number;
  ram_usage_bytes: number;
  ram_total_bytes: number;
  storage_usage_bytes: number;
  storage_total_bytes: number;
} | null> {
  return new Promise((resolve) => {
    // biome-ignore lint/suspicious/noExplicitAny: This is bad code.
    const usage: any = {};
    const finished = { powerState: false, stats: false };

    const ws = new WebSocket(`wss://${wsUrl}`);

    const timeout = setTimeout(() => {
      ws.close();
    }, 2000);

    ws.onopen = () => {
      ws.send(JSON.stringify({ event: "auth", jwt: wsToken }));
    };
    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      switch (data.event) {
        case "power-state":
          usage.power = data.state;

          finished.powerState = true;
          break;
        case "stats":
          usage.cpu_percent = data.cpu_percent;
          usage.ram_usage_bytes = data.ram_usage_bytes;
          usage.ram_total_bytes = data.ram_total_bytes;
          usage.storage_usage_bytes = data.storage_usage_bytes;
          usage.storage_total_bytes = data.storage_total_bytes;

          finished.stats = true;
          break;
      }

      if (finished.powerState && finished.stats) {
        resolve(usage);
        return ws.close();
      }
    };
    ws.onclose = () => {
      clearTimeout(timeout);
      if (!finished.powerState || !finished.stats) resolve(null);
    };
  });
}
