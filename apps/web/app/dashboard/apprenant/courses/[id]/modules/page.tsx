"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

type Module = {
  _id: string;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
};

export default function ModulesPage() {
  const params = useParams();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/profile");
        setUserId(res.data._id);
      } catch {
        setError("Impossible de récupérer l'utilisateur connecté");
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId || !params.id) return;
    const fetchModules = async () => {
      try {
        const response = await api.get(
          `/enrollments/modules/${params.id}/${userId}`,
        );

        setModules(response.data || []);
      } catch {
        setError("Erreur lors du chargement des modules.");
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, [userId, params.id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-lg text-gray-600">Chargement...</div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-3xl mx-auto mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Modules du cours
          </h1>
          <p className="text-gray-600">
            Progressez à votre rythme à travers les modules
          </p>
        </div>

        <div className="space-y-4">
          {modules?.map((module) => (
            <div
              key={module._id}
              className={`group relative rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${
                module.isPublished
                  ? "bg-white border border-gray-200 hover:border-blue-300"
                  : "bg-gray-50 border border-gray-300"
              }`}
            >
              {/* Barre de couleur latérale */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                  module.isPublished
                    ? "bg-gradient-to-b from-blue-500 to-purple-500"
                    : "bg-gray-400"
                }`}
              />

              <div className="p-6 pl-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Numéro du module */}
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                          module.isPublished
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {module.order}
                      </span>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {module.title}
                      </h2>
                    </div>

                    <p className="text-gray-600 leading-relaxed ml-11">
                      {module.description}
                    </p>
                  </div>

                  {/* Badge de statut */}
                  <div className="flex-shrink-0">
                    {module.isPublished ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-green-700">
                          Disponible
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                        <svg
                          className="w-5 h-5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-600">
                          Verrouillé
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 ml-11">
                  {module.isPublished && (
                    <a
                      href={`/dashboard/apprenant/courses/${params.id}/modules/${module._id}/quizzes`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C6.5 6.253 2 10.753 2 16.5S6.5 26.5 12 26.5s10-4.477 10-10S17.5 6.253 12 6.253z"
                        />
                      </svg>
                      Quizzes
                    </a>
                  )}
                </div>
              </div>

              {/* Overlay pour modules verrouillés */}
              {!module.isPublished && (
                <div className="absolute inset-0 bg-gray-200 bg-opacity-20 pointer-events-none" />
              )}
            </div>
          ))}
          {modules?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Aucun module disponible pour le moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
