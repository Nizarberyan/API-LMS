"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // ou 'next/router' selon ta version

import api from "@/lib/api";

export default function ResumeModule() {
  // Defining Interface here for now if not available elsewhere, or simple any replacement with unknown/custom
  interface Module {
    _id: string;
    title: string;
    description: string;
  }
  const params = useParams();
  const courseId = params?.courseId;
  const [modules, setModules] = useState<Module[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndModule = async () => {
      try {
        const userRes = await api.get("/auth/profile");
        const userId = userRes.data?._id;
        if (!courseId || !userId) return;
        const modulesRes = await api.get(`/courses/${courseId}/modules`);
        setModules(modulesRes.data);
      } catch (err) {
        if (err instanceof Error) {
          setError(`Erreur lors du chargement des modules. ${err.message}`);
        } else {
          setError("Erreur lors du chargement des modules.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndModule();
  }, [courseId]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!modules) return <div>Aucun module à reprendre.</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Modules</h2>
      <div className="border rounded p-4">
        {modules.map((module) => (
          <div key={module._id}>
            <strong>{module.title}</strong>
            <p>{module.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
