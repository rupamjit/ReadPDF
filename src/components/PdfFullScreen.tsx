import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand, Loader2 } from "lucide-react";
import SimpleBar from "simplebar-react";
import { Document, Page } from "react-pdf";
import { toast } from "sonner";
import { useResizeDetector } from "react-resize-detector";

interface FileUrlProps {
  fileUrl: string;
}

const PdfFullScreen = ({ fileUrl }: FileUrlProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [numPages, setNumPages] = useState<number>();
  const { width, ref } = useResizeDetector();
  return (
    <div>
      <Dialog
        open={isOpen}
        onOpenChange={(v) => {
          if (!v) {
            setIsOpen(v);
          }
        }}
      >
        <DialogTrigger onClick={() => setIsOpen(true)} asChild>
          <Button variant="ghost" aria-label="fullscreen">
            <Expand className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-7xl w-full">
          <SimpleBar
            autoHide={false}
            className="max-h-[calc(100vh-10rem)]  mt-6"
          >
            <div ref={ref}>
              <Document
                loading={
                  <div className="flex justify-center">
                    <Loader2 className="my-24 h-6 animate-spin" />
                  </div>
                }
                onLoadError={() => {
                  toast("Error in loading Pdf. Please try again later.");
                }}
                onLoadSuccess={({ numPages }) => {
                  setNumPages(numPages);
                }}
                file={fileUrl}
                className="max-h-full"
              >
                {new Array(numPages).fill(0).map((_, i) => (
                  <Page pageNumber={i + 1} key={i} width={width ? width : 1} />
                ))}
              </Document>
            </div>
          </SimpleBar>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PdfFullScreen;
