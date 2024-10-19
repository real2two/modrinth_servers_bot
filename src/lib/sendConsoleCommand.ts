export async function sendConsoleCommand(wsUrl: string, wsToken: string, cmd: string) {
  return new Promise((resolve) => {
    let success = false;

    const ws = new WebSocket(`wss://${wsUrl}`);

    const timeout = setTimeout(() => {
      ws.close();
    }, 2000);

    ws.onopen = () => {
      ws.send(JSON.stringify({ event: "auth", jwt: wsToken }));
      ws.send(JSON.stringify({ event: "command", cmd }));

      success = true;
      ws.close();
    };

    ws.onclose = () => {
      clearTimeout(timeout);
      resolve(success);
    };
  }) as Promise<boolean>;
}
