"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // ou 'next/router' selon ta version

import api from "@/lib/api";

export default function ResumeModule() {
  const params = useParams();
  const courseId = params?.courseId;
  const [apprenantId, setApprenantId] = useState<string | null>(null);
  const [module, setModule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndModule = async () => {
      try {
        const userRes = await api.get("/auth/profile");
        const userId = userRes.data?._id;
        setApprenantId(userId);
        if (!courseId || !userId) return;
        // const moduleRes = await api.get(`/courses/${courseId}/resume?apprenantId=${userId}`);
        const modulesRes = await api.get(`/courses/${courseId}/modules`);
        setModule(modulesRes.data);
      } catch (err) {
        setError("Erreur lors du chargement du module à reprendre.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndModule();
  }, [courseId]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!module) return <div>Aucun module à reprendre.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Module à reprendre</h2>
      <div className="border rounded p-4">
        <strong>{module.title}</strong>
        <p>{module.description}</p>
      </div>
    </div>
  );
}
