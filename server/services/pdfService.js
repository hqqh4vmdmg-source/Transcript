const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;
const sealModel = require('../models/sealModel');
const QRCode = require('qrcode');

// Escape HTML special characters to prevent XSS in generated PDF templates
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

class PDFService {
  async generateTranscriptPDF(transcriptData, sealId = null, userId = null) {
    let browser;
    try {
      // Get seal data if seal ID is provided
      let sealData = null;
      let verificationCode = null;
      
      if (sealId) {
        sealData = await sealModel.getSealWithImage(sealId);
        if (sealData && transcriptData.id && userId) {
          // Record seal usage and get verification code
          const usage = await sealModel.recordUsage(sealId, transcriptData.id, userId);
          verificationCode = usage.verification_code;
        }
      }

      // Generate QR code for verification if we have a code
      let qrCodeDataUrl = null;
      if (verificationCode) {
        const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
        // Use https in production unless explicitly set to http
        const secureBaseUrl = process.env.NODE_ENV === 'production' && baseUrl.startsWith('http://') 
          ? baseUrl.replace('http://', 'https://') 
          : baseUrl;
        const verificationUrl = `${secureBaseUrl}/api/seals/verify/${verificationCode}`;
        qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
      }

      // Launch browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Render HTML from template with seal and QR code data
      const html = await this.renderTemplate(transcriptData, sealData, qrCodeDataUrl, verificationCode);

      // Set content
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      return pdfBuffer;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  async renderTemplate(transcriptData, sealData = null, qrCodeDataUrl = null, verificationCode = null) {
    const templatePath = transcriptData.type === 'high_school'
      ? path.join(__dirname, '../templates/highschool-transcript.ejs')
      : path.join(__dirname, '../templates/college-transcript.ejs');

    try {
      const template = await fs.readFile(templatePath, 'utf-8');
      return ejs.render(template, { 
        transcript: transcriptData,
        seal: sealData,
        qrCode: qrCodeDataUrl,
        verificationCode
      });
    } catch (_error) {
      // If template doesn't exist, use default template
      return this.getDefaultTemplate(transcriptData, sealData, qrCodeDataUrl, verificationCode);
    }
  }

  getDefaultTemplate(transcriptData, sealData = null, qrCodeDataUrl = null, verificationCode = null) {
    const { type, data, courses } = transcriptData;
    const isHighSchool = type === 'high_school';
    
    // Convert seal image data to base64 if available
    let sealImageBase64 = null;
    let sealImageMimeType = 'image/png'; // default
    if (sealData && sealData.image_data) {
      // Determine MIME type from image_path extension or metadata
      if (sealData.image_path) {
        const ext = path.extname(sealData.image_path).toLowerCase();
        const mimeTypes = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.webp': 'image/webp'
        };
        sealImageMimeType = mimeTypes[ext] || 'image/png';
      }
      sealImageBase64 = `data:${sealImageMimeType};base64,${Buffer.from(sealData.image_data).toString('base64')}`;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Times New Roman', serif;
            padding: 40px;
            color: #000;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          
          .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
          }
          
          .header h2 {
            font-size: 18px;
            font-weight: normal;
            margin-bottom: 5px;
          }
          
          .student-info {
            margin-bottom: 30px;
          }
          
          .student-info table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .student-info td {
            padding: 8px;
            border: 1px solid #000;
          }
          
          .student-info td:first-child {
            font-weight: bold;
            width: 200px;
            background-color: #f0f0f0;
          }
          
          .courses {
            margin-top: 30px;
          }
          
          .courses h3 {
            font-size: 16px;
            margin-bottom: 15px;
            text-align: center;
          }
          
          .courses table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          .courses th,
          .courses td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          
          .courses th {
            background-color: #e0e0e0;
            font-weight: bold;
            text-align: center;
          }
          
          .footer {
            margin-top: 50px;
            border-top: 2px solid #000;
            padding-top: 20px;
          }
          
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
          }
          
          .signature {
            width: 45%;
          }
          
          .signature-line {
            border-top: 1px solid #000;
            margin-top: 40px;
            padding-top: 5px;
            text-align: center;
          }
          
          .seal-section {
            position: relative;
            margin-top: 30px;
            text-align: center;
          }
          
          .seal-image {
            max-width: 150px;
            max-height: 150px;
            opacity: 0.9;
          }
          
          .verification-section {
            margin-top: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            text-align: center;
          }
          
          .qr-code {
            max-width: 100px;
            max-height: 100px;
            margin: 10px auto;
            display: block;
          }
          
          .verification-code {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            font-weight: bold;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${escapeHtml(data.schoolName) || (isHighSchool ? 'High School' : 'College')}</h1>
          <h2>Official Transcript</h2>
          <p>${escapeHtml(data.schoolAddress)}</p>
        </div>
        
        <div class="student-info">
          <table>
            <tr>
              <td>Student Name:</td>
              <td>${escapeHtml(data.studentName) || 'N/A'}</td>
            </tr>
            <tr>
              <td>Student ID:</td>
              <td>${escapeHtml(data.studentId) || 'N/A'}</td>
            </tr>
            <tr>
              <td>Date of Birth:</td>
              <td>${escapeHtml(data.dateOfBirth) || 'N/A'}</td>
            </tr>
            ${isHighSchool ? `
            <tr>
              <td>Grade Level:</td>
              <td>${escapeHtml(data.gradeLevel) || 'N/A'}</td>
            </tr>
            <tr>
              <td>Graduation Date:</td>
              <td>${escapeHtml(data.graduationDate) || 'N/A'}</td>
            </tr>
            ` : `
            <tr>
              <td>Major:</td>
              <td>${escapeHtml(data.major) || 'N/A'}</td>
            </tr>
            <tr>
              <td>Degree:</td>
              <td>${escapeHtml(data.degree) || 'N/A'}</td>
            </tr>
            <tr>
              <td>Expected Graduation:</td>
              <td>${escapeHtml(data.expectedGraduation) || 'N/A'}</td>
            </tr>
            `}
            <tr>
              <td>Cumulative GPA:</td>
              <td>${escapeHtml(data.cumulativeGPA) || 'N/A'}</td>
            </tr>
          </table>
        </div>
        
        <div class="courses">
          <h3>Academic Record</h3>
          <table>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Semester/Year</th>
                <th>Credits</th>
                <th>Grade</th>
                <th>${isHighSchool ? 'Teacher' : 'Professor'}</th>
              </tr>
            </thead>
            <tbody>
              ${courses && courses.length > 0 ? courses.map(course => `
                <tr>
                  <td>${escapeHtml(course.code)}</td>
                  <td>${escapeHtml(course.name)}</td>
                  <td>${escapeHtml(course.semester_year)}</td>
                  <td>${escapeHtml(String(course.credits))}</td>
                  <td>${escapeHtml(course.grade)}</td>
                  <td>${escapeHtml(course.teacher_professor)}</td>
                </tr>
              `).join('') : '<tr><td colspan="6" style="text-align: center;">No courses recorded</td></tr>'}
            </tbody>
          </table>
        </div>
        
        <div class="footer">
          <p><strong>Total Credits Earned:</strong> ${courses ? courses.reduce((sum, c) => sum + (parseInt(c.credits) || 0), 0) : 0}</p>
          
          <div class="signature-section">
            <div class="signature">
              <div class="signature-line">
                Registrar Signature
              </div>
            </div>
            <div class="signature">
              <div class="signature-line">
                Date: ${new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
          
          ${sealImageBase64 ? `
          <div class="seal-section">
            <img src="${sealImageBase64}" alt="Official Seal" class="seal-image" />
            <p><strong>${escapeHtml(sealData.name)}</strong></p>
          </div>
          ` : ''}
          
          ${qrCodeDataUrl && verificationCode ? `
          <div class="verification-section">
            <p><strong>Transcript Verification</strong></p>
            <img src="${qrCodeDataUrl}" alt="Verification QR Code" class="qr-code" />
            <p class="verification-code">Code: ${escapeHtml(verificationCode)}</p>
            <p style="font-size: 10px; margin-top: 5px;">Scan QR code or use verification code to verify authenticity</p>
          </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new PDFService();
