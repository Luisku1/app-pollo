import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ToastDanger, ToastSuccess } from "../helpers/toastify";

// provider: objeto proveedor cuando se edita
// setProvider: callback para actualizar el proveedor (Edición in-place)
// onSaved: callback adicional al guardar (recibe providerGuardado)
// onCancel: callback al cancelar la edición (opcional)
export default function RegistroProveedor({ provider, setProvider, onSaved, onCancel }) {
  const isEditing = !!provider;
  const { company } = useSelector((state) => state.user);
  const [formData, setFormData] = useState(provider ? { ...provider } : {});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) setFormData({ ...provider });
  }, [provider, isEditing]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const endpoint = isEditing ? `/api/provider/update/${provider._id}` : "/api/provider/create";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, company: company._id }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        if (data?.statusCode === 500) ToastDanger("Este proveedor ya existe. No se ha registrado");
        else ToastDanger(data?.message || "Error al guardar el proveedor");
        return;
      }
      // Actualizar estado externo si aplica
      if (setProvider) setProvider(data || formData);
      if (!isEditing) setFormData({});
      ToastSuccess(isEditing ? "Proveedor actualizado correctamente" : "Proveedor registrado correctamente");
      if (onSaved) onSaved(data || formData);
    } catch (err) {
      if (isEditing) {
        ToastDanger("Error al actualizar el proveedor");
        if (setProvider) setProvider(provider);
      } else {
        ToastDanger("Error al registrar el proveedor");
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo si se usa como página completa; cuando es modal no afecta mayormente.
    document.title = isEditing ? "Editar Proveedor" : "Registro Proveedor";
  }, [isEditing]);

  return (
    <main className="w-full">
      <div className="p-3 max-w-lg mx-auto">
        <h1 className="text-2xl text-center font-semibold my-4">
          {isEditing ? "Editar Proveedor" : "Registra un Nuevo Proveedor"}
        </h1>
        <form onSubmit={handleSubmit} id="form" className="flex flex-col gap-4">
          <input
            type="text"
            id="name"
            placeholder="Nombre del proveedor"
            className="border p-3 rounded-lg"
            onChange={handleChange}
            value={formData.name || ""}
            required
          />
          <input
            type="text"
            id="lastName"
            placeholder="Apellido (Opcional)"
            className="border p-3 rounded-lg"
            onChange={handleChange}
            value={formData.lastName || ""}
          />
          <input
            type="text"
            id="location"
            placeholder="URL de ubicación (Maps)"
            className="border p-3 rounded-lg"
            onChange={handleChange}
            value={formData.location || ""}
          />
          <input
            type="tel"
            id="phoneNumber"
            placeholder="Teléfono del proveedor"
            className="border p-3 rounded-lg"
            onChange={handleChange}
            value={formData.phoneNumber || ""}
            required
          />
          <div className="flex gap-2">
            {isEditing && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 text-gray-800 p-3 rounded-lg hover:opacity-90"
                disabled={loading}
              >
                Cancelar
              </button>
            )}
            <button
              disabled={loading}
              className="flex-1 bg-button text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
            >
              {loading ? "Cargando..." : isEditing ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 mt-3 text-sm">{error}</p>}
      </div>
    </main>
  );
}
