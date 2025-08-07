// utils/branchFilter.js
// Función utilitaria para filtrar sucursales por coincidencia parcial (case-insensitive)
export function filterBranchesByName(branches, searchString) {
  if (!searchString || searchString.trim() === "") return branches;
  return branches.filter(branch =>
    branch.branch && branch.branch.toLowerCase().includes(searchString.trim().toLowerCase())
  );
}
