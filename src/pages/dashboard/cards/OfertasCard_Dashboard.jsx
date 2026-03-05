import { useQueryOfertasResumo } from "@/hooks/ReactQuery/useQueryOfertasResumo";
import { motion } from "framer-motion";
import { time } from "./constant";

const OfertasCard_Dashboard = () => {
    const { data } = useQueryOfertasResumo();
    const totalUnidade = data?.totalUnidade ?? 0;
    const totalGeral = data?.totalGeral ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }} // ❌ Removido: translate: 0
            transition={{ duration: 0.7, delay: time * 0.2 }}
            exit={{ opacity: 0, scale: 0 }}
            className="homeCard"
        >
            <div className="homeCardItem">
                <h3 className="homeCardItemHeader">Ofertas</h3>
                <div className="homeCardItemBody">
                    <div>
                        <p>Unidade</p>
                        <p>{totalUnidade}</p>
                    </div>
                    <div>
                        <p>Geral</p>
                        <p>{totalGeral}</p>
                    </div>
                </div>
            </div>
            <div className="homeCardBar" />
        </motion.div>
    )
};

export default OfertasCard_Dashboard;
