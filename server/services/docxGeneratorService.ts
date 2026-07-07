import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  AlignmentType,
  HeadingLevel,
} from "docx";

/**
 * Generates an ATS-safe DOCX Buffer from a structured resume JSON object
 */
export const generateResumeDOCX = async (resume: any, theme?: string): Promise<Buffer> => {
  let primaryColor = "1A3C5E"; // Deep Navy Hex (Classic)
  let secondaryColor = "2E6DA4"; // Accent Blue Hex
  let darkColor = "1A1A1A"; // Off Black Hex
  let grayColor = "555555"; // Gray Slate Hex
  let fontName = "Arial";

  const selectedTheme = theme || resume.theme || "classic";

  if (selectedTheme === "modern") {
    primaryColor = "0D9488"; // Teal
    secondaryColor = "0F766E"; // Darker Teal accent
    darkColor = "1F2937"; // Charcoal Dark
    grayColor = "4B5563"; // Medium Gray
    fontName = "Arial";
  } else if (selectedTheme === "minimalist") {
    primaryColor = "111827"; // Off-Black
    secondaryColor = "374151"; // Cool Dark Gray
    darkColor = "1F2937"; // Dark text
    grayColor = "6B7280"; // Muted Slate
    fontName = "Times New Roman";
  } else if (selectedTheme === "creative") {
    primaryColor = "9D174D"; // Ruby Pink
    secondaryColor = "BE185D"; // Pink Accent
    darkColor = "0F172A"; // Slate Off Black
    grayColor = "475569"; // Slate Gray
    fontName = "Georgia";
  }

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
    .join("   |   ");

  const children: any[] = [];

  // --- 1. HEADER (Candidate Name) ---
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 100 },
      children: [
        new TextRun({
          text: resume.name || "Unnamed Candidate",
          bold: true,
          size: 32, // 16pt
          color: primaryColor,
          font: fontName,
        }),
      ],
    })
  );

  // Contact line
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      children: [
        new TextRun({
          text: contactInfo,
          size: 18, // 9pt
          color: grayColor,
          font: fontName,
        }),
      ],
    })
  );

  // Utility to generate a styled Section Heading
  const addSectionHeading = (title: string) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 24, // 12pt
            color: primaryColor,
            font: fontName,
          }),
        ],
      })
    );
  };

  // --- 2. SUMMARY ---
  if (resume.summary) {
    addSectionHeading("Professional Summary");
    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 160, line: 280 },
        children: [
          new TextRun({
            text: resume.summary,
            size: 20, // 10pt
            color: darkColor,
            font: fontName,
          }),
        ],
      })
    );
  }

  // --- 3. SKILLS ---
  if (resume.skills) {
    addSectionHeading("Technical Skills");
    const skillsObj = resume.skills;

    const categories = [
      { label: "Languages", key: "languages" },
      { label: "Frameworks & Libraries", key: "frameworks" },
      { label: "Databases", key: "databases" },
      { label: "Tools & Platforms", key: "tools" },
      { label: "Concepts & Methodologies", key: "concepts" },
    ];

    categories.forEach((cat) => {
      const list = skillsObj[cat.key];
      if (Array.isArray(list) && list.length > 0) {
        children.push(
          new Paragraph({
            spacing: { after: 100, line: 240 },
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: `${cat.label}: `,
                bold: true,
                size: 20,
                color: darkColor,
                font: fontName,
              }),
              new TextRun({
                text: list.join(", "),
                size: 20,
                color: darkColor,
                font: fontName,
              }),
            ],
          })
        );
      }
    });

    // Fallback
    if (categories.every((cat) => !skillsObj[cat.key] || skillsObj[cat.key].length === 0)) {
      if (Array.isArray(skillsObj)) {
        children.push(
          new Paragraph({
            spacing: { after: 100, line: 240 },
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: `Skills: ${skillsObj.join(", ")}`,
                size: 20,
                color: darkColor,
                font: fontName,
              }),
            ],
          })
        );
      } else if (typeof skillsObj === "string") {
        children.push(
          new Paragraph({
            spacing: { after: 100, line: 240 },
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: `Skills: ${skillsObj}`,
                size: 20,
                color: darkColor,
                font: fontName,
              }),
            ],
          })
        );
      }
    }
  }

  // --- 4. EXPERIENCE ---
  if (Array.isArray(resume.experience) && resume.experience.length > 0) {
    addSectionHeading("Professional Experience");

    resume.experience.forEach((exp: any) => {
      // Role Title & Company / Location
      const dates = [exp.startDate, exp.endDate].filter(Boolean).join(" - ");
      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: exp.title || "Position",
              bold: true,
              size: 22, // 11pt
              color: darkColor,
              font: fontName,
            }),
            new TextRun({
              text: `   |   ${[exp.company, exp.location].filter(Boolean).join(", ")}`,
              bold: false,
              size: 20,
              color: grayColor,
              font: fontName,
            }),
            new TextRun({
              text: dates ? `   (${dates})` : "",
              size: 20,
              color: grayColor,
              font: fontName,
            }),
          ],
        })
      );

      // Bullet points
      if (Array.isArray(exp.bullets)) {
        exp.bullets.forEach((bullet: string) => {
          children.push(
            new Paragraph({
              spacing: { after: 80, line: 240 },
              bullet: { level: 0 },
              children: [
                new TextRun({
                  text: bullet,
                  size: 19, // 9.5pt
                  color: darkColor,
                  font: fontName,
                }),
              ],
            })
          );
        });
      }
    });
  }

  // --- 5. PROJECTS ---
  if (Array.isArray(resume.projects) && resume.projects.length > 0) {
    addSectionHeading("Key Projects");

    resume.projects.forEach((proj: any) => {
      const techStr = Array.isArray(proj.tech) && proj.tech.length > 0
        ? `   [Tech: ${proj.tech.join(", ")}]`
        : "";
      const links = [proj.liveUrl, proj.githubUrl].filter(Boolean).join(" | ");

      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: proj.name || "Project",
              bold: true,
              size: 22,
              color: darkColor,
              font: fontName,
            }),
            new TextRun({
              text: techStr,
              bold: true,
              size: 18,
              color: secondaryColor,
              font: fontName,
            }),
            new TextRun({
              text: links ? `   (${links})` : "",
              size: 18,
              color: grayColor,
              font: fontName,
            }),
          ],
        })
      );

      if (Array.isArray(proj.bullets)) {
        proj.bullets.forEach((bullet: string) => {
          children.push(
            new Paragraph({
              spacing: { after: 80, line: 240 },
              bullet: { level: 0 },
              children: [
                new TextRun({
                  text: bullet,
                  size: 19,
                  color: darkColor,
                  font: fontName,
                }),
              ],
            })
          );
        });
      }
    });
  }

  // --- 6. EDUCATION ---
  if (Array.isArray(resume.education) && resume.education.length > 0) {
    addSectionHeading("Education");

    resume.education.forEach((edu: any) => {
      const degreeStr = [edu.degree, edu.major].filter(Boolean).join(" in ");
      const gradAndGpa = [
        edu.graduation ? `Graduated: ${edu.graduation}` : null,
        edu.gpa ? `GPA: ${edu.gpa}` : null,
        edu.percentage ? `Percentage: ${edu.percentage}` : null,
      ]
        .filter(Boolean)
        .join("  |  ");

      children.push(
        new Paragraph({
          spacing: { before: 100, after: 40 },
          children: [
            new TextRun({
              text: degreeStr || "Degree",
              bold: true,
              size: 22,
              color: darkColor,
              font: fontName,
            }),
            new TextRun({
              text: `   |   ${[edu.institution, edu.location].filter(Boolean).join(", ")}`,
              size: 20,
              color: grayColor,
              font: fontName,
            }),
            new TextRun({
              text: gradAndGpa ? `   (${gradAndGpa})` : "",
              size: 20,
              color: grayColor,
              font: fontName,
            }),
          ],
        })
      );
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

      children.push(
        new Paragraph({
          spacing: { after: 80, line: 240 },
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: `${nameStr} ${issuerStr} ${dateStr} ${credStr}`.trim(),
              size: 19,
              color: darkColor,
              font: fontName,
            }),
          ],
        })
      );
    });
  }

  // Build document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
};
