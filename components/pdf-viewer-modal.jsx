"use client"

import React, { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download,
  FileText,
  Calendar,
  User,
  MapPin,
  Hash,
  Edit,
  X
} from 'lucide-react'
import EditRegistrationModal from './edit-registration-modal'

// Set up the worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

export default function PDFViewerModal({ 
  open, 
  onOpenChange, 
  registration,
  statuses = [],
  documentTypes = [],
  users = []
}) {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  function onDocumentLoadError(error) {
    console.error('Error loading PDF:', error)
    setError('Nu s-a putut încărca documentul PDF')
    setLoading(false)
  }

  const previousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1)
    }
  }

  const nextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1)
    }
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
  }

  const downloadPDF = () => {
    if (registration?.fileStorageId) {
      // Assuming the file storage URL pattern
      const downloadUrl = `/api/files/${registration.fileStorageId}`
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `document-${registration.nrInregistrare}.pdf`
      link.click()
    }
  }
  if (!registration) return null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[70vw] !w-[70vw] max-h-[90vh] h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0 p-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Înregistrarea #{registration.nrInregistrare}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 gap-4 min-h-0 p-6 pt-2 overflow-hidden">
          {/* PDF Viewer */}
          <div className="flex-1 flex flex-col border rounded-lg bg-muted/20 min-h-0 overflow-hidden">
            {/* PDF Controls */}
            <div className="flex items-center justify-between p-3 border-b bg-background rounded-t-lg shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousPage}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {numPages ? `${pageNumber} / ${numPages}` : 'Se încarcă...'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={pageNumber >= numPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomOut}
                  disabled={scale <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-12 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={zoomIn}
                  disabled={scale >= 3.0}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadPDF}
                  disabled={!registration.fileStorageId}
                >
                  <Download className="w-4 h-4" />
                  Descarcă
                </Button>
              </div>
            </div>

            {/* PDF Content */}
            <ScrollArea className="flex-1 p-4 min-h-0 overflow-auto">
              <div className="flex justify-center min-h-full">
                {registration.fileStorageId ? (
                  <Document
                    file={`/api/files/${registration.fileStorageId}`}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={
                      <div className="flex items-center justify-center p-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Se încarcă documentul...</p>
                        </div>
                      </div>
                    }
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                ) : (
                  <div className="flex items-center justify-center p-8 text-center">
                    <div>
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Nu există document atașat</p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center justify-center p-8 text-center">
                    <div>
                      <FileText className="w-12 h-12 text-destructive mx-auto mb-2" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>          {/* Registration Details Sidebar */}
          <div className="w-[380px] shrink-0 border rounded-lg bg-background flex flex-col max-h-full overflow-hidden shadow-sm">
            <div className="p-5 border-b shrink-0 bg-muted/30">
              <h3 className="font-semibold text-base">Detalii înregistrare</h3>
            </div>
            
            <ScrollArea className="flex-1 min-h-0 overflow-auto">
              <div className="p-5 space-y-5">                {/* Numărul înregistrării */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Hash className="w-4 h-4 text-primary" />
                    Număr înregistrare
                  </div>
                  <Badge variant="outline" className="font-mono text-sm px-3 py-1">
                    {registration.nrInregistrare}
                  </Badge>
                </div>

                <Separator />

                {/* Tip document */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    Tip document
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{registration.tipDocument || '-'}</p>
                </div>

                <Separator />

                {/* Rezumat */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">Rezumat</div>
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-sm text-muted-foreground leading-relaxed break-words">
                      {registration.rezumat || 'Nu există rezumat disponibil'}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Data document */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    Data document
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{registration.dataDocument || '-'}</p>
                </div>

                <Separator />

                {/* Data înregistrare */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    Data înregistrare
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{registration.dataInregistrare || '-'}</p>
                </div>

                <Separator />

                {/* Înregistrat de */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="w-4 h-4 text-primary" />
                    Înregistrat de
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{registration.inregistratDe || '-'}</p>
                </div>

                <Separator />

                {/* Destinatar */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    Destinatar
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{registration.destinatar || '-'}</p>
                </div>

                <Separator />                {/* Status */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-foreground">Status</div>
                  <Badge variant="secondary" className="px-3 py-1">
                    {registration.status || 'Necunoscut'}
                  </Badge>
                </div>
              </div>
            </ScrollArea>
              {/* Action Buttons */}
            <div className="p-5 border-t shrink-0 bg-muted/20">
              <div className="flex gap-3">                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={() => setEditModalOpen(true)}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-4 h-4" />
                  Close
                </Button>
              </div>
            </div>
          </div>        </div>
      </DialogContent>      <EditRegistrationModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        registration={registration}
        statuses={statuses}
        documentTypes={documentTypes}
        users={users}
        onSuccess={() => {
          // Close the edit modal
          setEditModalOpen(false)
          // Close the PDF viewer modal
          onOpenChange(false)
          // Optional: refresh data or show success message
          console.log('Registration updated successfully')
        }}
      />
    </Dialog>
  )
}
