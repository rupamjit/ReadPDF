// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   ChevronDown,
//   ChevronUp,
//   Loader2,
//   RotateCw,
//   Search,
// } from "lucide-react";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { Document, Page, pdfjs } from "react-pdf";
// import { useResizeDetector } from "react-resize-detector";
// import SimpleBar from "simplebar-react";
// import { toast } from "sonner";
// import * as z from "zod";

// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import { cn } from "@/lib/utils";

// // import { PdfFullscreen } from "./pdf-fullscreen";

// import "react-pdf/dist/Page/AnnotationLayer.css";
// import "react-pdf/dist/Page/TextLayer.css";

// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

// type PDFRendererProps = {
//   fileUrl: string;
// };

// export const PDFRenderer = ({ fileUrl }: PDFRendererProps) => {
//   const { width, ref } = useResizeDetector();

//   const [numPages, setNumPages] = useState<number | undefined>(undefined);
//   const [currPage, setCurrPage] = useState(1);
//   const [scale, setScale] = useState(1);
//   const [rotation, setRotation] = useState(0);
//   const [renderedScale, setRenderedScale] = useState<number | null>(null);

//   const isLoading = renderedScale !== scale;

//   const CustomPageValidator = z.object({
//     page: z
//       .string()
//       .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
//   });

//   type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//   } = useForm<TCustomPageValidator>({
//     defaultValues: {
//       page: "1",
//     },
//     resolver: zodResolver(CustomPageValidator),
//   });

//   const handlePageSubmit = ({ page }: TCustomPageValidator) => {
//     setCurrPage(Number(page));
//     setValue("page", String(page));
//   };

//   return (
//     <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
//       {/* topbar */}
//       <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
//         <div className="flex items-center gap-1.5">
//           {/* prev page */}
//           <Button
//             disabled={currPage <= 1}
//             aria-disabled={currPage <= 1}
//             onClick={() => {
//               setCurrPage((prevPage) => (prevPage - 1 > 1 ? prevPage - 1 : 1));
//               setValue("page", String(currPage - 1));
//             }}
//             variant="ghost"
//             aria-label="Previous Page"
//             title="Previous Page"
//           >
//             <ChevronDown className="h-4 w-4" />
//           </Button>

//           {/* current page */}
//           <div className="flex items-center gap-1.5">
//             <Input
//               {...register("page")}
//               className={cn(
//                 "w-12 h-8",
//                 errors.page && "focus-visible:ring-red-500",
//               )}
//               aria-label="Page number"
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   handleSubmit(handlePageSubmit)();
//                 }
//               }}
//               onBlur={() => handleSubmit(handlePageSubmit)()}
//             />
//             <p className="text-zinc-700 text-sm space-x-1">
//               <span>/</span>
//               <span>{numPages ?? "X"}</span>
//             </p>
//           </div>

//           {/* next page */}
//           <Button
//             disabled={numPages === undefined || currPage === numPages}
//             aria-disabled={numPages === undefined || currPage === numPages}
//             onClick={() => {
//               setCurrPage((prevPage) =>
//                 prevPage + 1 > numPages! ? numPages! : prevPage + 1,
//               );
//               setValue("page", String(currPage + 1));
//             }}
//             variant="ghost"
//             aria-label="Next Page"
//             title="Next Page"
//           >
//             <ChevronUp className="h-4 w-4" />
//           </Button>
//         </div>

//         <div className="space-x-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button
//                 aria-label="Zoom"
//                 title="Zoom"
//                 variant="ghost"
//                 className="gap-1.5"
//               >
//                 <Search className="h-4 w-4" />
//                 {scale * 100}%
//                 <ChevronDown className="h-3 w-3 opacity-50" />
//               </Button>
//             </DropdownMenuTrigger>

//             <DropdownMenuContent>
//               <DropdownMenuItem onSelect={() => setScale(0.8)}>
//                 80%
//               </DropdownMenuItem>
//               <DropdownMenuItem onSelect={() => setScale(1)}>
//                 100%
//               </DropdownMenuItem>
//               <DropdownMenuItem onSelect={() => setScale(1.5)}>
//                 150%
//               </DropdownMenuItem>
//               <DropdownMenuItem onSelect={() => setScale(2)}>
//                 200%
//               </DropdownMenuItem>
//               <DropdownMenuItem onSelect={() => setScale(2.5)}>
//                 250%
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           <Button
//             variant="ghost"
//             onClick={() => setRotation((prev) => prev + 90)}
//             aria-label="Rotate 90 degrees"
//             title="Rotate 90 degrees"
//           >
//             <RotateCw className="h-4 w-4" />
//           </Button>

//           {/* <PdfFullscreen fileUrl={url} /> */}
//         </div>
//       </div>

//       {/* show pdf content */}
//       <div className="flex-1 w-full max-h-screen">
//         <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
//           <div ref={ref}>
//             <Document
//               loading={
//                 <div className="flex justify-center">
//                   <Loader2 className="my-24 h-6 w-6 animate-spin" />
//                 </div>
//               }
//               onLoadSuccess={({ numPages }) => setNumPages(numPages)}
//               onLoadError={() =>
//                 toast.error("Error loading PDF.", {
//                   description: "Please try again.",
//                 })
//               }
//               file={fileUrl}
//               className="max-h-full"
//             >
//               {isLoading && renderedScale ? (
//                 <Page
//                   pageNumber={currPage}
//                   width={width ? width : 1}
//                   scale={scale}
//                   rotate={rotation}
//                   key={"@" + renderedScale}
//                 />
//               ) : null}

//               <Page
//                 className={cn(isLoading && "hidden")}
//                 pageNumber={currPage}
//                 width={width ? width : 1}
//                 scale={scale}
//                 rotate={rotation}
//                 key={"@" + scale}
//                 loading={
//                   <div className="flex justify-center">
//                     <Loader2 className="my-24 h-6 w-6 animate-spin" />
//                   </div>
//                 }
//                 onRenderSuccess={() => setRenderedScale(scale)}
//               />
//             </Document>
//           </div>
//         </SimpleBar>
//       </div>
//     </div>
//   );
// };



// "use client";


// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   ChevronDown,
//   ChevronUp,
//   Loader2,
//   RotateCw,
//   Search,
// } from "lucide-react";
// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { useResizeDetector } from "react-resize-detector";
// import SimpleBar from "simplebar-react";
// import { toast } from "sonner";
// import * as z from "zod";
// import dynamic from "next/dynamic";

// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import { cn } from "@/lib/utils";

// // Dynamic imports for react-pdf components (no SSR)
// const Document = dynamic(
//   () => import("react-pdf").then((mod) => mod.Document),
//   { 
//     ssr: false,
//     loading: () => <div className="flex justify-center"><Loader2 className="my-24 h-6 w-6 animate-spin" /></div>
//   }
// );

// const Page = dynamic(
//   () => import("react-pdf").then((mod) => mod.Page),
//   { ssr: false }
// );

// // Import styles
// import "react-pdf/dist/Page/AnnotationLayer.css";
// import "react-pdf/dist/Page/TextLayer.css";

// type PDFRendererProps = {
//   fileUrl: string;
// };

// export const PDFRenderer = ({ fileUrl }: PDFRendererProps) => {
//   const { width, ref } = useResizeDetector();

//   const [numPages, setNumPages] = useState<number | undefined>(undefined);
//   const [currPage, setCurrPage] = useState(1);
//   const [scale, setScale] = useState(1);
//   const [rotation, setRotation] = useState(0);
//   const [renderedScale, setRenderedScale] = useState<number | null>(null);
//   const [isClient, setIsClient] = useState(false);

//   const isLoading = renderedScale !== scale;

//   // Configure PDF.js worker and set client flag
//   useEffect(() => {
//     setIsClient(true);
    
//     // Configure PDF.js worker with proper URL
//     import("react-pdf").then((pdfjs) => {
//       pdfjs.pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.pdfjs.version}/build/pdf.worker.min.js`;
//     });
//   }, []);

//   const CustomPageValidator = z.object({
//     page: z
//       .string()
//       .refine((num) => Number(num) > 0 && Number(num) <= (numPages || 1)),
//   });

//   type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//   } = useForm<TCustomPageValidator>({
//     defaultValues: {
//       page: "1",
//     },
//     resolver: zodResolver(CustomPageValidator),
//   });

//   const handlePageSubmit = ({ page }: TCustomPageValidator) => {
//     setCurrPage(Number(page));
//     setValue("page", String(page));
//   };

//   // Don't render PDF components until we're on the client
//   if (!isClient) {
//     return (
//       <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
//         <div className="flex justify-center py-24">
//           <Loader2 className="h-6 w-6 animate-spin" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
//       {/* topbar */}
//       <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
//         <div className="flex items-center gap-1.5">
//           {/* prev page */}
//           <Button
//             disabled={currPage <= 1}
//             aria-disabled={currPage <= 1}
//             onClick={() => {
//               setCurrPage((prevPage) => (prevPage - 1 > 1 ? prevPage - 1 : 1));
//               setValue("page", String(currPage - 1));
//             }}
//             variant="ghost"
//             aria-label="Previous Page"
//             title="Previous Page"
//           >
//             <ChevronDown className="h-4 w-4" />
//           </Button>

//           {/* current page */}
//           <div className="flex items-center gap-1.5">
//             <Input
//               {...register("page")}
//               className={cn(
//                 "w-12 h-8",
//                 errors.page && "focus-visible:ring-red-500",
//               )}
//               aria-label="Page number"
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   handleSubmit(handlePageSubmit)();
//                 }
//               }}
//               onBlur={() => handleSubmit(handlePageSubmit)()}
//             />
//             <p className="text-zinc-700 text-sm space-x-1">
//               <span>/</span>
//               <span>{numPages ?? "X"}</span>
//             </p>
//           </div>

//           {/* next page */}
//           <Button
//             disabled={numPages === undefined || currPage === numPages}
//             aria-disabled={numPages === undefined || currPage === numPages}
//             onClick={() => {
//               setCurrPage((prevPage) =>
//                 prevPage + 1 > numPages! ? numPages! : prevPage + 1,
//               );
//               setValue("page", String(currPage + 1));
//             }}
//             variant="ghost"
//             aria-label="Next Page"
//             title="Next Page"
//           >
//             <ChevronUp className="h-4 w-4" />
//           </Button>
//         </div>

//         <div className="space-x-2">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button
//                 aria-label="Zoom"
//                 title="Zoom"
//                 variant="ghost"
//                 className="gap-1.5"
//               >
//                 <Search className="h-4 w-4" />
//                 {scale * 100}%
//                 <ChevronDown className="h-3 w-3 opacity-50" />
//               </Button>
//             </DropdownMenuTrigger>

//             <DropdownMenuContent>
//               <DropdownMenuItem onSelect={() => setScale(0.8)}>
//                 80%
//               </DropdownMenuItem>
//               <DropdownMenuItem onSelect={() => setScale(1)}>
//                 100%
//               </DropdownMenuItem>
//               <DropdownMenuItem onSelect={() => setScale(1.5)}>
//                 150%
//               </DropdownMenuItem>
//               <DropdownMenuItem onSelect={() => setScale(2)}>
//                 200%
//               </DropdownMenuItem>
//               <DropdownMenuItem onSelect={() => setScale(2.5)}>
//                 250%
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           <Button
//             variant="ghost"
//             onClick={() => setRotation((prev) => prev + 90)}
//             aria-label="Rotate 90 degrees"
//             title="Rotate 90 degrees"
//           >
//             <RotateCw className="h-4 w-4" />
//           </Button>

//           {/* <PdfFullscreen fileUrl={url} /> */}
//         </div>
//       </div>

//       {/* show pdf content */}
//       <div className="flex-1 w-full max-h-screen">
//         <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
//           <div ref={ref}>
//             <Document
//               loading={
//                 <div className="flex justify-center">
//                   <Loader2 className="my-24 h-6 w-6 animate-spin" />
//                 </div>
//               }
//               onLoadSuccess={({ numPages }) => setNumPages(numPages)}
//               onLoadError={() =>
//                 toast.error("Error loading PDF.", {
//                   description: "Please try again.",
//                 })
//               }
//               file={fileUrl}
//               className="max-h-full"
//             >
//               {isLoading && renderedScale ? (
//                 <Page
//                   pageNumber={currPage}
//                   width={width ? width : 1}
//                   scale={scale}
//                   rotate={rotation}
//                   key={"@" + renderedScale}
//                 />
//               ) : null}

//               <Page
//                 className={cn(isLoading && "hidden")}
//                 pageNumber={currPage}
//                 width={width ? width : 1}
//                 scale={scale}
//                 rotate={rotation}
//                 key={"@" + scale}
//                 loading={
//                   <div className="flex justify-center">
//                     <Loader2 className="my-24 h-6 w-6 animate-spin" />
//                   </div>
//                 }
//                 onRenderSuccess={() => setRenderedScale(scale)}
//               />
//             </Document>
//           </div>
//         </SimpleBar>
//       </div>
//     </div>
//   );
// };




"use client";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { toast } from "sonner";
import { useResizeDetector } from "react-resize-detector";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import SimpleBar from "simplebar-react";
import PdfFullScreen from "./PdfFullScreen";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface PdfRendererProps {
  fileUrl: string;
}

const PDFRenderer = ({ fileUrl }: PdfRendererProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  const { width, ref } = useResizeDetector();

  const PageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });

  type TPageValidator = z.infer<typeof PageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(PageValidator),
  });

  const handlePageSubmit = ({ page }: TPageValidator) => {
    setCurrentPage(Number(page));
    setValue("page", String(page));
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center ">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            disabled={currentPage <= 1}
            onClick={() => {
              setCurrentPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
              setValue("page", String(currentPage - 1));
            }}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(handlePageSubmit)();
                }
              }}
              {...register("page")}
              className={cn(
                `w-12 h-8`,
                errors.page && "focus-visible:ring-red-500"
              )}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>

          <Button
            disabled={numPages === undefined || currentPage === numPages}
            onClick={() => {
              setCurrentPage((prev) =>
                prev + 1 > numPages ? numPages : prev + 1
              );
              setValue("page", String(currentPage + 1));
            }}
            variant="ghost"
            aria-label="previous page"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="zoom" className="gap-1.5" variant="ghost">
                <Search className="h-4 w-4" />
                {scale * 100}% <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setRotation((prev) => prev + 90)}
            variant="ghost"
            aria-label="rotate 90 degrees"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
        </div>
        {/* <PdfFullScreen fileUrl={fileUrl} /> */}
      </div>

      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
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
              <Page
                rotate={rotation}
                scale={scale}
                width={width ? width : 1}
                pageNumber={currentPage}
              />
            </Document>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default PDFRenderer;
