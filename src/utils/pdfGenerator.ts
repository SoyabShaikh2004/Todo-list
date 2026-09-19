import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Task, User } from '../types';

export interface ReportData {
  user: User;
  dateStr: string;
  tasks: Task[];
  generationTime: string;
}

export const generateDailyReportPDF = (data: ReportData): jsPDF => {
  const { user, dateStr, tasks, generationTime } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const parsedDate = new Date(`${dateStr}T12:00:00`);
  const formattedDate = parsedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
  const total = dayTasks.length;
  const completedTasks = dayTasks.filter((t) => t.status === 'completed');
  const notCompletedTasks = dayTasks.filter((t) => t.status === 'not_completed');
  const pendingTasks = dayTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const percentage = total > 0 ? Math.round((completedTasks.length / total) * 100) : 0;

  // Header Banner
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(0, 0, 210, 36, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('DAILY TASK MANAGEMENT', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('END-OF-DAY PERFORMANCE & ACTIVITY REPORT', 14, 23);

  // Date on right
  doc.setFontSize(10);
  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'bold');
  doc.text(formattedDate, 196, 16, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${generationTime}`, 196, 23, { align: 'right' });

  // User & Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 42, 182, 34, 3, 3, 'FD');

  // User details
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('TEAM MEMBER:', 18, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(user.fullName, 52, 50);

  doc.setFont('helvetica', 'bold');
  doc.text('EMAIL:', 18, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(user.email, 52, 56);

  if (user.mobile) {
    doc.setFont('helvetica', 'bold');
    doc.text('CONTACT:', 18, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(user.mobile, 52, 62);
  }

  // Summary Metrics Badges
  const metricX = 120;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('SUMMARY OVERVIEW', metricX, 48);

  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`Total Tasks: ${total}`, metricX, 55);
  doc.setTextColor(16, 149, 102); // emerald
  doc.text(`Completed: ${completedTasks.length}`, metricX, 61);
  doc.setTextColor(225, 29, 72); // rose
  doc.text(`Not Completed: ${notCompletedTasks.length}`, metricX + 40, 55);
  doc.setTextColor(217, 119, 6); // amber
  doc.text(`Pending: ${pendingTasks.length}`, metricX + 40, 61);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229); // indigo
  doc.text(`Completion Rate: ${percentage}%`, metricX, 69);

  let currentY = 82;

  // 1. Completed Tasks Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 149, 102);
  doc.text(`Completed Tasks (${completedTasks.length})`, 14, currentY);
  currentY += 4;

  if (completedTasks.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('No tasks were marked as completed for this date.', 14, currentY + 4);
    currentY += 12;
  } else {
    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Task Title', 'Description', 'Category', 'Assigned Time', 'Completion Time', 'Status']],
      body: completedTasks.map((t, idx) => [
        idx + 1,
        t.title,
        t.description || '-',
        t.category,
        t.dueTime || 'Not set',
        t.completedAt
          ? new Date(t.completedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : 'Completed',
        'COMPLETED',
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [16, 149, 102],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 42 },
        2: { cellWidth: 45 },
        3: { cellWidth: 20 },
        4: { cellWidth: 22 },
        5: { cellWidth: 25 },
        6: { cellWidth: 20 },
      },
      margin: { left: 14, right: 14 },
    });

    // @ts-expect-error jspdf-autotable plugin property
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Check if we need page break
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  // 2. Not Completed Tasks Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72);
  doc.text(`Not Completed Tasks (${notCompletedTasks.length})`, 14, currentY);
  currentY += 4;

  if (notCompletedTasks.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('Zero tasks missed! All scheduled tasks were completed.', 14, currentY + 4);
    currentY += 12;
  } else {
    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Task Title', 'Description', 'Priority', 'Assigned Time', 'Status', 'Documented Reason']],
      body: notCompletedTasks.map((t, idx) => [
        idx + 1,
        t.title,
        t.description || '-',
        t.priority.toUpperCase(),
        t.dueTime || 'Not set',
        'NOT COMPLETED',
        t.incompleteReason || 'Reason not provided',
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [225, 29, 72],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 8 },
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
        3: { cellWidth: 18 },
        4: { cellWidth: 20 },
        5: { cellWidth: 22 },
        6: { cellWidth: 39 },
      },
      margin: { left: 14, right: 14 },
    });

    // @ts-expect-error jspdf-autotable plugin property
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // 3. Pending Tasks (if any remain)
  if (pendingTasks.length > 0) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6);
    doc.text(`Pending Tasks (${pendingTasks.length})`, 14, currentY);
    currentY += 4;

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Task Title', 'Category', 'Priority', 'Scheduled Time', 'Status']],
      body: pendingTasks.map((t, idx) => [
        idx + 1,
        t.title,
        t.category,
        t.priority.toUpperCase(),
        t.dueTime || 'Not set',
        'PENDING',
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [217, 119, 6],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 65 },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 27 },
      },
      margin: { left: 14, right: 14 },
    });

    // @ts-expect-error jspdf-autotable plugin property
    currentY = doc.lastAutoTable.finalY + 10;
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Daily Task Management System • Page ${i} of ${pageCount} • Confidential User Report`,
      105,
      287,
      { align: 'center' }
    );
  }

  return doc;
};
