import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { formatDate, getDayRange } from "../helpers/DatePickerFunctions";
import FechaDePagina from "../components/FechaDePagina";
import "react-toastify/dist/ReactToastify.css";
import { GiCardExchange } from "react-icons/gi";
import { useLoading } from "../hooks/loading";
import Loading from "../components/Loading";
import { useRoles } from "../context/RolesContext";
import SectionsMenu from "../components/SectionsMenu";
import { useDate } from "../context/DateContext";
import { MdDomainAdd } from "react-icons/md";
import MenuProveedor from "./MenuProveedor";
import CreateMovementsProviders from "../components/CreateMovementsProviders";

export default function ControlProveedores() {
  const hideFechaDePagina = false;
  let paramsDate = useParams().date;
  let datePickerValue = paramsDate ? new Date(paramsDate) : new Date();
  let stringDatePickerValue = formatDate(datePickerValue);
  const { currentUser } = useSelector((state) => state.user);
  const { loading: roleLoading, isManager } = useRoles();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState(null);

  const { currentDate, setCurrentDate } = useDate();

  const handleShowSections = (section) => {
    setSelectedSection(section);
  };

  const isLoading = useLoading(roleLoading);

  const changeDatePickerValue = (e) => {
    const newDate = e.target.value + "T06:00:00.000Z";
    setCurrentDate(newDate);
    navigate("/proveedores/" + newDate);
  };

  const changeDay = (date) => {
    setCurrentDate(date);
    navigate("/proveedores/" + date);
  };

  useEffect(() => {
    if (stringDatePickerValue) {
      setCurrentDate(stringDatePickerValue);
    } else {
      setCurrentDate(formatDate(new Date()));
    }
  }, [stringDatePickerValue]);


  useEffect(() => {
    if (hideFechaDePagina) return;
    document.title =
      "Proveedores (" + new Date(currentDate).toLocaleDateString() + ")";
  }, [currentDate, hideFechaDePagina]);

  if (isLoading) {
    return <Loading></Loading>;
  } else {
    return (
      <main id="provider-main" className={"p-3 max-w-lg mx-auto"}>
        <div>
          <div
            className={`w-fit mx-auto sticky ${
              hideFechaDePagina ? "-top-[4rem]" : "top-16"
            } bg-opacity-60 bg-menu z-10 mb-2`}
          >
            {isManager(currentUser.role) && !hideFechaDePagina ? (
              <FechaDePagina
                changeDay={changeDay}
                stringDatePickerValue={currentDate}
                changeDatePickerValue={changeDatePickerValue}
                higherZ={true}
              ></FechaDePagina>
            ) : (
              ""
            )}
          </div>
          {getDayRange(new Date(currentDate)).bottomDate <=
          getDayRange(new Date()).bottomDate ? (
            <SectionsMenu
              handleShowSections={handleShowSections}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              sections={[
                {
                  label: "Gestión entre Proveedores",
                  button: (
                    <div className="flex justify-center gap-1">
                      <GiCardExchange className="justify-self-center text-2xl" />
                    </div>
                  ),
                  component: <CreateMovementsProviders />,
                },
                {
                  label: "Proveedores",
                  button: (
                    <MdDomainAdd className="justify-self-center text-2xl" />
                  ),
                  component: <MenuProveedor />,
                },
              ]}
              />
            ) : (
              <div className="flex justify-center mt-4">
              <p className="text-red-800 font-bold text-lg">
                No puedes ver información de días futuros
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }
}
