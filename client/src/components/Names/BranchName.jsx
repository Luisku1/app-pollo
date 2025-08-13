import { useState } from "react";
import BranchInfo from "../BranchInfo";

export default function BranchName({ branch, handleBranchUpdate }) {
  const [showInfo, setShowInfo] = useState(false);

  if (!branch) return null;

  return (
    <div>
      <BranchInfo branch={branch} toggleInfo={() => setShowInfo((prev) => !prev)} isShown={showInfo} handleBranchUpdate={handleBranchUpdate} />
      <button onClick={() => setShowInfo(true)}>
        <span className="font-bold text-md flex gap-1 text-blue-700 items-center hover:underline">
          {branch.branch}
        </span>
      </button>
    </div>
  );
}