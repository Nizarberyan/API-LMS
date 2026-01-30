"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

export default function ModulesCrud() {
  const params = useParams();
  // const courseId = params?.courseId;
  interface Module {
    _id: string;
    title: string;
    description: string;
    order: number;
    moduleType: "video" | "pdf";
    isPublished: boolean;
    [key: string]: unknown;
  }

  interface ModuleForm {
    title: string;
    description: string;
    order: number;
    moduleType: "video" | "pdf";
    isPublished: boolean;
  }

  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ModuleForm>({
    title: "",
    description: "",
    order: 1,
    moduleType: "video",
    isPublished: false,
  });
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  // Récupérer le fichier du module sélectionné (vidéo/pdf) via Axios pour inclure le token
  useEffect(() => {
    const fetchFile = async () => {
      if (!selectedModule) return;
      if (
        selectedModule.moduleType !== "video" &&
        selectedModule.moduleType !== "pdf"
      )
        return;
      try {
        const response = await api.get(`/modules/${selectedModule._id}/file`, {
          responseType: "blob",
        });
        const url = URL.createObjectURL(response.data);
        setFileUrl(url);
      } catch (err) {
        if (err instanceof Error) {
          setError(`Erreur lors du chargement du fichier. ${err.message}`);
        } else {
          setError("Erreur lors du chargement du fichier.");
        }
        setFileUrl(null);
      }
    };
    if (selectedModule) {
      fetchFile();
    } else {
      setFileUrl(null);
    }
    // Nettoyage de l'URL Blob
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule]);
  const [file, setFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const courseId = typeof params?.courseId === "string" ? params.courseId : "";

  useEffect(() => {
    const fetchModules = async () => {
      try {
        if (!courseId) return;
        const res = await api.get(`/courses/${courseId}/modules`);
        setModules(res.data || []);
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
    fetchModules();
  }, [courseId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, type, value } = e.target;
    if (type === "checkbox") {
      setForm({
        ...form,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (type === "file") {
      const files = (e.target as HTMLInputElement).files;
      setFile(files && files[0] ? files[0] : null);
    } else {
      setForm({
        ...form,
        [name]: name === "order" ? Number(value) : value,
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const needsFile =
        form.moduleType === "pdf" || form.moduleType === "video";
      if (needsFile && !file) {
        setError("Veuillez sélectionner un fichier pour ce type de module.");
        return;
      }
      if (editingId) {
        if (needsFile) {
          const formData = new FormData();
          (
            Object.entries(form) as [string, string | number | boolean][]
          ).forEach(([key, value]) => {
            formData.append(key, String(value));
          });
          formData.append("course", courseId);
          if (file) formData.append("content", file);
          await api.patch(`/modules/${editingId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await api.patch(`/modules/${editingId}`, {
            ...form,
            course: courseId,
          });
        }
      } else {
        if (needsFile) {
          const formData = new FormData();
          (
            Object.entries(form) as [string, string | number | boolean][]
          ).forEach(([key, value]) => {
            formData.append(key, String(value));
          });
          formData.append("course", courseId);
          if (file) formData.append("content", file);
          await api.post(`/modules`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          await api.post(`/modules`, { ...form, course: courseId });
        }
      }
      setForm({
        title: "",
        description: "",
        order: 1,
        moduleType: "video",
        isPublished: false,
      });
      setFile(null);
      setEditingId(null);
      setLoading(true);
      const res = await api.get(`/courses/${courseId}/modules`);
      setModules(res.data || []);
    } catch {
      setError("Erreur lors de la sauvegarde du module.");
    } finally {
      setLoading(false);
    }
    setShowForm(false);
  };

  const handleEdit = (module: Module) => {
    setForm({
      title: module.title,
      description: module.description,
      order: module.order,
      moduleType: module.moduleType,
      isPublished: module.isPublished,
    });
    setEditingId(module._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Supprimer ce module ?")) return;
    try {
      await api.delete(`/modules/${id}`);
      setModules(modules.filter((m) => m._id !== id));
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-lg text-gray-400">Chargement...</div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-4xl mx-auto mt-8 p-4 bg-card border border-gray-700 rounded-lg">
        <p className="text-gray-300 text-center">{error}</p>
      </div>
    );

  return (
    <div className=" py-12  ">
      <div className=" mx-auto">
        {/* En-tête avec bouton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-200 mb-2 drop-shadow">
              Gestion des modules
            </h2>
            <p className="text-gray-400">
              Créez et organisez les modules de votre cours
            </p>
          </div>

          <button
            onClick={() => {
              if (showForm && editingId) {
                setEditingId(null);
                setForm({
                  title: "",
                  description: "",
                  order: 1,
                  moduleType: "video",
                  isPublished: false,
                });
              }
              setShowForm(!showForm);
            }}
            className={`flex items-center gap-2 font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${showForm
                ? "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600"
                : "bg-gray-700 hover:bg-gray-800 text-white"
              }`}
          >
            {showForm ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Fermer
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Ajouter un module
              </>
            )}
          </button>
        </div>

        {/* Formulaire de création */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${showForm
              ? "max-h-[800px] opacity-100 mb-8"
              : "max-h-0 opacity-0 mb-0"
            }`}
        >
          <div className="bg-card border border-gray-700 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              {editingId ? "Modifier le module" : "Nouveau module"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Titre du module
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ex: Introduction à React"
                  className="w-full border border-gray-700 text-gray-100 bg-gray-950 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Decrivez le contenu du module..."
                  rows={4}
                  className="w-full border border-gray-700 text-gray-100 bg-card rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Ordre d&apos;affichage
                </label>
                <input
                  name="order"
                  type="number"
                  value={form.order}
                  onChange={handleChange}
                  placeholder="1"
                  className="w-full border border-gray-700 text-gray-100 bg-gray-950 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  min={1}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Type de module
                </label>
                <select
                  name="moduleType"
                  value={form.moduleType}
                  onChange={handleChange}
                  className="w-full border border-gray-700 text-gray-100 bg-gray-950 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  required
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>

              {/* File input for video/pdf */}
              {(form.moduleType === "pdf" || form.moduleType === "video") && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    Fichier {form.moduleType === "pdf" ? "PDF" : "Vidéo"}
                  </label>
                  <input
                    type="file"
                    name="file"
                    accept={
                      form.moduleType === "pdf" ? "application/pdf" : "video/*"
                    }
                    onChange={handleChange}
                    className="w-full border border-gray-700 text-gray-100 bg-gray-950 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                    required
                  />
                  {file && (
                    <div className="text-gray-400 text-xs mt-1">
                      Fichier sélectionné : {file.name}
                    </div>
                  )}
                </div>
              )}
              <div>
                <label className="inline-flex items-center mt-3">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={form.isPublished}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-gray-600"
                  />
                  <span className="ml-2 text-gray-200">Publier le module</span>
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gray-700 hover:bg-gray-800 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {editingId ? "Mettre à jour" : "Créer le module"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        title: "",
                        description: "",
                        order: 1,
                        moduleType: "video",
                        isPublished: false,
                      });
                    }}
                    className="px-6 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-700 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Liste des modules */}
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            Modules existants ({modules.length})
          </h3>

          {modules.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-gray-700">
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
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-300 text-lg">
                Aucun module créé pour l&apos;instant
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Cliquez sur &quot;Ajouter un module&quot; pour commencer
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {modules.map((module) => (
                <li
                  key={module._id}
                  onClick={() => setSelectedModule(module)}
                  className="bg-card border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all duration-200 shadow-lg group cursor-pointer"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-800 text-gray-200 border border-gray-600 text-sm font-semibold">
                          {module.order}
                        </span>
                        <h4 className="text-lg font-semibold text-gray-200 group-hover:text-gray-300 transition-colors">
                          {module.title}
                        </h4>
                      </div>
                      <p className="text-gray-400 leading-relaxed ml-11 mb-2">
                        {module.description}
                      </p>
                      <div className="ml-11 flex items-center gap-2 text-xs text-gray-500">
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
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                          />
                        </svg>
                        Position: {module.order}
                      </div>
                      <div className="ml-11 flex items-center gap-2 text-xs text-gray-500">
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Type: {module.moduleType === "video" ? "Vidéo" : "PDF"}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(module)}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-gray-300 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Éditer
                      </button>
                      <button
                        onClick={() => handleDelete(module._id)}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-red-400 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
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
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {selectedModule && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedModule(null)}
          >
            <div
              className="bg-gray-900 w-full max-w-4xl rounded-2xl border border-gray-700 shadow-2xl p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-200">
                  {selectedModule.title}
                </h4>

                <button
                  onClick={() => setSelectedModule(null)}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[70vh] overflow-auto rounded-lg border border-gray-700 bg-black">
                {selectedModule.moduleType === "video" && fileUrl && (
                  <video
                    src={fileUrl}
                    controls
                    className="w-full max-h-[70vh] rounded-lg"
                  />
                )}

                {selectedModule.moduleType === "pdf" && fileUrl && (
                  <iframe
                    src={fileUrl}
                    className="w-full h-[70vh] rounded-lg"
                  />
                )}
              </div>

              <div className="mt-4 text-right">
                <button
                  onClick={() => setSelectedModule(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-lg text-white"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
