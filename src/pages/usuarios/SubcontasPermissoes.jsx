import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { ColorRing } from "react-loader-spinner";
import Footer from "@/components/Footer";
import { activePage } from "@/utils/functions/setActivePage";
import ButtonMotion from "@/components/FramerMotion/ButtonMotion";
import useRevalidate from "@/hooks/ReactQuery/useRevalidate";
import { FaUser } from "react-icons/fa";
import PermissionsMatrix from "@/components/Permissions/PermissionsMatrix";
import { permissionsSchema } from "@/config/permissionsSchema";
import { API_URL } from "@/config/api";

const ensureMatrixShape = (matrix = {}) => {
  const shaped = {};

  permissionsSchema.forEach((categoria) => {
    shaped[categoria.categoria] = {
      ...(matrix?.[categoria.categoria] || {}),
    };
  });

  Object.keys(matrix || {}).forEach((categoria) => {
    if (!shaped[categoria]) {
      shaped[categoria] = { ...(matrix[categoria] || {}) };
    }
  });

  return shaped;
};

const matrixToKeys = (matrix = {}) => {
  const keys = [];
  Object.entries(matrix || {}).forEach(([categoria, values]) => {
    Object.entries(values || {}).forEach(([acao, habilitado]) => {
      if (habilitado) {
        keys.push(`${categoria}.${acao}`);
      }
    });
  });
  return keys;
};

const SubcontasPermissoes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const revalidate = useRevalidate();
  const subcontaId =
    location.state?.subcontaId ||
    new URLSearchParams(location.search).get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [subconta, setSubconta] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [initialGroupId, setInitialGroupId] = useState(null);
  const [baseMatrix, setBaseMatrix] = useState(ensureMatrixShape());
  const [currentMatrix, setCurrentMatrix] = useState(ensureMatrixShape());
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const [hasInitialOverride, setHasInitialOverride] = useState(false);

  const token = localStorage.getItem("tokenRedeTrade");
  const headers = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  useEffect(() => {
    activePage("usuarios");
    if (!subcontaId) {
      toast.error("ID da subconta não encontrado");
      navigate("/usuariosEditar");
      return;
    }
    if (!token) {
      toast.error("Token expirado. Faça login novamente.");
      navigate("/login");
      return;
    }
    fetchInitialData();
  }, [subcontaId, token]);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId),
    [groups, selectedGroupId]
  );

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [subResponse, groupsResponse, permissionsResponse] =
        await Promise.all([
          fetch(`${API_URL}/contas/buscar-subconta/${subcontaId}`, {
            headers,
          }),
          fetch(`${API_URL}/permissions/permission-groups`, { headers }),
          fetch(
            `${API_URL}/permissions/usuarios/${subcontaId}/permissoes?target=subconta`,
            { headers }
          ),
        ]);

      if (!subResponse.ok) {
        throw new Error("Erro ao buscar subconta");
      }
      const subData = await subResponse.json();
      setSubconta(subData);

      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json();
        setGroups(groupsData.data || []);
      }

      if (permissionsResponse.ok) {
        const permData = await permissionsResponse.json();
        const base = ensureMatrixShape(permData.baseMatrix || {});
        const resolved = ensureMatrixShape(permData.resolvedMatrix || base);

        setBaseMatrix(base);
        setCurrentMatrix(resolved);
        setSelectedGroupId(permData.group?.id || null);
        setInitialGroupId(permData.group?.id || null);

        const overrideActive =
          Boolean(permData.override?.allow?.length) ||
          Boolean(permData.override?.deny?.length);
        setOverrideEnabled(overrideActive);
        setHasInitialOverride(overrideActive);
      } else {
        setBaseMatrix(ensureMatrixShape());
        setCurrentMatrix(ensureMatrixShape());
        setSelectedGroupId(null);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error);
      toast.error(error.message || "Erro ao carregar dados da subconta");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = async (event) => {
    const value = event.target.value;
    if (!value) {
      setSelectedGroupId(null);
      setBaseMatrix(ensureMatrixShape());
      setCurrentMatrix(ensureMatrixShape());
      setOverrideEnabled(false);
      return;
    }

    try {
      setSelectedGroupId(parseInt(value, 10));
      const response = await fetch(
        `${API_URL}/permissions/permission-groups/${value}`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar permissões do grupo");
      }

      const data = await response.json();
      const permissions = ensureMatrixShape(data.permissions || {});
      setBaseMatrix(permissions);
      setCurrentMatrix(permissions);
      setOverrideEnabled(false);
    } catch (error) {
      console.error("❌ Erro ao trocar grupo:", error);
      toast.error(error.message || "Não foi possível alterar o grupo");
    }
  };

  const toggleOverride = () => {
    if (!selectedGroupId) {
      toast.error("Selecione um grupo antes de personalizar.");
      return;
    }
    setOverrideEnabled((prev) => {
      if (prev) {
        setCurrentMatrix(ensureMatrixShape(baseMatrix));
        return false;
      }
      return true;
    });
  };

  const handleSave = async () => {
    if (!selectedGroupId) {
      toast.error("Selecione um grupo antes de salvar.");
      return;
    }

    try {
      setSaving(true);
      const requests = [];
      if (selectedGroupId !== initialGroupId) {
        requests.push(
          fetch(
            `${API_URL}/permissions/usuarios/${subcontaId}/permission-group?target=subconta`,
            {
              method: "POST",
              headers,
              body: JSON.stringify({
                groupId: selectedGroupId,
                escopo: "DEFAULT",
              }),
            }
          )
        );
      }

      const baseKeys = new Set(matrixToKeys(baseMatrix));
      const targetKeys = new Set(matrixToKeys(currentMatrix));
      const additions = [...targetKeys].filter((key) => !baseKeys.has(key));
      const removals = [...baseKeys].filter((key) => !targetKeys.has(key));

      if (overrideEnabled) {
        if (additions.length || removals.length) {
          requests.push(
            fetch(
              `${API_URL}/permissions/usuarios/${subcontaId}/permission-override?target=subconta`,
              {
                method: "PUT",
                headers,
                body: JSON.stringify({
                  groupId: selectedGroupId,
                  override: {
                    allow: additions,
                    deny: removals,
                  },
                }),
              }
            )
          );
        } else if (hasInitialOverride) {
          requests.push(
            fetch(
              `${API_URL}/permissions/usuarios/${subcontaId}/permission-override?target=subconta`,
              {
                method: "PUT",
                headers,
                body: JSON.stringify({
                  groupId: selectedGroupId,
                  override: {
                    allow: [],
                    deny: [],
                  },
                }),
              }
            )
          );
        }
      } else if (hasInitialOverride) {
        requests.push(
          fetch(
            `${API_URL}/permissions/usuarios/${subcontaId}/permission-override?target=subconta`,
            {
              method: "PUT",
              headers,
              body: JSON.stringify({
                groupId: selectedGroupId,
                override: {
                  allow: [],
                  deny: [],
                },
              }),
            }
          )
        );
      }

      await Promise.all(requests);
      toast.success("Permissões atualizadas com sucesso!");
      revalidate("sub-contas");
      setInitialGroupId(selectedGroupId);
      setHasInitialOverride(overrideEnabled && (additions.length || removals.length));
    } catch (error) {
      console.error("❌ Erro ao salvar permissões:", error);
      toast.error(error.message || "Erro ao salvar permissões");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="containerHeader">Carregando...</div>
        <div className="loading">
          <ColorRing
            visible
            height="80"
            width="80"
            ariaLabel="color-ring-loading"
            colors={["#2d6cdf", "#2d6cdf", "#2d6cdf", "#2d6cdf", "#2d6cdf"]}
          />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="containerHeader">
        <FaUser /> Permissões da Subconta
      </div>

      {subconta && (
        <div className="perm-card">
          <p>
            <strong>Nome:</strong> {subconta.nome}
          </p>
          <p>
            <strong>Email:</strong> {subconta.email}
          </p>
          <p>
            <strong>Número:</strong> {subconta.numeroSubConta}
          </p>
        </div>
      )}

      <div className="perm-card">
        <div className="permissions-section__header">
          <p>Grupo aplicado</p>
        </div>
        <div className="permissions-page__selector">
          <label className="permissions-page__selectorLabel">
            Selecionar grupo
          </label>
          <select
            value={selectedGroupId || ""}
            onChange={handleGroupChange}
          >
            <option value="">Selecione...</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.nome}
              </option>
            ))}
          </select>
          {selectedGroup?.descricao && (
            <p className="permissions-page__hint">{selectedGroup.descricao}</p>
          )}
        </div>
      </div>

      <div className="perm-card">
        <div className="permissions-section__header">
          <div>
            <p>Permissões personalizadas</p>
            <small>Ative para ajustar permissões específicas da subconta.</small>
          </div>
          <label className="permissions-toggle">
            <input
              type="checkbox"
              checked={overrideEnabled}
              onChange={toggleOverride}
            />
            <span>Personalizar</span>
          </label>
        </div>
        <PermissionsMatrix
          schema={permissionsSchema}
          value={currentMatrix}
          onChange={setCurrentMatrix}
          disabled={!overrideEnabled}
        />
      </div>

      <div className="buttonContainer">
        {saving ? (
          <ColorRing
            visible
            height="33"
            width="80"
            ariaLabel="blocks-loading"
            colors={["#2d6cdf", "#2d6cdf", "#2d6cdf", "#2d6cdf", "#2d6cdf"]}
          />
        ) : (
          <ButtonMotion className="purpleBtn" onClick={handleSave}>
            Salvar
          </ButtonMotion>
        )}
        <ButtonMotion
          className="secondaryBtn"
          type="button"
          onClick={() => navigate("/usuariosEditar")}
        >
          Voltar
        </ButtonMotion>
      </div>

      <Footer />
    </div>
  );
};

export default SubcontasPermissoes;
