const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const { User, Intern } = require('../models');

exports.generateAdviserList = async (req, res) => {
  let doc;

  try {
    /* =========================
       FETCH ADVISERS (USERS ONLY)
    ========================= */
    const advisers = await User.findAll({
      where: { role: 'Adviser' },
      order: [['lastName', 'ASC']],
    });

    /* =========================
       COUNT INTERNS PER ADVISER
    ========================= */
    for (const adviser of advisers) {
      const count = await Intern.count({
        where: {
          program: adviser.program,
        },
      });

      adviser.dataValues.internCount = count;
    }

    /* =========================
       RESPONSE HEADERS
    ========================= */
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=list_of_advisers.pdf');

    doc = new PDFDocument({
      size: 'Legal',
      layout: 'landscape',
      margin: 40,
    });

    doc.pipe(res);

    const startX = doc.page.margins.left;
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    /* =========================
       HEADER
    ========================= */
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
    doc.fontSize(14).font('Helvetica-Bold').text('LIST OF ADVISER', { align: 'center' });

    doc.moveDown(1);

    /* =========================
       TABLE HEADER
    ========================= */
    let y = doc.y;
    doc.rect(startX, y, pageWidth, 26).fill('#800000');
    doc.fillColor('white').fontSize(9).font('Helvetica-Bold');

    const cols = {
      no: { x: startX + 10, w: 40 },
      name: { x: startX + 60, w: 250 },
      email: { x: startX + 320, w: 230 },
      program: { x: startX + 560, w: 260 },
      count: { x: startX + 830, w: 90 },
    };

    doc.text('NO.', cols.no.x, y + 8, { width: cols.no.w });
    doc.text('FULL NAME', cols.name.x, y + 8, { width: cols.name.w });
    doc.text('EMAIL', cols.email.x, y + 8, { width: cols.email.w });
    doc.text('PROGRAM', cols.program.x, y + 8, { width: cols.program.w });
    doc.text('NO. OF INTERNS', cols.count.x, y + 8, {
      width: cols.count.w,
      align: 'center',
    });

    y += 26;
    doc.fillColor('black').font('Helvetica').fontSize(9);

    /* =========================
       TABLE ROWS
    ========================= */
    advisers.forEach((adviser, index) => {
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = doc.page.margins.top;
      }

      const internCount = adviser.dataValues.internCount || adviser.internCount || 0;

      doc.rect(startX, y, pageWidth, 18).stroke('#CCCCCC');

      doc.text(index + 1, cols.no.x, y + 5, { width: cols.no.w });
      doc.text(`${adviser.lastName}, ${adviser.firstName}`, cols.name.x, y + 5, { width: cols.name.w });
      doc.text(adviser.email || 'N/A', cols.email.x, y + 5, { width: cols.email.w });
      doc.text(adviser.program || 'N/A', cols.program.x, y + 5, { width: cols.program.w });
      doc.text(String(internCount), cols.count.x, y + 5, {
        width: cols.count.w,
        align: 'center',
      });

      y += 18;
    });

    doc.end();
  } catch (err) {
    console.error('❌ ADVISER LIST ERROR:', err);
    if (doc) doc.end();
    if (!res.headersSent) {
      res.status(500).json({
        message: 'Failed to generate Adviser List report',
      });
    }
  }
};
