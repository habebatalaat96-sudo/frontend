import { useState } from "react";
import { Document, Page } from "react-pdf";

export  function PDFViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: any) {
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col items-center gap-4">

      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        className="border rounded-lg"
      >
        <Page pageNumber={pageNumber} />
      </Document>

      {/* Controls */}
      <div className="flex gap-4 items-center text-white">

        <button
          onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
          className="px-3 py-1 bg-gray-700 rounded"
        >
          Prev
        </button>

        <p>
          Page {pageNumber} of {numPages}
        </p>

        <button
          onClick={() =>
            setPageNumber((p) => Math.min(p + 1, numPages || 1))
          }
          className="px-3 py-1 bg-gray-700 rounded"
        >
          Next
        </button>

      </div>
    </div>
  );
}