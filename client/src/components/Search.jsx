import { MdSearch } from "react-icons/md";
import { useSelector } from "react-redux";


export const SearchMenu = ({ onActivateSearch }) => {

  const { currentUser } = useSelector((state) => state.user)

  if (!currentUser) return null

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