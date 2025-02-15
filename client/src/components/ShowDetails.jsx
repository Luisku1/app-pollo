/* eslint-disable react/prop-types */
import Modal from './Modals/Modal';

export default function ShowDetails({ data, fields, title, closeModal, children, payment, actions }) {
  const renderData = () => {
    if (children) return children;

    return (
      <>
        {fields.map((field, index) => (
          <div key={index} className="grid grid-cols-2 p-3 shadow-lg rounded-lg mb-4 gap-2 items-center">
            <p className="font-bold text-lg">{field.label}:</p>
            {data && (
              <p className={(field.className ? field.className(data) : '') + ` text-start`}>{field.format ? field.format(data, payment) : data[field.key]}</p>
            )}
          </div>
        ))}
        <div className='w-full'>
          {actions && (
            <div className='w-full'>
              {actions(data)}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div>
      <Modal
        title={title}
        content={renderData()}
        closeModal={closeModal}
      />
    </div>
  );
}

