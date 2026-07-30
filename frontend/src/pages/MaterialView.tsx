import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, FileText, Video, ExternalLink, Loader2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X, Maximize2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface StudyMaterial {
  _id: string;
  title: string;
  description: string;
  content?: string;
  type: 'pdf' | 'youtube' | 'link' | 'topic';
  url?: string;
  pdfs?: { title: string; url: string }[];
  videos?: { title: string; url: string }[];
  board: string;
  grade: string;
  subject: string;
  chapter: string;
  topic: string;
  tags: string[];
  views: number;
  createdAt: string;
}

const MaterialView = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // PDF Viewer State
  const [selectedPdf, setSelectedPdf] = useState<{ title: string; url: string } | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const { data: material, isLoading, error } = useQuery({
    queryKey: ['material', id],
    queryFn: async () => {
      const { data } = await api.get<StudyMaterial>(`/study-materials/${id}`);
      return data;
    },
    enabled: !!id
  });

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const openPdf = (pdf: { title: string; url: string }) => {
    setSelectedPdf(pdf);
    setPageNumber(1);
    setScale(1.0);
  };

  const closePdf = () => {
    setSelectedPdf(null);
    setNumPages(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Material not found</h2>
        <Button onClick={() => navigate("/materials")}>Back to Materials</Button>
      </div>
    );
  }

  // Helper to get secure URL
  const getSecureUrl = (url: string) => url.replace(/^http:\/\//i, 'https://');

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <Button
        variant="ghost"
        onClick={() => navigate("/materials")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Materials
      </Button>

      {/* Header Section */}
      <Card className="glass border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Badge variant="outline">{material.grade === '11' ? 'Class 11' : material.grade === '12' ? 'Class 12' : material.grade}</Badge>
                <span>•</span>
                <span className="font-semibold text-primary">{material.subject}</span>
                <span>•</span>
                <span>{material.chapter}</span>
              </div>
              <CardTitle className="text-3xl font-bold">{material.title}</CardTitle>
              <p className="text-muted-foreground mt-2">{material.description}</p>
            </div>
            {material.tags && (
              <div className="flex flex-wrap gap-2 max-w-xs justify-end">
                {material.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Rich Content Section */}
      {material.content && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Study Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-invert max-w-none text-foreground prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground"
              dangerouslySetInnerHTML={{ __html: material.content }}
            />
          </CardContent>
        </Card>
      )}

      {/* PDFs Section (Tiles) */}
      {(material.pdfs && material.pdfs.length > 0) || (material.type === 'pdf' && material.url) ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-400" />
            Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Handle new array format */}
            {material.pdfs?.map((pdf, index) => (
              <Card
                key={index}
                className="glass hover:bg-muted/50 transition-all cursor-pointer group hover:-translate-y-1"
                onClick={() => openPdf(pdf)}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <FileText className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{pdf.title}</h4>
                    <p className="text-xs text-muted-foreground">Click to view</p>
                  </div>
                  <Maximize2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>
            ))}

            {/* Handle legacy single file format */}
            {(!material.pdfs || material.pdfs.length === 0) && material.type === 'pdf' && material.url && (
              <Card
                className="glass hover:bg-muted/50 transition-all cursor-pointer group hover:-translate-y-1"
                onClick={() => openPdf({ title: material.title, url: material.url! })}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <FileText className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{material.title}</h4>
                    <p className="text-xs text-muted-foreground">Click to view</p>
                  </div>
                  <Maximize2 className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : null}

      {/* Videos Section */}
      {(material.videos && material.videos.length > 0) || (material.type === 'youtube' && material.url) ? (
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Video className="h-5 w-5 text-red-500" />
            Video Lessons
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Handle new array format */}
            {material.videos?.map((video, index) => (
              <Card key={index} className="glass overflow-hidden">
                <div className="aspect-video w-full bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={video.url.replace("watch?v=", "embed/")}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold">{video.title}</h4>
                </CardContent>
              </Card>
            ))}

            {/* Handle legacy single video format */}
            {(!material.videos || material.videos.length === 0) && material.type === 'youtube' && material.url && (
              <Card className="glass overflow-hidden">
                <div className="aspect-video w-full bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={material.url.replace("watch?v=", "embed/")}
                    title={material.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold">{material.title}</h4>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : null}

      {/* Full Screen PDF Viewer Overlay */}
      {selectedPdf && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col animate-fade-in">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b bg-background/50">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-lg truncate max-w-md">{selectedPdf.title}</h3>
              <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
                <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.min(2.0, s + 0.1))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href={getSecureUrl(selectedPdf.url)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </a>
              <Button variant="ghost" size="icon" onClick={closePdf}>
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Viewer Content */}
          <div className="flex-1 overflow-auto p-8 flex justify-center bg-slate-100/5 dark:bg-slate-900/50">
            <Document
              file={getSecureUrl(selectedPdf.url)}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading document...</p>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <FileText className="h-12 w-12 text-red-500" />
                  <p className="text-red-500 font-medium">Unable to load PDF</p>
                  <a href={getSecureUrl(selectedPdf.url)} target="_blank" rel="noopener noreferrer">
                    <Button>Download File</Button>
                  </a>
                </div>
              }
            >
              <div className="shadow-2xl">
                <Page
                  key={`page_${pageNumber}_${scale}`}
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="animate-fade-in"
                  width={Math.min(window.innerWidth - 100, 1000)}
                />
              </div>
            </Document>
          </div>

          {/* Footer / Pagination */}
          {numPages && (
            <div className="p-4 border-t bg-background/50 flex justify-center">
              <div className="flex items-center gap-4 bg-background border rounded-full px-4 py-2 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber(prev => prev - 1)}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium tabular-nums">
                  Page {pageNumber} of {numPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={pageNumber >= numPages}
                  onClick={() => setPageNumber(prev => prev + 1)}
                  className="rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialView;
