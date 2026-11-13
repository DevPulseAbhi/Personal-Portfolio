import fs from 'node:fs';
import path from 'node:path';
import PDFDocument from 'pdfkit';

const outputDirectory = path.resolve('public/resume');
const outputPath = path.join(outputDirectory, 'Abhinav_Deshwal_Resume.pdf');
fs.mkdirSync(outputDirectory, { recursive: true });

const document = new PDFDocument({ size: 'A4', margin: 42, info: { Title: 'Abhinav Deshwal Resume', Author: 'Abhinav Deshwal' } });
document.pipe(fs.createWriteStream(outputPath));

const colors = { ink: '#17201e', muted: '#4d5a56', accent: '#08705d' };
const width = document.page.width - document.page.margins.left - document.page.margins.right;

function ensureSpace(height = 50) {
  if (document.y + height > document.page.height - document.page.margins.bottom) document.addPage();
}

function sectionHeading(text) {
  ensureSpace(32);
  document.moveDown(0.7).font('Helvetica-Bold').fontSize(11).fillColor(colors.accent).text(text.toUpperCase());
  document.moveTo(document.page.margins.left, document.y + 4).lineTo(document.page.width - document.page.margins.right, document.y + 4).strokeColor('#d6dfdb').stroke();
  document.moveDown(0.45);
}

function body(text, options = {}) {
  ensureSpace(options.height || 24);
  document.font(options.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(options.size || 8.6).fillColor(options.color || colors.muted).text(text, { width, lineGap: 2, continued: false });
}

function bullet(text) {
  ensureSpace(20);
  document.font('Helvetica').fontSize(8.2).fillColor(colors.muted).text(`• ${text}`, { width: width - 8, indent: 8, lineGap: 1.5 });
}

// Header
document.font('Helvetica-Bold').fontSize(25).fillColor(colors.ink).text('ABHINAV DESHWAL');
document.moveDown(0.15).font('Helvetica').fontSize(9).fillColor(colors.accent).text('MCA STUDENT  |  CLOUD COMPUTING & DEVOPS  |  FULL-STACK DEVELOPER');
document.moveDown(0.55).fontSize(8.2).fillColor(colors.muted).text('Meerut, India  |  abhinavdeshwal01@gmail.com  |  github.com/DevPulseAbhi  |  linkedin.com/in/devpulseabhi  |  abhinavdeshwal.dev');

sectionHeading('Profile');
body('MCA student specializing in Cloud Computing and DevOps, with a B.Sc. in Computer Science and hands-on full-stack project experience across Firebase, React.js, Java, and Python. Built and deployed a cloud-hosted booking platform and developed database-backed applications using Cloud Firestore, MySQL, and Oracle. Seeking an entry-level Cloud/DevOps or Full-Stack Developer role focused on deployment workflows, automation, and scalable software.', { size: 8.7 });
body('Java  |  Python  |  JavaScript  |  React.js  |  Firebase  |  MySQL  |  Oracle  |  Git & GitHub', { bold: true, color: colors.ink, height: 22 });

sectionHeading('Projects');
body('ODYVIA - Cloud-Based Travel Booking Platform', { bold: true, color: colors.ink });
body('Tech: HTML5, CSS3, JavaScript, Firebase Authentication, Google Sign-In, Cloud Firestore, Firebase Hosting');
bullet('Developed a responsive travel booking web application with authentication and Google Sign-In.');
bullet('Integrated Cloud Firestore for booking data and built an end-to-end booking workflow without a payment gateway.');
bullet('Deployed the application to the cloud using Firebase Hosting.');

body('LEARNWISE - Adaptive Learning System', { bold: true, color: colors.ink, height: 30 });
body('Tech: React.js, Java, MySQL, Hibernate, REST APIs, Apache Tomcat, Maven');
bullet('Developed a full-stack adaptive learning platform for personalized learning experiences.');
bullet('Built a React.js frontend integrated with a Java backend through REST APIs and Maven-managed builds.');
bullet('Designed registration, login, and learning functionality with MySQL and Hibernate persistence.');

body('CLOUDLEDGER - Cloud Resource Cost Analyzer', { bold: true, color: colors.ink, height: 30 });
body('Tech: Python, Streamlit, Oracle Database, SQL, PL/SQL');
bullet('Developed a dashboard for cloud resource cost visibility and monitoring.');
bullet('Built the interface with Python and Streamlit and integrated Oracle Database with SQL and PL/SQL.');

sectionHeading('Education');
body('MASTER OF COMPUTER APPLICATIONS (MCA)  |  Chandigarh University - Cloud Computing and DevOps  |  Pursuing', { bold: true, color: colors.ink });
body('B.SC. IN COMPUTER SCIENCE  |  Chaudhary Charan Singh University, Meerut  |  Completed');

sectionHeading('Technical Skills');
body('Languages: Java, Python, JavaScript, C, C++, SQL, PL/SQL');
body('Frontend & Backend: HTML5, CSS3, React.js, REST API development, Hibernate, Firebase integration');
body('Databases: MySQL, Oracle Database, Cloud Firestore');
body('Cloud & DevOps: Firebase Hosting, Git, GitHub, Oracle VM VirtualBox, cloud computing concepts, CI/CD fundamentals, Linux');
body('Tools: VS Code, Maven, Apache Tomcat, Streamlit');

sectionHeading('Hackathons');
body('PECATHON 2026 - Punjab Engineering College', { bold: true, color: colors.ink });
body('Team participation on privacy-focused and developer-assistance problem statements.');

document.end();
console.log(`Generated ${outputPath}`);
