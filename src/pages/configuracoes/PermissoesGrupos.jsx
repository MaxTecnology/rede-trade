import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { permissionsSchema } from "@/config/permissionsSchema";
import { API_URL } from "@/config/api";
import PermissionsMatrix from "@/components/Permissions/PermissionsMatrix";
import ButtonMotion from "@/components/FramerMotion/ButtonMotion";
import Footer from "@/components/Footer";
import { ColorRing } from "react-loader-spinner";
import { activePage } from "@/utils/functions/setActivePage";

const DEFAULT_FORM = {
  nome: "",
  descricao: "",
  defaultForTipo: "",
  herdaDoGrupoId: "",
  isDefault: false,
};

const PermissoesGrupos = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const [baseline, setBaseline] = useState({
    form: DEFAULT_FORM,
    permissions: {},
  });
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const navigate = useNavigate();
  const { groupId } = useParams();

  useEffect(() => {
    activePage("usuarios");
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/permissions/permission-groups`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("tokenRedeTrade")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar grupos");
      }
      const data = await response.json();
      const loadedGroups = data.data || [];
      setGroups(loadedGroups);

      if (!loadedGroups.length) {
        return;
      }

      const initialId = groupId ? parseInt(groupId, 10) : null;
      const targetGroup =
        loadedGroups.find((item) => item.id === initialId) ||
        loadedGroups[0];

      if (targetGroup) {
        await handleSelectGroup(targetGroup, Boolean(!initialId));
      }
    } catch (error) {
      console.error("❌ Erro ao carregar grupos:", error);
      toast.error("Erro ao carregar grupos.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = async (group, shouldUpdateRoute = true) => {
    try {
      setSelectedGroup(group);
      setFormValues({
        nome: group.nome,
        descricao: group.descricao || "",
        defaultForTipo: group.defaultForTipo || "",
        herdaDoGrupoId: group.herdaDoGrupoId || "",
        isDefault: group.isDefault,
      });

      const response = await fetch(
        `${API_URL}/permissions/permission-groups/${group.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("tokenRedeTrade")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar detalhes");
      }

      const data = await response.json();
      const normalizedPermissions = data.permissions || {};
      const normalizedForm = {
        nome: group.nome,
        descricao: group.descricao || "",
        defaultForTipo: group.defaultForTipo || "",
        herdaDoGrupoId: group.herdaDoGrupoId || "",
        isDefault: group.isDefault,
      };

      setFormValues(normalizedForm);
      setPermissions(normalizedPermissions);
      setBaseline({
        form: normalizedForm,
        permissions: normalizedPermissions,
      });
      setHasPendingChanges(false);

      if (shouldUpdateRoute && group?.id) {
        navigate(`/configuracoes/permissoes/grupos/${group.id}`, {
          replace: true,
        });
      }
    } catch (error) {
      console.error("❌ Erro ao carregar detalhes do grupo:", error);
      toast.error("Erro ao carregar detalhes do grupo.");
    }
  };

  const handleSave = async () => {
    if (!selectedGroup) return;

    try {
      setSaving(true);
      await fetch(
        `${API_URL}/permissions/permission-groups/${selectedGroup.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("tokenRedeTrade")}`,
          },
          body: JSON.stringify({
            nome: formValues.nome,
            descricao: formValues.descricao,
            defaultForTipo: formValues.defaultForTipo,
            herdaDoGrupoId: formValues.herdaDoGrupoId || null,
            isDefault: formValues.isDefault,
          }),
        }
      );

      await fetch(
        `${API_URL}/permissions/permission-groups/${selectedGroup.id}/permissions`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("tokenRedeTrade")}`,
          },
          body: JSON.stringify({ permissions }),
        }
      );

      toast.success("Grupo atualizado com sucesso!");
      await loadGroups();
    } catch (error) {
      console.error("❌ Erro ao salvar grupo:", error);
      toast.error(
        error?.response?.data?.error || "Erro ao salvar grupo de permissões."
      );
    } finally {
      setSaving(false);
    }
  };

  const groupOptions = useMemo(
    () =>
      groups.map((group) => ({
        value: group.id,
        label: group.nome,
      })),
    [groups]
  );

  const stats = useMemo(() => {
    if (!groups.length) return null;
    const defaultCount = groups.filter((item) => item.isDefault).length;
    const subCount = groups.filter((item) =>
      (item.defaultForTipo || "").toLowerCase().includes("sub")
    ).length;

    return {
      total: groups.length,
      defaults: defaultCount,
      subGroupCount: subCount,
    };
  }, [groups]);

  const inheritedGroup = useMemo(() => {
    if (!selectedGroup?.herdaDoGrupoId) return null;
    return groups.find((group) => group.id === selectedGroup.herdaDoGrupoId);
  }, [groups, selectedGroup]);

  const normalizedPermissions = useMemo(
    () => permissions || {},
    [permissions]
  );

  useEffect(() => {
    const formChanged =
      JSON.stringify(formValues) !== JSON.stringify(baseline.form);
    const permissionsChanged =
      JSON.stringify(normalizedPermissions) !==
      JSON.stringify(baseline.permissions);

    setHasPendingChanges(formChanged || permissionsChanged);
  }, [baseline, formValues, normalizedPermissions]);

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
      <div className="container permissions-page">
        <div className="containerHeader">
          Grupos de Permissões
          {hasPendingChanges && (
            <span className="status-chip warning">Alterações não salvas</span>
          )}
        </div>

        {stats && (
          <div className="permissions-summary">
            <div className="summary-card">
              <span>Total de grupos</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="summary-card">
              <span>Grupos padrão</span>
              <strong>{stats.defaults}</strong>
            </div>
            <div className="summary-card">
              <span>Perfis de subconta</span>
              <strong>{stats.subGroupCount}</strong>
            </div>
          </div>
        )}

        <div className="perm-card permissions-page__selector">
          <label className="permissions-page__selectorLabel">
            Selecionar grupo
          </label>
        <select
          value={selectedGroup?.id || ""}
          onChange={(event) => {
            const group = groups.find(
              (item) => item.id === parseInt(event.target.value, 10)
            );
            if (group) {
            handleSelectGroup(group);
            }
          }}
        >
          {groupOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="perm-card">
        <div className="permissions-section__header">
          <div>
            <p>Dados do Grupo</p>
            <div className="permissions-group-badges">
              {formValues.isDefault && (
                <span className="status-chip success">Grupo padrão</span>
              )}
              {formValues.defaultForTipo && (
                <span className="status-chip neutral">
                  {formValues.defaultForTipo}
                </span>
              )}
              {inheritedGroup && (
                <span className="status-chip info">
                  Herda de {inheritedGroup.nome}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="permissions-form-grid">
          <div className="form-group">
            <label>Nome do Grupo</label>
            <input
              type="text"
              value={formValues.nome}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, nome: event.target.value }))
              }
              disabled
            />
          </div>

          <div className="form-group">
            <label>Descrição</label>
            <textarea
              rows={1}
              value={formValues.descricao}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  descricao: event.target.value,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label>Tipo Padrão</label>
            <input
              type="text"
              value={formValues.defaultForTipo}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  defaultForTipo: event.target.value,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label>Herda de outro grupo</label>
            <select
              value={formValues.herdaDoGrupoId || ""}
              onChange={(event) =>
                setFormValues((prev) => ({
                  ...prev,
                  herdaDoGrupoId: event.target.value,
                }))
              }
            >
              <option value="">Nenhum</option>
              {groupOptions
                .filter((option) => option.value !== selectedGroup?.id)
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="permissions-group-meta">
          <div className="permissions-group-meta__item">
            <span>Tipo padrão</span>
            <strong>{formValues.defaultForTipo || "Nenhum"}</strong>
          </div>
          <div className="permissions-group-meta__item">
            <span>Herda de</span>
            <strong>{inheritedGroup?.nome || "Nenhum"}</strong>
          </div>
        </div>
      </div>

      <div className="perm-card">
        <div className="permissions-section__header">
          <p>Permissões</p>
        </div>
        <PermissionsMatrix
          schema={permissionsSchema}
          value={permissions}
          onChange={setPermissions}
        />
      </div>

      <div className="buttonContainer permissions-page__buttons">
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
            {hasPendingChanges ? "Salvar alterações" : "Salvar"}
          </ButtonMotion>
        )}
        <ButtonMotion
          className="secondaryBtn"
          type="button"
          onClick={() => navigate(-1)}
        >
          Voltar
        </ButtonMotion>
      </div>

      <Footer />
    </div>
  );
};

export default PermissoesGrupos;
