const API_URL = 'http://localhost:5000/api/teams';

export const teamService = {
    autoSelectTeam: async (projectData: any) => {
        const response = await fetch(`${API_URL}/auto-select`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(projectData)
        });
        return response.json();
    },

    getTeamOverview: async () => {
        const response = await fetch(`${API_URL}/overview`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.json();
    }
};
