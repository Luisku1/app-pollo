import { useEffect, useState, useMemo } from "react";

export const useProvidersMovements = ({
  companyId = null,
  date = null,
  typeMovement = null,
}) => {
  const [movements, setMovements] = useState([]);
  const [selectedMovement, setSelectedMovement] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //Solicitud de Todos los Movimientos hechos a los Proveedores
  useEffect(() => {

    if (!companyId) return;
    const fetchMovements = async () => {
      try {
        const res = await fetch(
          "/api/provider/get-providers-movements/" + companyId + "/" + date,
        );
        const data = await res.json();

        if (data.success === false) {
          setError(data.message);
          return;
        }
        setMovements(data);
        setError(null);
      } catch (error) {
        setError(error.message);
      }
    };
    setMovements([])
    fetchMovements();
  }, [companyId, date]);

  useEffect(() => {
    setSelectedMovement(
      movements.filter((movement) => movement.isReturn == typeMovement)
    );
  }, [typeMovement, movements]);

  const newMovement = async (movementData) => {

    try {
      const res = await fetch("/api/provider/create-providers-movement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...movementData,
          employee: movementData?.employee?._id,
          provider: movementData?.provider?._id,
          company: movementData?.company?._id,
        })
      });

      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        setLoading(true);
        return;
      }

      setMovements((prevMovements) => [movementData, ...prevMovements]);
      setError(null)
      setLoading(false);
    } catch (error) {
      setError(error)
      setLoading(false)
      setError(error.message);
    }
  };

  const onDeleteMovement = async (movementId) => {
    try {
      const res = await fetch(
        "/api/provider/delete-provider-movement/" + movementId,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }
      setMovements((prevMovements) =>
        prevMovements.filter((movement) => movement._id !== movementId)
      );

      setError(null);
      setLoading(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const { totalWeight, totalAmount } = useMemo(() => {
    const totalWeight = selectedMovement.reduce(
      (acc, selectedMovement) => acc + selectedMovement.weight,
      0
    );
    const totalAmount = selectedMovement.reduce(
      (acc, selectedMovement) => acc + selectedMovement.amount,
      0
    );

    return { totalWeight, totalAmount };
  }, [selectedMovement]);

  return {
    selectedMovement,
    totalWeight,
    totalAmount,
    loading,
    error,
    newMovement,
    onDeleteMovement,
  };
};
