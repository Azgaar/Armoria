/** Attribution is untrusted upload metadata, even after SVG sanitization. */
export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    character => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"})[character] || character
  );
}

export function attributionUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function attributionLink(value: string, label: string): string {
  const url = attributionUrl(value);
  const text = escapeHtml(label);
  return url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${text}</a>` : text;
}
