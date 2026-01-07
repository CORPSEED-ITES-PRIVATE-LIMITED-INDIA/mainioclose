import { useDispatch, useSelector } from "react-redux";
import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import {
  getAllCitiesByStateName,
  getAllStatesByCountryName,
} from "../toolkit/slices/commonSlice";

const AddressFields = ({ prefix, control, errors = {} }) => {
  const dispatch = useDispatch();

  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);

  const getAddressFieldName = (prefix, field) => {
    const isBilling = prefix === "billingAddress";

    const map = {
      address: isBilling ? "primaryAddress" : "secondaryAddress",
      country: isBilling ? "primaryCountry" : "secondaryCountry",
      state: isBilling ? "primaryState" : "secondaryState",
      city: isBilling ? "primaryCity" : "secondaryCity",
      pinCode: isBilling ? "primaryPinCode" : "secondaryPinCode",
    };

    return `${prefix}.${map[field]}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Address */}
      <FormInput
        label="Address"
        name={getAddressFieldName(prefix, "address")}
        control={control}
        error={errors?.primaryAddress || errors?.secondaryAddress}
      />

      {/* Country */}
      <FormSelect
        label="Country"
        name={getAddressFieldName(prefix, "country")}
        control={control}
        data={countryList || []}
        labelKey="name"
        valueKey="name"
        onChangeExtra={(value) => {
          dispatch(getAllStatesByCountryName(value));
        }}
      />

      {/* State */}
      <FormSelect
        label="State"
        name={getAddressFieldName(prefix, "state")}
        control={control}
        data={statesList || []}
        labelKey="name"
        valueKey="name"
        onChangeExtra={(value) => {
          dispatch(getAllCitiesByStateName(value));
        }}
      />

      {/* City */}
      <FormSelect
        label="City"
        name={getAddressFieldName(prefix, "city")}
        control={control}
        data={citiesList || []}
        labelKey="name"
        valueKey="name"
      />

      {/* Pin Code */}
      <FormInput
        label="Pin Code"
        name={getAddressFieldName(prefix, "pinCode")}
        control={control}
        error={errors?.primaryPinCode || errors?.secondaryPinCode}
      />
    </div>
  );
};

export default AddressFields;
