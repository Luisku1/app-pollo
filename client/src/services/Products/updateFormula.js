export const updateFormula = async (formulaId, formula) => {
  const response = await fetch(`/api/product/update-formula/${formulaId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formula }),
  });
  if (!response.ok) {
    throw new Error('Failed to update formula');
  }
  const data = await response.json();
  return data.formula;
};
