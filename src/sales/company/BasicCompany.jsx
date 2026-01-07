import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button, addToast } from "@heroui/react";
import { z } from "zod";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
} from "../../toolkit/slices/commonSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NewSelect from "../../components/NewSelect";
import { useMediaQuery } from "react-responsive";
import { Plus, X } from "lucide-react";
import {
  addBasicCompanyDetail,
  getBasicCompanyDetails,
} from "../../toolkit/slices/companySlice";

const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-gray-900 font-medium">{value}</p>
  </div>
);

export const unitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pinCode: z.string().optional(),
  gstNo: z.string().optional(),
  panNo: z.string().optional(),
});

const BasicCompany = () => {
  const dispatch = useDispatch();
  const { leadId, userId } = useParams();
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const company = useSelector((state) => state.company.basicCompanyDetail);
  const [isAddCompany, setIsAddCompany] = useState(false);
  const info = (value) => value ?? "—";

  useEffect(() => {
    dispatch(getAllCountries());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getBasicCompanyDetails({ leadId, userId }));
  }, [dispatch, leadId, userId]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pinCode: "",
      gstNo: "",
      panNo: "",
      leadId,
      createdById: userId,
      updatedById: userId,
    },
  });

  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const isLarge = useMediaQuery({ minWidth: 1536 });

  const onSubmit = (values) => {
    values.leadId = leadId;
    values.createdById = userId;
    values.updatedById = userId;
    dispatch(addBasicCompanyDetail(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Company details added successfully !.",
            color: "success",
          });
          setIsAddCompany(false);
          reset();
          dispatch(getBasicCompanyDetails({ leadId, userId }));
        } else {
          addToast({
            title: resp?.payload,
            color: "danger",
          });
        }
      })
      .catch((err) =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  return (
    <>
      <div className="flex items-center justify-between gap-2 my-2">
        <h1 className="font-medium text-xl">Company basic details</h1>

        {isAddCompany ? (
          <Button
            onPress={() => setIsAddCompany(false)}
            endContent={<X className="w-4 h-4" />}
          >
            Cancel
          </Button>
        ) : (
          <Button
            color="primary"
            onPress={() => setIsAddCompany(true)}
            endContent={<Plus className="w-4 h-4" />}
          >
            Add
          </Button>
        )}
      </div>

      {isAddCompany ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name */}
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Name"
                  isRequired
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                />
              )}
            />

            {/* GST */}
            <Controller
              name="gstNo"
              control={control}
              render={({ field }) => (
                <Input {...field} label="GST Number" maxLength={15} />
              )}
            />

            {/* PAN */}
            <Controller
              name="panNo"
              control={control}
              render={({ field }) => (
                <Input {...field} label="PAN Number" maxLength={10} />
              )}
            />

            {/* Address */}
            <Controller
              name="address"
              control={control}
              render={({ field }) => <Input {...field} label="Address" />}
            />

            <Controller
              name="country"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  label="Country"
                  size={isMedium ? "sm" : "md"}
                  data={countryList || []}
                  labelKey="name"
                  valueKey="name"
                  value={field.value}
                  onChange={(value) => {
                    dispatch(getAllStatesByCountryName(value));
                    field.onChange(value);
                  }}
                />
              )}
            />

            <Controller
              name="state"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  label="State"
                  size={isMedium ? "sm" : "md"}
                  data={statesList || []}
                  labelKey="name"
                  valueKey="name"
                  value={field.value}
                  onChange={(value) => {
                    dispatch(getAllCitiesByStateName(value));
                    field.onChange(value);
                  }}
                />
              )}
            />

            <Controller
              name="city"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <NewSelect
                  label="City"
                  size={isMedium ? "sm" : "md"}
                  data={citiesList || []}
                  labelKey="name"
                  valueKey="name"
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            />

            {/* Pin Code */}
            <Controller
              name="pinCode"
              control={control}
              render={({ field }) => (
                <Input {...field} label="Pin Code" maxLength={6} />
              )}
            />
          </div>

          <div className="flex justify-end mt-4">
            <Button color="primary" type="submit">
              Submit
            </Button>
          </div>
        </form>
      ) : (
        <div className="h-[calc(100vh-240px)] overflow-y-auto pr-2 p-4 md:p-6 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {company?.name}
              </h1>
              <p className="text-sm text-gray-500">
                PAN: {info(company?.panNo)}
              </p>
            </div>

            <div className="flex gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {company?.status ?? "Active"}
              </span>
              {company?.isConsultant && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  Consultant
                </span>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Company Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <Info label="Industry" value={info(company?.industry)} />
              <Info label="Rating" value={info(company?.rating)} />
              <Info label="Company Age" value={info(company?.companyAge)} />
              <Info
                label="Established On"
                value={info(company?.establishDate)}
              />
              <Info label="Revenue" value={info(company?.revenue)} />
              <Info label="Payment Term" value={info(company?.paymentTerm)} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Primary Address
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <Info label="Address" value={info(company?.address)} />
              <Info label="City" value={info(company?.city)} />
              <Info label="State" value={info(company?.state)} />
              <Info label="Country" value={info(company?.country)} />
              <Info
                label="Primary Pin Code"
                value={info(company?.primaryPinCode)}
              />
              <Info
                label="Secondary Pin Code"
                value={info(company?.secondaryPinCode)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Legal & Compliance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <Info
                label="Agreement Present"
                value={company?.aggrementPresent ? "Yes" : "No"}
              />
              <Info
                label="NDA Present"
                value={company?.ndaPresent ? "Yes" : "No"}
              />
              <Info label="Stage" value={info(company?.stage)} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              Units ({company?.units?.length || 0})
            </h2>

            <div className="space-y-4">
              {company?.units?.length > 0 &&
                company?.units?.map((unit) => (
                  <div
                    key={unit?.id}
                    className="border rounded-lg p-4 hover:shadow transition"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between gap-2">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {unit?.unitName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          GST: {info(unit?.gstNo)}
                        </p>
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 h-fit">
                        {unit?.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
                      <Info label="Address" value={info(unit?.addressLine1)} />
                      <Info label="City" value={info(unit?.city)} />
                      <Info label="State" value={info(unit?.state)} />
                      <Info label="Country" value={info(unit?.country)} />
                      <Info label="Pin Code" value={info(unit?.pinCode)} />
                      <Info
                        label="Consultant Present"
                        value={unit?.consultantPresent ? "Yes" : "No"}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BasicCompany;
