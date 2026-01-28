"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { showSuccess, showError } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

interface Course {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        setCourses(res.data || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(`Erreur lors du chargement des cours. ${err.message}`);
        } else {
          setError("Erreur lors du chargement des cours.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const checkRoleAndFetch = async () => {
      try {
        const profile = await api.get("/auth/profile");
        if (profile.data.role !== "admin") {
          router.replace("/dashboard");
          return;
        }
        const res = await api.get("/courses");
        setCourses(res.data || []);
      } catch (err) {
        if (err instanceof Error) {
          setError(`Erreur lors du chargement des cours. ${err.message}`);
        } else {
          setError("Erreur lors du chargement des cours.");
        }
      } finally {
        setLoading(false);
      }
    };
    checkRoleAndFetch();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce cours ?")) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses(courses.filter((c) => c._id !== id));
      showSuccess("Cours supprimé avec succès");
    } catch {
      setError("Erreur lors de la suppression.");
      showError("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-lg text-gray-400">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-950 border border-red-800 rounded-lg">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Gestion des cours
            </h2>
            <p className="text-gray-400">Gérez les cours de la plateforme</p>
          </div>
        </div>
        <div className="bg-card border border-gray-700 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-card border-b border-gray-700">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">
                    Titre
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">
                    Description
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-300">
                    Créé le
                  </th>
                  <th className="py-4 px-6 text-center text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr
                    key={course._id}
                    className={`border-b border-gray-700 hover:bg-gray-750 transition-colors ${index % 2 === 0 ? "bg-card" : "bg-gray-850"}`}
                  >
                    <td className="py-4 px-6 text-white font-medium">
                      {course.title}
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {course.description}
                    </td>
                    <td className="py-4 px-6 text-gray-400">
                      {new Date(course.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {courses.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-600 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="text-gray-400 text-lg">Aucun cours trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
