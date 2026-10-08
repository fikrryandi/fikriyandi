import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function generateCV() {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const primaryColor = rgb(0 / 255, 120 / 255, 215 / 255);
  const darkColor = rgb(25 / 255, 30 / 255, 45 / 255);
  const grayColor = rgb(100 / 255, 110 / 255, 125 / 255);
  const lightBg = rgb(245 / 255, 248 / 255, 252 / 255);

  // PAGE 1
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  // Header background banner
  page1.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: lightBg,
  });

  // Top accent bar
  page1.drawRectangle({
    x: 0,
    y: height - 6,
    width: width,
    height: 6,
    color: primaryColor,
  });

  // Name
  page1.drawText('FIKRI YANDI, S.T.', {
    x: 40,
    y: height - 50,
    size: 24,
    font: fontBold,
    color: darkColor,
  });

  // Subtitle
  page1.drawText('INDUSTRIAL ENGINEERING  •  PPIC & OPERATIONS SPECIALIST', {
    x: 40,
    y: height - 72,
    size: 11,
    font: fontBold,
    color: primaryColor,
  });

  // Contact line
  page1.drawText('Purwakarta, Indonesia  |  fikrryandi@gmail.com  |  +62 838-1774-5869  |  linkedin.com/in/fikri-yandi', {
    x: 40,
    y: height - 92,
    size: 9,
    font: fontRegular,
    color: grayColor,
  });

  let currentY = height - 150;

  // SECTION HELPER
  const drawSectionTitle = (page, title, y) => {
    page.drawText(title.toUpperCase(), {
      x: 40,
      y: y,
      size: 12,
      font: fontBold,
      color: primaryColor,
    });
    page.drawLine({
      start: { x: 40, y: y - 5 },
      end: { x: width - 40, y: y - 5 },
      thickness: 1,
      color: rgb(215 / 255, 225 / 255, 235 / 255),
    });
    return y - 22;
  };

  // ABOUT / SUMMARY
  currentY = drawSectionTitle(page1, 'Ringkasan Profesional', currentY);

  const summaryLines = [
    'Lulusan Sarjana Teknik Industri dari STT Wastukancana Purwakarta (IPK 3.85 / 4.00) dengan fokus pada Continuous',
    'Improvement, perancangan sistem operasional manufaktur, dan tata kelola logistik PPIC (Production Planning & Inventory',
    'Control). Memiliki rekam jejak praktis di PT Velasto Indonesia dalam otomasi administrasi pengiriman ekspor, implementasi',
    'sistem scan QR Code, standardisasi 5S/Kaizen, serta pengembangan software web operasional untuk efisiensi rantai pasok.',
  ];

  for (const line of summaryLines) {
    page1.drawText(line, {
      x: 40,
      y: currentY,
      size: 9.5,
      font: fontRegular,
      color: darkColor,
    });
    currentY -= 14;
  }

  currentY -= 12;

  // PENGALAMAN KERJA
  currentY = drawSectionTitle(page1, 'Pengalaman Kerja', currentY);

  // Experience 1
  page1.drawText('PT Velasto Indonesia', {
    x: 40,
    y: currentY,
    size: 11,
    font: fontBold,
    color: darkColor,
  });
  page1.drawText('Agustus 2024 - Sekarang', {
    x: width - 180,
    y: currentY,
    size: 9.5,
    font: fontBold,
    color: primaryColor,
  });
  currentY -= 14;

  page1.drawText('Staff Komite Digitalisasi, Otomasi & PPIC (Delivery)', {
    x: 40,
    y: currentY,
    size: 10,
    font: fontOblique,
    color: grayColor,
  });
  currentY -= 16;

  const velastoBullets = [
    'Mengelola administrasi dan kontrol jadwal pengiriman (delivery dispatch) ekspor dan domestik secara tepat waktu.',
    'Mengembangkan dan mengimplementasikan sistem scan barcode/QR code guna meminimalkan kesalahan validasi manual.',
    'Memimpin inisiatif Continuous Improvement (QCC, QCP, 5S) untuk mengeliminasi bottleneck proses pengiriman barang.',
    'Merancang sistem aplikasi web internal berbasis Node.js & React untuk monitoring data logistik secara real-time.',
    'Melakukan koordinasi intensif lintas divisi produksi, gudang logistik, dan supplier pihak ketiga.',
  ];

  for (const bullet of velastoBullets) {
    page1.drawText('•', { x: 48, y: currentY, size: 9, font: fontBold, color: primaryColor });
    page1.drawText(bullet, { x: 60, y: currentY, size: 9, font: fontRegular, color: darkColor });
    currentY -= 13;
  }

  currentY -= 12;

  // Experience 2
  page1.drawText('PT Flexora Polymer Internasional', {
    x: 40,
    y: currentY,
    size: 11,
    font: fontBold,
    color: darkColor,
  });
  page1.drawText('2023 - 2024', {
    x: width - 180,
    y: currentY,
    size: 9.5,
    font: fontBold,
    color: primaryColor,
  });
  currentY -= 14;

  page1.drawText('Project Coordinator & Operations Lead', {
    x: 40,
    y: currentY,
    size: 10,
    font: fontOblique,
    color: grayColor,
  });
  currentY -= 16;

  const flexoraBullets = [
    'Merumuskan strategi operational excellence dan tata kelola inventory bahan baku polimer.',
    'Menerapkan prinsip lean manufacturing untuk mereduksi waste produksi hingga 15% pada lini utama.',
    'Menyusun KPI operasional dan laporan performa berkala kepada jajaran dewan manajemen.',
  ];

  for (const bullet of flexoraBullets) {
    page1.drawText('•', { x: 48, y: currentY, size: 9, font: fontBold, color: primaryColor });
    page1.drawText(bullet, { x: 60, y: currentY, size: 9, font: fontRegular, color: darkColor });
    currentY -= 13;
  }

  currentY -= 12;

  // PENDIDIKAN
  currentY = drawSectionTitle(page1, 'Riwayat Pendidikan', currentY);

  page1.drawText('Sekolah Tinggi Teknologi (STT) Wastukancana Purwakarta', {
    x: 40,
    y: currentY,
    size: 11,
    font: fontBold,
    color: darkColor,
  });
  page1.drawText('2022 - 2026', {
    x: width - 180,
    y: currentY,
    size: 9.5,
    font: fontBold,
    color: primaryColor,
  });
  currentY -= 14;

  page1.drawText('Sarjana Teknik (S.T.) - Teknik Industri  |  IPK: 3.85 / 4.00 (Cum Laude)', {
    x: 40,
    y: currentY,
    size: 9.5,
    font: fontRegular,
    color: grayColor,
  });
  currentY -= 15;

  const eduBullets = [
    'Fokus Penelitian: Optimasi Penjadwalan Pengiriman Ekspor dengan Pendekatan Lean Manufacturing & Line Balancing.',
    'Aktif dalam Himpunan Mahasiswa Teknik Industri dan studi perancangan tata letak fasilitas pabrik.',
  ];
  for (const b of eduBullets) {
    page1.drawText('•', { x: 48, y: currentY, size: 8.5, font: fontBold, color: primaryColor });
    page1.drawText(b, { x: 60, y: currentY, size: 8.5, font: fontRegular, color: darkColor });
    currentY -= 12;
  }

  // Footer Page 1
  page1.drawText('Curriculum Vitae  •  Fikri Yandi  •  Halaman 1 dari 2', {
    x: width / 2 - 80,
    y: 25,
    size: 8,
    font: fontRegular,
    color: grayColor,
  });

  // PAGE 2 (PROYEK, SKILL, SERTIFIKASI & PUBLIKASI)
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  
  // Top accent bar
  page2.drawRectangle({
    x: 0,
    y: height - 6,
    width: width,
    height: 6,
    color: primaryColor,
  });

  let p2Y = height - 45;

  p2Y = drawSectionTitle(page2, 'Keahlian & Kompetensi Teknis', p2Y);

  const skillCategories = [
    { title: 'Industri & Manufaktur', items: 'Lean Manufacturing, PPIC, Line Balancing, Kaizen/5S, Six Sigma, Quality Control Circle (QCC)' },
    { title: 'Perangkat Lunak Produktivitas', items: 'Microsoft Excel (Advanced Macro/VBA), Microsoft Word, PowerPoint, Visio, Canva' },
    { title: 'Teknologi & Pengembangan Web', items: 'JavaScript, TypeScript, React, Node.js, ASP.NET, SQL Server, MySQL, REST API, Git' },
    { title: 'Bahasa & Soft Skills', items: 'Bahasa Indonesia (Native), English (Professional), Kepemimpinan Tim, Negosiasi Supplier' },
  ];

  for (const cat of skillCategories) {
    page2.drawText(cat.title + ':', {
      x: 40,
      y: p2Y,
      size: 9.5,
      font: fontBold,
      color: darkColor,
    });
    page2.drawText(cat.items, {
      x: 200,
      y: p2Y,
      size: 9,
      font: fontRegular,
      color: darkColor,
    });
    p2Y -= 15;
  }

  p2Y -= 15;

  p2Y = drawSectionTitle(page2, 'Portofolio & Proyek Pilihan', p2Y);

  const projects = [
    {
      title: 'Nexus Inventory System (PT Vertex / Industri Otomotif)',
      desc: 'Sistem manajemen persediaan berkinerja tinggi untuk lantai manufaktur dengan pelacakan real-time dan algoritma restock prediktif.',
      tech: 'ASP.NET, SQL Server, C#, Barcode Integration'
    },
    {
      title: 'AeroRoute Logistics Optimizer',
      desc: 'Platform visualisasi logistik dan pemetaan inefisiensi supply chain menggunakan analisis spasial dan dashboard interaktif.',
      tech: 'React, Node.js, Express, Leaflet Maps, REST API'
    },
    {
      title: 'Digital Delivery Dispatch & Scan QR System',
      desc: 'Aplikasi internal verifikasi muatan kontainer pengiriman ekspor untuk mencegah human error dalam packing list.',
      tech: 'React Native, Node.js, Web-Socket, PostgreSql'
    },
  ];

  for (const proj of projects) {
    page2.drawText(proj.title, { x: 40, y: p2Y, size: 10, font: fontBold, color: darkColor });
    p2Y -= 13;
    page2.drawText(proj.desc, { x: 40, y: p2Y, size: 8.5, font: fontRegular, color: darkColor });
    p2Y -= 12;
    page2.drawText('Teknologi: ' + proj.tech, { x: 40, y: p2Y, size: 8, font: fontOblique, color: primaryColor });
    p2Y -= 16;
  }

  p2Y -= 10;

  p2Y = drawSectionTitle(page2, 'Publikasi Ilmiah & Sertifikasi', p2Y);

  page2.drawText('Publikasi Jurnal:', { x: 40, y: p2Y, size: 9.5, font: fontBold, color: darkColor });
  p2Y -= 14;
  page2.drawText('• Analisis & Optimasi Penjadwalan Pengiriman Ekspor Menggunakan Pendekatan Lean Manufacturing & Line Balancing', { x: 48, y: p2Y, size: 8.5, font: fontRegular, color: darkColor });
  p2Y -= 12;
  page2.drawText('  Jurnal Rekayasa Sistem & Industri (JRSI), Tahun 2024.', { x: 48, y: p2Y, size: 8, font: fontOblique, color: grayColor });
  p2Y -= 16;

  page2.drawText('Sertifikasi Profesional:', { x: 40, y: p2Y, size: 9.5, font: fontBold, color: darkColor });
  p2Y -= 14;
  const certs = [
    '• Sertifikasi Lean Manufacturing & Continuous Improvement - Asosiasi Manajemen Industri (2024)',
    '• Professional Data Analysis & Advanced Excel for Supply Chain - Microsoft & Dikti (2023)',
    '• Front-End & Fullstack Web Application Development - BNSP (2023)',
  ];
  for (const c of certs) {
    page2.drawText(c, { x: 48, y: p2Y, size: 8.5, font: fontRegular, color: darkColor });
    p2Y -= 13;
  }

  // Footer Page 2
  page2.drawText('Curriculum Vitae  •  Fikri Yandi  •  Halaman 2 dari 2', {
    x: width / 2 - 80,
    y: 25,
    size: 8,
    font: fontRegular,
    color: grayColor,
  });

  const pdfBytes = await pdfDoc.save();
  const outputPath = path.resolve('public/Fikri_Yandi_CV.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log('Successfully generated Fikri_Yandi_CV.pdf at', outputPath);
}

generateCV();
