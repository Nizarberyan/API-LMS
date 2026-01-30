import api from "@/lib/api";

export interface Enrollment {
    _id: string;
    student: string;
    course: {
        _id: string;
        title: string;
        description: string;
        isPublished: boolean;
        imageUrl?: string;
        teacher: {
            firstName: string;
            lastName: string;
        };
    };
    createdAt: string;
    updatedAt: string;
}

export const getStudentEnrollments = async (studentId: string): Promise<Enrollment[]> => {
    const response = await api.get(`/enrollments/student/${studentId}`);
    return response.data;
};
