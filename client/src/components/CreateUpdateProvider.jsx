/* eslint-disable react/prop-types */
import { useState } from "react";
import Modal from "./Modals/Modal";
import { useSelector } from "react-redux";

export default function CreateUpdateProvider({
  provider = null,
  handleUpdateProvider,
  handleAddProvider,
  closeModal = null,
}) {
  const {company} = useSelector((state) => state.user)
  const [formData, setFormData] = useState({ ...provider });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isUpdating = provider === null ? false : true;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        company: company._id,
        _id: isUpdating ? provider._id : null,
      };

      if (isUpdating) {
        await handleUpdate(data);
        
      } else {
        await handleRegisterProvider(data);
      }

      if(closeModal) closeModal();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (provider) => {
    const form = document.getElementById("form");
    try {
      setLoading(true);

      const res = await fetch("api/provider/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(provider),
      });

      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }

      handleUpdateProvider(provider);

      form.reset();
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  const handleRegisterProvider = async (provider) => {
    const form = document.getElementById("form");
    
    try {
      setLoading(true);

      const res = await fetch("api/provider/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(provider),
      });

      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }

      handleAddProvider(provider)

      form.reset();
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  console.log(formData)
  return (
    <form
      onSubmit={handleSubmit}
      id="form"
      className="flex flex-col gap-4 text-base"
    >
      {error && (
        <Modal
          content={<p>{error}</p>}
          closeModal={() => setError(null)}
          closeOnClickOutside={true}
          closeOnEsc={true}
        />
      )}
      <input
        type="text"
        name="name"
        id="name"
        placeholder="Nombre del proveedor"
        className="border p-3 rounded-lg"
        value={formData.name || ""}
        onChange={handleChange}
        required
      />
      <input
        type="tel"
        name="phoneNumber"
        id="phoneNumber"
        placeholder="Teléfono del proveedor"
        className="border p-3 rounded-lg"
        onChange={handleChange}
        value={formData.phoneNumber || ""}
        required
      />
      <p className="text-xs text-red-700">Ubicación*</p>
      <input
        type="text"
        name="location"
        id="location"
        placeholder="https://maps.app.goo.gl/YU99bo6wYVY9AMdL6"
        value={formData.location || ""}
        className="border p-3 rounded-lg"
        onChange={handleChange}
      />
      <button
        disabled={loading}
        className="bg-button text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
      >
        {isUpdating ? "Actualizar" : "Registrar"}
      </button>
    </form>
  );
}
