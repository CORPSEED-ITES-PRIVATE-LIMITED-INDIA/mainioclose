import { useEffect, useState } from "react";

// The organization logo is stored on S3, which doesn't send CORS headers.
// An <img> with crossOrigin="anonymous" is then blocked, so logos must be
// rendered as plain images. html2canvas can't draw a cross-origin image
// without CORS, so for PDFs the logo is inlined as a data URL when possible
// and otherwise swapped for the bundled fallback in the cloned document.

const isRemote = (src = "") =>
  /^https?:/i.test(src) && !src.startsWith(window.location.origin);

/** Returns the logo src to render: a data URL when S3 allows it, else the URL. */
export const useOrgLogoSrc = (url) => {
  const [src, setSrc] = useState(url);

  useEffect(() => {
    let cancelled = false;

    setSrc(url);

    if (!url || !isRemote(url)) return undefined;

    fetch(url, { mode: "cors" })
      .then((response) => {
        if (!response.ok) throw new Error(`Logo request failed: ${response.status}`);
        return response.blob();
      })
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }),
      )
      .then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl);
      })
      // Blocked by CORS: keep the plain URL, which still displays on screen
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [url]);

  return src;
};

/** html2canvas `onclone` helper: replaces non-inlined remote logos with the fallback. */
export const swapRemoteLogos = (clonedDoc, fallbackSrc) => {
  clonedDoc.querySelectorAll("img[data-org-logo]").forEach((img) => {
    if (isRemote(img.getAttribute("src") || "")) {
      img.setAttribute("src", fallbackSrc);
    }
  });
};
