/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"

export default function SectionsMenu({ sections, handleShowSections, selectedSection, setSelectedSection }) {

  const [currentSections, setCurrentSections] = useState([])
  const [startX, setStartX] = useState(0);
  const [endX, setEndX] = useState(0);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  }

  const handleTouchMove = (e) => {
    setEndX(e.touches[0].clientX);
  }

  const handleTouchEnd = () => {
    const diffX = endX - startX;
    if (Math.abs(diffX) > 80) {
      if (diffX > 0) {
        changeSection('right');
      } else {
        changeSection('left');
      }
    }
  }

  const changeSection = (direction) => {
    const currentIndex = currentSections.findIndex(section => section.label === selectedSection.label);
    if (direction === 'right' && currentIndex > 0) {
      handleShowSections(currentSections[currentIndex - 1]);
    } else if (direction === 'left' && currentIndex < currentSections.length - 1) {
      handleShowSections(currentSections[currentIndex + 1]);
    }
  }

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [endX])

  useEffect(() => {

    if (!(sections && sections.length > 0)) return

    setCurrentSections(sections)

  }, [sections])

  useEffect(() => {

    if(selectedSection != null || sections.length === 0) return

    setSelectedSection(sections[0])

  }, [sections])

  return (

    <div>
      {currentSections.length > 0 && selectedSection && (
        <div>
          <div className={`border bg-white my-4 w-full rounded-lg font-bold grid grid-cols-${sections.length}`}>
            {currentSections.map((section) => (
              <div key={section.label} className="col-span-1 border border-black rounded-lg h-full">
                <div className="h-full">
                  <button id={section.label} className={`text-center h-full w-full p-1 rounded-lg hover:shadow-xl ${(selectedSection.label == section.label ? 'bg-lime-600 text-white' : 'bg-white text-black')}`} onClick={() => { handleShowSections(section) }}>{section.label}</button>
                </div>
              </div>
            ))}
          </div>

          {selectedSection == null ?

            <div className="mt-4">
              {currentSections[0].component}
            </div>

            :

            <div>
              {currentSections.map((section) => (
                (section.label == selectedSection.label && (
                  <div key={section.label} className="mt-4">
                    {section.component}
                  </div>
                ))
              ))
              }
            </div>
          }
        </div>
      )}
    </div>
  )
}
