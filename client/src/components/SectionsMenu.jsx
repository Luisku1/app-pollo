/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";

export default function SectionsMenu({ sections, handleShowSections, selectedSection, setSelectedSection }) {
  const [currentSections, setCurrentSections] = useState([]);
  const tabsRef = useRef(null);
  const [startX, setStartX] = useState(0);

  // Swipe solo en el menú de tabs
  useEffect(() => {
    const handleTouchStart = (e) => setStartX(e.touches[0].clientX);
    const handleTouchEnd = (e) => {
      const endX = e.changedTouches[0].clientX;
      const diffX = endX - startX;
      if (Math.abs(diffX) > 100) {
        const currentIndex = currentSections.findIndex(section => section.label === selectedSection.label);
        if (diffX > 0 && currentIndex > 0) {
          handleShowSections(currentSections[currentIndex - 1]);
        } else if (diffX < 0 && currentIndex < currentSections.length - 1) {
          handleShowSections(currentSections[currentIndex + 1]);
        }
      }
    };
    const tabs = tabsRef.current;
    if (tabs) {
      tabs.addEventListener('touchstart', handleTouchStart);
      tabs.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      if (tabs) {
        tabs.removeEventListener('touchstart', handleTouchStart);
        tabs.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [currentSections, selectedSection, startX, handleShowSections]);

  useEffect(() => {
    if (sections && sections.length > 0) setCurrentSections(sections);
  }, [sections]);

  useEffect(() => {
    if (!selectedSection && sections.length > 0) setSelectedSection(sections[0]);
  }, [sections, selectedSection, setSelectedSection]);

  return (
    <div>
      {currentSections.length > 0 && selectedSection && (
        <div>
          <div
            ref={tabsRef}
            className="flex overflow-x-auto bg-white rounded-lg shadow mb-4"
          >
            {currentSections.map((section) => (
              <button
                key={section.label}
                title={section.label}
                className={`flex-1 min-w-[120px] py-3 px-4 text-base font-semibold transition-all duration-200
                  ${selectedSection.label === section.label
                    ? 'bg-orange-500 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-orange-100'}
                  rounded-lg mx-1`}
                onClick={() => handleShowSections(section)}
              >
                {section.button ?? section.label}
              </button>
            ))}
          </div>
          <div className="transition-all duration-300 animate-fade-in">
            {currentSections.map((section) =>
              section.label === selectedSection.label && (
                <div key={section.label} className="mt-4">
                  {section.component}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
