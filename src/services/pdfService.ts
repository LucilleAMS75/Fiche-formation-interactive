import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export interface FicheData {
  titre: string;
  publicCible: string;
  objectifFormation: string;
  objectifsPedagogiques: string[];
  duree: string;
  savoirs: string;
  savoirFaire: string;
  savoirEtre: string;
  modalites: string;
}

export const generateFichePDF = (data: FicheData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let currentY = 20;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(129, 4, 100); // Accent color #810464
  doc.text('FICHE FORMATION', pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 15;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  const date = new Date().toLocaleDateString('fr-FR');
  doc.text(`Généré le : ${date}`, pageWidth - margin, currentY, { align: 'right' });

  currentY += 10;
  doc.setDrawColor(129, 4, 100);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 15;

  // Intro
  doc.setFontSize(11);
  doc.setTextColor(50);
  const intro = "Cette fiche présente de manière structurée l'ensemble des composantes de la formation conçue pour Résid'Azur.";
  const splitIntro = doc.splitTextToSize(intro, pageWidth - (margin * 2));
  doc.text(splitIntro, margin, currentY);
  currentY += (splitIntro.length * 7) + 5;

  // Content Sections
  const renderSection = (title: string, content: string | string[]) => {
    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(129, 4, 100);
    doc.text(title.toUpperCase(), margin, currentY);
    currentY += 7;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0);

    if (Array.isArray(content)) {
      content.forEach((item, index) => {
        const bullet = `• ${item}`;
        const splitItem = doc.splitTextToSize(bullet, pageWidth - (margin * 2) - 5);
        doc.text(splitItem, margin + 5, currentY);
        currentY += (splitItem.length * 6);
      });
    } else {
      const splitContent = doc.splitTextToSize(content, pageWidth - (margin * 2));
      doc.text(splitContent, margin, currentY);
      currentY += (splitContent.length * 6);
    }
    
    currentY += 10;
  };

  renderSection('1. Titre de la formation', data.titre);
  renderSection('2. Public cible', data.publicCible);
  renderSection('3. Objectif de formation', data.objectifFormation);
  renderSection('4. Objectifs pédagogiques', data.objectifsPedagogiques);
  renderSection('5. Durée', data.duree);
  
  // Programme grouped
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(129, 4, 100);
  doc.text('6. PROGRAMME', margin, currentY);
  currentY += 10;

  const renderSubSection = (subTitle: string, content: string) => {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text(subTitle, margin + 5, currentY);
    currentY += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    const splitContent = doc.splitTextToSize(content, pageWidth - (margin * 2) - 10);
    doc.text(splitContent, margin + 10, currentY);
    currentY += (splitContent.length * 6) + 5;
  };

  renderSubSection('Savoirs (Connaissances) :', data.savoirs);
  renderSubSection('Savoir-faire (Compétences) :', data.savoirFaire);
  renderSubSection('Savoir-être (Postures) :', data.savoirEtre);

  renderSection('7. Modalités', data.modalites);

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} sur ${pageCount}`, pageWidth / 2, 285, { align: 'center' });
  }

  doc.save(`Fiche_Formation_${data.titre.replace(/\s+/g, '_') || 'Sans_Titre'}.pdf`);
};
