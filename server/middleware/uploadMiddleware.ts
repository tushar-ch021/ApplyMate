import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// Store files in memory so we can extract text from the buffer
const storage = multer.memoryStorage();

// File filter to allow only PDF and DOCX formats
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are allowed!") as any, false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
