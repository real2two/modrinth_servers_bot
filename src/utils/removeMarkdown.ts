export function removeMarkdown(str: string) {
  return str.replace(/\*/g, "\\*").replace(/`/g, "\\`").replace(/~/g, "\\~").replace(/\|\|/g, "\\|\\|").replace(/_/g, "\\_");
}

export function removeMarkdownInTemplate(str: string) {
  return str.replace(/`/g, "\\`");
}
