import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import {
  Camera,
  Upload,
  FileText,
  X,
  Plus,
  Trash2,
  RotateCw,
  Download,
  CheckCircle2,
  Sparkles,
  Sliders,
  Maximize2,
  FileCheck,
  RefreshCw,
  Smartphone,
  Eye,
  Check
} from 'lucide-react';

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentType?: 'assignment' | 'permission_slip' | 'general';
  documentTitle?: string;
  onScanComplete?: (pdfDataUrl: string, fileName: string) => void;
}

interface CapturedPage {
  id: string;
  dataUrl: string;
  filter: 'none' | 'bw' | 'grayscale' | 'contrast';
  rotation: number;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  onClose,
  documentType = 'assignment',
  documentTitle = 'Scanned Document',
  onScanComplete
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [pages, setPages] = useState<CapturedPage[]>([]);
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [docName, setDocName] = useState<string>(documentTitle);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize camera when camera tab is open
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (documentTitle) {
      setDocName(documentTitle);
    }
  }, [documentTitle]);

  const startCamera = async () => {
    setCameraError('');
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsCameraActive(true);
        }
      } else {
        setCameraError('Camera API is not supported on this browser.');
      }
    } catch (err: any) {
      console.warn('Camera permission denied or camera missing:', err);
      setCameraError('Camera access unavailable. You can upload photo files below instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const newPage: CapturedPage = {
      id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      dataUrl,
      filter: 'contrast', // Default document filter for crisp readability
      rotation: 0
    };

    setPages((prev) => [...prev, newPage]);
    setSelectedPageIndex(pages.length);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          const newPage: CapturedPage = {
            id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            dataUrl,
            filter: 'contrast',
            rotation: 0
          };
          setPages((prev) => [...prev, newPage]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const applyFilterToCanvas = (
    img: HTMLImageElement,
    filter: 'none' | 'bw' | 'grayscale' | 'contrast',
    rotation: number
  ): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (rotation === 90 || rotation === 270) {
      canvas.width = img.height;
      canvas.height = img.width;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }

    if (!ctx) return img.src;

    ctx.save();
    if (rotation === 90) {
      ctx.translate(canvas.width, 0);
      ctx.rotate((90 * Math.PI) / 180);
    } else if (rotation === 180) {
      ctx.translate(canvas.width, canvas.height);
      ctx.rotate((180 * Math.PI) / 180);
    } else if (rotation === 270) {
      ctx.translate(0, canvas.height);
      ctx.rotate((270 * Math.PI) / 180);
    }

    ctx.drawImage(img, 0, 0);
    ctx.restore();

    if (filter === 'none') return canvas.toDataURL('image/jpeg', 0.92);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const avg = 0.299 * r + 0.587 * g + 0.114 * b;

      if (filter === 'bw') {
        // High threshold contrast B&W
        const threshold = 128;
        const v = avg > threshold ? 255 : 0;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
      } else if (filter === 'grayscale') {
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      } else if (filter === 'contrast') {
        // Document contrast enhancement (boost whites, deepen darks)
        const factor = 1.3;
        let nr = factor * (r - 128) + 128;
        let ng = factor * (g - 128) + 128;
        let nb = factor * (b - 128) + 128;

        data[i] = Math.min(255, Math.max(0, nr));
        data[i + 1] = Math.min(255, Math.max(0, ng));
        data[i + 2] = Math.min(255, Math.max(0, nb));
      }
    }

    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  const updatePageFilter = (filter: 'none' | 'bw' | 'grayscale' | 'contrast') => {
    if (pages.length === 0) return;
    setPages((prev) =>
      prev.map((p, idx) => (idx === selectedPageIndex ? { ...p, filter } : p))
    );
  };

  const rotatePage = () => {
    if (pages.length === 0) return;
    setPages((prev) =>
      prev.map((p, idx) =>
        idx === selectedPageIndex ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
  };

  const deletePage = (indexToDelete: number) => {
    setPages((prev) => prev.filter((_, idx) => idx !== indexToDelete));
    if (selectedPageIndex >= pages.length - 1) {
      setSelectedPageIndex(Math.max(0, pages.length - 2));
    }
  };

  // Convert pages into PDF using jsPDF
  const generatePdf = async (): Promise<string | null> => {
    if (pages.length === 0) return null;

    setIsGeneratingPdf(true);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210 mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297 mm

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (i > 0) pdf.addPage();

        // Load image to apply filter & canvas transforms
        const img = new Image();
        img.src = page.dataUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const filteredDataUrl = applyFilterToCanvas(img, page.filter, page.rotation);

        // Add to PDF maintaining aspect ratio
        pdf.addImage(filteredDataUrl, 'JPEG', 5, 5, pdfWidth - 10, pdfHeight - 10, undefined, 'FAST');
      }

      const pdfDataUri = pdf.output('datauristring');
      setGeneratedPdfUrl(pdfDataUri);
      setIsGeneratingPdf(false);
      return pdfDataUri;
    } catch (err) {
      console.error('PDF Generation Error:', err);
      setIsGeneratingPdf(false);
      return null;
    }
  };

  const handleFinalSubmit = async () => {
    const pdfUrl = await generatePdf();
    if (pdfUrl) {
      const sanitizedName = `${docName.replace(/[^a-zA-Z0-9_]/g, '_')}_scanned.pdf`;
      if (onScanComplete) {
        onScanComplete(pdfUrl, sanitizedName);
      }
      setCopiedSuccess(true);
      setTimeout(() => {
        setCopiedSuccess(false);
        onClose();
      }, 1200);
    }
  };

  const handleDownloadDirectPdf = async () => {
    const pdfUrl = await generatePdf();
    if (pdfUrl) {
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `${docName.replace(/[^a-zA-Z0-9_]/g, '_')}_scan.pdf`;
      a.click();
    }
  };

  if (!isOpen) return null;

  const currentPage = pages[selectedPageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col w-full max-w-4xl max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">AI Document & Permission Slip Scanner</h3>
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                  PDF Converter
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Snap or upload photos of assignments, lab notes, or permission slips to convert to PDF.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Document Title Input */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Document Title (e.g., Math_Assignment_Page1)"
                className="w-full bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl text-xs text-white font-semibold outline-none focus:border-indigo-500"
              />
            </div>

            {/* Mode Switch Tabs */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold shrink-0">
              <button
                onClick={() => setActiveTab('camera')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'camera' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Camera Snap
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload Photos
              </button>
            </div>
          </div>

          {/* Main Grid: Capture / Viewport on Left, Thumbnails & Controls on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Viewport / Camera Box */}
            <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden">
              {activeTab === 'camera' ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4 relative">
                  {cameraError ? (
                    <div className="p-6 text-center space-y-3">
                      <Smartphone className="w-10 h-10 text-amber-400 mx-auto" />
                      <p className="text-xs text-amber-200">{cameraError}</p>
                      <button
                        onClick={() => setActiveTab('upload')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <Upload className="w-4 h-4" /> Switch to Photo Upload
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-indigo-500/30 flex items-center justify-center">
                        <video
                          ref={videoRef}
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                        {/* Document Framing Overlay */}
                        <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-emerald-400/70 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                          <span className="text-[10px] bg-emerald-500/80 text-white font-bold px-1.5 py-0.5 rounded self-start">
                            Align Page Inside Border
                          </span>
                        </div>
                      </div>

                      <canvas ref={canvasRef} className="hidden" />

                      <button
                        onClick={capturePhoto}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl text-xs transition shadow-lg flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" /> Snap Document Page
                      </button>
                    </>
                  )}
                </div>
              ) : (
                /* Upload Dropzone */
                <div className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-3 bg-slate-900/40 hover:border-indigo-500/50 transition">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Upload Document Images</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Drag & drop JPG, PNG, or WEBP photos of your paper or select files.
                    </p>
                  </div>
                  <label className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer transition shadow-xs">
                    Browse Photos
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Page Inspector & Enhancement Controls */}
            <div className="lg:col-span-5 bg-slate-950/80 rounded-2xl border border-slate-800 p-4 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h4 className="font-bold text-sm text-white flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" /> Document Pages ({pages.length})
                  </h4>
                  {pages.length > 0 && (
                    <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                      Page {selectedPageIndex + 1} Selected
                    </span>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {pages.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs space-y-1">
                    <FileText className="w-8 h-8 text-slate-700 mx-auto" />
                    <p>No pages captured yet.</p>
                    <p className="text-[10px] text-slate-600">Snap a picture or upload photos to begin.</p>
                  </div>
                ) : (
                  <div className="py-3 flex items-center gap-2.5 overflow-x-auto">
                    {pages.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedPageIndex(idx)}
                        className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition ${
                          selectedPageIndex === idx
                            ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                            : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={p.dataUrl} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] font-bold px-1 rounded">
                          P{idx + 1}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePage(idx);
                          }}
                          className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-0.5 rounded-full shadow-xs"
                          title="Delete Page"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Filter and Rotate Controls */}
                {currentPage && (
                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Document Enhancements
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => updatePageFilter('contrast')}
                        className={`p-2 rounded-xl border font-medium flex items-center justify-center gap-1.5 ${
                          currentPage.filter === 'contrast'
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Sharp Document
                      </button>

                      <button
                        onClick={() => updatePageFilter('bw')}
                        className={`p-2 rounded-xl border font-medium flex items-center justify-center gap-1.5 ${
                          currentPage.filter === 'bw'
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Clean B&W
                      </button>

                      <button
                        onClick={() => updatePageFilter('none')}
                        className={`p-2 rounded-xl border font-medium flex items-center justify-center gap-1.5 ${
                          currentPage.filter === 'none'
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        Original Photo
                      </button>

                      <button
                        onClick={rotatePage}
                        className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl font-medium flex items-center justify-center gap-1.5"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-indigo-400" /> Rotate 90°
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* PDF Actions */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                {copiedSuccess && (
                  <div className="p-2 bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>PDF Scanned & Attached successfully!</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadDirectPdf}
                    disabled={pages.length === 0 || isGeneratingPdf}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-white font-bold rounded-xl text-xs transition border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGeneratingPdf ? 'Compiling PDF...' : 'Download PDF'}</span>
                  </button>

                  <button
                    onClick={handleFinalSubmit}
                    disabled={pages.length === 0 || isGeneratingPdf}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{onScanComplete ? 'Attach to Task' : 'Save PDF Document'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
