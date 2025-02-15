/* eslint-disable react/prop-types */

import React from "react";

const RowItem = ({ children, alignLeft = false }) => {
  // Asegurarse de que children sea un array
  const childrenArray = React.Children.toArray(children);

  return (
    <div className={`flex flex-wrap ${alignLeft ? 'justify-start' : ''} items-center w-full h-8`}>
      {childrenArray.map((child, index) => (
        <span key={index} className="flex-1 text-left px-2">
          {child}
        </span>
      ))}
    </div>
  );
};

export default RowItem;