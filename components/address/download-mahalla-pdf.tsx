'use client';

import React, { useState } from 'react';
import { Download, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface Props {
  mahalla: {
    nameUz: string;
    code: string;
    geoCode: string;
    district: {
      nameUz: string;
      region: {
        nameUz: string;
      }
    };
    streets: any[];
  }
}

export function DownloadMahallaPdf({ mahalla }: Props) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const mapElement = document.getElementById('mahalla-detail-map-container');
      if (!mapElement) {
        throw new Error('Map element not found');
      }

      // Capture the map with html2canvas
      const canvas = await html2canvas(mapElement, {
        useCORS: true,
        allowTaint: true,
        scale: 2, // Higher quality
        logging: false,
        backgroundColor: '#f8fafc' // slate-50 background
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let yPos = 20;

      // Title
      pdf.setFontSize(14);
      pdf.setTextColor(30, 41, 59); // slate-800
      pdf.setFont('helvetica', 'bold');
      
      const title = `${mahalla.district.region.nameUz}, ${mahalla.district.nameUz}, ${mahalla.nameUz} xaritasi`.toUpperCase();
      
      // Handle title wrapping if too long
      const splitTitle = pdf.splitTextToSize(title, pageWidth - (margin * 2));
      pdf.text(splitTitle, pageWidth / 2, yPos, { align: 'center' });
      
      yPos += (splitTitle.length * 7) + 5;
      
      // Draw a line
      pdf.setDrawColor(226, 232, 240); // slate-200
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      
      yPos += 15;
      
      // Map Image
      const imgWidth = pageWidth - (margin * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Ensure image fits or add page
      if (yPos + imgHeight > 280) {
        pdf.addPage();
        yPos = margin + 10;
      }
      
      pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
      
      yPos += imgHeight + 15;
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184); // slate-400
      pdf.setFont('helvetica', 'normal');
      const date = new Date().toLocaleDateString('uz-UZ');
      pdf.text(`Sana: ${date} | Manzillar axborot tizimi`, pageWidth / 2, 285, { align: 'center' });

      // Save PDF
      pdf.save(`${mahalla.nameUz}_pasporti.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('PDF yuklashda xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleDownload} 
      disabled={isExporting}
      className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Tayyorlanmoqda...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4" />
          PDF Yuklash
        </>
      )}
    </Button>
  );
}
