// App.tsx
import {RouterProvider} from 'react-router-dom';
import {router} from './routes';
import {Toaster} from 'sonner';
import {useAuthInitialization} from "@/hooks/useAuthInitialization.ts";

function App() {
    useAuthInitialization();

    return (
        <>
            <RouterProvider router={router}/>
            <Toaster position="top-right" richColors/>
        </>
    );
}

export default App;