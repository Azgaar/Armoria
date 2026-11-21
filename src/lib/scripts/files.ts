export function getFilesFromDropEvent(event: DragEvent): File[] {
  const transfer = event.dataTransfer;
  if (!transfer) return [];
  if (transfer.files.length) return [...transfer.files];
  return [...transfer.items]
    .filter(item => item.kind === "file")
    .map(item => item.getAsFile())
    .filter((file): file is File => file !== null);
}

export function getFilesFromInputEvent(event: Event): File[] {
  const target = event.currentTarget;
  if (!(target instanceof HTMLInputElement)) return [];
  const files = target.files ? [...target.files] : [];
  target.value = "";
  return files;
}
