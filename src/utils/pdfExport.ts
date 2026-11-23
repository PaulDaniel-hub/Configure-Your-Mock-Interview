import { jsPDF } from 'jspdf';
import type { InterviewSessionRecord } from '../types/interview';
import { calculateDimensionAverages, formatShortDate } from './interviewLogic';

export function exportInterviewReportPdf(session: InterviewSessionRecord): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 44;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addSectionHeading = (title: string) => {
    ensureSpace(34);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text(title, margin, y);
    y += 6;
    doc.setDrawColor(219, 228, 244);
    doc.setLineWidth(0.75);
    doc.line(margin, y, pageWidth - margin, y);
    y += 16;
  };

  const addWrappedText = (text: string, fontSize = 10, color: [number, number, number] = [30, 41, 59], indent = 0) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth - indent) as string[];
    for (const line of lines) {
      ensureSpace(fontSize * 1.45);
      doc.text(line, margin + indent, y);
      y += fontSize * 1.45;
    }
  };

  const addBulletList = (items: string[]) => {
    for (const item of items) {
      ensureSpace(18);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      const lines = doc.splitTextToSize(`•  ${item}`, contentWidth - 10) as string[];
      for (const line of lines) {
        ensureSpace(14);
        doc.text(line, margin + 8, y);
        y += 14;
      }
      y += 2;
    }
    y += 6;
  };

  // Header Banner
  doc.setFillColor(8, 13, 27);
  doc.rect(0, 0, pageWidth, 108, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('InterviewAce AI', margin, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('Practice Smart. Answer Confidently. Get Hired.', margin, 60);
  doc.text(`Interview Performance Report  ·  ${formatShortDate(session.createdAt)}`, margin, 78);

  // Overall score callout box on top-right
  doc.setFillColor(17, 26, 46);
  doc.roundedRect(pageWidth - margin - 118, 22, 118, 64, 6, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(71, 123, 255);
  doc.text(`${session.analysis.overallScore}/100`, pageWidth - margin - 59, 52, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240);
  doc.text(session.analysis.performanceTier, pageWidth - margin - 59, 72, { align: 'center' });

  y = 132;

  // Session Metadata Row
  const averages = calculateDimensionAverages(session.responses.map((r) => r.evaluation));
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 54, 6, 6, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(session.config.role, margin + 14, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `${session.config.experienceLevel}  ·  ${session.config.interviewType}  ·  ${session.config.difficulty}  ·  ${session.responses.length} Questions`,
    margin + 14,
    y + 39
  );
  doc.text(
    `Technical Accuracy: ${averages.averageTechnical}/10   |   Communication: ${averages.averageCommunication}/10`,
    pageWidth - margin - 14,
    y + 39,
    { align: 'right' }
  );

  y += 74;

  // Performance Summary
  addSectionHeading('Performance Summary');
  addWrappedText(session.analysis.performanceSummary, 10, [30, 41, 59]);
  y += 10;

  // Strongest Areas
  addSectionHeading('Strongest Areas');
  addBulletList(session.analysis.strongestAreas);

  // Areas Needing Improvement
  addSectionHeading('Areas Needing Improvement');
  addBulletList(session.analysis.areasNeedingImprovement);

  // Personalized Recommendations
  addSectionHeading('Personalized Recommendations');
  addBulletList(session.analysis.personalizedRecommendations);

  // Final AI Coach Feedback
  addSectionHeading('Final AI Interview Feedback');
  addWrappedText(session.analysis.finalFeedback, 10, [30, 41, 59]);
  y += 14;

  // Detailed Question-by-Question Breakdown
  addSectionHeading('Question-by-Question Evaluation');
  for (const item of session.responses) {
    ensureSpace(120);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    const qHeader = `Q${item.question.number} [${item.question.category} · ${item.question.topic}] — Score: ${item.evaluation.score}/10`;
    doc.text(qHeader, margin, y);
    y += 15;

    addWrappedText(item.question.question, 10, [15, 23, 42]);
    y += 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    ensureSpace(14);
    doc.text('Your Answer:', margin, y);
    y += 12;
    addWrappedText(item.userAnswer, 9.5, [51, 65, 85], 8);
    y += 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235);
    ensureSpace(14);
    doc.text('Recommended Model Answer:', margin, y);
    y += 12;
    addWrappedText(item.evaluation.betterSampleAnswer, 9.5, [30, 41, 59], 8);
    y += 12;
  }

  const safeRole = session.config.role.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  doc.save(`InterviewAce-Report-${safeRole || 'session'}.pdf`);
}
