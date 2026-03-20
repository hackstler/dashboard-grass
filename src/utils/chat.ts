/**
 * Pure utility functions for chat message rendering.
 * No React dependency — testable in isolation.
 */

/** Extracts PDF markdown links from content, returning cleaned text + PDF URLs. */
export function detectAttachments(content: string): { text: string; pdfs: string[] } {
  const pdfRegex = /\[([^\]]*\.pdf)\]\((https?:\/\/[^\s)]+\.pdf[^\s)]*)\)/gi;
  const pdfs: string[] = [];
  let match;
  while ((match = pdfRegex.exec(content)) !== null) {
    pdfs.push(match[2]);
  }
  const text = content.replace(pdfRegex, "").trim();
  return { text, pdfs };
}

/** Triggers a browser download of a base64-encoded PDF. */
export function downloadBase64Pdf(base64: string, filename: string): void {
  const byteChars = atob(base64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Converts a subset of markdown to HTML for rendering in chat bubbles. */
export function formatContent(raw: string): string {
  let html = raw;
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-surface-hi px-1.5 py-0.5 rounded text-xs font-mono text-accent">$1</code>',
  );
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent hover:underline">$1</a>',
  );
  html = html.replace(/\n/g, "<br/>");
  return html;
}
