export const newFormula = async (branchId, productId, formula) => {
  try {
    const response = await fetch('/api/product/create-formula', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ branchId, productId, formula }),
    });

    if (!response.ok) {
      throw new Error('Failed to create formula');
    }

    const data = await response.json();
    return data.formula;
  } catch (error) {
    console.error('Error creating formula:', error);
    throw error;
  }
}