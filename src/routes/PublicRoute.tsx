// routes/PublicRoute.tsx
import {Navigate, Outlet, useLocation} from 'react-router-dom';
import {useAuthStore} from '@/store/authStore';

export function PublicRoute({redirectTo = '/dashboard'}: { redirectTo?: string }) {
    const {isAuthenticated} = useAuthStore();
    const location = useLocation();

    if (isAuthenticated) {
        return <Navigate to={redirectTo} state={{from: location}} replace/>;
    }

    return <Outlet/>;
}