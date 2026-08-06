import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

/**
 * Waits for every <img> inside a container to finish loading (or fail) so
 * html2canvas doesn't rasterize a blank/half-loaded image, e.g. a school logo
 * fetched from a remote CDN.
 */
export function waitForImagesToLoad(container: HTMLElement, timeoutMs = 4000) {
  const images = Array.from(container.querySelectorAll("img"));
  if (images.length === 0) return Promise.resolve();

  const loaders = images.map((img) => {
    if (img.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      img.addEventListener("load", () => resolve(), { once: true });
      img.addEventListener("error", () => resolve(), { once: true });
    });
  });

  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
  return Promise.race([Promise.all(loaders), timeout]);
}

/**
 * Rasterizes a DOM node and saves it as a paginated A4 PDF.
 * Splits tall content across multiple pages instead of squashing it onto one.
 */
export async function downloadNodeAsPdf(node: HTMLElement, filename: string) {
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    // Capture the node on its own terms, independent of the page's current
    // scroll position or where it happens to sit in the viewport — without
    // this, an off-screen-positioned node is frequently rasterized blank.
    x: 0,
    y: 0,
    scrollX: 0,
    scrollY: 0,
    width: node.scrollWidth,
    height: node.scrollHeight,
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidthMm = pageWidth;
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

  if (imgHeightMm <= pageHeight) {
    pdf.addImage(
      canvas.toDataURL("image/png", 1),
      "PNG",
      0,
      0,
      imgWidthMm,
      imgHeightMm,
    );
  } else {
    const pageHeightPx = (pageHeight * canvas.width) / imgWidthMm;
    let renderedHeightPx = 0;
    let isFirstPage = true;

    while (renderedHeightPx < canvas.height) {
      const sliceHeightPx = Math.min(
        pageHeightPx,
        canvas.height - renderedHeightPx,
      );

      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = canvas.width;
      sliceCanvas.height = sliceHeightPx;
      const ctx = sliceCanvas.getContext("2d");
      ctx?.drawImage(
        canvas,
        0,
        renderedHeightPx,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx,
      );

      if (!isFirstPage) pdf.addPage();
      pdf.addImage(
        sliceCanvas.toDataURL("image/png", 1),
        "PNG",
        0,
        0,
        imgWidthMm,
        (sliceHeightPx * imgWidthMm) / canvas.width,
      );

      renderedHeightPx += sliceHeightPx;
      isFirstPage = false;
    }
  }

  pdf.save(filename);
}
