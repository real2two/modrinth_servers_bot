import type { ServerState } from "../types";

export function getPowerState(wsUrl: string, wsToken: string): Promise<ServerState | null> {
  return new Promise((resolve) => {
    let resolved = false;

    const ws = new WebSocket(`wss://${wsUrl}`);

    const timeout = setTimeout(() => {
      ws.close();
    }, 2000);

    ws.onopen = () => {
      ws.send(JSON.stringify({ event: "auth", jwt: wsToken }));
    };

    ws.onmessage = (evt) => {
      const data = JSON.parse(evt.data);

      if (data.event === "power-state") {
        resolved = true;
        resolve(data.state);
        ws.close();
      }
    };

    ws.onclose = () => {
      clearTimeout(timeout);
      if (!resolved) {
        resolve(null);
      }
    };
  });
}
