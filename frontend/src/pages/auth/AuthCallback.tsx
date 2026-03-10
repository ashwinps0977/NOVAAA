import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userDataStr = params.get('user');

        if (token && userDataStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userDataStr));

                // Store auth data
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                // Redirect based on role
                if (user.role === 'admin') {
                    navigate('/admin/dashboard');
                } else if (user.role === 'hr') {
                    navigate('/hr/dashboard');
                } else {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
                navigate('/login?error=invalid_user_data');
            }
        } else {
            console.error('Missing token or user data in URL');
            navigate('/login?error=missing_auth_data');
        }
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-gray-900">Finalizing Authentication...</h2>
                <p className="text-gray-500 mt-2">Connecting you to your NOVA dashboard</p>
            </div>
        </div>
    );
};

export default AuthCallback;
