"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { User, getColumns } from "./columns";
import { DataTable } from "./data-table";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get("/users");
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted", {
        description: "The user has been successfully deleted.",
      });
      fetchData(); // Refresh list
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Error", {
          description: "Failed to delete user.",
        });
      }
    }
  }, [fetchData]);

  const columns = useMemo(() => getColumns(handleDelete), [handleDelete]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-8">
        User Management
      </h1>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
