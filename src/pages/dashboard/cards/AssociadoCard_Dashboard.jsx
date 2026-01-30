import { motion } from "framer-motion";
import { useQueryAssociadosResumo } from "@/hooks/ReactQuery/useQueryAssociadosResumo";

const AssociadoCard_Dashboard = () => {
  const { data } = useQueryAssociadosResumo();

  const totalUnidade = data?.totalUnidade ?? 0;
  const totalGeral = data?.totalGeral ?? 0;

  return (
      <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }} // ❌ Removido: translate: 0
          transition={{ duration: 0.7 }}
          exit={{ opacity: 0, scale: 0 }}
          className="homeCard"
      >
        <div className="homeCardItem">
          <h3 className="homeCardItemHeader">Associados</h3>
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
  );
};

export default AssociadoCard_Dashboard;
