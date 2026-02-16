import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractTextFromPdf(buffer: Buffer) {
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;

  const pages: { page: number; text: string }[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const text = content.items
      .map((it: any) => (typeof it.str === "string" ? it.str : ""))
      .filter(Boolean)
      .join(" ");

    pages.push({ page: i, text });
  }

  const fullText = pages.map(p => `[PAGE ${p.page}]\n${p.text}`).join("\n\n");

  const compact = fullText.replace(/\s+/g, "").length;
  const isMostlyEmpty = compact < 200; // seuil simple, ajuste si besoin

  return { fullText, pages, numPages: pdf.numPages, isMostlyEmpty };
}
