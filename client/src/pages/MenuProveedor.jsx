/* eslint-disable react/prop-types */
import ProviderAvg from "../components/ProviderAvg";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MdClear, MdEdit } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { useExtraOutgoingsAvg } from "../hooks/ExtraOutgoings/useExtraOutgoingsAvg";
import { useRoles } from "../context/RolesContext";
import Modal from "../components/Modals/Modal";
import CreateUpdateProvider from "../components/CreateUpdateProvider";

const MenuProveedor = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { company } = useSelector((state) => state.user);
  const [providers, setProviders] = useState([]);
  const { extraOutgoingsAvg } = useExtraOutgoingsAvg({
    companyId: company._id,
  });
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isController } = useRoles();
  const [isOpen, setIsOpen] = useState(false);
  const modalStatus = false;
  const [buttonId, setButtonId] = useState(null);
  const [showModal, setShowModal] = useState();
  const [providerToUpdate, setProviderToUpdate] = useState(null)

  const handleAddProvider = (provider) => {

    setProviders((prevProviders) => [provider, ...prevProviders])
  }

  useEffect(() => {
    setShowModal(modalStatus);
  }, [modalStatus]);

  const changeShowModal = () => {
    setShowModal((prev) => !prev);
  };

  const handleSearchBarChange = (e) => {
    const searchString = e.target.value;

    if (searchString != "") {
      const filteredList = providers.filter((provider) =>
        provider.name.toLowerCase().includes(searchString.toLowerCase())
      );

      setFilteredProviders(filteredList);
    } else {
      setFilteredProviders(providers);
    }
  };

  const handleUpdateProvider = (paramsProvider) => {

    setProviders((prevProviders) => {

      let newProviders = [...prevProviders]

      newProviders = newProviders.map((provider) => {

        if(provider._id === paramsProvider._id) {
          return paramsProvider
        }
        return provider
      })

      return newProviders
    })
  }

  useEffect(() => {

    setFilteredProviders(providers)

  }, [providers])

  const clearSearchBar = () => {
    const searchBar = document.getElementById("searchBar");

    searchBar.value = "";
    searchBar.focus();

    setFilteredProviders(providers);
  };

  const deleteProvider = async (providerId, index) => {
    setLoading(true);

    try {
      const res = await fetch("/api/provider/delete-provider/" + providerId, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }

      providers.splice(index, 1);
      setError(null);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
    console.log(index);
  };

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch("/api/provider/get-providers/" + company._id);
        const data = await res.json();

        if (data.success === false) {
          setError(data.message);
          return;
        }

        setProviders(data.providers);
        setFilteredProviders(data.providers);
        setError(null);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchProviders();
  }, [company._id]);

  const handleSetProviderToUpdate = (provider) => {

    setProviderToUpdate(provider)
  }

  return (
    <main className="p-3 max-w-lg mx-auto">
      <div>
        <div className="w-full bg-button rounded-lg border text-md border-black">
          <button
            className="w-full bg-button text-white p-3 rounded-lg uppercase "
            onClick={changeShowModal}
          >
            Registra un proveedor
          </button>
        </div>
        {error && (
          <Modal
            content={<p>{error}</p>}
            closeModal={() => setError(null)}
            closeOnClickOutside={true}
            closeOnEsc={true}
          />
        )}
        {showModal && (
          <Modal
            title={"Registro de Proveedor"}
            content={<CreateUpdateProvider handleAddProvider={handleAddProvider} />}
            closeModal={changeShowModal}
            closeOnClickOutside={true}
            closeOnEsc={true}
          ></Modal>
        )}
      </div>
      <div className="w-full bg-white  p-3 border">
        <div className="border flex items-center">
          <CiSearch className=" h-8 w-8 border-r" />
          <input
            autoComplete="off"
            className=" h-full w-full p-2 outline-none"
            type="text"
            name="searchBar"
            id="searchBar"
            onChange={handleSearchBarChange}
          />
          <button className="h-8 w-8" onClick={clearSearchBar}>
            <MdClear className="w-full h-full" />
          </button>
        </div>
      </div>
      <div>
        {filteredProviders &&
          filteredProviders.length > 0 &&
          filteredProviders.map((provider, index) => (
            <div
              className="my-4 bg-white p-4 grid grid-cols-12"
              key={provider._id}
            >
              <div className="col-span-10">
                <p className="text-2xl font-bold">{provider.name}</p>
                {isController(currentUser.role) && (
                  <div>
                    <ProviderAvg providerId={provider._id}></ProviderAvg>
                  </div>
                )}
                <div className="flex gap-2">
                  <p className="font-bold text-lg">{"Promedio de gastos:"}</p>
                  <p className="text-lg text-red-700 font-bold">
                    {extraOutgoingsAvg.toLocaleString("es-Mx", {
                      style: "currency",
                      currency: "MXN",
                    })}
                  </p>
                </div>
                <div className="p-3">
                  {provider.phoneNumber ? (
                    <p className="text-lg">
                      Teléfono:{" "}
                      {provider.phoneNumber
                        ? provider.phoneNumber.replace(
                            /(\d{2})(\d{4})(\d{4})/,
                            "$1-$2-$3"
                          )
                        : ""}
                    </p>
                  ) : (
                    ""
                  )}
                  <div className="flex gap-1 text-lg mt-2">
                    <p className="">Visítanos</p>
                    <a
                      href={provider.location}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700"
                    >
                      aquí
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-span-2 my-auto">
                <button
                  id={provider._id}
                  onClick={() => { handleSetProviderToUpdate(provider)}}
                  className="bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3 "
                >
                  <span>
                    <MdEdit className="text-blue-700 m-auto" />
                  </span>
                </button>
                {providerToUpdate && (
                  <Modal
                    title={"Modificación del Proveedor"}
                    content={<CreateUpdateProvider provider={providerToUpdate} handleUpdateProvider={handleUpdateProvider} closeModal={() => {setProviderToUpdate(null)}} />}
                    closeModal={() => {setProviderToUpdate(null)}}
                    closeOnClickOutside={true}
                    closeOnEsc={true}
                  ></Modal>
                )}
                <div>
                  <button
                    id={provider._id}
                    onClick={() => {
                      setIsOpen(isOpen ? false : true),
                        setButtonId(provider._id);
                    }}
                    disabled={loading}
                    className=" col-span-2 bg-slate-100 border shadow-lg rounded-lg text-center h-10 w-10 m-3"
                  >
                    <span>
                      <FaTrash className="text-red-700 m-auto" />
                    </span>
                  </button>
                  {isOpen && provider._id == buttonId ? (
                    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
                      <div className="bg-white p-5 rounded-lg flex flex-col justify-center items-center gap-5">
                        <div>
                          <p className="text-3xl font-semibold">
                            ¿Estás seguro de borrar este registro?
                          </p>
                        </div>
                        <div className="flex gap-10">
                          <div>
                            <button
                              className="rounded-lg bg-red-500 text-white shadow-lg w-20 h-10"
                              onClick={() => {
                                deleteProvider(provider._id, index),
                                  setIsOpen(isOpen ? false : true);
                              }}
                            >
                              Si
                            </button>
                          </div>
                          <div>
                            <button
                              className="rounded-lg border shadow-lg w-20 h-10"
                              onClick={() => {
                                setIsOpen(isOpen ? false : true);
                              }}
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
};

export default MenuProveedor;
