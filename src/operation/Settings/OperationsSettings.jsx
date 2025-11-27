import { Listbox, ListboxItem } from "@heroui/react";
import { useEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

export const ListboxWrapper = ({ children }) => (
  <div className="w-full h-[90vh] border-small px-1 py-2 rounded-small border-default-200 dark:border-default-100">
    {children}
  </div>
);

const OperationsSettings = () => {
  const navigate = useNavigate();
  const path = useLocation();
  const lastKey = path?.pathname?.split("/");

  const handleOnNavigate = (key) => {
    navigate(key);
  };

  return (
    <div className=" w-full flex gap-8">
      <div className="w-[10%] ">
        <ListboxWrapper>
          <Listbox
            aria-label="Actions"
            selectedKeys={[lastKey[lastKey?.length - 1]]}
            onAction={handleOnNavigate}
          >
            <ListboxItem key="userMap">User map</ListboxItem>
            <ListboxItem key="milestones">Milestones</ListboxItem>
            <ListboxItem key="allDocuments">Documents</ListboxItem>
            <ListboxItem key="departments">Departments</ListboxItem>

            {/* <ListboxItem key="delete" className="text-danger" color="danger">
              Delete file
            </ListboxItem> */}
          </Listbox>
        </ListboxWrapper>
      </div>
      <div className="w-[90%]">
        <Outlet />
      </div>
    </div>
  );
};

export default OperationsSettings;
