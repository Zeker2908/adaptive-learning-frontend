// routes/RootRedirect.tsx
import { Navigate } from 'react-router-dom';
import {useAuthStore} from "@/store/authStore.ts";

export default function RootRedirect() {
    const {isAuthenticated} = useAuthStore();

    return (
        <Navigate
            to={isAuthenticated ? '/dashboard' : '/login'}
            replace
        />
    );
}
