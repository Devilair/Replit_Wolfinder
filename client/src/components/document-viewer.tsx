import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface DocumentViewerProps {
  fileName: string;
  originalFileName?: string;
  fileSize: number;
  trigger?: React.ReactNode;
}

export function DocumentViewer({ fileName, originalFileName, fileSize, trigger }: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const fileUrl = `/uploads/${fileName}`;
  const isImage = /\.(jpg|jpeg|tiff)$/i.test(fileName);
  const isPdf = /\.pdf$/i.test(fileName);
  const isWordDoc = /\.(doc|docx)$/i.test(fileName);
  
  // Determine if file can be previewed
  const canPreview = isImage || isPdf;

  const defaultTrigger = (
    <Button size="sm" variant="outline">
      <Eye className="h-4 w-4 mr-2" />
      Visualizza
    </Button>
  );

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  
  const getFileTypeDescription = () => {
    if (isImage) return "Immagine";
    if (isPdf) return "Documento PDF";
    if (isWordDoc) return "Documento Word";
    return "Documento";
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">{fileName}</DialogTitle>
              <p className="text-sm text-gray-500">
                {(fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {isImage && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleZoomOut}
                    disabled={zoom <= 50}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[3rem] text-center">
                    {zoom}%
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleZoomIn}
                    disabled={zoom >= 200}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRotate}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                Apri in nuova scheda
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 p-4 overflow-auto">
          {isImage ? (
            <div className="flex justify-center">
              <img
                src={fileUrl}
                alt={fileName}
                className="max-w-full h-auto border rounded-lg shadow-sm"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbW1hZ2luZSBub24gZGlzcG9uaWJpbGU8L3RleHQ+Cjwvc3ZnPg==';
                }}
              />
            </div>
          ) : isPdf ? (
            <div className="w-full h-[70vh]">
              <iframe
                src={fileUrl}
                className="w-full h-full border rounded-lg"
                title={fileName}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    {getFileTypeDescription()}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    {(fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {isWordDoc ? 
                    "I documenti Word possono essere scaricati e aperti con Microsoft Word o applicazioni compatibili" :
                    "Questo tipo di file non supporta l'anteprima inline"
                  }
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = fileUrl;
                      link.download = fileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    variant="default"
                  >
                    Scarica file
                  </Button>
                  <Button
                    onClick={() => window.open(fileUrl, '_blank')}
                    variant="outline"
                  >
                    Apri in nuova scheda
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}