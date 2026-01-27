const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { Intern, InternDocuments, User, Company } = require('../models');

exports.generateInternSubmittedDocuments = async (req, res) => {
  let doc;

  try {
    const { program } = req.body;
    if (!program) {
      return res.status(400).json({ message: 'Program is required' });
    }

    const interns = await Intern.findAll({
      where: { program },
      include: [
        {
          model: User,
          as: 'User',
          required: true,
          attributes: ['firstName', 'lastName'],
        },
        {
          model: InternDocuments,
          as: 'InternDocuments',
          required: false,
        },
        {
          model: Company,
          as: 'company',
          required: false,
          attributes: ['moaFile'],
        },
      ],
      order: [[{ model: User, as: 'User' }, 'lastName', 'ASC']],
    });

    const adviser = await User.findOne({
      where: { role: 'adviser', program },
    });

    const adviserName = adviser ? `${adviser.firstName} ${adviser.lastName}`.toUpperCase() : 'N/A';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=interns_submitted_documents.pdf');

    doc = new PDFDocument({
      size: 'Legal',
      layout: 'landscape',
      margin: 40,
    });

    doc.pipe(res);

    const startX = doc.page.margins.left;
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    const logoPath = path.join(process.cwd(), 'pup_1904_flat.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, startX, 35, { width: 50 });
    }

    doc
      .fontSize(8)
      .text('REPUBLIC OF THE PHILIPPINES', startX + 70, 40)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('POLYTECHNIC UNIVERSITY OF THE PHILIPPINES', startX + 70, 52)
      .fontSize(8)
      .font('Helvetica')
      .text('OFFICE OF THE VICE PRESIDENT FOR CAMPUSES', startX + 70, 66)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('MARIVELES, BATAAN CAMPUS', startX + 70, 78);

    doc
      .moveTo(startX, 100)
      .lineTo(doc.page.width - doc.page.margins.right, 100)
      .stroke();

    doc.moveDown(2);
    doc.fontSize(14).font('Helvetica-Bold').text('INTERNS SUBMITTED DOCUMENTS', { align: 'center' });

    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica-Bold').text(`PROGRAM: ${program.toUpperCase()}`, { align: 'center' });

    doc.moveDown(0.3);
    doc.fontSize(9).font('Helvetica').text(`ADVISER: ${adviserName}`, { align: 'center' });

    doc.moveDown(1);

    let y = doc.y;
    doc.rect(startX, y, pageWidth, 26).fill('#800000');
    doc.fillColor('white').fontSize(8).font('Helvetica-Bold');

    const cols = {
      no: { x: startX + 5, w: 30 },
      name: { x: startX + 40, w: 210 },
      nc: { x: startX + 260, w: 90 },
      med: { x: startX + 360, w: 90 },
      ins: { x: startX + 460, w: 70 },
      moa: { x: startX + 540, w: 60 },
      cor: { x: startX + 610, w: 60 },
      ia: { x: startX + 680, w: 120 },
      res: { x: startX + 810, w: 70 },
    };

    doc.text('NO.', cols.no.x, y + 8, { width: cols.no.w });
    doc.text('STUDENT NAME', cols.name.x, y + 8, { width: cols.name.w });
    doc.text('NOTARIZED AGREEMENT', cols.nc.x, y + 8, { width: cols.nc.w, align: 'center' });
    doc.text('MEDICAL CERT', cols.med.x, y + 8, { width: cols.med.w, align: 'center' });
    doc.text('INSURANCE', cols.ins.x, y + 8, { width: cols.ins.w, align: 'center' });
    doc.text('MOA', cols.moa.x, y + 8, { width: cols.moa.w, align: 'center' });
    doc.text('COR', cols.cor.x, y + 8, { width: cols.cor.w, align: 'center' });
    doc.text('CONSENT FORM', cols.ia.x, y + 8, { width: cols.ia.w, align: 'center' });
    doc.text('RESUME', cols.res.x, y + 8, { width: cols.res.w, align: 'center' });

    y += 26;
    doc.fillColor('black').font('Helvetica').fontSize(9);

    // ✅ Use simple YES/NO or checkboxes instead of Unicode characters
    const mark = (val) => {
      if (val && val !== '' && val !== null && val !== undefined) {
        return 'YES'; // or use '[X]' for checkbox style
      }
      return 'NO'; // or use '[ ]' for empty checkbox
    };

    interns.forEach((intern, index) => {
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = doc.page.margins.top;
      }

      const internData = intern.get({ plain: true });
      const docs = internData.InternDocuments || {};
      const user = internData.User;
      const company = internData.company;

      if (!user) return;

      doc.rect(startX, y, pageWidth, 18).stroke('#CCCCCC');

      doc.text(index + 1, cols.no.x, y + 5);
      doc.text(`${user.lastName || 'N/A'}, ${user.firstName || 'N/A'}`.trim(), cols.name.x, y + 5, {
        width: cols.name.w,
      });
      doc.text(mark(docs.notarized_agreement), cols.nc.x, y + 5, { width: cols.nc.w, align: 'center' });
      doc.text(mark(docs.medical_cert), cols.med.x, y + 5, { width: cols.med.w, align: 'center' });
      doc.text(mark(docs.insurance), cols.ins.x, y + 5, { width: cols.ins.w, align: 'center' });
      doc.text(mark(company?.moaFile), cols.moa.x, y + 5, { width: cols.moa.w, align: 'center' });
      doc.text(mark(docs.cor), cols.cor.x, y + 5, { width: cols.cor.w, align: 'center' });
      doc.text(mark(docs.consent_form), cols.ia.x, y + 5, { width: cols.ia.w, align: 'center' });
      doc.text(mark(docs.resume), cols.res.x, y + 5, { width: cols.res.w, align: 'center' });

      y += 18;
    });

    doc.end();
  } catch (err) {
    console.error('❌ INTERN DOCUMENT MATRIX ERROR:', err);
    if (doc) doc.end();
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to generate Intern Submitted Documents report' });
    }
  }
};
