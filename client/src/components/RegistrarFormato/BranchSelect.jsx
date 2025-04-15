/* eslint-disable react/prop-types */
import { GiConfirmed } from "react-icons/gi";
import { useEffect, useMemo, useRef, useState } from "react";
import Modal from "../Modals/Modal";
import SearchBar from "../SearchBar";

export default function BranchSelect({
  branches,
  selectBranch,
  ableToClose,
  selectedBranch,
  modalStatus = false,
  isEditing,
}) {
  const [searchText, setSearchText] = useState("");
  const [preSelect, setPreSelect] = useState(selectedBranch || null);
  const [showModal, setShowModal] = useState();
  const searchBarRef = useRef(null);

  useEffect(() => {
    setShowModal(modalStatus);
  }, [modalStatus]);

  useEffect(() => {
    if (searchBarRef.current && showModal) {
      searchBarRef.current.focus();
    }
  }, [showModal]);

  const changeShowModal = () => {
    setShowModal((prev) => !prev);
  };

  const handlePreSelect = (branch) => {
    setPreSelect((previousSelect) =>
      previousSelect == branch
        ? !selectedBranch
          ? null
          : selectedBranch
        : branch
    );
  };

  const filteredBranches = useMemo(() => {
    return branches.filter((branch) =>
      branch.label.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [branches, searchText]);

  const handleSelectBranch = (branch) => {
    changeShowModal();
    selectBranch(branch ? branch : selectedBranch);
  };

  useEffect(() => {}, [searchText, preSelect, selectedBranch]);

  const renderBranchElemet = (branch) => {
    return (
      <button
        key={branch.value}
        id={branch.value}
        className={`w-full py-2 border border-black rounded-lg border-opacity-25 ${
          preSelect && preSelect.value == branch.value ? "bg-green-300" : ""
        }`}
        onClick={() => {
          handlePreSelect(branch);
        }}
      >
        <p className="w-full text-center font-semibold text-base">
          {branch.label}
        </p>
      </button>
    );
  };

  const renderBranchList = () => {
    return (
      <div className="relative">
        <div className="sticky text-sm top-0 bg-white">
          <SearchBar
            ref={searchBarRef}
            handleFilterTextChange={setSearchText}
            placeholder={"Busca tu sucursal"}
          ></SearchBar>
        </div>
        {filteredBranches.length > 0 &&
          filteredBranches.map(renderBranchElemet)}
        {preSelect && (
          <div className="fixed bottom-10 p-4 max-w-lg">
            <button
              className="bg-green-600 p-3 border border-black rounded-full active:bg-green-300"
              onClick={() => {
                handleSelectBranch(preSelect);
              }}
            >
              <GiConfirmed className="text-white bg-green-600 w-16 h-16" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="w-full bg-button rounded-lg border text-md border-black">
        <button
          className="p-2 w-full rounded-md shadow-md text-center text-white text-xl font-semibold"
          onClick={changeShowModal}
          disabled={!isEditing}
        >
          {selectedBranch ? selectedBranch.label : "Selecciona tu sucursal"}
        </button>
      </div>
      {showModal && (
        <Modal
          title={"Selecciona tu sucursal"}
          content={renderBranchList(branches)}
          ableToClose={ableToClose}
          closeModal={changeShowModal}
          closeOnClickOutside={true}
          closeOnEsc={true}
          >
        </Modal>
      )}
    </div>
  );
}
