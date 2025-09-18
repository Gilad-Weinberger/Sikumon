"use client";

/**
 * Gets file information including filename, type, and icon based on file extension
 */
export const getFileInfo = (url: string) => {
  const filename = url.split("/").pop() || "קובץ לא ידוע";
  const extension = url.split(".").pop()?.toLowerCase() || "";

  let type = "לא ידוע";
  let icon = "📁";
  let isDocument = false;
  let isImage = false;
  let isPDF = false;

  switch (extension) {
    case "pdf":
      type = "מסמך PDF";
      icon = "📄";
      isDocument = true;
      isPDF = true;
      break;
    case "doc":
    case "docx":
      type = extension === "doc" ? "מסמך Word (.doc)" : "מסמך Word (.docx)";
      icon = "📝";
      isDocument = true;
      break;
    case "xls":
    case "xlsx":
      type = "גיליון Excel";
      icon = "📊";
      isDocument = true;
      break;
    case "ppt":
    case "pptx":
      type = "מצגת PowerPoint";
      icon = "📊";
      isDocument = true;
      break;
    case "txt":
      type = "קובץ טקסט";
      icon = "📄";
      isDocument = true;
      break;
    case "jpg":
    case "jpeg":
      type = "תמונת JPEG";
      icon = "🖼️";
      isImage = true;
      break;
    case "png":
      type = "תמונת PNG";
      icon = "🖼️";
      isImage = true;
      break;
    case "gif":
      type = "תמונת GIF";
      icon = "🖼️";
      isImage = true;
      break;
    case "svg":
      type = "תמונת SVG";
      icon = "🖼️";
      isImage = true;
      break;
    case "webp":
      type = "תמונת WebP";
      icon = "🖼️";
      isImage = true;
      break;
    case "bmp":
      type = "תמונת BMP";
      icon = "🖼️";
      isImage = true;
      break;
    case "ico":
      type = "תמונת Icon";
      icon = "🖼️";
      isImage = true;
      break;
  }

  return { filename, type, icon, isDocument, isImage, isPDF, url };
};

/**
 * Check if a file is a supported document type
 * @param filename - The filename to check
 * @returns Object indicating support for different formats
 */
export const getDocumentSupport = (filename: string) => {
  const extension = filename.split(".").pop()?.toLowerCase();

  return {
    isDoc: extension === "doc",
    isDocx: extension === "docx",
    isDocument:
      extension === "doc" || extension === "docx" || extension === "pdf",
    needsOnlineViewer: true, // All documents can use online viewers
  };
};

/**
 * Generate URLs for online document viewers
 * @param documentUrl - The URL of the document
 * @returns Object with different viewer URLs
 */
export const getOnlineViewerUrls = (documentUrl: string) => {
  const encodedUrl = encodeURIComponent(documentUrl);

  return {
    googleDocs: `https://docs.google.com/gview?url=${encodedUrl}&embedded=true`,
    microsoftOffice: `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`,
  };
};
