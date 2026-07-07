import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "../prompts/geminiPrompts";

const GEMINI_MODEL = "gemini-2.5-flash";

// Initialize Gemini client with proper User-Agent telemetry
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

/**
 * Helper to clean up response text and parse it as JSON
 */
const cleanAndParseJSON = (text: string): any => {
  try {
    let cleanText = text.trim();
    
    // Find the first occurrence of '{' or '['
    const startChar = cleanText.indexOf('{');
    const startArray = cleanText.indexOf('[');
    let startIndex = -1;
    let endChar = '';
    
    if (startChar !== -1 && (startArray === -1 || startChar < startArray)) {
      startIndex = startChar;
      endChar = '}';
    } else if (startArray !== -1) {
      startIndex = startArray;
      endChar = ']';
    }
    
    if (startIndex !== -1) {
      const endIndex = cleanText.lastIndexOf(endChar);
      if (endIndex !== -1 && endIndex > startIndex) {
        cleanText = cleanText.substring(startIndex, endIndex + 1);
      }
    }

    // Strip markdown code fences if present
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Failed to parse JSON from Gemini response. Raw text:", text);
    throw new Error("Gemini API error: Received invalid JSON response structure from the AI model.");
  }
};

// --- Strict Response Schemas to guarantee API reliability ---

const atsAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    atsScore: { type: Type.INTEGER, description: "ATS matching score from 0 to 100" },
    keywordMatchPercent: { type: Type.INTEGER, description: "Keyword match percent from 0 to 100" },
    shortlistProbability: { type: Type.STRING, description: "Very Low, Low, Medium, High, or Very High" },
    matchedKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    weakKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    sectionScores: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.INTEGER },
        skills: { type: Type.INTEGER },
        experience: { type: Type.INTEGER },
        education: { type: Type.INTEGER },
        projects: { type: Type.INTEGER }
      },
      required: ["summary", "skills", "experience", "education", "projects"]
    },
    recruiterConcerns: { type: Type.ARRAY, items: { type: Type.STRING } },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    gapAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          requirement: { type: Type.STRING },
          present: { type: Type.BOOLEAN },
          evidence: { type: Type.STRING, nullable: true },
          improvementOpportunity: { type: Type.STRING }
        },
        required: ["requirement", "present", "evidence", "improvementOpportunity"]
      }
    },
    sectionWeaknesses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          section: { type: Type.STRING },
          issue: { type: Type.STRING },
          suggestion: { type: Type.STRING }
        },
        required: ["section", "issue", "suggestion"]
      }
    },
    overallVerdict: { type: Type.STRING }
  },
  required: [
    "atsScore",
    "keywordMatchPercent",
    "shortlistProbability",
    "matchedKeywords",
    "missingKeywords",
    "weakKeywords",
    "sectionScores",
    "recruiterConcerns",
    "strengths",
    "gapAnalysis",
    "sectionWeaknesses",
    "overallVerdict"
  ]
};

const resumeOptimizerSchema = {
  type: Type.OBJECT,
  properties: {
    optimizedResume: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        contact: {
          type: Type.OBJECT,
          properties: {
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            linkedin: { type: Type.STRING, nullable: true },
            github: { type: Type.STRING, nullable: true },
            portfolio: { type: Type.STRING, nullable: true }
          },
          required: ["email", "phone", "location"]
        },
        summary: { type: Type.STRING },
        skills: {
          type: Type.OBJECT,
          properties: {
            languages: { type: Type.ARRAY, items: { type: Type.STRING } },
            frameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
            databases: { type: Type.ARRAY, items: { type: Type.STRING } },
            tools: { type: Type.ARRAY, items: { type: Type.STRING } },
            concepts: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["languages", "frameworks", "databases", "tools", "concepts"]
        },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              startDate: { type: Type.STRING },
              endDate: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "company", "location", "startDate", "endDate", "bullets"]
          }
        },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              tech: { type: Type.ARRAY, items: { type: Type.STRING } },
              liveUrl: { type: Type.STRING, nullable: true },
              githubUrl: { type: Type.STRING, nullable: true },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["name", "tech", "bullets"]
          }
        },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              degree: { type: Type.STRING },
              major: { type: Type.STRING },
              institution: { type: Type.STRING },
              location: { type: Type.STRING },
              graduation: { type: Type.STRING },
              gpa: { type: Type.STRING, nullable: true },
              percentage: { type: Type.STRING, nullable: true }
            },
            required: ["degree", "major", "institution", "location", "graduation"]
          }
        },
        certifications: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              issuer: { type: Type.STRING },
              date: { type: Type.STRING },
              credentialId: { type: Type.STRING, nullable: true },
              expiryDate: { type: Type.STRING, nullable: true }
            },
            required: ["name", "issuer", "date"]
          }
        }
      },
      required: ["name", "contact", "summary", "skills", "experience", "projects", "education", "certifications"]
    },
    improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
    newATSScore: { type: Type.INTEGER },
    scoreImprovement: { type: Type.INTEGER },
    remainingGaps: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["optimizedResume", "improvements", "newATSScore", "scoreImprovement", "remainingGaps"]
};

const sectionEditorSchema = {
  type: Type.OBJECT,
  properties: {
    rewrittenSection: { type: Type.STRING },
    changesMade: { type: Type.ARRAY, items: { type: Type.STRING } },
    rationale: { type: Type.STRING }
  },
  required: ["rewrittenSection", "changesMade", "rationale"]
};

const keywordAnalyzerSchema = {
  type: Type.OBJECT,
  properties: {
    criticalMissing: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          keyword: { type: Type.STRING },
          context: { type: Type.STRING },
          naturalPlacement: { type: Type.STRING }
        },
        required: ["keyword", "context", "naturalPlacement"]
      }
    },
    niceToHave: { type: Type.ARRAY, items: { type: Type.STRING } },
    alreadyPresent: { type: Type.ARRAY, items: { type: Type.STRING } },
    advice: { type: Type.STRING }
  },
  required: ["criticalMissing", "niceToHave", "alreadyPresent", "advice"]
};

const coverLetterSchema = {
  type: Type.OBJECT,
  properties: {
    coverLetter: { type: Type.STRING },
    subjectLine: { type: Type.STRING },
    keyStrengthsHighlighted: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["coverLetter", "subjectLine", "keyStrengthsHighlighted"]
};

const interviewPrepSchema = {
  type: Type.OBJECT,
  properties: {
    technicalQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          whyAsked: { type: Type.STRING },
          answerFramework: { type: Type.STRING }
        },
        required: ["question", "whyAsked", "answerFramework"]
      }
    },
    behavioralQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          relevantResumeMoment: { type: Type.STRING },
          starTemplate: {
            type: Type.OBJECT,
            properties: {
              situation: { type: Type.STRING },
              task: { type: Type.STRING },
              action: { type: Type.STRING },
              result: { type: Type.STRING }
            },
            required: ["situation", "task", "action", "result"]
          }
        },
        required: ["question", "relevantResumeMoment", "starTemplate"]
      }
    },
    projectQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          project: { type: Type.STRING },
          question: { type: Type.STRING },
          challengeHighlight: { type: Type.STRING },
          answerStrategy: { type: Type.STRING }
        },
        required: ["project", "question", "challengeHighlight", "answerStrategy"]
      }
    },
    questionsToAsk: { type: Type.ARRAY, items: { type: Type.STRING } },
    redFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["technicalQuestions", "behavioralQuestions", "projectQuestions", "questionsToAsk", "redFlags"]
};


/**
 * Perform ATS resume analysis
 */
export const analyzeATS = async (resumeText: string, jdText: string): Promise<any> => {
  try {
    const ai = getGeminiClient();
    const prompt = `RESUME:\n${resumeText}\n\nTARGET JOB DESCRIPTION:\n${jdText}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.ATS_ANALYSIS,
        responseMimeType: "application/json",
        responseSchema: atsAnalysisSchema,
        temperature: 0.1, // Low temperature for consistent factual evaluation
      },
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini.");
    }

    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("analyzeATS error:", error);
    throw new Error(`Gemini API error: ${(error as Error).message}`);
  }
};

/**
 * Perform AI Resume Optimization
 */
export const optimizeResume = async (resumeText: string, jdText: string): Promise<any> => {
  try {
    const ai = getGeminiClient();
    const prompt = `RESUME:\n${resumeText}\n\nTARGET JOB DESCRIPTION:\n${jdText}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.RESUME_OPTIMIZER,
        responseMimeType: "application/json",
        responseSchema: resumeOptimizerSchema,
        temperature: 0.2,
      },
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini.");
    }

    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("optimizeResume error:", error);
    throw new Error(`Gemini API error: ${(error as Error).message}`);
  }
};

/**
 * Rewrite a specific section of the resume
 */
export const editSection = async (
  sectionName: string,
  sectionContent: string,
  userPrompt: string,
  jdText?: string
): Promise<any> => {
  try {
    const ai = getGeminiClient();
    let prompt = `SECTION TO EDIT: ${sectionName}\nCURRENT CONTENT:\n${sectionContent}\n\nUSER DIRECTIVE:\n${userPrompt}`;
    if (jdText) {
      prompt += `\n\nTARGET JOB DESCRIPTION:\n${jdText}`;
    }

    const isJSON = (str: string) => {
      try {
        const trimmed = str.trim();
        return (trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"));
      } catch {
        return false;
      }
    };

    if (isJSON(sectionContent)) {
      prompt += `\n\nCRITICAL SYSTEM NOTE:\n` +
        `The current content to edit is formatted as a JSON data structure. You MUST maintain the exact same JSON format, fields, and schema in your rewrite.\n` +
        `Specifically, your 'rewrittenSection' output MUST be a valid JSON-stringified object/array representing the rewritten section. Do not output plain text, do not describe changes there, and do not use markdown formatting/backticks inside that string. Maintain all existing JSON properties.`;
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.SECTION_EDITOR,
        responseMimeType: "application/json",
        responseSchema: sectionEditorSchema,
        temperature: 0.3,
      },
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini.");
    }

    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("editSection error:", error);
    throw new Error(`Gemini API error: ${(error as Error).message}`);
  }
};

/**
 * Perform standalone Keyword analysis
 */
export const analyzeKeywords = async (resumeText: string, jdText: string): Promise<any> => {
  try {
    const ai = getGeminiClient();
    const prompt = `RESUME:\n${resumeText}\n\nTARGET JOB DESCRIPTION:\n${jdText}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.KEYWORD_ANALYZER,
        responseMimeType: "application/json",
        responseSchema: keywordAnalyzerSchema,
        temperature: 0.1,
      },
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini.");
    }

    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("analyzeKeywords error:", error);
    throw new Error(`Gemini API error: ${(error as Error).message}`);
  }
};

/**
 * Generate a Tailored Cover Letter
 */
export const generateCoverLetter = async (
  resumeText: string,
  jdText: string,
  companyName: string,
  roleName: string,
  tone: string
): Promise<any> => {
  try {
    const ai = getGeminiClient();
    const prompt = `RESUME:\n${resumeText}\n\nTARGET JOB DESCRIPTION:\n${jdText}\n\nCOMPANY NAME: ${companyName}\nROLE: ${roleName}\nTONE DIRECTIVE: ${tone}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.COVER_LETTER,
        responseMimeType: "application/json",
        responseSchema: coverLetterSchema,
        temperature: 0.5, // Slightly higher for flowing natural cover letters
      },
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini.");
    }

    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("generateCoverLetter error:", error);
    throw new Error(`Gemini API error: ${(error as Error).message}`);
  }
};

/**
 * Generate Interview Prep materials
 */
export const prepareInterview = async (resumeText: string, jdText: string): Promise<any> => {
  try {
    const ai = getGeminiClient();
    const prompt = `RESUME:\n${resumeText}\n\nTARGET JOB DESCRIPTION:\n${jdText}`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.INTERVIEW_PREP,
        responseMimeType: "application/json",
        responseSchema: interviewPrepSchema,
        temperature: 0.4,
      },
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini.");
    }

    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("prepareInterview error:", error);
    throw new Error(`Gemini API error: ${(error as Error).message}`);
  }
};

/**
 * Generate MORE Interview Prep materials avoiding existing ones
 */
export const prepareMoreInterview = async (
  resumeText: string,
  jdText: string,
  existingPrep: any
): Promise<any> => {
  try {
    const ai = getGeminiClient();
    const existingTechnical = (existingPrep?.technicalQuestions || []).map((q: any) => q.question);
    const existingBehavioral = (existingPrep?.behavioralQuestions || []).map((q: any) => q.question);
    const existingProjects = (existingPrep?.projectQuestions || []).map((q: any) => q.question);

    const prompt = `CANDIDATE RESUME:\n${resumeText}\n\nTARGET JOB DESCRIPTION:\n${jdText}
    
EXISTING TECHNICAL QUESTIONS TO AVOID:\n${JSON.stringify(existingTechnical)}
EXISTING BEHAVIORAL QUESTIONS TO AVOID:\n${JSON.stringify(existingBehavioral)}
EXISTING PROJECT-BASED QUESTIONS TO AVOID:\n${JSON.stringify(existingProjects)}

TASK: Generate exactly 5 to 7 NEW, ADDITIONAL, and DIFFERENT questions of each category that do NOT overlap with the existing ones listed above. Ensure the technical questions map to resume skills/JD, the behavioral ones map to STAR, and project ones map to actual resume projects.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.INTERVIEW_PREP,
        responseMimeType: "application/json",
        responseSchema: interviewPrepSchema,
        temperature: 0.6,
      },
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini.");
    }

    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("prepareMoreInterview error:", error);
    throw new Error(`Gemini API error: ${(error as Error).message}`);
  }
};

/**
 * Conversational Interview Coaching Assistant
 */
export const chatInterviewPrep = async (
  resumeText: string,
  jdText: string,
  prepData: any,
  message: string,
  chatHistory: any[]
): Promise<string> => {
  try {
    const ai = getGeminiClient();

    const systemInstruction = `You are an elite technical interview coach, senior recruiter, and career mentor.
You are helping the user prepare for their upcoming interview. Be professional, direct, and constructive.

CANDIDATE RESUME:
${resumeText}

TARGET JOB DESCRIPTION:
${jdText}

CURRENT PRE-GENERATED PRACTICE QUESTIONS:
${JSON.stringify(prepData || {})}

GUIDELINES:
1. Conduct interactive mock interviews: you can ask them a question, await their response, and give actionable feedback on their answers (e.g. how they can apply the STAR method, what technologies they should emphasize, or correct factual gaps).
2. Answer queries they have about preparing for this specific role, explaining complex technical concepts, or how to frame weak experiences.
3. Keep your advice punchy, direct, and under 150-200 words. Use bullet points or code block suggestions if necessary.`;

    const contents = chatHistory.map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }],
    }));

    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "I apologize, I could not generate a response. Please try again.";
  } catch (error) {
    console.error("chatInterviewPrep error:", error);
    throw new Error(`Gemini API error: ${(error as Error).message}`);
  }
};

const chatEditResumeSchema = {
  type: Type.OBJECT,
  properties: {
    assistantResponse: { type: Type.STRING },
    updatedResume: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        contact: {
          type: Type.OBJECT,
          properties: {
            email: { type: Type.STRING },
            phone: { type: Type.STRING },
            location: { type: Type.STRING },
            linkedin: { type: Type.STRING, nullable: true },
            github: { type: Type.STRING, nullable: true },
            portfolio: { type: Type.STRING, nullable: true }
          },
          required: ["email", "phone", "location"]
        },
        summary: { type: Type.STRING },
        theme: { type: Type.STRING },
        skills: {
          type: Type.OBJECT,
          properties: {
            languages: { type: Type.ARRAY, items: { type: Type.STRING } },
            frameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
            databases: { type: Type.ARRAY, items: { type: Type.STRING } },
            tools: { type: Type.ARRAY, items: { type: Type.STRING } },
            concepts: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["languages", "frameworks", "databases", "tools", "concepts"]
        },
        experience: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              startDate: { type: Type.STRING },
              endDate: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "company", "location", "startDate", "endDate", "bullets"]
          }
        },
        projects: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              tech: { type: Type.ARRAY, items: { type: Type.STRING } },
              liveUrl: { type: Type.STRING, nullable: true },
              githubUrl: { type: Type.STRING, nullable: true },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["name", "tech", "bullets"]
          }
        },
        education: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              degree: { type: Type.STRING },
              major: { type: Type.STRING },
              institution: { type: Type.STRING },
              location: { type: Type.STRING },
              graduation: { type: Type.STRING },
              gpa: { type: Type.STRING, nullable: true },
              percentage: { type: Type.STRING, nullable: true }
            },
            required: ["degree", "major", "institution", "location", "graduation"]
          }
        },
        certifications: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              issuer: { type: Type.STRING },
              date: { type: Type.STRING },
              credentialId: { type: Type.STRING, nullable: true },
              expiryDate: { type: Type.STRING, nullable: true }
            },
            required: ["name", "issuer", "date"]
          }
        }
      },
      required: ["name", "contact", "summary", "skills", "experience", "projects", "education", "certifications"]
    }
  },
  required: ["assistantResponse", "updatedResume"]
};

/**
 * Conversational Resume Editor & Customizer Assistant
 */
export const chatEditResume = async (
  currentResume: any,
  message: string,
  chatHistory: any[],
  jdText?: string
): Promise<any> => {
  try {
    const ai = getGeminiClient();

    const systemInstruction = `You are a world-class professional resume designer, ATS compliance auditor, and content writer.
The user is viewing their live resume preview and chatting with you to make changes in styling, spacing, content, phrasing, adding sections, etc.

YOUR CRITICAL CORE MISSIONS:
1. EXPLICITLY respect the user's styling, spacing, or structural guidelines by modifying the "theme" value (available options: "classic", "modern", "minimalist", "creative") or rewriting and editing sections.
2. Edit content safely. If they say "add TypeScript to skills" or "reword my experience summary" or "shorten spacing", modify the structured JSON dynamically to fulfill their request.
3. NEVER fabricate facts or credentials that aren't mentioned or requested.
4. Your response must be structured JSON containing both your text response explaining the change and the updated complete resume JSON object.

STRICT JSON RESPONDING INSTRUCTIONS:
- You must always output the complete, updated resume JSON inside the "updatedResume" field so that we can immediately update the candidate's workspace.
- The "theme" property can be "classic" (Navy/Corporate), "modern" (Teal/Clean), "minimalist" (Times New Roman Elegant Serif), or "creative" (Ruby/Warm). Choose the theme that matches their stylistic query best if they ask for styling changes!`;

    // Format message contents
    const contents = chatHistory.map((h: any) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }],
    }));

    contents.push({
      role: "user",
      parts: [{ text: `CURRENT RESUME STATE:\n${JSON.stringify(currentResume)}\n\nUSER'S DESIRED CHANGES:\n${message}\n\nTARGET JOB DESCRIPTION (IF ANY):\n${jdText || ""}` }],
    });

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: chatEditResumeSchema,
        temperature: 0.3,
      },
    });

    if (!response.text) {
      throw new Error("Empty response received from Gemini.");
    }

    return cleanAndParseJSON(response.text);
  } catch (error) {
    console.error("chatEditResume error:", error);
    throw new Error(`Gemini API error: ${(error as Error).message}`);
  }
};
