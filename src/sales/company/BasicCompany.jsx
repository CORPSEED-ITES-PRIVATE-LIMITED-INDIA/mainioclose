import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Input,
  Button,
  addToast,
  Modal,
  ModalContent,
  ModalHeader,
  Card,
  CardBody,
  useDisclosure,
  ModalBody,
  ModalFooter,
  CardHeader,
} from "@heroui/react";
import { z } from "zod";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
} from "../../toolkit/slices/commonSlice";
import { useDispatch, useSelector } from "react-redux";
import { memo, useEffect } from "react";
import { useParams } from "react-router-dom";
import NewSelect from "../../components/NewSelect";
import { useMediaQuery } from "react-responsive";
import { Building, Plus } from "lucide-react";
import {
  addBasicCompanyDetail,
  createCompanyInAccounts,
  getBasicCompanyDetails,
} from "../../toolkit/slices/companySlice";
import { formatGSTInput, formatPANInput } from "../../common";

const iconClass = "h-4 w-4";

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
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const company = useSelector((state) => state.company.basicCompanyDetail);

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
    setValue,
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

  const validateGST = (gstNo, stateName) => {
    if (!gstNo) return "";
    if (
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNo)
    ) {
      return "Invalid GST Number";
    }
    const selectedState = statesList?.find((s) => s.name === stateName);
    if (selectedState && gstNo.slice(0, 2) !== selectedState.gstCode) {
      return "GST code does not match selected state";
    }
    return "";
  };

  const handleGstChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatGSTInput(rawValue);
    setValue("gstNo", formattedValue);
    // const error = validateGST(formattedValue, state);
    // setGstError(error);
  };

  const handlePanChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatPANInput(rawValue);
    setValue("panNo", formattedValue);
    // if (
    //   formattedValue.length === 10 &&
    //   !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formattedValue)
    // ) {
    //   setPanError("Invalid PAN Number");
    // } else {
    //   setPanError("");
    // }
  };

  const onSubmit = (values) => {
    values.leadId = leadId;
    values.createdById = userId;
    values.updatedById = userId;
    dispatch(addBasicCompanyDetail(values))
      .then((resp) => {
        console.log("jkdghsjkdgjhsdgh", resp);
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Company details added successfully !.",
            color: "success",
          });
          dispatch(
            createCompanyInAccounts({
              leadCompanyId: resp?.payload?.id,
              companyUnitId: resp?.payload?.units?.[0]?.id,
              ...values,
            }),
          )
            .then((companyRes) => {
              if (companyRes.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Company created in account service is done.",
                  color: "success",
                });
                reset();
                onClose();
                dispatch(getBasicCompanyDetails({ leadId, userId }));
              } else {
                addToast({
                  title: `${companyRes?.payload?.data?.message} with status ${companyRes?.payload?.data?.status}`,
                  color: "danger",
                });
              }
            })
            .catch((err) =>
              addToast({
                title: "Something went wrong in account service !.",
                color: "danger",
              }),
            );
        } else {
          addToast({
            title: resp?.payload,
            color: "danger",
          });
        }
      })
      .catch((err) =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  return (
    <>
      <Card className="my-2">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <Building className={iconClass} />{" "}
              <p className="text-sm font-medium">Company detail</p>
            </div>
            {!company?.name && (
              <Button
                size="sm"
                isIconOnly
                variant="light"
                className="w-6 h-6 rounded-full bg-none"
                onPress={onOpen}
              >
                <Plus className={iconClass} />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody className="max-h-[300px] overflow-auto">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="col-span-2">
              <p className="font-medium text-gray-900">
                {company?.name || "NA"}
              </p>
            </div>

            <p className="text-gray-500">
              <span className="text-gray-700 font-medium">GST:</span>{" "}
              {company?.gstNo || "NA"}
            </p>

            <p className="text-gray-500">
              <span className="text-gray-700 font-medium">PAN:</span>{" "}
              {company?.panNo || "NA"}
            </p>

            <p className="text-gray-500 col-span-2">
              <span className="text-gray-700 font-medium">Location:</span>{" "}
              {company?.city || "NA"}, {company?.state || "NA"}
            </p>
          </div>
        </CardBody>
      </Card>

      <Modal
        size="3xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add company
              </ModalHeader>
              <ModalBody>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Company name"
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
                        <Input
                          value={field.value}
                          label="GST Number"
                          maxLength={15}
                          onChange={(e) => {
                            handleGstChange(e);
                          }}
                        />
                      )}
                    />

                    {/* PAN */}
                    <Controller
                      name="panNo"
                      control={control}
                      render={({ field }) => (
                        <Input
                          value={field.value}
                          label="PAN Number"
                          maxLength={10}
                          onChange={(e) => {
                            handlePanChange(e);
                          }}
                        />
                      )}
                    />

                    {/* Address */}
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} label="Address" />
                      )}
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

                  <ModalFooter className="w-full flex justify-end">
                    <Button onPress={onClose}>Cancel</Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default memo(BasicCompany);
