import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye, X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface DocumentViewerProps {
  fileName: string;
  originalFileName?: string;
  fileSize: number;
  documentId?: number;
  trigger?: React.ReactNode;
}

export function DocumentViewer({ fileName, originalFileName, fileSize, documentId, trigger }: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const fileUrl = documentId ? `/api/files/${documentId}` : `/uploads/${fileName}`;
  const fileToCheck = originalFileName || fileName;
  
  // Analyze file type
  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|tiff)$/i.test(fileToCheck);
  const isPdf = /\.pdf$/i.test(fileToCheck);
  const isWordDoc = /\.(doc|docx)$/i.test(fileToCheck);
  
  // Determine if file can be previewed
  const canPreview = isImage || isPdf;

  // GESTIONE COMPLETAMENTE MANUALE - NO DialogTrigger
  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (documentId) {
      window.open(`/api/files/download/${documentId}`, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = originalFileName || fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileTypeDescription = () => {
    if (isImage) return "Immagine";
    if (isPdf) return "Documento PDF";
    if (isWordDoc) return "Documento Word";
    return "Documento";
  };

  // COMPONENTE TRIGGER PERSONALIZZATO
  const ViewTrigger = () => {
    if (trigger) {
      return (
        <div onClick={handleViewClick} style={{ cursor: 'pointer' }}>
          {trigger}
        </div>
      );
    }
    
    return (
      <Button size="sm" variant="outline" onClick={handleViewClick}>
        <Eye className="h-4 w-4 mr-2" />
        Visualizza
      </Button>
    );
  };

  return (
    <>
      <ViewTrigger />
      
      {/* DIALOG COMPLETAMENTE SEPARATO DAL TRIGGER */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg">{originalFileName || fileName}</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  {getFileTypeDescription()} - {(fileSize / 1024 / 1024).toFixed(2)} MB
                </DialogDescription>
              </div>
              
              <div className="flex items-center gap-2">
                {isImage && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setZoom(Math.max(25, zoom - 25))}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-gray-500 min-w-[60px] text-center">
                      {zoom}%
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setZoom(Math.min(400, zoom + 25))}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRotation((rotation + 90) % 360)}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadClick}
                >
                  Scarica
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto p-4 pt-0">
            {canPreview ? (
              <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
                {isImage && (
                  <img
                    src={fileUrl}
                    alt={originalFileName || fileName}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease-in-out'
                    }}
                  />
                )}
                
                {isPdf && (
                  <iframe
                    src={fileUrl}
                    className="w-full h-[600px] border-0 rounded"
                    title={originalFileName || fileName}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Anteprima non disponibile
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Questo tipo di file non può essere visualizzato in anteprima. 
                    Puoi scaricarlo per aprirlo con l'applicazione appropriata.
                  </p>
                  <Button onClick={handleDownloadClick}>
                    Scarica {getFileTypeDescription()}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}