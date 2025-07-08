import './App.css'
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Resultado from './Modals/Resultado';
import { useSnapshot } from 'valtio';
import state from './store';
import { useQueryLogin } from './hooks/ReactQuery/useQueryLogin';
import { useEffect } from 'react'; // <-- Adicionar

function App() {
    const { data, isLoading } = useQueryLogin();
    const snap = useSnapshot(state);
    const navigate = useNavigate();

    // MUDANÇA: Usar useEffect para navegação
    useEffect(() => {
        if (!isLoading && !snap.logged) {
            navigate("/login");
        }
    }, [isLoading, snap.logged, navigate]);

    if (isLoading) {
        return null;
    }

    if (!snap.logged) {
        return null; // <-- Mudança: retornar null em vez de navigate
    }

    return (
        <div className="app-container">
            <Resultado />
            <Sidebar />
            <div className="main-container">
                <Header />
                <Outlet />
            </div>
        </div>
    );
}

export default App;