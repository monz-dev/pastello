'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';

type IngredientRow = {
  id: string;
  type: string;
  name: string;
  description: string | null;
  image_url: string;
  additional_price: number | null;
  is_available: boolean | null;
  is_active: boolean | null;
  sort_order: number | null;
};

type Message = {
  text: string;
  kind: 'success' | 'error';
} | null;

type EditingIngredient = {
  id?: string;
  type: string;
  name: string;
  description: string;
  image_url: string;
  additional_price: string;
  sort_order: string;
};

const TABS = [
  { key: 'tamaño', label: 'Tamaño' },
  { key: 'pan', label: 'Pan' },
  { key: 'relleno', label: 'Relleno' },
  { key: 'cobertura', label: 'Cobertura' },
] as const;

const BLANK_FORM: EditingIngredient = {
  type: 'pan',
  name: '',
  description: '',
  image_url: '/images/placeholder-ingredient.svg',
  additional_price: '0',
  sort_order: '0',
};

export default function AdminCatalogPage() {
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<string>('tamaño');
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message>(null);

  const [editing, setEditing] = useState<EditingIngredient>({ ...BLANK_FORM });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('type', activeTab)
      .order('sort_order', { ascending: true });

    if (error) {
      setMessage({ text: `Error al cargar: ${error.message}`, kind: 'error' });
      setIngredients([]);
    } else {
      setIngredients(data as IngredientRow[]);
    }
    setLoading(false);
  }, [supabase, activeTab]);

  useEffect(() => {
    void fetchIngredients();
  }, [fetchIngredients]);

  const showMessage = (text: string, kind: 'success' | 'error') => {
    setMessage({ text, kind });
    setTimeout(() => setMessage(null), 4000);
  };

  const startEditing = (ingredient: IngredientRow) => {
    setEditingId(ingredient.id);
    setEditing({
      type: ingredient.type,
      name: ingredient.name,
      description: ingredient.description ?? '',
      image_url: ingredient.image_url,
      additional_price: String(ingredient.additional_price ?? 0),
      sort_order: String(ingredient.sort_order ?? 0),
    });
    setFormOpen(true);
  };

  const startAdding = () => {
    setEditingId(null);
    setEditing({ ...BLANK_FORM, type: activeTab });
    setFormOpen(true);
  };

  const cancelForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setEditing({ ...BLANK_FORM });
  };

  const handleSave = async () => {
    const price = parseFloat(editing.additional_price) || 0;
    const order = parseInt(editing.sort_order, 10) || 0;

    if (!editing.name.trim()) {
      showMessage('El nombre es obligatorio.', 'error');
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from('ingredients')
        .update({
          type: editing.type,
          name: editing.name.trim(),
          description: editing.description.trim() || null,
          image_url: editing.image_url,
          additional_price: price,
          sort_order: order,
        } as never)
        .eq('id', editingId);

      if (error) {
        showMessage(`Error al actualizar: ${error.message}`, 'error');
        return;
      }
      showMessage('Ingrediente actualizado.', 'success');
    } else {
      const { error } = await supabase.from('ingredients').insert({
        type: editing.type,
        name: editing.name.trim(),
        description: editing.description.trim() || null,
        image_url: editing.image_url,
        additional_price: price,
        sort_order: order,
      } as never);

      if (error) {
        showMessage(`Error al crear: ${error.message}`, 'error');
        return;
      }
      showMessage('Ingrediente creado.', 'success');
    }

    cancelForm();
    await fetchIngredients();
  };

  const handleToggleActive = async (ingredient: IngredientRow) => {
    const newVal = !ingredient.is_active;
    const { error } = await supabase
      .from('ingredients')
      .update({ is_active: newVal } as never)
      .eq('id', ingredient.id);

    if (error) {
      showMessage(`Error: ${error.message}`, 'error');
      return;
    }
    showMessage(
      newVal ? 'Ingrediente activado.' : 'Ingrediente desactivado.',
      'success',
    );
    await fetchIngredients();
  };

  const handleDelete = async (ingredient: IngredientRow) => {
    if (
      !window.confirm(`¿Eliminar "${ingredient.name}"? Esta acción no se puede deshacer.`)
    ) {
      return;
    }

    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', ingredient.id);

    if (error) {
      showMessage(`Error al eliminar: ${error.message}`, 'error');
      return;
    }
    showMessage('Ingrediente eliminado.', 'success');
    await fetchIngredients();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-md text-on-surface">Catálogo</h1>
          <p className="text-body-md text-on-surface-variant">
            Gestión de ingredientes del pastel.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={startAdding}>
          <Icon name="add" size={1.25} />
          Agregar
        </Button>
      </div>

      {message && (
        <div
          className={cn(
            'rounded-md px-4 py-3 text-body-sm font-medium',
            message.kind === 'success'
              ? 'bg-primary-container text-on-primary-container'
              : 'bg-error-container text-on-error-container',
          )}
        >
          {message.text}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setFormOpen(false);
              setEditingId(null);
            }}
            className={cn(
              'rounded-full px-4 py-2 text-label-md transition-colors',
              activeTab === tab.key
                ? 'bg-secondary text-white'
                : 'bg-surface-light text-on-surface-variant hover:bg-surface-container',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {formOpen && (
        <Card>
          <div className="flex flex-col gap-4">
            <h2 className="text-headline-sm text-on-surface">
              {editingId ? 'Editar ingrediente' : 'Nuevo ingrediente'}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-label-md text-on-surface-variant">
                  Tipo
                </label>
                <select
                  value={editing.type}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="min-h-12 w-full rounded-md border border-outline-variant bg-beige-soft px-4 py-2 text-body-md text-on-surface outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/30"
                >
                  {TABS.map((tab) => (
                    <option key={tab.key} value={tab.key}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Nombre"
                value={editing.name}
                onChange={(e) =>
                  setEditing((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <div className="sm:col-span-2">
                <Input
                  label="Descripción"
                  value={editing.description}
                  onChange={(e) =>
                    setEditing((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
              <Input
                label="URL de imagen"
                value={editing.image_url}
                onChange={(e) =>
                  setEditing((prev) => ({ ...prev, image_url: e.target.value }))
                }
              />
              <Input
                label="Precio adicional ($)"
                type="number"
                value={editing.additional_price}
                onChange={(e) =>
                  setEditing((prev) => ({
                    ...prev,
                    additional_price: e.target.value,
                  }))
                }
              />
              <Input
                label="Orden"
                type="number"
                value={editing.sort_order}
                onChange={(e) =>
                  setEditing((prev) => ({
                    ...prev,
                    sort_order: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={cancelForm}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave}>
                {editingId ? 'Guardar cambios' : 'Crear'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {loading && (
        <p className="py-10 text-center text-body-md text-on-surface-variant">
          Cargando...
        </p>
      )}

      {!loading && ingredients.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-outline-variant bg-surface-light/60 px-4 py-20 text-center">
          <Icon
            name="inventory_2"
            size={2.5}
            weight={400}
            className="text-on-surface-variant"
          />
          <span className="text-headline-sm text-on-surface">
            Sin ingredientes
          </span>
          <span className="text-body-md text-on-surface-variant">
            Agregá el primer ingrediente de tipo &ldquo;{activeTab}&rdquo;.
          </span>
        </div>
      )}

      {!loading && ingredients.length > 0 && (
        <div className="flex flex-col gap-3">
          {ingredients.map((ingredient) => (
            <Card key={ingredient.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-headline-sm text-on-surface">
                      {ingredient.name}
                    </h3>
                    {!ingredient.is_active && (
                      <span className="rounded-full bg-error-container px-2 py-0.5 text-label-md text-error">
                        Inactivo
                      </span>
                    )}
                  </div>
                  {ingredient.description && (
                    <p className="text-body-sm text-on-surface-variant">
                      {ingredient.description}
                    </p>
                  )}
                  <div className="flex gap-4 text-body-sm text-on-surface-variant">
                    <span>
                      ${(ingredient.additional_price ?? 0).toFixed(2)}
                    </span>
                    <span>Orden: {ingredient.sort_order ?? 0}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(ingredient)}
                  >
                    <Icon
                      name={ingredient.is_active ? 'visibility_off' : 'visibility'}
                      size={1.25}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(ingredient)}
                  >
                    <Icon name="edit" size={1.25} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(ingredient)}
                  >
                    <Icon name="delete" size={1.25} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
