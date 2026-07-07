import axios from "axios";

// Create Axios Instance
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach JWT Token dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("applymate_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format error structures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || "An unexpected network error occurred.";
    return Promise.reject({
      ...error,
      message,
      status: error.response?.status,
    });
  }
);

export const authAPI = {
  register: async (name: string, email: string, password: string) => {
    const response = await api.post("/auth/register", { name, email, password });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

export const resumeAPI = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/resume/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  pasteText: async (resumeText: string, sessionName?: string) => {
    const response = await api.post("/resume/paste", { resumeText, sessionName });
    return response.data;
  },
  createFromScratch: async (sessionName?: string) => {
    const response = await api.post("/resume/scratch", { sessionName });
    return response.data;
  },
  getSessions: async () => {
    const response = await api.get("/resume/sessions");
    return response.data;
  },
  getSession: async (id: string) => {
    const response = await api.get(`/resume/sessions/${id}`);
    return response.data;
  },
  deleteSession: async (id: string) => {
    const response = await api.delete(`/resume/sessions/${id}`);
    return response.data;
  },
  saveEditedResume: async (id: string, resumeJson: any) => {
    const response = await api.patch(`/resume/sessions/${id}/resume`, { resumeJson });
    return response.data;
  },
  downloadPDF: async (resumeJson: any, theme?: string) => {
    const response = await api.post("/resume/download/pdf", { resumeJson, theme }, { responseType: "blob" });
    return response.data; // Returns Blob
  },
  downloadDOCX: async (resumeJson: any, theme?: string) => {
    const response = await api.post("/resume/download/docx", { resumeJson, theme }, { responseType: "blob" });
    return response.data; // Returns Blob
  },
};

export const aiAPI = {
  runATS: async (sessionId: string, jobDescription: string) => {
    const response = await api.post("/analysis/ats", { sessionId, jobDescription });
    return response.data;
  },
  runOptimizer: async (sessionId: string) => {
    const response = await api.post("/analysis/optimize", { sessionId });
    return response.data;
  },
  editSection: async (
    sectionName: string,
    sectionContent: string,
    userPrompt: string,
    jobDescription?: string
  ) => {
    const response = await api.post("/analysis/edit-section", {
      sectionName,
      sectionContent,
      userPrompt,
      jobDescription,
    });
    return response.data;
  },
  runKeywordAnalyzer: async (sessionId: string) => {
    const response = await api.post("/analysis/keywords", { sessionId });
    return response.data;
  },
  runCoverLetter: async (sessionId: string, companyName: string, roleName: string, tone: string) => {
    const response = await api.post("/analysis/cover-letter", {
      sessionId,
      companyName,
      roleName,
      tone,
    });
    return response.data;
  },
  runInterviewPrep: async (sessionId: string, generateMore?: boolean) => {
    const response = await api.post("/analysis/interview-prep", { sessionId, generateMore });
    return response.data;
  },
  runInterviewPrepChat: async (sessionId: string, message: string, chatHistory: any[]) => {
    const response = await api.post("/analysis/interview-prep/chat", { sessionId, message, chatHistory });
    return response.data;
  },
  runResumeChatEdit: async (sessionId: string, message: string, chatHistory: any[]) => {
    const response = await api.post("/analysis/resume/chat-edit", { sessionId, message, chatHistory });
    return response.data;
  },
};

export default api;
