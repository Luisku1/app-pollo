/* eslint-disable react/display-name */
/* eslint-disable react/prop-types */
import { forwardRef, useState } from 'react'
import { CiSearch } from 'react-icons/ci'
import { MdClear } from 'react-icons/md';

const SearchBar = forwardRef(({ handleFilterTextChange, placeholder, onFocus }, ref) => {

  const [searchTerm, setSearchTerm] = useState('')

  const handleOnFocus = (e) => {

    if (onFocus) {

      onFocus(e)
    }

    e.target.select()
  }

  const handleSearchBarChange = (e) => {

    setSearchTerm(e.target.value)
    handleFilterTextChange(e.target.value)
  }

  const clearSearchBar = () => {

    const searchBar = document.getElementById('searchBar')

    setSearchTerm('')
    handleSearchBarChange({ target: { value: '' } })
    searchBar.focus()
  }

  return (
    <div className="w-full">
      <div className="border rounded-lg flex items-center p-2">
        <CiSearch className=" h-8 w-8 border-r pr-2" />
        <input ref={ref} onFocus={handleOnFocus} value={searchTerm} placeholder={placeholder ?? 'Búsqueda...'} autoComplete="off" className=" h-full w-full p-2 outline-none" type="text" name="searchBar" id="searchBar" onChange={handleSearchBarChange} />
        <button className="h-8 w-8" onClick={clearSearchBar}>
          {searchTerm != '' && (
            <MdClear className="w-full h-full opacity-60" />
          )}
        </button>
      </div>
    </div>
  )
})

export default SearchBar
