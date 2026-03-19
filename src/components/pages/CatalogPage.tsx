import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCatalogs } from "../../hooks/useCatalogs";
import { useApp } from "../../context/AppContext";
import type { CatalogData, CatalogItemData } from "../../types";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { Input } from "../ui/Input";
import { Skeleton } from "../ui/Skeleton";
import { EmptyState } from "../ui/EmptyState";
import { PlusIcon, TrashIcon, EditIcon, TagIcon, AlertCircleIcon } from "../ui/Icons";

export function CatalogPage() {
  const { t } = useTranslation();
  const { user } = useApp();
  const isSuperAdmin = user?.role === "super_admin";
  const {
    catalogs,
    selectedCatalogId,
    items,
    loading,
    itemsLoading,
    error,
    selectCatalog,
    createCatalog,
    updateCatalog,
    deleteCatalog,
    activateCatalog,
    createItem,
    updateItem,
    deleteItem,
  } = useCatalogs();

  const [showCreateCatalog, setShowCreateCatalog] = useState(false);
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItemData | null>(null);
  const [editingCatalog, setEditingCatalog] = useState<CatalogData | null>(null);
  const [catalogToDelete, setCatalogToDelete] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ catalogId: string; itemId: string } | null>(null);
  const [deletingCatalog, setDeletingCatalog] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);

  const selectedCatalog = catalogs.find((c) => c.id === selectedCatalogId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text tracking-tight">{t('catalog.title')}</h1>
          <p className="text-sm text-text-muted mt-2">
            {t('catalog.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<PlusIcon size={14} />}
          onClick={() => setShowCreateCatalog(true)}
        >
          {t('catalog.newCatalog')}
        </Button>
      </div>

      {error && (
        <div className="bg-red-muted border border-red/30 rounded-[var(--radius-md)] px-4 py-3 text-sm text-red">
          {error}
        </div>
      )}

      {/* Catalogs list */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : catalogs.length === 0 ? (
          <EmptyState
            icon={<TagIcon size={40} />}
            title={t('catalog.noCatalogs')}
            description={t('catalog.noCatalogsDescription')}
          />
        ) : (
          catalogs.map((catalog, i) => (
            <div
              key={catalog.id}
              onClick={() => selectCatalog(catalog.id)}
              className={`glass border rounded-[var(--radius-lg)] px-4 py-3 cursor-pointer glow-card animate-fade-in-up ${
                selectedCatalogId === catalog.id
                  ? "border-accent/50 bg-accent-dim/30"
                  : "border-border hover:border-border-hi hover:bg-surface-hover"
              }`}
              style={{ animationDelay: `${Math.min(i * 0.04, 0.3)}s` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-sm font-medium text-text-bright">
                      {catalog.name}
                    </span>
                    <p className="text-xs text-text-muted font-mono mt-0.5">
                      {t('catalog.effective', { date: new Date(catalog.effectiveDate).toLocaleDateString() })}
                    </p>
                  </div>
                  {isSuperAdmin && (catalog.orgName || catalog.orgId) && (
                    <Badge variant="default">
                      {catalog.orgName ?? catalog.orgId}
                    </Badge>
                  )}
                  <Badge
                    variant={catalog.isActive ? "success" : "default"}
                    dot
                  >
                    {catalog.isActive ? t('common.active') : t('common.inactive')}
                  </Badge>
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {!catalog.isActive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => activateCatalog(catalog.id)}
                    >
                      {t('catalog.activate')}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<EditIcon size={14} />}
                    onClick={() => setEditingCatalog(catalog)}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<TrashIcon size={14} />}
                    onClick={() => setCatalogToDelete(catalog.id)}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Items table */}
      {selectedCatalog && (
        <div className="space-y-3">
          <div className="flex items-center justify-between animate-fade-in-up">
            <h2 className="text-sm font-semibold text-text-bright">
              {t('catalog.items', { name: selectedCatalog.name })}
            </h2>
            <Button
              variant="primary"
              size="sm"
              icon={<PlusIcon size={14} />}
              onClick={() => setShowCreateItem(true)}
            >
              {t('catalog.addItem')}
            </Button>
          </div>

          {itemsLoading ? (
            <Skeleton className="h-32" />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<TagIcon size={40} />}
              title={t('catalog.noItems')}
              description={t('catalog.noItemsDescription')}
            />
          ) : (
            <div className="glass border border-border rounded-[var(--radius-lg)] overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-hi/30">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted">{t('catalog.code')}</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted">{t('common.name')}</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted">{t('catalog.category')}</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-text-muted">{t('catalog.price')}</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted">{t('catalog.unit')}</th>
                      <th className="text-center px-4 py-2.5 text-xs font-medium text-text-muted">{t('common.active')}</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-text-muted">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-border last:border-0 hover:bg-surface-hover/60 transition-all duration-200">
                        <td className="px-4 py-2.5 text-text-muted font-mono text-xs">{item.code}</td>
                        <td className="px-4 py-2.5 text-text-bright">
                          <div>{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-text-muted truncate max-w-[200px]">{item.description}</div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-text-muted">{item.category ?? "—"}</td>
                        <td className="px-4 py-2.5 text-right text-text-bright font-mono">
                          {item.priceRange ? (
                            <div className="group relative">
                              <span className="text-accent">
                                {t('catalog.from', { price: Math.min(
                                  item.priceRange.solado?.min ?? Infinity,
                                  item.priceRange.tierra?.min ?? Infinity,
                                ).toFixed(2) })}
                              </span>
                              <div className="absolute right-0 top-full mt-1 z-10 hidden group-hover:block bg-surface-hi border border-border rounded-[var(--radius-md)] px-3 py-2 text-xs text-text-muted whitespace-nowrap shadow-lg">
                                {item.priceRange.solado && (
                                  <div>{t('catalog.solado', { min: item.priceRange.solado.min.toFixed(2), max: item.priceRange.solado.max.toFixed(2) })}</div>
                                )}
                                {item.priceRange.tierra && (
                                  <div>{t('catalog.tierra', { min: item.priceRange.tierra.min.toFixed(2), max: item.priceRange.tierra.max.toFixed(2) })}</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            Number(item.pricePerUnit).toFixed(2)
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-text-muted">{item.unit}</td>
                        <td className="px-4 py-2.5 text-center">
                          <Badge variant={item.isActive ? "success" : "default"} dot>
                            {item.isActive ? t('common.yes') : t('common.no')}
                          </Badge>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<EditIcon size={14} />}
                              onClick={() => setEditingItem(item)}
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              icon={<TrashIcon size={14} />}
                              onClick={() => setItemToDelete({ catalogId: selectedCatalogId!, itemId: item.id })}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Catalog Modal */}
      <CreateCatalogModal
        open={showCreateCatalog}
        onClose={() => setShowCreateCatalog(false)}
        onCreate={async (data) => {
          await createCatalog(data);
          setShowCreateCatalog(false);
        }}
      />

      {/* Edit Catalog Modal */}
      {editingCatalog && (
        <EditCatalogModal
          open={true}
          catalog={editingCatalog}
          onClose={() => setEditingCatalog(null)}
          onSave={async (data) => {
            await updateCatalog(editingCatalog.id, data);
            setEditingCatalog(null);
          }}
        />
      )}

      {/* Create Item Modal */}
      {selectedCatalogId && (
        <CreateItemModal
          open={showCreateItem}
          onClose={() => setShowCreateItem(false)}
          onCreate={async (data) => {
            await createItem(selectedCatalogId, data);
            setShowCreateItem(false);
          }}
        />
      )}

      {/* Edit Item Modal */}
      {editingItem && selectedCatalogId && (
        <EditItemModal
          open={true}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={async (data) => {
            await updateItem(selectedCatalogId, editingItem.id, data);
            setEditingItem(null);
          }}
        />
      )}

      {/* Delete Catalog Confirmation */}
      <ConfirmDeleteModal
        open={catalogToDelete !== null}
        onClose={() => setCatalogToDelete(null)}
        onConfirm={async () => {
          if (!catalogToDelete) return;
          setDeletingCatalog(true);
          try {
            await deleteCatalog(catalogToDelete);
            setCatalogToDelete(null);
          } finally {
            setDeletingCatalog(false);
          }
        }}
        loading={deletingCatalog}
        title={t('catalog.deleteCatalog')}
        message={t('catalog.deleteCatalogConfirm')}
      />

      {/* Delete Item Confirmation */}
      <ConfirmDeleteModal
        open={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={async () => {
          if (!itemToDelete) return;
          setDeletingItem(true);
          try {
            await deleteItem(itemToDelete.catalogId, itemToDelete.itemId);
            setItemToDelete(null);
          } finally {
            setDeletingItem(false);
          }
        }}
        loading={deletingItem}
        title={t('catalog.deleteItem')}
        message={t('catalog.deleteItemConfirm')}
      />
    </div>
  );
}

// ── Create Catalog Modal ──────────────────────────────────────────────────

function CreateCatalogModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; effectiveDate: string }) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0]!,
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onCreate({
        name: name.trim(),
        effectiveDate: new Date(effectiveDate).toISOString(),
      });
      setName("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('catalog.createCatalog')}>
      <div className="space-y-4">
        <Input
          label={t('common.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('catalog.catalogName')}
        />
        <Input
          label={t('catalog.effectiveDate')}
          type="date"
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={saving}
            disabled={!name.trim()}
          >
            {t('common.create')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Edit Catalog Modal ────────────────────────────────────────────────────

function EditCatalogModal({
  open,
  catalog,
  onClose,
  onSave,
}: {
  open: boolean;
  catalog: CatalogData;
  onClose: () => void;
  onSave: (data: { name?: string; effectiveDate?: string }) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState(catalog.name);
  const [effectiveDate, setEffectiveDate] = useState(
    new Date(catalog.effectiveDate).toISOString().split("T")[0]!,
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        effectiveDate: new Date(effectiveDate).toISOString(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('catalog.editCatalog')}>
      <div className="space-y-4">
        <Input
          label={t('common.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label={t('catalog.effectiveDate')}
          type="date"
          value={effectiveDate}
          onChange={(e) => setEffectiveDate(e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>
            {t('common.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Create Item Modal ─────────────────────────────────────────────────────

function CreateItemModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description?: string | null;
    category?: string | null;
    pricePerUnit: number;
    unit: string;
  }) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("m²");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !price) return;
    setSaving(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        pricePerUnit: Number(price),
        unit: unit.trim(),
      });
      setName("");
      setDescription("");
      setCategory("");
      setPrice("");
      setUnit("m²");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('catalog.addItem')}>
      <div className="space-y-4">
        <Input
          label={t('common.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('catalog.productName')}
        />
        <Input
          label={t('catalog.description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('catalog.descriptionPlaceholder')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('catalog.category')}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t('catalog.categoryPlaceholder')}
          />
          <Input
            label={t('catalog.unit')}
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder={t('catalog.unitPlaceholder')}
          />
        </div>
        <Input
          label={t('catalog.pricePerUnit')}
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={saving}
            disabled={!name.trim() || !price}
          >
            {t('catalog.addItem')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Confirm Delete Modal ──────────────────────────────────────────────────

function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
  loading,
  title,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
  title: string;
  message: string;
}) {
  const { t } = useTranslation();

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-red-muted/50 border border-red/20 rounded-[var(--radius-md)]">
          <AlertCircleIcon size={18} className="text-red shrink-0 mt-0.5" />
          <p className="text-sm text-red">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {t('common.delete')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Edit Item Modal ───────────────────────────────────────────────────────

function EditItemModal({
  open,
  item,
  onClose,
  onSave,
}: {
  open: boolean;
  item: CatalogItemData;
  onClose: () => void;
  onSave: (data: {
    name?: string;
    description?: string | null;
    category?: string | null;
    pricePerUnit?: number;
    unit?: string;
    isActive?: boolean;
  }) => Promise<void>;
}) {
  const { t } = useTranslation();
  const hasVariablePricing = !!item.priceRange;
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? "");
  const [category, setCategory] = useState(item.category ?? "");
  const [price, setPrice] = useState(item.pricePerUnit);
  const [unit, setUnit] = useState(item.unit);
  const [isActive, setIsActive] = useState(item.isActive);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || null,
        category: category.trim() || null,
        ...(hasVariablePricing ? {} : { pricePerUnit: Number(price) }),
        unit: unit.trim(),
        isActive,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('catalog.editItem')}>
      <div className="space-y-4">
        <Input
          label={t('common.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label={t('catalog.description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('catalog.category')}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Input
            label={t('catalog.unit')}
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>
        {hasVariablePricing ? (
          <div className="text-sm text-text-muted bg-surface-hi/50 border border-border rounded-[var(--radius-md)] px-3 py-2">
            {t('catalog.variablePrice')}
            {item.priceRange?.solado && (
              <span className="block text-xs mt-1">{t('catalog.solado', { min: item.priceRange.solado.min.toFixed(2), max: item.priceRange.solado.max.toFixed(2) })}</span>
            )}
            {item.priceRange?.tierra && (
              <span className="block text-xs">{t('catalog.tierra', { min: item.priceRange.tierra.min.toFixed(2), max: item.priceRange.tierra.max.toFixed(2) })}</span>
            )}
          </div>
        ) : (
          <Input
            label={t('catalog.pricePerUnit')}
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        )}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="accent-[var(--color-accent)]"
          />
          <label htmlFor="isActive" className="text-sm text-text-muted">{t('catalog.isActive')}</label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={saving}>
            {t('common.save')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
