declare module "pdf-parse" {
  export interface PdfParseResult {
    text: string;
    numpages?: number;
    numrender?: number;
    info?: any;
    metadata?: any;
    version?: string;
  }
  export default function pdfParse(dataBuffer: Buffer, options?: any): Promise<PdfParseResult>;
}
