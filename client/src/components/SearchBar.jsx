/* eslint-disable react/prop-types */
import { useRef, useState } from 'react'
import { CiSearch } from 'react-icons/ci'
import { MdClear } from 'react-icons/md';

export default function SearchBar({ handleFilterTextChange, placeholder }) {

  const [searchTerm, setSearchTerm] = useState('')
  const searchBarRef = useRef(null);

  const handleSearchBarChange = (e) => {

    setSearchTerm(e.target.value)
    handleFilterTextChange(e.target.value)
  }

  const clearSearchBar = () => {

    const searchBar = document.getElementById('searchBar')

    setSearchTerm('')
    searchBar.focus()
  }

  return (
    <div className="w-full bg-white  p-3 border rounded-lg">
      <div className="border rounded-lg flex items-center">
        <CiSearch className=" h-8 w-8 border-r" />
        <input ref={searchBarRef} value={searchTerm} placeholder={placeholder ?? 'Búsqueda...'} autoComplete="off" className=" h-full w-full p-2 outline-none" type="text" name="searchBar" id="searchBar" onChange={handleSearchBarChange} />
        <button className="h-8 w-8" onClick={clearSearchBar}>
          <MdClear className="w-full h-full" />
        </button>
      </div>
    </div>
  )
}
