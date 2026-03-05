import Modal from "react-modal";
import { useEffect, useMemo, useState } from "react";
import { GrFormClose } from "react-icons/gr";
import {
  aproveCreditos,
  atualizarCreditos,
  deleteCreditos,
  formatDate,
  forwardCreditos,
  negateCreditos,
} from "../hooks/ListasHook";
import { closeModal } from "../hooks/Functions";
import { formateValue } from "../hooks/Mascaras";
import { getId, getType } from "../hooks/getId";
import {
  CREDIT_STATUS,
  getCreditStatusLabel,
  isCreditStatusFinal,
  isCreditStatusPending,
  normalizeCreditStatus,
  normalizeUserRole,
} from "../pages/creditos/creditStatus";

Modal.setAppElement(document.getElementById("root"));

const CreditosModal = ({ isOpen, modalToggle, info, onActionSuccess }) => {
  const [error, setError] = useState(false);
  const [sucess, setSucess] = useState(false);

  const data = info ?? {};
  const currentUserId = Number(getId());
  const role = normalizeUserRole(getType());

  const status = normalizeCreditStatus(data.status);
  const isFinalStatus = isCreditStatusFinal(data.status);
  const isOwner = Number(data.usuarioSolicitanteId) === currentUserId;
  const isPending = isCreditStatusPending(data.status);

  const canEdit = isOwner && isPending;
  const canDelete = canEdit;
  const canMatrizFinalize =
    role === "MATRIZ" &&
    !isFinalStatus &&
    (status === CREDIT_STATUS.PENDING || status === CREDIT_STATUS.FORWARDED);
  const canAgencyHandle =
    role === "AGENCIA" && !isFinalStatus && !isOwner && isPending;

  const submitHandler = (event) => {
    atualizarCreditos(
      event,
      data.idSolicitacaoCredito,
      modalToggle,
      onActionSuccess
    );
  };

  useEffect(() => {
    formateValue();
  }, []);

  const descricaoPadrao = useMemo(() => {
    return data.descricaoSolicitante || "";
  }, [data.descricaoSolicitante]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={() => closeModal(modalToggle, setSucess, setError)}
      contentLabel="Detalhes do pedido de crédito"
      className="modalEditPanel modalAnimationEdit"
      overlayClassName="modalOverlay modalAnimationOverlay"
    >
      <div className="modalEditHeader">
        <p>Detalhes do pedido de Crédito</p>
        <GrFormClose onClick={() => closeModal(modalToggle, setSucess, setError)} />
      </div>

      <div className="modalDivider"></div>

      <form className="containerForm" onSubmit={submitHandler}>
        <div className="modalTransacoesContainer">
          <div className="modalTransacoesSubContainer">
            <div className="modalTransacoesItem">
              <span>Nome</span>
              <p>{data.usuarioSolicitante?.nome || "-"}</p>
            </div>
            <div className="modalTransacoesItem">
              <span>Agência</span>
              <p>{data.usuarioCriador?.nome || "-"}</p>
            </div>
            <div className="modalTransacoesItem">
              <span>Valor</span>
              <p>{data.valorSolicitado || 0}</p>
            </div>
          </div>

          <div className="modalTransacoesDivider"></div>

          <div className="modalTransacoesSubContainer">
            <div className="modalTransacoesItem">
              <span>Data de Solicitação</span>
              <p>{data.createdAt ? formatDate(data.createdAt) : "-"}</p>
            </div>
            <div className="modalTransacoesItem">
              <span>Status</span>
              <p>{getCreditStatusLabel(data.status)}</p>
            </div>
            <div className="modalTransacoesItem">
              <span>Descrição</span>
              <p>
                {data.descricaoSolicitante
                  ? data.descricaoSolicitante
                  : "Sem descrição"}
              </p>
            </div>
          </div>

          <div className="modalTransacoesDivider"></div>

          {canEdit ? (
            <div className="rowForm">
              <span>Editar Pedido de Crédito</span>
              <div className="form-group">
                <label htmlFor="valorSolicitado">Valor:</label>
                <input
                  required
                  type="text"
                  name="valorSolicitado"
                  id="valorSolicitado"
                  defaultValue={data.valorSolicitado}
                />
              </div>
              <div className="transacoesDesc">
                <div className="form-group desc">
                  <label>Descrição</label>
                  <textarea
                    required
                    defaultValue={descricaoPadrao}
                    name="descricaoSolicitante"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="modalDivierForm"></div>

        <div className="buttonContainer">
          {canMatrizFinalize ? (
            <>
              <button
                className="modalAprove"
                type="button"
                onClick={() =>
                  aproveCreditos(
                    data.idSolicitacaoCredito,
                    modalToggle,
                    onActionSuccess
                  )
                }
              >
                Aprovar
              </button>
              <button
                className="modalDelete"
                type="button"
                onClick={() =>
                  negateCreditos(
                    data.idSolicitacaoCredito,
                    modalToggle,
                    onActionSuccess,
                    "matriz"
                  )
                }
              >
                Recusar
              </button>
            </>
          ) : null}

          {canAgencyHandle ? (
            <>
              <button
                type="button"
                onClick={() =>
                  forwardCreditos(
                    data.idSolicitacaoCredito,
                    modalToggle,
                    onActionSuccess
                  )
                }
              >
                Encaminhar
              </button>
              <button
                className="modalDelete"
                type="button"
                onClick={() =>
                  negateCreditos(
                    data.idSolicitacaoCredito,
                    modalToggle,
                    onActionSuccess,
                    "agencia"
                  )
                }
              >
                Recusar
              </button>
            </>
          ) : null}

          {canDelete ? (
            <button
              className="modalDelete"
              type="button"
              onClick={() =>
                deleteCreditos(
                  data.idSolicitacaoCredito,
                  modalToggle,
                  onActionSuccess
                )
              }
            >
              Deletar
            </button>
          ) : null}

          {canEdit ? (
            <button className="modalButtonSave" type="submit">
              Editar pedido
            </button>
          ) : null}

          <button
            className="modalButtonClose"
            type="button"
            onClick={() => closeModal(modalToggle, setSucess, setError)}
          >
            Fechar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreditosModal;
