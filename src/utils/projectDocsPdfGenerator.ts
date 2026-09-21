import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateProjectDocumentationPDF = (): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const addHeaderBanner = (title: string, subtitle: string, pageNum: number, totalPages: number) => {
    // Top banner
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(0, 0, pageWidth, 24, 'F');

    // Accent line
    doc.setFillColor(99, 102, 241); // indigo-500
    doc.rect(0, 23.5, pageWidth, 1, 'F');

    // Title text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, 12);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text(subtitle, margin, 18);

    // Page indicator
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - margin, 15, { align: 'right' });

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('TaskFlow Enterprise Management Architecture & Workflow Specification', margin, pageHeight - 8);
    doc.text(new Date().toLocaleDateString('en-US', { dateStyle: 'long' }), pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE ARCHITECTURE
  // ==========================================
  // Cover Hero Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 60, 'F');
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 58.5, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('TaskFlow Enterprise RBAC', margin, 24);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(165, 180, 252); // indigo-200
  doc.text('Full Project Architecture, Workflow & Technical Documentation', margin, 33);

  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225);
  doc.text('3-Tier Role Hierarchy | Task Delegation Lifecycle | Daily Work Reporting | Dual-Storage Sync Engine', margin, 42);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${new Date().toLocaleString()} | Version 2.4 Enterprise Edition`, margin, 51);

  let currentY = 70;

  // Section 1: Executive Summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('1. Executive System Overview', margin, currentY);
  currentY += 5;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const execSummary =
    'TaskFlow is a production-grade enterprise task execution and team governance platform engineered for organizations requiring strict accountability, structured delegation, and real-time oversight. The system bridges top-level executive strategy with frontline execution through a 3-tier Role-Based Access Control (RBAC) model, dual-layer cloud persistence (PostgreSQL + Firebase), and an end-of-day audit workflow.';
  doc.text(doc.splitTextToSize(execSummary, contentWidth), margin, currentY);
  currentY += 16;

  // Architecture Diagram Block
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('2. System High-Level Architecture Diagram', margin, currentY);
  currentY += 6;

  // Box 1: Client Tier
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229);
  doc.text('PRESENTATION & CLIENT TIER (React 19 + TypeScript + Tailwind CSS)', margin + 4, currentY + 7);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('• Responsive Web Application: Desktop Command Center & Mobile Adaptive Nav', margin + 4, currentY + 14);
  doc.text('• Views: Dashboard Analytics, Task Matrix, Hierarchy Tree, Interactive Calendar, Daily Reports, Cloud DB Admin', margin + 4, currentY + 20);
  doc.text('• Client State: LocalStorage Fast Cache + Realtime Session Context + Theme Engine (Dark/Light)', margin + 4, currentY + 26);

  currentY += 36;

  // Connector Arrow
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.6);
  doc.line(pageWidth / 2, currentY - 3, pageWidth / 2, currentY + 3);
  doc.triangle(pageWidth / 2 - 2, currentY + 2, pageWidth / 2 + 2, currentY + 2, pageWidth / 2, currentY + 4, 'FD');

  currentY += 6;

  // Box 2: Application / API Server Tier
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(margin, currentY, contentWidth, 32, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(67, 56, 202);
  doc.text('APPLICATION & SERVER TIER (Node.js + Express + Vite + Tsx Engine)', margin + 4, currentY + 7);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('• RESTful APIs: /api/tasks, /api/hierarchy, /api/reports, /api/users, /api/db-status', margin + 4, currentY + 14);
  doc.text('• Middleware: Role-Based Authorization, Schema Validation, Audit Logging, Error Recovery', margin + 4, currentY + 20);
  doc.text('• PDF Generation Service: Client & Server PDF synthesis using jsPDF and AutoTable', margin + 4, currentY + 26);

  currentY += 36;

  // Connector Arrow
  doc.line(pageWidth / 2, currentY - 3, pageWidth / 2, currentY + 3);
  doc.triangle(pageWidth / 2 - 2, currentY + 2, pageWidth / 2 + 2, currentY + 2, pageWidth / 2, currentY + 4, 'FD');

  currentY += 6;

  // Box 3: Dual Data Tier
  doc.setFillColor(240, 253, 244); // green-50
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, currentY, contentWidth, 34, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text('PERSISTENCE & DATA STORAGE TIER (Dual Redundant Architecture)', margin + 4, currentY + 7);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('1. Google Cloud SQL (PostgreSQL): Drizzle ORM Schema, Relational Integrity, Foreign Keys, Acid Compliance', margin + 4, currentY + 14);
  doc.text('2. Google Firebase (Firestore): Document collections for real-time synchronization and offline snapshot fallback', margin + 4, currentY + 20);
  doc.text('3. Client LocalStorage: Zero-latency offline caching, instant optimistic UI updates, auto-reconciliation', margin + 4, currentY + 26);

  // ==========================================
  // PAGE 2: 3-TIER ROLE HIERARCHY & RBAC
  // ==========================================
  doc.addPage();
  addHeaderBanner('3-TIER ROLE HIERARCHY & ACCESS MATRIX', 'Enterprise Governance & Permission Boundary', 2, 5);

  currentY = 32;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Role Hierarchy Topology Diagram', margin, currentY);
  currentY += 5;

  // Topology visual diagram in boxes
  const boxW = 54;
  const boxH = 26;

  // Super Admin Box (Top Center)
  const superX = (pageWidth - boxW) / 2;
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(superX, currentY, boxW, boxH, 2, 2, 'FD');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  doc.text('SUPER ADMIN', superX + boxW / 2, currentY + 7, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 83, 9);
  doc.text('Executive Oversight', superX + boxW / 2, currentY + 13, { align: 'center' });
  doc.text('Creates Admins & Directs All', superX + boxW / 2, currentY + 18, { align: 'center' });
  doc.text('Company-Wide Audit', superX + boxW / 2, currentY + 23, { align: 'center' });

  // Arrows from Super Admin down to Admins
  const arrowY = currentY + boxH;
  doc.setDrawColor(100, 116, 139);
  doc.line(superX + boxW / 2, arrowY, superX + boxW / 2, arrowY + 6);
  doc.line(margin + 28, arrowY + 6, pageWidth - margin - 28, arrowY + 6);
  doc.line(margin + 28, arrowY + 6, margin + 28, arrowY + 10);
  doc.line(pageWidth - margin - 28, arrowY + 6, pageWidth - margin - 28, arrowY + 10);

  currentY = arrowY + 10;

  // Admin Box 1 & Admin Box 2
  const adminW = 75;
  doc.setFillColor(224, 231, 255); // indigo-100
  doc.setDrawColor(99, 102, 241);
  doc.roundedRect(margin, currentY, adminW, boxH, 2, 2, 'FD');
  doc.roundedRect(pageWidth - margin - adminW, currentY, adminW, boxH, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 48, 163);
  doc.text('ADMIN A (Operations)', margin + adminW / 2, currentY + 7, { align: 'center' });
  doc.text('ADMIN B (Engineering)', pageWidth - margin - adminW / 2, currentY + 7, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(67, 56, 202);
  doc.text('Manages Assigned Users | Delegates Tasks', margin + adminW / 2, currentY + 14, { align: 'center' });
  doc.text('Reviews Team Daily Work Reports', margin + adminW / 2, currentY + 19, { align: 'center' });
  doc.text('Manages Assigned Users | Delegates Tasks', pageWidth - margin - adminW / 2, currentY + 14, { align: 'center' });
  doc.text('Submits Consolidated Reports', pageWidth - margin - adminW / 2, currentY + 19, { align: 'center' });

  // Arrows to Users
  const userArrowY = currentY + boxH;
  doc.line(margin + adminW / 2, userArrowY, margin + adminW / 2, userArrowY + 6);
  doc.line(pageWidth - margin - adminW / 2, userArrowY, pageWidth - margin - adminW / 2, userArrowY + 6);

  currentY = userArrowY + 6;

  // Users Row
  doc.setFillColor(241, 245, 249); // slate-100
  doc.setDrawColor(148, 163, 184);
  doc.roundedRect(margin, currentY, adminW, 16, 2, 2, 'FD');
  doc.roundedRect(pageWidth - margin - adminW, currentY, adminW, 16, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('TEAM USERS (Under Admin A)', margin + adminW / 2, currentY + 6, { align: 'center' });
  doc.text('TEAM USERS (Under Admin B)', pageWidth - margin - adminW / 2, currentY + 6, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Executes Tasks | Submits Daily EOD Report', margin + adminW / 2, currentY + 11, { align: 'center' });
  doc.text('Executes Tasks | Submits Daily EOD Report', pageWidth - margin - adminW / 2, currentY + 11, { align: 'center' });

  currentY += 24;

  // RBAC Table
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Role-Based Access Control (RBAC) Permission Matrix', margin, currentY);
  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    head: [['System Capability / Action', 'Super Admin', 'Admin (Manager)', 'Team User']],
    body: [
      ['Create New Admin Accounts', 'YES (Full Control)', 'NO', 'NO'],
      ['Create New Team Users', 'YES (Can assign to any Admin)', 'YES (Assigned to self)', 'NO'],
      ['Reassign Users to Different Admins', 'YES (Full Hierarchy Control)', 'NO', 'NO'],
      ['Assign Directive Tasks', 'YES (To any Admin or User)', 'YES (To direct team)', 'Personal tasks only'],
      ['Delegate Received Super Admin Tasks', 'N/A (Originator)', 'YES (To team members)', 'NO'],
      ['View All Organization Tasks', 'YES (Complete Matrix)', 'NO (Team tasks only)', 'NO (Own tasks only)'],
      ['Submit End-of-Day Work Report', 'Optional / Reviews all', 'YES (Consolidated to Super Admin)', 'YES (Daily to Admin)'],
      ['Review & Approve Daily Reports', 'YES (Company-wide feed)', 'YES (Team submissions)', 'NO'],
      ['Toggle Member Status (Active/Inactive)', 'YES (Admins & Users)', 'YES (Team users only)', 'NO'],
      ['Cloud SQL & Firebase Synchronization', 'YES (Database Console)', 'NO', 'NO'],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 38 },
      2: { cellWidth: 40 },
      3: { cellWidth: 34 },
    },
    margin: { left: margin, right: margin },
  });

  // ==========================================
  // PAGE 3: TASK LIFECYCLE & DELEGATION WORKFLOW
  // ==========================================
  doc.addPage();
  addHeaderBanner('TASK LIFECYCLE & DELEGATION WORKFLOW', 'End-to-End Directive Execution & State Transitions', 3, 5);

  currentY = 32;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('1. Task State Transition Machine', margin, currentY);
  currentY += 5;

  // Task state machine boxes
  const stateBoxW = 38;
  const stateBoxH = 18;
  const stateY = currentY;

  // PENDING
  doc.setFillColor(254, 249, 195); // yellow-100
  doc.setDrawColor(234, 179, 8);
  doc.roundedRect(margin, stateY, stateBoxW, stateBoxH, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(161, 98, 7);
  doc.text('PENDING', margin + stateBoxW / 2, stateY + 7, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Assigned / Queued', margin + stateBoxW / 2, stateY + 13, { align: 'center' });

  // Arrow 1
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + stateBoxW, stateY + 9, margin + stateBoxW + 8, stateY + 9);

  // IN PROGRESS
  const ipX = margin + stateBoxW + 8;
  doc.setFillColor(224, 242, 254); // sky-100
  doc.setDrawColor(14, 165, 233);
  doc.roundedRect(ipX, stateY, stateBoxW, stateBoxH, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(3, 105, 161);
  doc.text('IN PROGRESS', ipX + stateBoxW / 2, stateY + 7, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Under Active Work', ipX + stateBoxW / 2, stateY + 13, { align: 'center' });

  // Arrow 2 Split
  const splitX = ipX + stateBoxW;
  doc.line(splitX, stateY + 9, splitX + 8, stateY + 5);
  doc.line(splitX, stateY + 9, splitX + 8, stateY + 13);

  // COMPLETED (Top)
  const finalX = splitX + 8;
  doc.setFillColor(220, 252, 231); // green-100
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(finalX, stateY - 3, stateBoxW + 4, stateBoxH - 2, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text('COMPLETED', finalX + (stateBoxW + 4) / 2, stateY + 3, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Timestamp recorded', finalX + (stateBoxW + 4) / 2, stateY + 9, { align: 'center' });

  // NOT COMPLETED (Bottom)
  doc.setFillColor(254, 226, 226); // red-100
  doc.setDrawColor(239, 68, 68);
  doc.roundedRect(finalX, stateY + 14, stateBoxW + 4, stateBoxH - 2, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('NOT COMPLETED', finalX + (stateBoxW + 4) / 2, stateY + 20, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Reason mandatory', finalX + (stateBoxW + 4) / 2, stateY + 26, { align: 'center' });

  currentY += 36;

  // Section 2: Delegation Sequence Steps
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('2. Two-Stage Task Delegation Sequence', margin, currentY);
  currentY += 4;

  autoTable(doc, {
    startY: currentY,
    head: [['Stage', 'Actor', 'Action & System Behavior', 'Data Integrity & Audit Fields']],
    body: [
      [
        'Stage 1: Directive',
        'Super Admin',
        'Selects target Admin or User, enters Title, Priority, Due Date, Category, and Instructions. Clicks "+ Assign Task".',
        'createdById = superAdmin.id, creatorRole = "super_admin", assignedToId = admin.id, status = "pending"',
      ],
      [
        'Stage 2: Receipt',
        'Admin (Manager)',
        'Task appears in Admin workspace highlighted as "Executive Directive" from Super Admin.',
        'Visible in both "Team & Directives" and Daily Reports feed.',
      ],
      [
        'Stage 3: Delegation',
        'Admin (Manager)',
        'Admin clicks "Delegate" on the directive. Selects team member (User), adds specific sub-instructions, and confirms.',
        'parentTaskId = originalTask.id, createdById = admin.id, assignedToId = user.id, adminId = admin.id',
      ],
      [
        'Stage 4: Execution',
        'Team User',
        'Task appears in User Daily Tasks list with badge "Delegated by [Admin Name]". User executes work during shift.',
        'User updates status: Pending -> In Progress -> Completed (or Not Completed with mandatory written reason).',
      ],
      [
        'Stage 5: Verification',
        'Admin & Super',
        'Parent task tracks child task completion in real-time. Super Admin and Admin can inspect timestamp and reason audit logs.',
        'completedAt ISO timestamp, incompleteReason recorded, included in nightly report rollup.',
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 26 },
      2: { cellWidth: 72 },
      3: { cellWidth: 52 },
    },
    margin: { left: margin, right: margin },
  });

  // ==========================================
  // PAGE 4: DAILY REPORTING & EOD WORKFLOW
  // ==========================================
  doc.addPage();
  addHeaderBanner('DAILY WORK REPORTING & REVIEW WORKFLOW', 'End-of-Day Performance Tracking & Consolidated Rollup', 4, 5);

  currentY = 32;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('1. Daily Work Reporting Workflow Diagram', margin, currentY);
  currentY += 5;

  // Step 1: User compiles
  const stepW = contentWidth;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, stepW, 20, 2, 2, 'FD');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('STEP 1: TEAM USER DAILY REPORT GENERATION', margin + 4, currentY + 6);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('• End of workday: User reviews daily tasks, marks all completed or provides mandatory reason for incomplete tasks.', margin + 4, currentY + 11);
  doc.text('• Clicks "Submit Daily Report" -> Adds overall remarks -> Submits to assigned Manager (Admin).', margin + 4, currentY + 16);

  currentY += 25;

  // Step 2: Admin reviews
  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(margin, currentY, stepW, 20, 2, 2, 'FD');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(67, 56, 202);
  doc.text('STEP 2: ADMIN (MANAGER) TEAM AUDIT & CONSOLIDATION', margin + 4, currentY + 6);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('• Manager opens "Team Reports" tab. Inspects completion percentages, task tables, and overdue blockers.', margin + 4, currentY + 11);
  doc.text('• Clicks "Consolidate & Submit Report" -> Synthesizes team outcomes -> Submits Executive Report to Super Admin.', margin + 4, currentY + 16);

  currentY += 25;

  // Step 3: Super Admin
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, currentY, stepW, 20, 2, 2, 'FD');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  doc.text('STEP 3: SUPER ADMIN EXECUTIVE AUDIT & SIGN-OFF', margin + 4, currentY + 6);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 53, 15);
  doc.text('• Super Admin views company-wide reports feed with filters by Date, Department, and Submitter Role.', margin + 4, currentY + 11);
  doc.text('• Full exportability: Generates official high-resolution PDF daily summaries for regulatory archival.', margin + 4, currentY + 16);

  currentY += 28;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('2. Daily Report Data Structure & Validation Rules', margin, currentY);
  currentY += 4;

  autoTable(doc, {
    startY: currentY,
    head: [['Field / Attribute', 'Type & Range', 'Validation & Business Logic']],
    body: [
      ['date', 'varchar(20) YYYY-MM-DD', 'Defaults to selected calendar date. Immutable once submitted.'],
      ['senderId & role', 'text (FK -> users.id)', 'Identifies author (role: "user" or "admin"). Enforces isolation.'],
      ['recipientId', 'text (FK -> users.id)', 'Points to managing Admin (for users) or Super Admin (for managers).'],
      ['completedCount', 'integer >= 0', 'Calculated from tasks where status = "completed".'],
      ['pendingCount', 'integer >= 0', 'Calculated from tasks where status = "pending" or "in_progress".'],
      ['tasksSummary', 'JSON text string', 'Stores frozen snapshot array of all daily tasks, timestamps, categories & reasons.'],
      ['remarks', 'text (optional)', 'Free-form operational handover notes, blockers, or highlights from submitter.'],
      ['status', 'varchar(20)', '"submitted" upon transmission; updated to "reviewed" when signed off.'],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold' },
      1: { cellWidth: 44 },
      2: { cellWidth: 96 },
    },
    margin: { left: margin, right: margin },
  });

  // ==========================================
  // PAGE 5: DATABASE SCHEMA & TECHNICAL ENGINE
  // ==========================================
  doc.addPage();
  addHeaderBanner('DATABASE SCHEMAS & TECHNICAL SPECIFICATIONS', 'Cloud SQL (PostgreSQL) Drizzle Tables & Dual-Storage Sync', 5, 5);

  currentY = 32;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('1. Relational Database Tables (Cloud SQL / Drizzle ORM)', margin, currentY);
  currentY += 4;

  autoTable(doc, {
    startY: currentY,
    head: [['Table', 'Column Name', 'Type / Constraints', 'Description & Relationship']],
    body: [
      ['users', 'id', 'text PRIMARY KEY', 'Unique UUID for user identification.'],
      ['users', 'full_name', 'text NOT NULL', 'Full name of employee or manager.'],
      ['users', 'email', 'text NOT NULL', 'Unique login credentials address.'],
      ['users', 'role', 'text NOT NULL', 'Enum: "super_admin" | "admin" | "user".'],
      ['users', 'admin_id', 'text NULLABLE', 'Foreign key referencing managing admin user.'],
      ['users', 'status', 'text NOT NULL', 'Enum: "active" | "inactive" (access toggle).'],
      ['users', 'department', 'text DEFAULT "General"', 'Organizational division (Sales, Ops, Eng).'],
      ['tasks', 'id', 'text PRIMARY KEY', 'Unique UUID for task record.'],
      ['tasks', 'user_id', 'text FK -> users.id', 'Owner / Assignee responsible for execution.'],
      ['tasks', 'created_by_id', 'text NULLABLE', 'Author ID (Super Admin or Admin).'],
      ['tasks', 'parent_task_id', 'text NULLABLE', 'References directive task for delegated items.'],
      ['tasks', 'due_date', 'varchar(20) NOT NULL', 'Target completion date (YYYY-MM-DD).'],
      ['tasks', 'priority', 'varchar(20) NOT NULL', '"low" | "medium" | "high" | "urgent".'],
      ['tasks', 'status', 'varchar(20) NOT NULL', '"pending" | "in_progress" | "completed" | "not_completed".'],
      ['tasks', 'category', 'varchar(50) NOT NULL', '"Work" | "Personal" | "Operations" | "Urgent" etc.'],
      ['tasks', 'incomplete_reason', 'text NULLABLE', 'Audit rationale if marked not completed.'],
      ['daily_reports', 'id', 'text PRIMARY KEY', 'Unique UUID for daily report submission.'],
      ['daily_reports', 'sender_id', 'text FK -> users.id', 'Employee or Admin who filed the report.'],
      ['daily_reports', 'tasks_summary', 'text JSON', 'Serialized snapshot of task items on report date.'],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85],
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 38 },
      3: { cellWidth: 86 },
    },
    margin: { left: margin, right: margin },
  });

  const nextY = (doc as any).lastAutoTable.finalY + 6;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('2. Dual-Storage Reconciliation & Fallback Strategy', margin, nextY);

  const strategyY = nextY + 5;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, strategyY, contentWidth, 34, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('• Optimistic Client Persistence: All CRUD operations immediately commit to LocalStorage for zero-latency UI responsiveness.', margin + 4, strategyY + 7);
  doc.text('• Async Cloud SQL Sync: The client asynchronously invokes /api/sync-batch and /api/tasks to persist records in PostgreSQL.', margin + 4, strategyY + 13);
  doc.text('• Firebase Document Fallback: Firestore database ("ai-studio-todolist-bab526b9-92bb-410b-90ea-d2321e559207") provides active replication.', margin + 4, strategyY + 19);
  doc.text('• Fault Tolerant Offline Cache: In the event of network disruption or container cold-start, client continues unhindered.', margin + 4, strategyY + 25);
  doc.text('• Automatic Reconciliation: When connection re-establishes, dirty records reconcile via upsert queries on primary keys.', margin + 4, strategyY + 31);

  return doc;
};
