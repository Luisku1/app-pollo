import { useState, useEffect } from "react";
import Select from "react-select";
import { useSelector } from "react-redux";
import ProvidersSelect from "./Select/ProvidersSelect";
import { customSelectStyles } from "../helpers/Constants";
import Modal from "./Modals/Modal";
import { useProvidersPayments } from "../hooks/Providers/useProvidersPayments";
// import HistoryPaymentsProvideres from "./Proveedores/HistorypaymentsProviders";
import { useDate } from "../context/DateContext";
import { isToday } from "../helpers/DatePickerFunctions";

export default function CreatePaymentsProviders(providers) {
  const { currentUser, company } = useSelector((state) => state.user);
  const { currentDate } = useDate();
  const [showAmount, setShowAmount] = useState(false);
  const [showAmountCash, setShowAmountCash] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showModal, setShowModal] = useState(false);

  //  const [seletedProvider, setSeletedProvider] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    isCash: false,
    amountCash: 0,
    amount: 0,
    provider: null,
  });

  const {
    newPayment,
  } = useProvidersPayments({
    companyId: company._id,
    date: currentDate,
  });

  const resetForm = () => {
    setShowAmount(false);
    setShowAmountCash(true);
    setSelectedProvider(null);
    setFormData({
      isCash: false,
      amountCash: 0,
      amount: 0,
      provider: null,
    });
  };

  const handleSubmit = async (e) => {
    const form = document.getElementById("form-payments");
    e.preventDefault();
    setLoading(true);
    try {
      const paymentDate = isToday(currentDate)
        ? new Date()
        : new Date(currentDate);
      const data = {
        ...formData,
        company: company,
        createdAt: paymentDate,
        employee: currentUser,
      };
      resetForm();
      await newPayment(data);
      setError(null);
      setLoading(loadingPayments);
      form.reset();
    } catch (error) {
      setLoading(loadingPayments);
      setError(errorPayments);
      console.error(error);
    }
  };

  const selectTypePayment = (value) => {
    switch (value) {
      case "Ambos":
        setShowAmountCash(false);
        setShowAmount(false);
        setFormData({
          ...formData,
          isCash: true,
        });
        break;
      case "Efectivo":
        setShowAmountCash(false);
        setShowAmount(true);
        setFormData({
          ...formData,
          isCash: true,
        });
        break;
      case "Transferencia":
        setShowAmountCash(true);
        setShowAmount(false);
        setFormData({
          ...formData,
          isCash: false,
        });
        break;
      default:
        break;
    }
  };

  const handleProviderSelectChange = (provider) => {
    setSelectedProvider(provider);
  };

  const handleChange = (e) => {
    switch (e.target.id) {
        case "amount":
        setFormData({ ...formData, [e.target.id]: parseFloat(e.target.value) });
        break;
      case "amountCash":
        setFormData({ ...formData, [e.target.id]: parseFloat(e.target.value) });
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setFormData({ ...formData, provider: selectedProvider });
  }, [selectedProvider]);

  console.log(formData)

  return (
    <main>
      <div className="mb-5">
        <button
          title={"Pagos del Día"}
          className="flex flex-cols-2 bg-white text text-black font-bold p-2 border border-header rounded-lg w-full"
          onClick={() => {
            setShowModal(true);
          }}
        >
          <div className="w-3/4  ml-12">Pagos del Día</div>
          <div className="w-1/4 font-bold border border-header rounded-lg ">
            $100
          </div>
        </button>
      </div>
      {showModal && (
        <Modal
          title={"Pagos del Día"}
          content={<p>Hola</p>}
          closeModal={() => {
            setShowModal(false);
          }}
          closeOnClickOutside={true}
          closeOnEsc={true}
        ></Modal>
      )}
      <div className="flex flex-cols-2 gap-2 mt-3">
        <div className="relative border-black rounded-lg w-1/2">
          <ProvidersSelect
            options={providers.providers}
            defaultLabel={"Proveedores"}
            selectedOption={selectedProvider}
            handleSelectChange={handleProviderSelectChange}
          />
        </div>
        <div className="relative border-black rounded-lg w-1/2">
          <Select
            options={[
              { value: "Transferencia", label: "Transferencia" },
              { value: "Efectivo", label: "Efectivo" },
              { value: "Ambos", label: "Ambos" },
            ]}
            onChange={(e) => {
              selectTypePayment(e.value);
            }}
            placeholder={"Método de Pago"}
            styles={customSelectStyles}
          />
        </div>
      </div>
      {error && (
        <Modal
          content={<p>{error}</p>}
          closeModal={() => setError(null)}
          closeOnClickOutside={true}
          closeOnEsc={true}
        />
      )}
      <form id="form-payments" onSubmit={handleSubmit}>
        <div className="flex flex-cols-2 gap-2 mt-3">
          <div className={"relative w-full"} hidden={showAmount}>
            <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold">
              Monto{" "}
              {!showAmount && !showAmountCash ? "de la Transferencia" : ""}
            </label>
            <input
              type="number"
              id="amount"
              placeholder="$0.00"
              onChange={handleChange}
              className="w-full border border-black p-3 rounded-lg h-full"
              required
            />
          </div>
          <div className={"relative w-full"} hidden={showAmountCash}>
            <label className="-translate-y-full px-1 absolute top-1/4 left-2 transform border border-header rounded-lg bg-white text-black text-sm font-semibold">
              Monto del Efectivo
            </label>
            <input
              type="number"
              id="amountCash"
              onChange={handleChange}
              placeholder="$0.00"
              className="w-full border border-black p-3 rounded-lg h-full"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 mt-3">
          <button
            disabled={loading}
            className={"bg-green-500 text-white p-3 rounded-lg col-span-3 mt-4"}
          >
            <b>REGISTRAR PAGO</b>
          </button>
        </div>
      </form>
    </main>
  );
}
