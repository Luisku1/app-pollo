import { useEffect, useState, useMemo } from "react";
import { formatSimpleDate } from "../../helpers/DatePickerFunctions";

export const useProvidersMovements = ({
  companyId = null,
  date = null,
  typeMovement = null,
}) => {
  const [movements, setMovements] = useState([]);
  const [selectedMovement, setSelectedMovement] = useState([]);
  const [filteredMovement, setFilteredMovement] = useState([]);
  const [state, setState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  //Solicitud de Todos los Movimientos hechos a los Proveedores
  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const res = await fetch(
          "/api/provider/get-providers-movements/" + companyId
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
    fetchMovements();
  }, [companyId]);

  useEffect(() => {
    setFilteredMovement(
      movements.filter(
        (movement) =>
          formatSimpleDate(movement.createdAt) == formatSimpleDate(date.dateDay)
      )
    );
  }, [date, movements]);

  useEffect(() => {
    setSelectedMovement(
      filteredMovement.filter((movement) => movement.isReturn == typeMovement)
    );
  }, [typeMovement, filteredMovement]);

  const newMovement = async (movementData) => {
    const form = document.getElementById("form-movement");
    setLoading(true);

    try {
      const res = await fetch("api/provider/create-providers-movement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(movementData),
      });

      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        setLoading(true);
        return;
      }

      setMovements((prevMovements) => [data, ...prevMovements]);
      setLoading(false);
      form.reset();
    } catch (error) {
      setError(error.message);
    }
    setState((prevState) => !prevState);
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
    state,
    loading,
    error,
    newMovement,
    onDeleteMovement,
  };
};
