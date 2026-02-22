import { API_BASE_URL as API_BASE } from '../config';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export interface Task {
    _id: string;
    title: string;
    description?: string;
    project: string;
    priority: 'low' | 'medium' | 'high';
    status: 'assigned' | 'in_progress' | 'review' | 'completed';
    dueDate: string;
    assignedTo?: {
        _id: string;
        name: string;
        email: string;
    };
    assignedBy?: {
        _id: string;
        name: string;
    };
    createdBy?: string;
    comments?: {
        text: string;
        author: {
            _id: string;
            name: string;
        };
        createdAt: string;
    }[];
    attachments?: string[];
    createdAt: string;
}

export const taskService = {
    getAllTasks: async () => {
        const response = await fetch(`${API_BASE}/tasks`, {
            headers: getHeaders(),
        });
        return response.json();
    },

    getMyTasks: async () => {
        const response = await fetch(`${API_BASE}/tasks/my-tasks`, {
            headers: getHeaders(),
        });
        return response.json();
    },

    createTask: async (taskData: any) => {
        const response = await fetch(`${API_BASE}/tasks`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(taskData),
        });
        return response.json();
    },

    updateTask: async (id: string, updates: any) => {
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(updates),
        });
        return response.json();
    },

    updateTaskStatus: async (id: string, status: string) => {
        const response = await fetch(`${API_BASE}/tasks/${id}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status }),
        });
        return response.json();
    },

    deleteTask: async (id: string) => {
        const response = await fetch(`${API_BASE}/tasks/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return response.json();
    },
    addComment: async (id: string, text: string) => {
        const response = await fetch(`${API_BASE}/tasks/${id}/comment`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ text }),
        });
        return response.json();
    },
    uploadAttachment: async (id: string, fileOrUrl: File | string) => {
        if (typeof fileOrUrl === 'string') {
            const response = await fetch(`${API_BASE}/tasks/${id}/upload`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ url: fileOrUrl }),
            });
            return response.json();
        } else {
            const formData = new FormData();
            formData.append('file', fileOrUrl);

            const response = await fetch(`${API_BASE}/tasks/${id}/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: formData,
            });
            return response.json();
        }
    }
};
