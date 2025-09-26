import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
  ListboxSection,
  Select,
  SelectItem,
} from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchCompaniesForCompany } from "../toolkit/slices/companySlice";
import { useNavigate, useParams } from "react-router-dom";

const CustomSearchInput = ({
  onChange,
  onSelect,
  value,
  isButton,
  buttonText,
  onButtonClick,
}) => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const seachCompniesList = useSelector(
    (state) => state.company.seachCompniesList
  );
  const [searchDetail, setSearchDetail] = useState({
    searchText: "",
    userId: userId,
    searchField: "searchNameAndGSt",
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchDetail.searchText) {
        dispatch(searchCompaniesForCompany(searchDetail));
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchDetail.searchText,dispatch]);

  console.log("seachCompniesList", seachCompniesList);

  return (
    <div className="flex items-center w-full my-2">
      <Select
        size="lg"
        className="w-[15%]"
        selectedKeys={[searchDetail?.searchField]}
        items={[
          { label: "GST", value: "gstNumber" },
          { label: "Name", value: "searchNameAndGSt" },
          { label: "Contact no.", value: "contactNumber" },
          { label: "Email", value: "contactEmail" },
        ]}
        onSelectionChange={(e) => {
          let key = Array.from(e);
          setSearchDetail((prev) => ({ ...prev, searchField: key }));
        }}
      >
        {(item) => <SelectItem key={item?.value}>{item?.label}</SelectItem>}
      </Select>
      <Autocomplete
        size="lg"
        className="max-w-[85%]"
        classNames={{ base: "rounded-tr-none rounded-br-none" }}
        items={seachCompniesList || []}
        placeholder="Search companies"
        onInputChange={(e) =>
          setSearchDetail((prev) => ({ ...prev, searchText: e }))
        }
      >
        {(item) => {
          console.log("item", item);
          return (
            <AutocompleteItem key={item?.companyId}>
              <div>
                <p className="text-sm">{item?.companyName}</p>
                <Button
                  variant="light"
                  size="sm"
                  color="primary"
                  onPress={() => {
                    navigate(
                      `/erp/${userId}/sales/company/${data?.companyId}/gstDetails`
                    );
                  }}
                >
                  Add unit
                </Button>
              </div>
            </AutocompleteItem>
          );
        }}
        <AutocompleteItem
          key="add-new"
          className="flex justify-center w-full"
          color="primary"
          onPress={onButtonClick}
        >
          Add new
        </AutocompleteItem>
      </Autocomplete>
    </div>
  );
};

export default CustomSearchInput;
