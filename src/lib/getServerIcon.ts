export async function getServerIcon(fsUrl: string, fsToken: string) {
  const req = await fetch(`https://${fsUrl}/download?path=/server-icon-original.png`, {
    headers: { Authorization: `Bearer ${fsToken}` },
  });

  return {
    status: req.status,
    body: req.status === 200 ? await req.blob() : null,
  };
}
