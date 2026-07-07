import PDFDocument from "pdfkit";

/**
 * Generates a beautiful professional PDF from a structured resume JSON object
 */
export const generateResumePDF = (resume: any, theme?: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // Colors & Styling based on theme selection
      let primaryColor = "#1A3C5E"; // Deep Navy (Classic)
      let secondaryColor = "#2E6DA4"; // Accent Blue
      let darkColor = "#1A1A1A"; // Off Black text
      let grayColor = "#555555"; // Cool Slate subtext
      let lightGrayColor = "#D5D5D5"; // Divider line color
      let fontName = "Helvetica";
      let fontBold = "Helvetica-Bold";
      let fontOblique = "Helvetica-Oblique";

      const selectedTheme = theme || resume.theme || "classic";

      if (selectedTheme === "modern") {
        primaryColor = "#0D9488"; // Teal
        secondaryColor = "#0F766E"; // Darker Teal accent
        darkColor = "#1F2937"; // Charcoal Dark
        grayColor = "#4B5563"; // Medium Gray
        lightGrayColor = "#E5E7EB"; // Light border
      } else if (selectedTheme === "minimalist") {
        primaryColor = "#111827"; // Off-Black
        secondaryColor = "#374151"; // Cool Dark Gray
        darkColor = "#1F2937"; // Dark text
        grayColor = "#6B7280"; // Muted Slate
        lightGrayColor = "#E5E7EB"; // Light divider
        fontName = "Times-Roman";
        fontBold = "Times-Bold";
        fontOblique = "Times-Italic";
      } else if (selectedTheme === "creative") {
        primaryColor = "#9D174D"; // Ruby Pink
        secondaryColor = "#BE185D"; // Pink Accent
        darkColor = "#0F172A"; // Slate Off Black
        grayColor = "#475569"; // Slate Gray
        lightGrayColor = "#E2E8F0"; // Slate line
      }

      // --- 1. HEADER SECTION ---
      doc
        .fillColor(primaryColor)
        .fontSize(22)
        .font(fontBold)
        .text(resume.name || "Unnamed Candidate", { align: "center" });

      doc.moveDown(0.2);

      // Contact bar (horizontal alignment, centered)
      const contact = resume.contact || {};
      const contactInfo = [
        contact.email,
        contact.phone,
        contact.location,
        contact.linkedin,
        contact.github,
        contact.portfolio,
      ]
        .filter(Boolean)
        .join("  |  ");

      doc
        .fillColor(grayColor)
        .fontSize(9)
        .font(fontName)
        .text(contactInfo, { align: "center" });

      doc.moveDown(1.2);

      // Utility function for drawing section dividers
      const addSectionHeading = (title: string) => {
        doc.moveDown(0.8);
        const yPos = doc.y;
        doc
          .fillColor(primaryColor)
          .fontSize(12)
          .font(fontBold)
          .text(title.toUpperCase(), 50, yPos);

        // Underline divider
        doc
          .strokeColor(lightGrayColor)
          .lineWidth(1)
          .moveTo(50, yPos + 16)
          .lineTo(545, yPos + 16)
          .stroke();

        doc.moveDown(0.6);
      };

      // --- 2. SUMMARY ---
      if (resume.summary) {
        addSectionHeading("Professional Summary");
        doc
          .fillColor(darkColor)
          .fontSize(10)
          .font(fontName)
          .text(resume.summary, { align: "justify", lineGap: 3 });
      }

      // --- 3. SKILLS ---
      if (resume.skills) {
        addSectionHeading("Technical Skills");
        let skillsText = "";
        const skillsObj = resume.skills;

        const categories = [
          { label: "Languages", key: "languages" },
          { label: "Frameworks/Libraries", key: "frameworks" },
          { label: "Databases", key: "databases" },
          { label: "Tools/Platforms", key: "tools" },
          { label: "Methodologies/Concepts", key: "concepts" },
        ];

        categories.forEach((cat) => {
          const list = skillsObj[cat.key];
          if (Array.isArray(list) && list.length > 0) {
            skillsText += `•  ${cat.label}: ${list.join(", ")}\n`;
          }
        });

        // Fallback for flat array or custom format
        if (!skillsText && Array.isArray(skillsObj)) {
          skillsText = `•  Skills: ${skillsObj.join(", ")}\n`;
        } else if (!skillsText && typeof skillsObj === "string") {
          skillsText = `•  Skills: ${skillsObj}\n`;
        }

        if (skillsText) {
          doc
            .fillColor(darkColor)
            .fontSize(10)
            .font(fontName)
            .text(skillsText.trim(), { lineGap: 4 });
        }
      }

      // --- 4. EXPERIENCE ---
      if (Array.isArray(resume.experience) && resume.experience.length > 0) {
        addSectionHeading("Professional Experience");

        resume.experience.forEach((exp: any, index: number) => {
          if (index > 0) doc.moveDown(0.5);

          const yPos = doc.y;
          // Left side: Title and Company
          doc
            .fillColor(darkColor)
            .fontSize(11)
            .font(fontBold)
            .text(exp.title || "Position", 50, yPos);

          const companyAndLocation = [exp.company, exp.location].filter(Boolean).join(", ");
          doc
            .fillColor(grayColor)
            .fontSize(10)
            .font(fontOblique)
            .text(companyAndLocation, 50, doc.y);

          // Right side: Dates (on the same horizontal level as title)
          const dates = [exp.startDate, exp.endDate].filter(Boolean).join(" - ");
          if (dates) {
            doc
              .fillColor(grayColor)
              .fontSize(10)
              .font(fontName)
              .text(dates, 400, yPos, { align: "right" });
          }

          doc.moveDown(0.3);

          // Bullet points
          if (Array.isArray(exp.bullets)) {
            exp.bullets.forEach((bullet: string) => {
              doc
                .fillColor(darkColor)
                .fontSize(9.5)
                .font(fontName)
                .text(`•  ${bullet}`, 65, doc.y, { align: "justify", lineGap: 2 });
            });
          }
          doc.moveDown(0.4);
        });
      }

      // --- 5. PROJECTS ---
      if (Array.isArray(resume.projects) && resume.projects.length > 0) {
        addSectionHeading("Key Projects");

        resume.projects.forEach((proj: any, index: number) => {
          if (index > 0) doc.moveDown(0.5);

          const yPos = doc.y;
          doc
            .fillColor(darkColor)
            .fontSize(11)
            .font(fontBold)
            .text(proj.name || "Project", 50, yPos);

          // Tech stack under name
          if (Array.isArray(proj.tech) && proj.tech.length > 0) {
            doc
              .fillColor(secondaryColor)
              .fontSize(9)
              .font(fontBold)
              .text(`Technologies: ${proj.tech.join(", ")}`, 50, doc.y);
          }

          // Project links
          const links = [proj.liveUrl, proj.githubUrl].filter(Boolean).join(" | ");
          if (links) {
            doc
              .fillColor(grayColor)
              .fontSize(8.5)
              .font(fontName)
              .text(links, 400, yPos, { align: "right" });
          }

          doc.moveDown(0.3);

          // Bullet points
          if (Array.isArray(proj.bullets)) {
            proj.bullets.forEach((bullet: string) => {
              doc
                .fillColor(darkColor)
                .fontSize(9.5)
                .font(fontName)
                .text(`•  ${bullet}`, 65, doc.y, { align: "justify", lineGap: 2 });
            });
          }
          doc.moveDown(0.4);
        });
      }

      // --- 6. EDUCATION ---
      if (Array.isArray(resume.education) && resume.education.length > 0) {
        addSectionHeading("Education");

        resume.education.forEach((edu: any, index: number) => {
          if (index > 0) doc.moveDown(0.4);

          const yPos = doc.y;
          const degreeStr = [edu.degree, edu.major].filter(Boolean).join(" in ");
          doc
            .fillColor(darkColor)
            .fontSize(11)
            .font(fontBold)
            .text(degreeStr || "Degree", 50, yPos);

          const instAndLoc = [edu.institution, edu.location].filter(Boolean).join(", ");
          doc
            .fillColor(grayColor)
            .fontSize(10)
            .font(fontName)
            .text(instAndLoc, 50, doc.y);

          // Graduation Year & GPA
          const gradAndGpa = [
            edu.graduation ? `Graduated: ${edu.graduation}` : null,
            edu.gpa ? `GPA: ${edu.gpa}` : null,
            edu.percentage ? `Percentage: ${edu.percentage}` : null,
          ]
            .filter(Boolean)
            .join("  |  ");

          if (gradAndGpa) {
            doc
              .fillColor(grayColor)
              .fontSize(9.5)
              .font(fontName)
              .text(gradAndGpa, 400, yPos, { align: "right" });
          }
          doc.moveDown(0.3);
        });
      }

      // --- 7. CERTIFICATIONS ---
      if (Array.isArray(resume.certifications) && resume.certifications.length > 0) {
        addSectionHeading("Certifications");

        resume.certifications.forEach((cert: any) => {
          const nameStr = cert.name || "Certification";
          const issuerStr = cert.issuer ? `(${cert.issuer})` : "";
          const dateStr = cert.date ? `- ${cert.date}` : "";
          const credStr = cert.credentialId ? `[ID: ${cert.credentialId}]` : "";

          doc
            .fillColor(darkColor)
            .fontSize(9.5)
            .font(fontName)
            .text(`•  ${nameStr} ${issuerStr} ${dateStr} ${credStr}`, 65, doc.y, { lineGap: 3 });
        });
      }

      // Complete Document
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
