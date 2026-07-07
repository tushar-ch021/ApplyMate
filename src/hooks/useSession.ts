import { useState, useCallback } from "react";
import { resumeAPI } from "../services/api";
import toast from "react-hot-toast";

export const useSession = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await resumeAPI.getSessions();
      if (res.success) {
        setSessions(res.data);
      }
    } catch (err: any) {
      console.error("fetchSessions error:", err);
      setError(err.message || "Failed to load sessions.");
      toast.error(err.message || "Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSession = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await resumeAPI.getSession(id);
      if (res.success) {
        setCurrentSession(res.data);
        return res.data;
      }
    } catch (err: any) {
      console.error("fetchSession error:", err);
      setError(err.message || "Failed to load session details.");
      toast.error(err.message || "Failed to load session details.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createSessionFromPaste = async (text: string, title?: string) => {
    setLoading(true);
    try {
      const res = await resumeAPI.pasteText(text, title);
      if (res.success) {
        toast.success("Resume submitted successfully!");
        return res.data;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create session.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createSessionFromScratch = async (title?: string) => {
    setLoading(true);
    try {
      const res = await resumeAPI.createFromScratch(title);
      if (res.success) {
        toast.success("Blank resume workspace initialized!");
        return res.data;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create scratch session.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createSessionFromUpload = async (file: File) => {
    setLoading(true);
    try {
      const res = await resumeAPI.uploadFile(file);
      if (res.success) {
        toast.success("Resume parsed and uploaded successfully!");
        return res.data;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to parse file.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const res = await resumeAPI.deleteSession(id);
      if (res.success) {
        setSessions((prev) => prev.filter((s) => s._id !== id));
        if (currentSession?._id === id) {
          setCurrentSession(null);
        }
        toast.success("Session deleted successfully.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete session.");
    }
  };

  const saveEditedResume = async (id: string, resumeJson: any) => {
    try {
      const res = await resumeAPI.saveEditedResume(id, resumeJson);
      if (res.success) {
        setCurrentSession((prev: any) => ({
          ...prev,
          optimizedResume: resumeJson,
          status: "optimized",
        }));
        toast.success("Resume saved successfully.");
        return true;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save edited resume.");
      return false;
    }
  };

  return {
    sessions,
    currentSession,
    loading,
    error,
    fetchSessions,
    fetchSession,
    createSessionFromPaste,
    createSessionFromScratch,
    createSessionFromUpload,
    deleteSession,
    saveEditedResume,
    setCurrentSession,
  };
};

export default useSession;
