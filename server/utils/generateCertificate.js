const PDFDocument = require('pdfkit');

/**
 * Generates a detailed blood donation certificate PDF.
 * @param {object} res  - Express response object
 * @param {object} data - Certificate data
 */
function generateCertificate(res, data) {
  const {
    donorName,
    bloodType,
    quantity,
    recipientName,
    hospital,
    city,
    completedDate,
    certificateId
  } = data;

  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 40, bottom: 40, left: 50, right: 50 }
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="bloodde-certificate-${certificateId}.pdf"`
  );
  doc.pipe(res);

  const W = doc.page.width;
  const H = doc.page.height;

  // ── Background ──────────────────────────────────────────────────────────────
  doc.rect(0, 0, W, H).fill('#fff8f8');

  // ── Outer border ────────────────────────────────────────────────────────────
  doc.rect(15, 15, W - 30, H - 30).lineWidth(5).stroke('#c0392b');
  doc.rect(22, 22, W - 44, H - 44).lineWidth(1.5).stroke('#e74c3c');

  // ── Top red banner ──────────────────────────────────────────────────────────
  doc.rect(15, 15, W - 30, 65).fill('#c0392b');

  doc.fillColor('#ffffff').fontSize(10).font('Helvetica')
    .text('BLOODDE  —  BLOOD DONATION PLATFORM', 0, 28, { align: 'center', width: W });
  doc.fontSize(8)
    .text('Connecting Donors  *  Saving Lives  *  Making a Difference', 0, 46, { align: 'center', width: W });

  // ── Certificate title ───────────────────────────────────────────────────────
  doc.fillColor('#c0392b').fontSize(28).font('Helvetica-Bold')
    .text('CERTIFICATE OF BLOOD DONATION', 0, 95, { align: 'center', width: W });

  // ── Decorative line ─────────────────────────────────────────────────────────
  doc.moveTo(80, 135).lineTo(W - 80, 135).lineWidth(2).stroke('#e74c3c');

  // ── Intro text ──────────────────────────────────────────────────────────────
  doc.fillColor('#555').fontSize(12).font('Helvetica')
    .text('This is to proudly certify that', 0, 148, { align: 'center', width: W });

  // ── Donor name ──────────────────────────────────────────────────────────────
  doc.fillColor('#c0392b').fontSize(26).font('Helvetica-Bold')
    .text(donorName, 0, 168, { align: 'center', width: W });

  // ── Donation statement ──────────────────────────────────────────────────────
  doc.fillColor('#333').fontSize(12).font('Helvetica')
    .text(
      `has voluntarily and successfully donated blood, contributing to saving lives.`,
      0, 205, { align: 'center', width: W }
    );

  // ── Details box ─────────────────────────────────────────────────────────────
  const boxX = 60;
  const boxY = 228;
  const boxW = W - 120;
  const boxH = 115;

  doc.rect(boxX, boxY, boxW, boxH).lineWidth(1).fillAndStroke('#fef2f2', '#e74c3c');

  // Format date and time
  const dateObj   = completedDate ? new Date(completedDate) : new Date();
  const dateStr   = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr   = dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const place     = hospital && city ? `${hospital}, ${city}` : hospital || city || 'N/A';

  const col1X = boxX + 20;
  const col2X = boxX + boxW / 2 + 10;
  const rowH  = 22;
  let   rowY  = boxY + 14;

  const drawRow = (label, value, x, y) => {
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#555').text(label, x, y, { width: 130 });
    doc.font('Helvetica').fontSize(10).fillColor('#111').text(value || 'N/A', x + 135, y, { width: 160 });
  };

  drawRow('Blood Type:',       bloodType || 'N/A',          col1X, rowY);
  drawRow('Units Donated:',    `${quantity || 450} ml`,      col2X, rowY);
  rowY += rowH;
  drawRow('Date of Donation:', dateStr,                      col1X, rowY);
  drawRow('Time:',             timeStr,                      col2X, rowY);
  rowY += rowH;
  drawRow('Place / Hospital:', place,                        col1X, rowY);
  drawRow('Recipient Name:',   recipientName || 'Anonymous', col2X, rowY);
  rowY += rowH;
  drawRow('Certificate ID:',   certificateId,                col1X, rowY);
  drawRow('Issued By:',        'Bloodde Platform',           col2X, rowY);

  // ── Quote ───────────────────────────────────────────────────────────────────
  doc.fillColor('#777').fontSize(10).font('Helvetica-Oblique')
    .text(
      '"One blood donation can save up to 3 lives. Thank you for your selfless act of kindness."',
      80, boxY + boxH + 14,
      { align: 'center', width: W - 160 }
    );

  // ── Signature section ───────────────────────────────────────────────────────
  const sigY    = H - 105;
  const sig1X   = 90;
  const sig2X   = W / 2 - 80;
  const sig3X   = W - 270;
  const sigW    = 160;

  const drawSig = (x, label, sublabel) => {
    // Signature space box
    doc.rect(x, sigY - 35, sigW, 35).lineWidth(0.5).stroke('#ddd');
    doc.fillColor('#bbb').fontSize(8).font('Helvetica-Oblique')
      .text('(Signature)', x, sigY - 22, { width: sigW, align: 'center' });
    // Line
    doc.moveTo(x, sigY + 2).lineTo(x + sigW, sigY + 2).lineWidth(1).stroke('#999');
    doc.fillColor('#333').fontSize(9).font('Helvetica-Bold')
      .text(label, x, sigY + 8, { width: sigW, align: 'center' });
    doc.fillColor('#777').fontSize(8).font('Helvetica')
      .text(sublabel, x, sigY + 20, { width: sigW, align: 'center' });
  };

  drawSig(sig1X, 'Donor Signature',       donorName);
  drawSig(sig2X, 'Medical Officer',       'Hospital Authority');
  drawSig(sig3X, 'Authorized Signatory',  'Bloodde Platform');

  // ── Bottom footer ────────────────────────────────────────────────────────────
  doc.rect(15, H - 55, W - 30, 40).fill('#c0392b');
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica')
    .text(
      `Certificate ID: ${certificateId}   |   Generated: ${new Date().toLocaleDateString('en-IN')}   |   Bloodde Blood Donation Platform   |   Every drop counts`,
      0, H - 43,
      { align: 'center', width: W }
    );

  doc.end();
}

module.exports = generateCertificate;
