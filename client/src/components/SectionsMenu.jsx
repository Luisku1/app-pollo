/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"

export default function SectionsMenu({ sections }) {

  const [currentSections, setCurrentSections] = useState([])
  const [selectedSection, setSelectedSection] = useState(null)

  const handleShowSections = (section) => {

    setSelectedSection(section)
  }

  useEffect(() => {

    if (!(sections && sections.length > 0)) return

    setCurrentSections(sections)
    setSelectedSection(sections[0])

  }, [sections])

  return (

    <div>
      {currentSections.length > 0 && (
        <div>
          <div className={`border bg-white border-black my-4 w-full rounded-lg font-bold grid grid-cols-${sections.length}`}>
            {currentSections.map((section) => (
              <div key={section.label} className="flex justify-center">
                <div>
                  <button id={section.label} className={`h-full p-1 rounded-lg hover:shadow-xl hover:bg-slate-700 hover:text-white ${(selectedSection.label == section.label ? 'bg-slate-500 text-white' : 'bg-white')}`} onClick={() => { handleShowSections(section) }}>{section.label}</button>
                </div>
              </div>
            ))}
          </div>

          {currentSections.map((section) => (
            (section.label == selectedSection.label && (
              <div key={section.label} className="mt-4">
                {section.component}
              </div>
            ))
          ))}
        </div>
      )}
    </div>
  )
}
