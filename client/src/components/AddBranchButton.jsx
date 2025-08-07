import { FaPlus } from "react-icons/fa";

export default function AddBranchButton({ onClick, loading = false, children = "Registra una sucursal" }) {
  return (
    <button
      className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 transition text-white p-3 rounded-xl font-bold shadow uppercase tracking-wide text-lg disabled:opacity-60"
      onClick={onClick}
      disabled={loading}
      type="button"
    >
      <FaPlus className="text-white text-xl" />
      {children}
    </button>
  );
}
