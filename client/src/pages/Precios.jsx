import { useEffect, useState, useMemo } from "react"
import Select from 'react-select'
import FormulaEditor from "../components/FormulaEditor";
import { useBranches } from "../hooks/Branches/useBranches";
import { useSelector } from "react-redux"
import { currency, normalizeText } from "../helpers/Functions"
import { ToastSuccess, ToastInfo, ToastDanger, ToastContainerComponent } from "../helpers/toastify"
import { useBranch } from "../hooks/Branches/useBranch"
import "../assets/super-xl.css"
import { useProducts } from "../hooks/Products/useProducts"
import { newFormula } from "../services/Products/newFormula";
import { updateFormula } from "../services/Products/updateFormula";
import Modal from "../components/Modals/Modal";
import { customSelectStyles } from "../helpers/Constants";
import { create } from "mathjs";
import { all } from "axios";

export default function Precios() {

  const { company } = useSelector((state) => state.user)
  const companyId = company._id
  const [prices, setPrices] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState({})
  const [successMessage, setSuccessMessage] = useState({})
  const [pricesFormData, setPricesFormData] = useState({})
  const [residualFormData, setResidualFormData] = useState({})
  const { products } = useProducts({ companyId })
  const [showResidual, setShowResidual] = useState({})
  const { onUpdateResidualUse } = useBranch()
  const [buttonDisabled, setButtonDisabled] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const searchInputRef = useState(null)[0] || (typeof window !== 'undefined' ? { current: null } : null);// Estado para mostrar el menú de fórmula
  const [showFormulaMenu, setShowFormulaMenu] = useState(false);
  const [formulaValues, setFormulaValues] = useState({}); // Guarda fórmulas por branchId+productId
  const [showGlobalFormulaMenu, setShowGlobalFormulaMenu] = useState(false);
  const [selectedFormulaProduct, setSelectedFormulaProduct] = useState(null); // { productId, productName }
  const [selectedBranchIds, setSelectedBranchIds] = useState([]); // array de { value, label }
  const { branches: allBranches = [] } = useBranches({ companyId });
  const ALL_BRANCHES_VALUE = 'ALL_BRANCHES';
  // Handler para guardar fórmula (creación o actualización, optimista)
  const handleSaveFormula = async (formula) => {
    if (!selectedFormulaProduct) return;
    if (!selectedBranchIds || selectedBranchIds.length === 0) return;
    const targetBranchIds = selectedBranchIds.some(b => b.value === ALL_BRANCHES_VALUE)
      ? allBranches.map(b => b._id)
      : selectedBranchIds.map(b => b.value);
    if (targetBranchIds.length === 0) return;

    // Optimistic: actualizar formulaValues para todas las sucursales seleccionadas
    setFormulaValues(prev => {
      const clone = { ...prev };
      targetBranchIds.forEach(bid => {
        const key = `${bid}_${selectedFormulaProduct.productId}`;
        clone[key] = formula;
      });
      return clone;
    });

    // Optimistic: reflejar en precios inmediatamente (sin IDs nuevas aún)
    setPrices(prev => prev.map(branch => {
      if (!targetBranchIds.includes(branch._id.branchId)) return branch;
      return {
        ...branch,
        prices: branch.prices.map(p => {
          if (p.productId !== selectedFormulaProduct.productId) return p;
          const existing = p.formula || {};
          return { ...p, formula: { ...existing, formula } };
        })
      };
    }));

    setShowFormulaMenu(false);

    // Llamadas a backend (crear/actualizar) en paralelo
    const ops = targetBranchIds.map(async (bid) => {
      try {
        const branchData = prices.find(b => b._id.branchId === bid);
        if (!branchData) return { bid, ok: false, error: 'No branch data' };
        const productData = branchData.prices.find(p => p.productId === selectedFormulaProduct.productId);
        if (productData && productData.formula && productData.formula._id) {
          // update
          await updateFormula(productData.formula._id, formula);
          return { bid, ok: true, updatedId: productData.formula._id };
        } else {
          // create
          const res = await newFormula(bid, selectedFormulaProduct.productId, formula);
          return { bid, ok: true, updatedId: res?._id };
        }
      } catch (e) {
        return { bid, ok: false, error: e.message };
      }
    });

    const results = await Promise.all(ops);
    const failed = results.filter(r => !r.ok);

    // Ajustar IDs recién creadas en precios
    const createdWithIds = results.filter(r => r.ok && r.updatedId);
    if (createdWithIds.length > 0) {
      setPrices(prev => prev.map(branch => {
        const match = createdWithIds.find(r => r.bid === branch._id.branchId);
        if (!match) return branch;
        return {
          ...branch,
          prices: branch.prices.map(p => {
            if (p.productId !== selectedFormulaProduct.productId) return p;
            const existing = p.formula || {};
            return { ...p, formula: { ...existing, _id: match.updatedId, formula } };
          })
        };
      }));
    }

    if (failed.length === 0) {
      ToastSuccess(targetBranchIds.length > 1 ? 'Fórmulas guardadas en sucursales seleccionadas' : 'Fórmula guardada');
    } else if (failed.length === targetBranchIds.length) {
      ToastDanger('Error al guardar fórmulas');
    } else {
      ToastInfo(`Algunas fórmulas no se guardaron (${failed.length}/${targetBranchIds.length}).`);
    }
  };

  // Estado para inputs globales por producto y toggle de visibilidad
  const [globalProductPrices, setGlobalProductPrices] = useState({});
  const [globalResidualPrices, setGlobalResidualPrices] = useState({});
  const [showGlobalInputs, setShowGlobalInputs] = useState(false);
  // Aplica el precio global a todas las sucursales para ese producto
  const applyGlobalPriceToAll = (productId, isResidual = false) => {
    if (isResidual) {
      setResidualFormData(prev => {
        const newData = { ...prev };
        prices.forEach(data => {
          const branchId = data._id.branchId;
          if (data._id.residualPrices === false) {
            return;
          }
          if (!newData[branchId]) newData[branchId] = {};
          newData[branchId][`${productId}${branchId}`] = {
            product: productId,
            branch: branchId,
            price: globalResidualPrices[productId] || '',
            residual: true
          };
        });
        return newData;
      });
    } else {
      setPricesFormData(prev => {
        const newData = { ...prev };
        prices.forEach(data => {
          const branchId = data._id.branchId;
          if (!newData[branchId]) newData[branchId] = {};
          newData[branchId][`${productId}${branchId}`] = {
            product: productId,
            branch: branchId,
            price: globalProductPrices[productId] || '',
            residual: false
          };
        });
        return newData;
      });
    }
    // Habilita el botón de guardar en todas las sucursales
    setButtonDisabled(prev => {
      const updated = { ...prev };
      prices.forEach(data => {
        updated[data._id.branchId] = false;
      });
      return updated;
    });
  };

  // Atajo Ctrl+F para enfocar el input de búsqueda
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (searchInputRef && searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchInputRef]);
  const [applyChanges, setApplyChanges] = useState({});

  // Maneja cambios para precios normales y residuales
  const handleInputsChange = (e, productId, branchId, isResidual = false) => {
    const key = `${productId}${branchId}`

    if (!e.target.value || isNaN(e.target.value) || e.target.value < 0) {

      if (e.target.value === '') {
        if (isResidual) {
          setResidualFormData(prev => {
            const newData = { ...prev }
            if (newData[branchId]) {
              delete newData[branchId][key]
            }
            if (Object.keys(newData[branchId] || {}).length === 0) {
              delete newData[branchId]
            }
            return newData
          })
        } else {
          setPricesFormData(prev => {
            const newData = { ...prev }
            if (newData[branchId]) {
              delete newData[branchId][key]
            }
            if (Object.keys(newData[branchId] || {}).length === 0) {
              delete newData[branchId]
            }
            return newData
          })
        }
        return
      }
    }

    if (isResidual) {
      setResidualFormData(prev => ({
        ...prev,
        [branchId]: {
          ...prev[branchId],
          [key]: {
            product: productId,
            branch: branchId,
            price: e.target.value,
            residual: true
          }
        }
      }))
    } else {
      setPricesFormData(prev => ({
        ...prev,
        [branchId]: {
          ...prev[branchId],
          [key]: {
            product: productId,
            branch: branchId,
            price: e.target.value,
            residual: false
          }
        }
      }))
    }
    setButtonDisabled(prev => ({
      ...prev,
      [branchId]: false
    }))
  }

  const submitBranchPrices = async (branchId) => {
    const normal = pricesFormData[branchId] || {}
    const residual = residualFormData[branchId] || {}
    const isResidual = showResidual[branchId]
    let payload = isResidual ? residual : normal
    if (Object.keys(payload).length === 0) return
    if (applyChanges[branchId]) {
      payload = { ...payload, applyChanges: true }
    }
    setLoading(prev => ({ ...prev, [branchId]: true }))
    setError(null)
    setSuccessMessage(prev => ({ ...prev, [branchId]: null }))
    try {
      if (applyChanges[branchId])
        ToastInfo('Actualizando precios, por favor espere...')

      const res = await fetch('/api/product/price/new-prices/' + company._id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success === false) {
        ToastDanger(data.message || 'Error al guardar precios')
        setError(data.message || 'Error al guardar precios')
        setLoading(prev => ({ ...prev, [branchId]: false }))
        return
      }
      ToastSuccess('Precios actualizados')
      setSuccessMessage(prev => ({ ...prev, [branchId]: 'Precios actualizados' }))
      setPrices(prev => prev.map(item => {
        if (item._id.branchId === branchId) {
          return {
            ...item,
            prices: item.prices.map(price => {
              if (payload[`${price.productId}${branchId}`]) {
                return {
                  ...price,
                  latestPrice: parseFloat(payload[`${price.productId}${branchId}`].price),
                  latestResidualPrice: isResidual ? parseFloat(payload[`${price.productId}${branchId}`]).price : parseFloat(price.residualPrice)
                }
              }
              return price
            }),
          }
        }
        return item
      }))
      if (!isResidual) {
        setPricesFormData(prev => {
          let newData = { ...prev }
          if (newData[branchId]) {
            delete newData[branchId]
          }
          return newData
        })
      } else {
        setResidualFormData(prev => {
          let newData = { ...prev }
          if (newData[branchId]) {
            delete newData[branchId]
          }
          return newData
        })
      }
      setButtonDisabled(prev => ({ ...prev, [branchId]: true }))
      setLoading(prev => ({ ...prev, [branchId]: false }))
    } catch (error) {
      ToastDanger(error.message)
      setError(error.message)
      setLoading(prev => ({ ...prev, [branchId]: false }))
    }
  }

  useEffect(() => {

    const fetchBranchPrices = async () => {

      try {

        const res = await fetch('/api/product/price/get-products-price/' + company._id)
        const data = await res.json()

        if (data.success === false) {

          setError(data.message)
          return
        }

        setPrices(data.data)
        setError(null)

      } catch (error) {

        setError(error.message)
      }

    }

    fetchBranchPrices()

  }, [company._id])

  const handleUpdateResidualsUse = async (branchId) => {
    try {

      setPrices(prev => prev.map(item => {
        if (item._id.branchId === branchId) {
          setShowResidual(prev => ({ ...prev, [branchId]: false }))
          return {
            ...item,
            _id: { ...item._id, residualPrices: !item._id.residualPrices },
          }

        }
        return item
      }))
      await onUpdateResidualUse(branchId)
      ToastSuccess('Uso de precios fríos actualizado')
      ToastInfo('Recuerda actualizar los precios para productos fríos')

    } catch (error) {
      ToastDanger(error.message || 'Error al actualizar uso de precios fríos')
    }
  }

  const math = useMemo(() => create(all, { number: 'number', matrix: 'Array' }), [])

  // Evalúa fórmula segura para un producto/sucursal
  const evaluateSuggested = (branchData, productId, isResidualMode) => {
    const formula = formulaValues[`${branchData._id.branchId}_${productId}`]
    if (!formula || typeof formula !== 'string') return { value: null }
    let expr = formula

    try {
      const branchId = branchData._id.branchId

        // Reemplazos: input manual > formData > latest > base
        ; (branchData.prices || []).forEach(p => {
          const key = `${p.productId}${branchId}`
          const manual = isResidualMode
            ? residualFormData[branchId]?.[key]?.price
            : pricesFormData[branchId]?.[key]?.price
          const fallback = isResidualMode
            ? (p.latestResidualPrice ?? p.residualPrice ?? 0)
            : (p.latestPrice ?? p.price ?? 0)
          const manualNum = parseFloat(manual)
          const value = !isNaN(manualNum) ? manualNum : (typeof fallback === 'number' ? fallback : 0)
          expr = expr.replaceAll(`{${p.product}}`, String(value))
        })

      // Placeholders no resueltos => 0
      expr = expr.replace(/\{[^}]+\}/g, '0')

      // Bloqueo de identificadores (si quieres permitir funciones, comenta esta línea)
      if (/[A-Za-z_]/.test(expr)) return { error: 'Sintaxis no permitida' }

      const val = math.evaluate(expr)
      if (typeof val !== 'number' || !isFinite(val)) return { error: 'Inválido' }
      return { value: val }
    } catch {
      return { error: 'Fórmula inválida' }
    }
  }

  useEffect(() => {

    document.title = 'Precios'
  }, [])

  // Switch para alternar precios frescos/fríos
  const handleToggleResidual = (branchId) => {
    setShowResidual(prev => ({ ...prev, [branchId]: !prev[branchId] }))
  }

  const filteredPrices = useMemo(() => {
    if (!searchTerm) return prices;
    return prices.filter((data) =>
      normalizeText(`${data._id.branchName ?? ''}`).toLowerCase().includes(normalizeText(searchTerm).toLowerCase()
      )
    );
  }, [searchTerm, prices]);

  return (
    <main className="p-2 md:p-6 max-w-5xl mx-auto mb-32">

      <ToastContainerComponent />

      <h1 className="text-3xl md:text-4xl text-center font-bold mt-7 mb-6 text-gray-800">
        Precios por Sucursal
      </h1>

      {error && <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-4 text-center">{error}</div>}

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar sucursal..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          ref={searchInputRef}
        />
        <div className="text-xs text-gray-500 mt-1">Atajo: <kbd className="px-1 py-0.5 bg-gray-200 rounded border">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 rounded border">F</kbd> para buscar sucursal</div>
      </div>

      {/* Menú global para definir precios y menú global para definir fórmulas */}
      {(!searchTerm && products && products.length > 0) && (
        <div className="mb-6 flex flex-col gap-6">
          {/* Menú global para aplicar precios a todas las sucursales */}
          <div>
            <button
              className={`mb-2 px-4 py-2 rounded-lg font-bold border-2 transition flex items-center gap-2 ${showGlobalInputs ? 'bg-yellow-100 border-yellow-400 text-yellow-900' : 'bg-white border-yellow-300 text-yellow-700 hover:bg-yellow-50'}`}
              type="button"
              onClick={() => setShowGlobalInputs(v => !v)}
            >
              {showGlobalInputs ? 'Ocultar' : 'Mostrar'} opción para aplicar precio a todas las sucursales
            </button>
            {showGlobalInputs && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mt-2">
                <h2 className="text-lg font-bold mb-2 text-yellow-800">Aplicar precio a todas las sucursales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div key={product._id} className="flex flex-col gap-1">
                      <label className="font-semibold text-gray-700">{product.name}</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          className="border border-gray-300 rounded-lg px-2 py-1 w-28 text-right focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          placeholder="$0.00"
                          min="0"
                          step="0.01"
                          value={globalProductPrices[product._id] || ''}
                          onChange={e => setGlobalProductPrices(prev => ({ ...prev, [product._id]: e.target.value }))}
                        />
                        <button
                          className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-2 py-1 rounded transition text-xs"
                          type="button"
                          onClick={() => applyGlobalPriceToAll(product._id, false)}
                        >Aplicar a todas</button>
                      </div>
                      {/* Residual price input */}
                      <div className="flex gap-2 items-center mt-1">
                        <input
                          type="number"
                          className="border border-blue-300 rounded-lg px-2 py-1 w-28 text-right focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Frío $0.00"
                          min="0"
                          step="0.01"
                          value={globalResidualPrices[product._id] || ''}
                          onChange={e => setGlobalResidualPrices(prev => ({ ...prev, [product._id]: e.target.value }))}
                        />
                        <button
                          className="bg-blue-400 hover:bg-blue-500 text-white font-bold px-2 py-1 rounded transition text-xs"
                          type="button"
                          onClick={() => applyGlobalPriceToAll(product._id, true)}
                        >Aplicar frío a todas</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Menú global para definir fórmulas por producto y sucursal */}
          <div>
            <button
              className={`mb-2 px-4 py-2 rounded-lg font-bold border-2 transition flex items-center gap-2 ${showGlobalFormulaMenu ? 'bg-blue-100 border-blue-400 text-blue-900' : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-50'}`}
              type="button"
              onClick={() => setShowGlobalFormulaMenu(v => !v)}
            >
              {showGlobalFormulaMenu ? 'Ocultar' : 'Definir fórmulas para productos'}
            </button>
            {showGlobalFormulaMenu && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-2">
                <h2 className="text-lg font-bold mb-2 text-blue-800">Definir fórmula para un producto y sucursal</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div key={product._id} className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">{product.name}</label>
                      <button
                        type="button"
                        className="text-xs bg-blue-100 border border-blue-300 rounded px-2 py-0.5 hover:bg-blue-200 text-blue-700 w-fit"
                        onClick={() => {
                          setSelectedFormulaProduct({ productId: product._id, productName: product.name });
                          setShowFormulaMenu(true);
                        }}
                      >
                        Definir fórmula
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Modal para elegir sucursal y definir fórmula */}
            {showFormulaMenu && selectedFormulaProduct && (

              <Modal
                closeModal={() => { setShowFormulaMenu(false); setSelectedFormulaProduct(null); setSelectedBranchIds([]); }}
                content={
                  <div className="bg-white rounded-xl shadow-lg p-4 relative max-w-xl w-full">
                    <h3 className="font-bold text-lg mb-2 text-blue-800">{selectedFormulaProduct.productName}</h3>
                    <label className="block font-semibold mb-1">Sucursales destino:</label>
                    <Select
                      isMulti
                      placeholder="Selecciona sucursales..."
                      className="mb-4"
                      classNamePrefix="rs"
                      menuPortalTarget={document.body}
                      styles={customSelectStyles}
                      value={selectedBranchIds}
                      onChange={(vals) => {
                        if (vals?.some(v => v.value === ALL_BRANCHES_VALUE)) {
                          setSelectedBranchIds([{ value: ALL_BRANCHES_VALUE, label: 'Todas' }]);
                        } else {
                          setSelectedBranchIds(vals || []);
                        }
                      }}
                      options={[
                        { value: ALL_BRANCHES_VALUE, label: 'Todas' },
                        ...(allBranches || []).map(b => ({ value: b._id, label: b.branch }))
                      ]}
                    />
                    {selectedBranchIds.length > 0 && (
                      <FormulaEditor
                        branchName={selectedBranchIds.some(b => b.value === ALL_BRANCHES_VALUE)
                          ? 'Todas las sucursales'
                          : (selectedBranchIds.length === 1 ? selectedBranchIds[0].label : `${selectedBranchIds.length} sucursales`)}
                        productName={selectedFormulaProduct.productName}
                        prices={(() => {
                          // Primera sucursal real para preview de variables
                          let previewBranchId = null;
                          if (selectedBranchIds.some(b => b.value === ALL_BRANCHES_VALUE)) {
                            previewBranchId = filteredPrices[0]?._id.branchId;
                          } else if (selectedBranchIds.length === 1) {
                            previewBranchId = selectedBranchIds[0].value;
                          } else {
                            previewBranchId = selectedBranchIds.find(b => b.value !== ALL_BRANCHES_VALUE)?.value;
                          }
                          if (!previewBranchId) return {};
                          const branchData = filteredPrices.find(b => b._id.branchId === previewBranchId);
                          if (!branchData) return {};
                          return Object.fromEntries((branchData.prices || []).map(p => [p.product, showResidual[previewBranchId] ? p.latestResidualPrice : p.latestPrice]));
                        })()}
                        initialFormula={(() => {
                          // Si solo una sucursal (no ALL) y existe fórmula previa
                          if (selectedBranchIds.length === 1 && !selectedBranchIds.some(b => b.value === ALL_BRANCHES_VALUE)) {
                            const bid = selectedBranchIds[0].value;
                            return formulaValues[`${bid}_${selectedFormulaProduct.productId}`] || '';
                          }
                          return '';
                        })()}
                        onSave={handleSaveFormula}
                        variables={(() => {
                          let previewBranchId = null;
                          if (selectedBranchIds.some(b => b.value === ALL_BRANCHES_VALUE)) {
                            previewBranchId = filteredPrices[0]?._id.branchId;
                          } else if (selectedBranchIds.length === 1) {
                            previewBranchId = selectedBranchIds[0].value;
                          } else {
                            previewBranchId = selectedBranchIds.find(b => b.value !== ALL_BRANCHES_VALUE)?.value;
                          }
                          if (!previewBranchId) return [];
                          const branchData = filteredPrices.find(b => b._id.branchId === previewBranchId);
                          return (branchData?.prices || []).map(p => p.product);
                        })()}
                      />
                    )}
                  </div>
                }
                className="max-w-3xl mx-auto"
              />
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 super-xl:grid-cols-3 gap-6">
        {filteredPrices && filteredPrices.length > 0 && filteredPrices.map((data) => {
          const isResidual = showResidual[data._id.branchId]
          // Agrupar productos en pares para doble columna
          const productPairs = []
          if (data.prices && data.prices.length > 0) {
            for (let i = 0; i < data.prices.length; i += 2) {
              productPairs.push([
                data.prices[i],
                data.prices[i + 1] || null
              ])
            }
          }

          return (
            <div key={data._id.branchId} className="rounded-2xl shadow-md bg-white border border-gray-200 flex flex-col p-4 transition hover:shadow-lg">
              <div className="flex items-center justify-between mb-2 gap-2">
                <h2 className="text-xl text-blue-700 font-bold">{data._id.branchName}</h2>
                <div className="flex gap-2 items-center">
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition flex items-center gap-2
                      ${data._id.residualPrices ? 'bg-blue-800 font-bold text-white border-blue-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
                    onClick={() => handleUpdateResidualsUse(data._id.branchId)}
                    title="Alternar uso de precios fríos en esta sucursal"
                    type="button"
                  >
                    <span className={`inline-block w-3 h-3 rounded-full border-2 mr-1
                      ${data._id.residualPrices ? 'bg-white border-white' : 'bg-gray-400 border-gray-400'}`}></span>
                    Uso de precios fríos
                  </button>
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition ${isResidual ? 'bg-blue-800 text-white border-blue-600' : 'bg-gray-200 text-gray-700 border-gray-300'}`}
                    disabled={!data._id.residualPrices}
                    onClick={() => handleToggleResidual(data._id.branchId)}
                    type="button"
                  >
                    {isResidual ? 'Precios Fríos' : 'Precios Frescos'}
                  </button>
                </div>
              </div>
              <div className="w-full">
                <table className="w-full text-sm table-fixed">
                  <colgroup>
                    <col className="w-1/4" />
                    <col className="w-1/4" />
                    <col className="w-1/4" />
                    <col className="w-1/4" />
                  </colgroup>
                  <thead>
                    <tr className="bg-gray-100 text-xs text-gray-700">
                      <th className="px-2 py-1 text-left">Producto</th>
                      <th className={`px-2 py-1 text-center rounded transition ${isResidual ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{isResidual ? 'Precio Frío' : 'Precio'}</th>
                      <th className="px-2 py-1 text-left">Producto</th>
                      <th className={`px-2 py-1 text-center rounded transition ${isResidual ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{isResidual ? 'Precio Frío' : 'Precio'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productPairs.map((pair, idx) => {
                      const [left, right] = pair;
                      const leftKey = left ? `${left.productId}${data._id.branchId}` : null;
                      const rightKey = right ? `${right.productId}${data._id.branchId}` : null;
                      return (
                        <tr key={idx} className="border-b last:border-b-0">
                          {/* Columna izquierda */}
                          <td className="px-2 py-1 font-medium text-gray-700 whitespace-normal flex items-center gap-2">
                            {left ? left.product : ''}
                          </td>
                          <td className="px-2 py-1">
                            {left && (
                              <div className="relative flex flex-col">
                                <input
                                  type="number"
                                  autoComplete="off"
                                  name={isResidual ? 'residualPrice' : 'price'}
                                  id={isResidual ? leftKey + '-residual' : leftKey}
                                  className={`w-full rounded-lg px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition
                                    ${(() => {
                                      const manual = isResidual
                                        ? residualFormData[data._id.branchId]?.[leftKey]?.price !== undefined
                                        : pricesFormData[data._id.branchId]?.[leftKey]?.price !== undefined;
                                      if (manual) return 'border-2 border-yellow-400';
                                      if (formulaValues[`${data._id.branchId}_${left.productId}`]) return 'border-2 border-blue-500';
                                      return isResidual ? 'border border-blue-600' : 'border border-gray-300';
                                    })()}`}
                                  onChange={(e) => handleInputsChange(e, left.productId, data._id.branchId, isResidual)}
                                  placeholder={isResidual ? (left.residualPrice ? currency(left.residualPrice) : '$0.00') : (left.latestPrice ? currency(left.latestPrice) : '$0.00')}
                                  min="0"
                                  step="0.01"
                                  value={
                                    isResidual
                                      ? (residualFormData[data._id.branchId]?.[leftKey]?.price ?? '')
                                      : (pricesFormData[data._id.branchId]?.[leftKey]?.price ?? '')
                                  }
                                />
                                {formulaValues[`${data._id.branchId}_${left.productId}`] && (
                                  <div className="text-xs text-blue-700 mt-1">
                                    Sugerido: {(() => {
                                      const r = evaluateSuggested(data, left.productId, isResidual)
                                      return r.error
                                        ? <span className="text-red-500">{r.error}</span>
                                        : (r.value == null ? '—' : <span className="font-bold">{currency(r.value)}</span>)
                                    })()}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          {/* Columna derecha */}
                          <td className="px-2 py-1 font-medium text-gray-700 whitespace-normal break-words flex items-center gap-2">
                            {right ? right.product : ''}
                          </td>
                          <td className="px-2 py-1">
                            {right && (
                              <div className="relative flex flex-col">
                                <input
                                  type="number"
                                  autoComplete="off"
                                  name={isResidual ? 'residualPrice' : 'price'}
                                  id={isResidual ? rightKey + '-residual' : rightKey}
                                  className={`w-full rounded-lg px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-blue-400 transition
                                    ${(() => {
                                      const manual = isResidual
                                        ? residualFormData[data._id.branchId]?.[rightKey]?.price !== undefined
                                        : pricesFormData[data._id.branchId]?.[rightKey]?.price !== undefined;
                                      if (manual) return 'border-2 border-yellow-400';
                                      if (formulaValues[`${data._id.branchId}_${right.productId}`]) return 'border-2 border-blue-500';
                                      return isResidual ? 'border border-blue-600' : 'border border-gray-300';
                                    })()}`}
                                  onChange={(e) => handleInputsChange(e, right.productId, data._id.branchId, isResidual)}
                                  placeholder={isResidual ? (right.residualPrice ? currency(right.residualPrice) : '$0.00') : (right.latestPrice ? currency(right.latestPrice) : '$0.00')}
                                  min="0"
                                  step="0.01"
                                  value={
                                    isResidual
                                      ? (residualFormData[data._id.branchId]?.[rightKey]?.price ?? '')
                                      : (pricesFormData[data._id.branchId]?.[rightKey]?.price ?? '')
                                  }
                                />
                                {formulaValues[`${data._id.branchId}_${right.productId}`] && (
                                  <div className="text-xs text-blue-700 mt-1">
                                    Sugerido: {(() => {
                                      const r = evaluateSuggested(data, right.productId, isResidual)
                                      return r.error
                                        ? <span className="text-red-500">{r.error}</span>
                                        : (r.value == null ? '—' : <span className="font-bold">{currency(r.value)}</span>)
                                    })()}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>
              <button
                className={`w-full mb-2 font-bold rounded-xl p-2 uppercase tracking-wide shadow transition border-2 flex items-center justify-center gap-2
    ${applyChanges[data._id.branchId] ? 'bg-yellow-400 text-yellow-900 border-yellow-500' : 'bg-white text-yellow-900 border-yellow-400 hover:bg-yellow-100'}`}
                type="button"
                onClick={() => setApplyChanges(prev => ({ ...prev, [data._id.branchId]: !prev[data._id.branchId] }))}
              >
                <span className={`inline-block w-4 h-4 rounded-full border-2 mr-1
    ${applyChanges[data._id.branchId] ? 'bg-yellow-400 border-yellow-600' : 'bg-white border-yellow-400'}`}></span>
                {applyChanges[data._id.branchId] ? 'FORMATO DE HOY ACTIVADO' : 'CAMBIAR PARA FORMATO DE HOY'}
              </button>
              <button
                className={`mt-0 w-full bg-[#3B82F6] opacity-90 text-white p-3 rounded-xl font-bold uppercase tracking-wide shadow transition hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed`}
                onClick={() => submitBranchPrices(data._id.branchId)}
                disabled={buttonDisabled[data._id.branchId] || loading[data._id.branchId]}
              >
                {loading[data._id.branchId] ? 'Guardando...' : 'Guardar precios'}
              </button>
              {successMessage[data._id.branchId] && (
                <div className="text-green-700 text-center mt-2 font-semibold animate-fade-in">{successMessage[data._id.branchId]}</div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}