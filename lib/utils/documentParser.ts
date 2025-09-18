"use client";

import mammoth from "mammoth";
// @ts-ignore - docx-preview doesn't have proper TypeScript definitions
import { renderAsync } from "docx-preview";

export interface DocumentContent {
  html: string;
  text: string;
  error?: string;
}

/**
 * Parse a DOCX file and extract its content as HTML
 * @param file - The DOCX file to parse
 * @returns Promise with the parsed content
 */
export const parseDocxFile = async (file: File): Promise<DocumentContent> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });

    return {
      html: result.value,
      text: result.value.replace(/<[^>]*>/g, ""), // Strip HTML tags for text content
    };
  } catch (error) {
    console.error("Error parsing DOCX file:", error);
    return {
      html: "",
      text: "",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error parsing DOCX file",
    };
  }
};

/**
 * Render a DOCX file using docx-preview
 * @param file - The DOCX file to render
 * @param container - The HTML element to render into
 * @returns Promise that resolves when rendering is complete
 */
export const renderDocxFile = async (
  file: File,
  container: HTMLElement
): Promise<void> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    await renderAsync(arrayBuffer, container);
  } catch (error) {
    console.error("Error rendering DOCX file:", error);
    container.innerHTML = `<div class="text-red-600 p-4">Error rendering document: ${
      error instanceof Error ? error.message : "Unknown error"
    }</div>`;
  }
};

/**
 * Fetch and parse a DOCX file from a URL
 * @param url - The URL of the DOCX file
 * @returns Promise with the parsed content
 */
export const parseDocxFromUrl = async (
  url: string
): Promise<DocumentContent> => {
  try {
    console.log("Fetching document from URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,*/*",
      },
      mode: "cors",
    });

    console.log("Fetch response:", {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get("content-type"),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch document: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log("ArrayBuffer size:", arrayBuffer.byteLength);

    const result = await mammoth.convertToHtml({ arrayBuffer });
    console.log("Mammoth conversion result:", {
      htmlLength: result.value.length,
      messages: result.messages,
    });

    return {
      html: result.value,
      text: result.value.replace(/<[^>]*>/g, ""), // Strip HTML tags for text content
    };
  } catch (error) {
    console.error("Error parsing DOCX from URL:", error);
    return {
      html: "",
      text: "",
      error:
        error instanceof Error
          ? error.message
          : "Unknown error parsing DOCX file",
    };
  }
};

/**
 * Render a DOCX file from URL using docx-preview
 * @param url - The URL of the DOCX file
 * @param container - The HTML element to render into
 * @returns Promise that resolves when rendering is complete
 */
export const renderDocxFromUrl = async (
  url: string,
  container: HTMLElement
): Promise<void> => {
  try {
    console.log("Rendering DOCX from URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,*/*",
      },
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch document: ${response.status} ${response.statusText}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log(
      "Rendering with docx-preview, buffer size:",
      arrayBuffer.byteLength
    );

    // Clear container first
    container.innerHTML = "";

    await renderAsync(arrayBuffer, container, undefined, {
      className: "docx-wrapper",
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
    });

    console.log("docx-preview rendering completed");
  } catch (error) {
    console.error("Error rendering DOCX from URL:", error);
    container.innerHTML = `<div class="text-red-600 p-4 text-center">
      <div class="text-4xl mb-2">⚠️</div>
      <p class="font-semibold">שגיאה בטעינת המסמך</p>
      <p class="text-sm mt-1">${
        error instanceof Error ? error.message : "שגיאה לא ידועה"
      }</p>
    </div>`;
  }
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
    canParseContent: extension === "docx", // Only DOCX can be parsed client-side
    canRenderInline: extension === "docx",
    needsOnlineViewer: extension === "doc", // DOC files need online viewers
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
