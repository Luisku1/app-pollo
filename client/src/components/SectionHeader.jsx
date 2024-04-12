/* eslint-disable react/prop-types */
export default function SectionHeader(props) {
  return (

    <h2 className='flex text-2xl text-center font-semibold mb-4 text-red-800' onClick={props.onClick}>{props.label}</h2>
  )
}
