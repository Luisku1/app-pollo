export default function Loading() {
  return (

    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex justify-center max-w-lg my-auto mx-auto z-10 blur l-flex text-center float-end align-items-center">
      <div
        className="spinner-grow"
        role="status"
        style={{ width: "3rem", height: "3rem" }}
      />
    </div>
  )
}