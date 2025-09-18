/**
 * Utility functions for file operations
 */

/**
 * Gets the file type/extension from a filename
 * @param filename - The name of the file
 * @returns The file extension in uppercase (e.g., "PDF", "DOCX", "TXT")
 */
export const getFileType = (filename: string): string => {
  const extension = filename.split(".").pop();
  return extension ? extension.toUpperCase() : "FILE";
};

/**
 * Gets a human-readable file type description
 * @param filename - The name of the file
 * @returns A descriptive file type in Hebrew
 */
export const getFileTypeDescription = (filename: string): string => {
  const extension = filename.split(".").pop()?.toLowerCase();

  const typeMap: Record<string, string> = {
    pdf: "מסמך PDF",
    doc: "מסמך Word",
    docx: "מסמך Word",
    txt: "קובץ טקסט",
    rtf: "קובץ RTF",
    odt: "מסמך OpenDocument",
    xls: "גיליון Excel",
    xlsx: "גיליון Excel",
    ppt: "מצגת PowerPoint",
    pptx: "מצגת PowerPoint",
    jpg: "תמונה",
    jpeg: "תמונה",
    png: "תמונה",
    gif: "תמונה",
    bmp: "תמונה",
    svg: "תמונה וקטורית",
    mp4: "וידאו",
    avi: "וידאו",
    mov: "וידאו",
    wmv: "וידאו",
    mp3: "קובץ שמע",
    wav: "קובץ שמע",
    zip: "קובץ דחוס",
    rar: "קובץ דחוס",
    "7z": "קובץ דחוס",
  };

  return typeMap[extension || ""] || "קובץ";
};
