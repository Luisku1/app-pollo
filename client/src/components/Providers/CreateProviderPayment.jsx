import { useState } from "react";
import { useSelector } from "react-redux";
import Select from "react-select";
import { useProviders } from "../../hooks/Providers/useProviders";
import { customSelectStyles } from "../../helpers/Constants";
import { getArrayForSelects, getElementForSelect, currency } from "../../helpers/Functions";

export default function CreateProviderPayment({ onAddPayment }) {
  const { company } = useSelector((state) => state.user);
  const { providers } = useProviders(company._id);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [cash, setCash] = useState(0);
  const [transfer, setTransfer] = useState(0);
  const [error, setError] = useState("");

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProvider) {
      setError("Selecciona un proveedor");
      return;
    }
    if (Number(cash) <= 0 && Number(transfer) <= 0) {
      setError("Ingresa al menos un monto mayor a 0");
      return;
    }
    setError("");
    const payment = {
      provider: selectedProvider.value,
      cash: Number(cash),
      transfer: Number(transfer),
      company: company._id,
      createdAt: new Date().toISOString(),
    };
    if (onAddPayment) onAddPayment(payment);
    setSelectedProvider(null);
    setCash(0);
    setTransfer(0);
  };

  return (
    <div className="border rounded-md p-3 max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Select
          styles={customSelectStyles}
          onChange={handleProviderChange}
          value={getElementForSelect(selectedProvider, (provider) => provider.name)}
          options={getArrayForSelects(providers, (provider) => provider.name)}
          placeholder={"Proveedor"}
          menuPortalTarget={document.body}
          isSearchable={true}
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-semibold mb-1">Efectivo</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="border border-black p-3 rounded-lg w-full"
              value={cash}
              onChange={e => setCash(e.target.value)}
              placeholder="$0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Transferencia/Depósito</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="border border-black p-3 rounded-lg w-full"
              value={transfer}
              onChange={e => setTransfer(e.target.value)}
              placeholder="$0.00"
            />
          </div>
        </div>
        {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}
        <button type="submit" className="bg-button text-white p-3 rounded-lg mt-2">Agregar</button>
      </form>
    </div>
  );
}
