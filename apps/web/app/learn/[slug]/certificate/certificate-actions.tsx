'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface CertificateActionsProps {
    certificateId: string;
    courseTitle: string;
    userName: string;
}

export function CertificateActions({ certificateId, courseTitle, userName }: CertificateActionsProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const handleDownloadPDF = async () => {
        const certificateElement = document.getElementById('certificate-to-capture');
        if (!certificateElement) {
            toast.error("Sertifikat topilmadi");
            return;
        }

        setIsDownloading(true);
        try {
            // Options to improve quality
            const canvas = await html2canvas(certificateElement, {
                scale: 3, // Higher scale for better resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');

            // PDF setup: A4 landscape (297mm x 210mm)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Ailar-Academy-Certificate-${courseTitle.replace(/\s+/g, '-')}.pdf`);

            toast.success("Sertifikat PDF formatida yuklab olindi");
        } catch (error) {
            console.error("PDF download error:", error);
            toast.error("Yuklab olishda xatolik yuz berdi");
        } finally {
            setIsDownloading(false);
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            if (navigator.share) {
                await navigator.share({
                    title: `${courseTitle} kursi sertifikati`,
                    text: `Men Ailar Academy'da "${courseTitle}" kursini muvaffaqiyatli tamomladim!`,
                    url: window.location.href,
                });
            } else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Havola buferga nusxalandi");
            }
        } catch (error) {
            console.error("Share error:", error);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className="flex gap-4">
            <Button
                variant="outline"
                onClick={handleShare}
                disabled={isSharing}
                className="rounded-full bg-white/5 border-white/10 hover:bg-white/10"
            >
                {isSharing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Share2 className="mr-2 h-4 w-4" />}
                Ulashish
            </Button>
            <Button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
                {isDownloading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Tayyorlanmoqda...
                    </>
                ) : (
                    <>
                        <Download className="mr-2 h-4 w-4" />
                        Yuklab olish (PDF)
                    </>
                )}
            </Button>
        </div>
    );
}
