import JSZip from "jszip";

/**
 * Reads a WhatsApp export file (.txt or the .zip WhatsApp produces) in the
 * browser and returns its text content. Nothing is uploaded anywhere.
 */
export async function readExportFile(file: File): Promise<string> {
  if (file.name.toLowerCase().endsWith(".zip") || file.type === "application/zip") {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const txtEntries = Object.values(zip.files).filter(
      (f) => !f.dir && f.name.toLowerCase().endsWith(".txt")
    );
    if (txtEntries.length === 0) {
      throw new Error("No .txt chat file found inside the zip");
    }
    // WhatsApp zips contain a single _chat.txt; pick the largest .txt to be safe.
    let best = txtEntries[0];
    for (const e of txtEntries) {
      const bestSize = (best as unknown as { _data?: { uncompressedSize?: number } })._data
        ?.uncompressedSize ?? 0;
      const eSize = (e as unknown as { _data?: { uncompressedSize?: number } })._data
        ?.uncompressedSize ?? 0;
      if (eSize > bestSize) best = e;
    }
    return best.async("string");
  }
  return file.text();
}
