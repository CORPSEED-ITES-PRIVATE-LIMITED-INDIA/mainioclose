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
import { memo, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NewSelect from "../../components/NewSelect";
import { useMediaQuery } from "react-responsive";
import { Building, Plus } from "lucide-react";
import {
  addBasicCompanyDetail,
  createCompanyInAccounts,
  getAllCompanyByUserId,
  getAllUnitListByCompanyId,
  getBasicCompanyDetailByCompanyId,
  getBasicCompanyDetails,
  updateBasicCompanyDetail,
} from "../../toolkit/slices/companySlice";
import { allowOnlyNumbers, formatGSTInput, formatPANInput } from "../../common";

const iconClass = "h-4 w-4";

export const unitSchema = (isEstimate) => {
  if (isEstimate) {
    return z.object({
      name: z.string().min(1, "Name is required"),
      address: z.string().min(1, "Address is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      country: z.string().min(1, "Country is required"),
      pinCode: z.string().min(1, "Pincode is required"),
      // gstNo: z.string().optional(),
      panNo: z.string().min(1, "Pan number is required"),
    });
  } else {
    return z.object({
      name: z.string().min(1, "Name is required"),
      address: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      pinCode: z.string().optional(),
      // gstNo: z.string().optional(),
      panNo: z.string().optional(),
    });
  }
};

const BasicCompany = ({ isEstimate, companyDetail, setIsDropDownOpen }) => {
  const dispatch = useDispatch();
  const { leadId, userId } = useParams();
  const { isOpen, onClose, onOpen, onOpenChange } = useDisclosure();
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const company = useSelector((state) => state.company.basicCompanyDetail);
  const [update, setUpdate] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(unitSchema(isEstimate)),
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

  useEffect(() => {
    dispatch(getAllCountries());
  }, [dispatch]);

  useEffect(() => {
    // 🔥 CASE 1: NO COMPANY SELECTED → RESET FORM
    if (isEstimate && !companyDetail?.id) {
      reset({
        name: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pinCode: "",
        gstNo: "",
        panNo: "",
      });
      return; // ❗ STOP HERE
    }

    // 🔥 CASE 2: COMPANY SELECTED
    if (isEstimate && companyDetail?.id) {
      dispatch(getBasicCompanyDetailByCompanyId(companyDetail?.id)).then(
        (resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            const data = resp.payload;

            dispatch(getAllUnitListByCompanyId(data?.id));

            if (data?.country) {
              dispatch(getAllStatesByCountryName(data?.country));
            }
            if (data?.state) {
              dispatch(getAllCitiesByStateName(data?.state));
            }

            reset({
              name: data?.name,
              address: data?.address,
              city: data?.city,
              state: data?.state,
              country: data?.country,
              pinCode: data?.primaryPinCode,
              gstNo: data?.gstNo,
              panNo: data?.panNo,
            });
          }
        },
      );
      return;
    }

    // 🔥 CASE 3: NON-ESTIMATE FLOW
    dispatch(getBasicCompanyDetails({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        const data = resp.payload;

        dispatch(getAllUnitListByCompanyId(data?.id));

        if (data?.country) {
          dispatch(getAllStatesByCountryName(data?.country));
        }
        if (data?.state) {
          dispatch(getAllCitiesByStateName(data?.state));
        }

        reset({
          name: data?.name,
          address: data?.address,
          city: data?.city,
          state: data?.state,
          country: data?.country,
          pinCode: data?.primaryPinCode,
          gstNo: data?.gstNo,
          panNo: data?.panNo,
        });
      }
    });
  }, [dispatch, leadId, userId, companyDetail, isEstimate, update]);

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

  const onSubmit = (values, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    values.leadId = leadId;
    values.createdById = userId;
    values.updatedById = userId;
    if (isEstimate && companyDetail?.id) {
      dispatch(
        updateBasicCompanyDetail({
          companyId: companyDetail?.id,
          userId,
          data: values,
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Company details updated successfully !.",
              color: "success",
            });
            reset();
            onClose();
            setUpdate((prev) => !prev);
            dispatch(getAllCompanyByUserId(userId));
            dispatch(getBasicCompanyDetails({ leadId, userId }));
            dispatch(getAllUnitListByCompanyId(resp?.payload?.id));
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
    } else {
      dispatch(addBasicCompanyDetail(values))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Company details added successfully !.",
              color: "success",
            });
            reset();
            onClose();
            setUpdate((prev) => !prev);
            dispatch(getAllCompanyByUserId(userId));
            dispatch(getBasicCompanyDetails({ leadId, userId }));

            // dispatch(
            //   createCompanyInAccounts({
            //     leadCompanyId: resp?.payload?.id,
            //     companyUnitId: resp?.payload?.units?.[0]?.id,
            //     ...values,
            //   }),
            // )
            //   .then((companyRes) => {
            //     if (companyRes.meta.requestStatus === "fulfilled") {
            //       addToast({
            //         title: "Company created in account service is done.",
            //         color: "success",
            //       });
            //       reset();
            //       onClose();
            //       dispatch(getBasicCompanyDetails({ leadId, userId }));
            //     } else {
            //       addToast({
            //         title: `${companyRes?.payload?.data?.message} with status ${companyRes?.payload?.data?.status}`,
            //         color: "danger",
            //       });
            //     }
            //   })
            //   .catch((err) =>
            //     addToast({
            //       title: "Something went wrong in account service !.",
            //       color: "danger",
            //     }),
            //   );
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
    }
  };

  return (
    <>
      {isEstimate ? (
        !company?.name ? (
          <span
            className="text-blue-700 cursor-pointer font-medium text-nowrap text-sm"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpen();
              setIsDropDownOpen((prev) => ({ ...prev, company: false }));
            }}
          >
            + Add
          </span>
        ) : (
          <span
            className="text-blue-700 cursor-pointer font-medium text-nowrap text-sm"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDropDownOpen((prev) => ({ ...prev, company: false }));
              setIsUpdate(true);
              onOpen();
            }}
          >
            Update
          </span>
        )
      ) : (
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

              {/* <p className="text-gray-500">
                <span className="text-gray-700 font-medium">GST:</span>{" "}
                {company?.gstNo || "NA"}
              </p> */}

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
      )}

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
                {isEstimate && isUpdate ? "Update company" : "Add company"}
              </ModalHeader>
              <ModalBody>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSubmit(onSubmit)(e);
                  }}
                  onKeyDown={(e) => {
                    const tag = e.target.tagName;

                    const isTextInput =
                      tag === "INPUT" ||
                      tag === "TEXTAREA" ||
                      e.target.isContentEditable;

                    // 🔥 If typing inside input, block space bubbling
                    if (isTextInput && e.key === " ") {
                      e.stopPropagation();
                    }
                  }}
                >
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
                          errorMessage={errors.name?.message}
                        />
                      )}
                    />

                    {/* GST
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
                          isInvalid={!!errors.name}
                          errorMessage={errors.name?.message}
                        />
                      )}
                    /> */}

                    {/* PAN */}
                    <Controller
                      name="panNo"
                      control={control}
                      render={({ field }) => (
                        <Input
                          value={field.value}
                          label="PAN Number"
                          isRequired={isEstimate ? true : false}
                          maxLength={10}
                          onChange={(e) => {
                            handlePanChange(e);
                          }}
                          errorMessage={errors.panNo?.message}
                        />
                      )}
                    />

                    {/* Address */}
                    <Controller
                      name="address"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          isRequired={isEstimate ? true : false}
                          label="Address"
                          // isRequired={isEstimate ? true : false}
                          // isInvalid={!!errors.name}
                          errorMessage={errors.address?.message}
                        />
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
                          isRequired={isEstimate ? true : false}
                          value={field.value}
                          onChange={(value) => {
                            dispatch(getAllStatesByCountryName(value));
                            field.onChange(value);
                          }}
                          errorMessage={errors.country?.message}
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
                          isRequired={isEstimate ? true : false}
                          value={field.value}
                          errorMessage={errors.state?.message}
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
                          isRequired={isEstimate ? true : false}
                          value={field.value}
                          errorMessage={errors.city?.message}
                          onChange={(value) => field.onChange(value)}
                        />
                      )}
                    />

                    {/* Pin Code */}
                    <Controller
                      name="pinCode"
                      control={control}
                      render={({ field }) => (
                        <Input
                          label="Pin Code"
                          maxLength={6}
                          isRequired={isEstimate ? true : false}
                          errorMessage={errors.pinCode?.message}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(allowOnlyNumbers(e.target.value, 6))
                          }
                        />
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
