"use client";

/**
 * Check if URL is a Google Docs URL
 */
export const isGoogleDocsUrl = (url: string): boolean => {
  return /^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/[a-zA-Z0-9-_]+/.test(
    url
  );
};

/**
 * Gets Google Docs information
 */
export const getGoogleDocsInfo = (url: string) => {
  if (url.includes("/document/")) {
    return {
      type: "Google Docs",
      icon: "📄",
      isGoogleDocs: true,
      googleDocsType: "document",
    };
  } else if (url.includes("/spreadsheets/")) {
    return {
      type: "Google Sheets",
      icon: "📊",
      isGoogleDocs: true,
      googleDocsType: "spreadsheet",
    };
  } else if (url.includes("/presentation/")) {
    return {
      type: "Google Slides",
      icon: "📑",
      isGoogleDocs: true,
      googleDocsType: "presentation",
    };
  }
  return {
    type: "Google Docs",
    icon: "🔗",
    isGoogleDocs: true,
    googleDocsType: "unknown",
  };
};

/**
 * Gets file information including filename, type, and icon based on file extension
 */
export const getFileInfo = (url: string) => {
  // Check if it's a Google Docs URL first
  if (isGoogleDocsUrl(url)) {
    const googleInfo = getGoogleDocsInfo(url);
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const docId = pathParts[pathParts.indexOf("d") + 1];
    const filename = docId
      ? `${googleInfo.type} - ${docId.substring(0, 8)}...`
      : googleInfo.type;

    return {
      filename,
      type: googleInfo.type,
      icon: googleInfo.icon,
      isDocument: true,
      isImage: false,
      isPDF: false,
      isGoogleDocs: true,
      googleDocsType: googleInfo.googleDocsType,
      url,
    };
  }

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

  return {
    filename,
    type,
    icon,
    isDocument,
    isImage,
    isPDF,
    isGoogleDocs: false,
    url,
  };
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

/**
 * Convert Google Docs URL to embed format
 * @param url - The Google Docs URL
 * @returns Embed URL for iframe
 */
export const getGoogleDocsEmbedUrl = (url: string): string => {
  if (!isGoogleDocsUrl(url)) {
    return url;
  }

  // Convert sharing URL to embed URL
  if (url.includes("/edit")) {
    return url.replace("/edit", "/preview");
  }

  // If it's already an embed URL, return as is
  if (url.includes("/preview")) {
    return url;
  }

  // Add preview to the end if it doesn't have edit or preview
  return url + "/preview";
};
