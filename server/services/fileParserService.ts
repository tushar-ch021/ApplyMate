import { createRequire } from "module";
import mammoth from "mammoth";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

/**
 * Extracts raw text from an uploaded file buffer based on its mime type
 */
export const parseFileToText = async (
  buffer: Buffer,
  mimeType: string
): Promise<string> => {
  try {
    if (mimeType === "application/pdf") {
      const data = await pdf(buffer);
      if (!data || !data.text) {
        throw new Error("Unable to extract text. The PDF might be empty or scanned images.");
      }
      return data.text;
    } else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      if (!result || !result.value) {
        throw new Error("Unable to extract text. The Word document might be empty.");
      }
      return result.value;
    } else {
      throw new Error("Unsupported file format. Please upload a PDF or DOCX file.");
    }
  } catch (error) {
    console.error("fileParserService parseFileToText error:", error);
    throw new Error(`File parsing failed: ${(error as Error).message}`);
  }
};
