import { MdSearch } from "react-icons/md";
import { useState } from "react";

export const SearchMenu = ({ onActivateSearch }) => {

  return (
    <div>
      <button
        onClick={onActivateSearch}
        className="fixed bottom-4 left-4 bg-header text-white p-3 rounded-full shadow-lg hover:bg-black transition duration-300 ease-in-out z-50"
      >
        <MdSearch className="text-3xl" />
      </button>
    </div>
  );
};