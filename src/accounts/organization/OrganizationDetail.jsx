import React, { useEffect, useState } from "react";
import logo from "../../assets/CORPSEED.webp";
import { useDispatch, useSelector } from "react-redux";
import {
  addOrganizationBankDetail,
  addStatutory,
  createOrganization,
  getAllLedgerType,
  getAllOrganizationBankAccounts,
  getAllOrganizations,
  getOrganizationByName,
  updateOrganization,
} from "../../toolkit/slices/organizationSlice";
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  DatePicker,
  Divider,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import { EllipsisVertical, Pencil, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import {
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
} from "../../toolkit/slices/commonSlice";
import NewSelect from "../../components/NewSelect";
import SingleFileUploader from "../../components/SingleFileUploader";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import {
  allowOnlyNumbers,
  formatCINInput,
  formatEmail,
  formatGSTInput,
  formatPANInput,
} from "../../common";
import { useParams } from "react-router-dom";

const orgFormSchema = (accountFlag) => {
  console.log("dfjhjhfkjgkjjg", accountFlag);
  return z.object({
    name: z.string().min(1, "Company name is required"),
    addressLine1: z.string().min(1, "Address Line 1 is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    pinCode: z.string().min(4, "Invalid pincode"),
    gstNo: z.string().min(1, "Please enter gst number"),
    panNo: z.string().min(1, "please enter number"),
    cinNumber: z.string().min(1, "please enter CIN number"),
    establishedDate: z.string().min(1, "please enter established date"),
    bankAccountPresent: z.boolean(),
    ...(accountFlag?.bankAccountPresent
      ? {
          accountHolderName: z
            .string()
            .min(1, "please enter account holder name"),
          accountNo: z.string().min(1, "please enter account holder number"),
          ifscCode: z.string().min(1, "please enter IFSC code."),
          swiftCode: z.string().min(1, "Please enter swift code."),
          bankName: z.string().min(1, "please enter bank name."),
          branch: z.string().min(1, "please enter branch name."),
          upiId: z.string().min(1, "please enter UPI ID."),
        }
      : {}),
    ownerName: z.string().min(1, "please enter owner name"),
    website: z.string().min(1, "please enter website url"),
    paymentPageLink: z.string().min(1, "please enter page libk"),
    logoUrl: z.string().min(1, "please enter email"),
    email: z.string().min(1, "please enter email"),
    phone: z.string().min(8, "Invalid phone number"),
  });
};
const orgDefaultValues = {
  name: "",
  address: "",
  country: "",
  state: "",
  pin: "",
};

const statFormSchema = (flagValues) =>
  z.object({
    id: z.string().min(1, "Please select ledger type."),
    hsnSacPresent: z.boolean(),
    ...(flagValues?.hsnSacPresent
      ? {
          hsnSacDetails: z.string().min(1, "Please enter hsn sac details"),
          hsnSacData: z.string().min(1, "Please enter hsn sac data"),
          hsnDescription: z.string().min(1, "Please enter hsn sac description"),
        }
      : {}),
    gstRateDetailPresent: z.boolean(),
    ...(flagValues?.gstRateDetailPresent
      ? {
          gstRateDetails: z.string().min(1, "Please enter gst rate details"),
          taxabilityType: z.string().min(1, "Please enter taxibility type"),
          gstRatesData: z.string().min(1, "Please enter gst rate data"),
        }
      : {}),
    bankAccountPresent: z.boolean(),
    ...(flagValues?.bankAccountPresent
      ? {
          bankName: z.string().min(1, "Please enter bank name"),
          accountNo: z.string().min(1, "Please enter account number"),
          ifscCode: z.string().min(1, "Please enter IFSC code"),
          accountHolderName: z
            .string()
            .min(1, "Please enter account holder name"),
          swiftCode: z.string().min(1, "Please enter swift code"),
        }
      : {}),
    classification: z.string().min(1, "Please enter classification"),
  });

const statDefaultValues = {
  id: "",
  hsnSacPresent: "",
  hsnSacDetails: "",
  hsnSacData: "",
  hsnDescription: "",
  gstRateDetailPresent: "",
  gstRateDetails: "",
  taxabilityType: "",
  gstRatesData: "",
  bankAccountPresent: "",
  bankName: "",
  accountNo: "",
  ifscCode: "",
  accountHolderName: "",
  swiftCode: "",
  classification: "",
};

const accountDetailSchema = (accountFlag) =>
  z.object({
    bankAccountPresent: z.boolean(),
    ...(accountFlag?.bankAccountPresent
      ? {
          bankName: z.string().min(1, "Please enter bank name"),
          accountNo: z.string().min(1, "Please enter account number"),
          ifscCode: z.string().min(1, "Please enter IFSC code"),
          accountHolderName: z
            .string()
            .min(1, "Please enter account holder name"),
          swiftCode: z.string().min(1, "Please enter swift code"),
          branch: z.string().min(1, "Please enter branch"),
        }
      : {}),
  });

const accountDefaultValues = {
  bankAccountPresent: "",
  bankName: "",
  accountNo: "",
  ifscCode: "",
  accountHolderName: "",
  swiftCode: "",
  branch: "",
};

const OrganizationDetail = () => {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const statutoryModal = useDisclosure();
  const accountModal = useDisclosure();
  const organizationModal = useDisclosure();
  const organizationDetail = useSelector(
    (state) => state.organization.organizationDetail,
  );
  const ledgerTypeList = useSelector(
    (state) => state.organization.ledgerTypeList,
  );
  const allOrganizationBankDetail = useSelector(
    (state) => state.organization.allOrganizationAccountList,
  );
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const [flagValues, setFlagValues] = useState({
    hsnSacPresent: false,
    gstRateDetailPresent: false,
    bankAccountPresent: false,
  });
  const [panError, setPanError] = useState("");
  const [gstError, setGstError] = useState("");
  const [accountFlag, setAccountFlag] = useState({
    bankAccountPresent: false,
  });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    dispatch(getOrganizationByName());
  }, [dispatch]);

  // useEffect(() => {
  //   if (organizationDetail?.id) {
  //     dispatch(getAllOrganizationBankAccounts(organizationDetail?.id));
  //   }
  // }, [organizationDetail]);

  const handleOpenOrgModal = () => {
    dispatch(getAllCountries());
    organizationModal.onOpen();
  };

  const orgForm = useForm({
    resolver: zodResolver(orgFormSchema(accountFlag)),
    defaultValues: orgDefaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const statForm = useForm({
    resolver: zodResolver(statFormSchema(flagValues)),
    defaultValues: statDefaultValues,
  });

  const accountDetailForm = useForm({
    resolver: zodResolver(accountDetailSchema(accountFlag)),
    defaultValues: accountDefaultValues,
  });

  const handleOpenStatModal = () => {
    dispatch(getAllLedgerType());
    statutoryModal.onOpen();
  };

  const handleEditOrganization = () => {
    setIsEdit(true);
    dispatch(getAllCountries());
    dispatch(getAllStatesByCountryName(organizationDetail?.country));
    dispatch(getAllCitiesByStateName(organizationDetail?.state));
    setAccountFlag((prev) => ({
      ...prev,
      bankAccountPresent: organizationDetail?.bankAccountPresent,
    }));

    orgForm.reset({
      name: organizationDetail?.name,
      gstNo: organizationDetail?.gstNo,
      panNo: organizationDetail?.panNo,
      cinNumber: organizationDetail?.cinNumber,
      establishedDate: String(organizationDetail.establishedDate) || "",
      addressLine1: organizationDetail?.addressLine1,
      country: organizationDetail?.country,
      state: organizationDetail?.state,
      city: organizationDetail?.city,
      pinCode: organizationDetail?.pinCode,
      ownerName: organizationDetail?.ownerName,
      website: organizationDetail?.website,
      paymentPageLink: organizationDetail?.paymentPageLink,
      logoUrl: organizationDetail?.logoUrl,
      email: organizationDetail?.email,
      phone: organizationDetail?.phone,
      bankAccountPresent: organizationDetail?.bankAccountPresent,
      bankName: organizationDetail?.bankName,
      accountNo: organizationDetail?.accountNo,
      ifscCode: organizationDetail?.ifscCode,
      accountHolderName: organizationDetail?.accountHolderName,
      swiftCode: organizationDetail?.swiftCode,
      branch: organizationDetail?.branch,
      upiId: organizationDetail?.upiId,
    });
    organizationModal.onOpen();
  };

  const bankAccountPresent = orgForm.watch("bankAccountPresent");

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

  const handlePanChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatPANInput(rawValue);
    orgForm.setValue("panNo", formattedValue);
    if (
      formattedValue.length === 10 &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formattedValue)
    ) {
      setPanError("Invalid PAN Number");
    } else {
      setPanError("");
    }
  };

  const gstNo = orgForm.watch("gstNo");
  const state = orgForm.watch("state");

  const handleGstChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatGSTInput(rawValue);
    orgForm.setValue("gstNo", formattedValue);
    // const error = validateGST(formattedValue, state);
    // setGstError(error);
  };

  const handleStateChange = (stateName) => {
    orgForm.setValue("state", stateName);
    dispatch(getAllCitiesByStateName(stateName));
    // const error = validateGST(gstNo, stateName);
    // setGstError(error);
  };

  const onOrgSubmit = (values) => {
    if (isEdit) {
      dispatch(
        updateOrganization({
          id: organizationDetail?.id,
          userId,
          data: values,
        }),
      )
        .then((resp) => {
          console.log("jufgkdjkfdgddjjk", resp);
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Organization updated successfully !.",
              color: "success",
            });
            dispatch(getOrganizationByName());
            orgForm.reset();
            organizationModal.onOpenChange(false);
            setIsEdit(false);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    } else {
      dispatch(createOrganization({ userId, data: values }))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Organization created successfully !.",
              color: "success",
            });
            dispatch(getOrganizationByName());
            orgForm.reset();
            organizationModal.onOpenChange(false);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    }
  };

  const onStatSubmit = (values) => {
    console.log("dfjghdfjhdjkhkdfh", values);
    dispatch(addStatutory(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Organization created successfully !.",
            color: "success",
          });
          dispatch(getOrganizationByName());
          statForm.reset(statDefaultValues);
          statutoryModal.onClose();
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  const onAccountDetailSubmit = (values) => {
    dispatch(
      addOrganizationBankDetail({
        ...values,
        bankAccountId: organizationDetail?.id,
      }),
    )
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Bank account created successfully !.",
            color: "success",
          });
          dispatch(getAllOrganizationBankAccounts(organizationDetail?.id));
          accountDetailForm.reset(accountDefaultValues);
          accountModal.onClose();
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  return (
    <div className="flex flex-col gap-2 ">
      <div className="flex justify-between py-2 px-1">
        <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
          Organization details
        </h1>
        <div className="flex gap-3">
          {/* <Button
            onPress={handleOpenStatModal}
            color="primary"
            endContent={<Plus />}
          >
            Add statutory
          </Button> */}
          <Button
            onPress={handleOpenOrgModal}
            color="primary"
            endContent={<Plus />}
          >
            Add organization
          </Button>
        </div>
      </div>
      <Card className="max-w-full">
        <CardHeader className="flex justify-between items-center gap-3">
          <div className="flex gap-2.5">
            <Image
              alt="company logo"
              height={40}
              radius="sm"
              src={organizationDetail?.logoUrl}
              width={60}
            />
            <div className="flex flex-col">
              <p className="text-md capitalize font-medium">
                {organizationDetail?.name}
              </p>
              <a
                className="text-small text-default-500 "
                href={organizationDetail?.website}
                target="_blank"
              >
                {organizationDetail?.website}
              </a>
            </div>
          </div>
          <div className="space-x-1">
            {" "}
            {/* <Button
              color="primary"
              startContent={<Plus className="h-4 w-4" />}
              onPress={() => accountModal.onOpen()}
            >
              Add Bank
            </Button> */}
            <Button
              startContent={<Pencil className="h-4 w-4" />}
              onPress={handleEditOrganization}
            >
              Edit Organization
            </Button>
          </div>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex gap-1">
              <span className="text-muted-foreground text-sm">CIN Number</span>
              <span className="text-muted-foreground text-sm">:</span>
              <span className="text-sm">{organizationDetail?.cinNumber}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-muted-foreground text-sm">GST Number</span>
              <span className="text-muted-foreground text-sm">:</span>
              <span className="text-sm">{organizationDetail?.gstNo}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-muted-foreground text-sm">PAN Number</span>
              <span className="text-muted-foreground text-sm">:</span>
              <span className="text-sm">{organizationDetail?.panNo}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-muted-foreground text-sm">
                Established data{" "}
              </span>
              <span className="text-muted-foreground text-sm">:</span>
              <span className="text-sm">
                {organizationDetail?.establishedDate}
              </span>
            </div>
            <div className="flex gap-1">
              <span className="text-muted-foreground text-sm">Email</span>
              <span className="text-muted-foreground text-sm">:</span>
              <span className="text-sm">{organizationDetail?.email}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-muted-foreground text-sm">Phone</span>
              <span className="text-muted-foreground text-sm">:</span>
              <span className="text-sm">{organizationDetail?.phone}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-muted-foreground text-sm">Address</span>
              <span className="text-muted-foreground text-sm">:</span>
              <span className="text-sm max-w-[70%]">
                {organizationDetail?.addressLine1}
              </span>
            </div>
            <div className="flex gap-1">
              <span className="text-muted-foreground text-sm">City</span>
              <span className="text-muted-foreground text-sm">:</span>
              <span className="text-sm">{organizationDetail?.city}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-muted-foreground text-sm">State</span>
              <span className="text-muted-foreground text-sm">:</span>
              <span className="text-sm">{organizationDetail?.state}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-muted-foreground text-sm">Country</span>
              <span className="text-muted-foreground text-sm">:</span>
              <span className="text-sm">{organizationDetail?.country}</span>
            </div>
            <div className="flex gap-1">
              <span className="text-muted-foreground text-sm">
                Zip/Pin code
              </span>
              <span className="text-muted-foreground text-sm">:</span>
              <span className="text-sm">{organizationDetail?.pinCode}</span>
            </div>
          </div>
          <Table
            aria-label="Bank account details table"
            className="mt-3"
            removeWrapper={false}
            classNames={{
              wrapper:
                "w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
              th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
              td: "py-1.5 text-[12.5px]",
            }}
          >
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>BANK NAME</TableColumn>
              <TableColumn>BRANCH</TableColumn>
              <TableColumn>ACCOUNT HOLDER</TableColumn>
              <TableColumn>ACCOUNT NO.</TableColumn>
              <TableColumn>UPI ID</TableColumn>
              <TableColumn>IFSC CODE</TableColumn>
              <TableColumn>SWIFT CODE</TableColumn>
            </TableHeader>
            <TableBody>
              {[
                {
                  id: 1,
                  bankName: organizationDetail?.bankName,
                  branch: organizationDetail?.branch,
                  accountHolderName: organizationDetail?.accountHolderName,
                  accountNo: organizationDetail?.accountNo,
                  upiId: organizationDetail?.upiId,
                  ifscCode: organizationDetail?.ifscCode,
                  swiftCode: organizationDetail?.swiftCode,
                },
              ]?.map((account) => (
                <TableRow key={account?.id}>
                  <TableCell>{account?.id}</TableCell>
                  <TableCell>{account?.bankName}</TableCell>
                  <TableCell>{account?.branch}</TableCell>
                  <TableCell>{account?.accountHolderName}</TableCell>
                  <TableCell>{account?.accountNo}</TableCell>
                  <TableCell>{account?.upiId}</TableCell>
                  <TableCell>{account?.ifscCode}</TableCell>
                  <TableCell>{account?.swiftCode}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
      <Modal
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={organizationModal.isOpen}
        onOpenChange={organizationModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add Organization</ModalHeader>
              <ModalBody>
                <form onSubmit={orgForm.handleSubmit(onOrgSubmit)}>
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto">
                    <Controller
                      name="name"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Organization name"
                          name="name"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                          errorMessage={error?.message}
                          // isInvalid={!!error}
                        />
                      )}
                    />

                    <Controller
                      name="gstNo"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="GST number"
                          maxLength={15}
                          errorMessage={error?.message || gstError}
                          // isInvalid={!!error || !!gstError}
                          {...field}
                          onChange={(e) => {
                            handleGstChange(e);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="panNo"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Pan number"
                          maxLength={10}
                          errorMessage={error?.message || panError}
                          // isInvalid={!!error || !!panError}
                          {...field}
                          onChange={(e) => {
                            handlePanChange(e);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="cinNumber"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="CIN number"
                          maxLength={21}
                          errorMessage={error?.message || panError}
                          // isInvalid={!!error || !!panError}
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(formatCINInput(e.target.value));
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="establishedDate"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => {
                        return (
                          <DatePicker
                            isRequired
                            label="Company incorporate date"
                            showMonthAndYearPickers
                            maxValue={today(getLocalTimeZone())}
                            errorMessage={error?.message}
                            // isInvalid={!!error}
                            value={
                              field.value &&
                              /^\d{4}-\d{2}-\d{2}$/.test(field.value)
                                ? parseDate(field.value)
                                : null
                            }
                            onChange={(value) => {
                              const iso = value ? value.toString() : "";
                              field.onChange(iso);
                            }}
                          />
                        );
                      }}
                    />

                    <Controller
                      name="addressLine1"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Address"
                          value={field.value}
                          errorMessage={error?.message}
                          // isInvalid={!!error}
                          name="addressLine1"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="country"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired
                          label="Country"
                          errorMessage={error?.message}
                          // isInvalid={!!error}
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
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired
                          label="State"
                          errorMessage={error?.message}
                          // isInvalid={!!error}
                          data={statesList || []}
                          labelKey="name"
                          valueKey="name"
                          value={field.value}
                          onChange={(value) => {
                            handleStateChange(value);
                            field.onChange(value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="city"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired
                          label="City"
                          errorMessage={error?.message}
                          data={citiesList || []}
                          labelKey="name"
                          valueKey="name"
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      )}
                    />
                    <Controller
                      name="pinCode"
                      control={orgForm.control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Pin code"
                          value={field.value}
                          name="pinCode"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="ownerName"
                      control={orgForm.control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Owner name"
                          value={field.value}
                          name="ownerName"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="website"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Website"
                          value={field.value}
                          name="website"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="paymentPageLink"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Payment page link"
                          value={field.value}
                          name="paymentPageLink"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="logoUrl"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <SingleFileUploader
                          isRequired
                          label="Company logo"
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          errorMessage={error?.message}
                          // isInvalid={!!error}
                        />
                      )}
                    />
                    <Controller
                      name="email"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Email"
                          value={field.value}
                          name="email"
                          onChange={(e) => {
                            field.onChange(formatEmail(e.target.value));
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="phone"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Phone"
                          value={field.value}
                          maxLength={10}
                          name="phone"
                          onChange={(e) => {
                            field.onChange(allowOnlyNumbers(e.target.value));
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="bankAccountPresent"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          label="Bank account present"
                          isRequired
                          selectedKeys={
                            field.value !== undefined
                              ? [field.value.toString()]
                              : []
                          }
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0];
                            if (value !== undefined)
                              field.onChange(value === "true");
                            setFlagValues((prev) => ({
                              ...prev,
                              bankAccountPresent: value === "true",
                            }));
                          }}
                          errorMessage={error?.message}
                          // isInvalid={!!error}
                        >
                          {[
                            { label: "True", value: true },
                            { label: "False", value: false },
                          ].map((item) => (
                            <SelectItem
                              key={item.value.toString()}
                              value={item.value}
                            >
                              {item.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    {bankAccountPresent && (
                      <>
                        <Controller
                          name="bankName"
                          control={orgForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Bank name"
                              value={field.value}
                              name="bankName"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="accountNo"
                          control={orgForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Account number"
                              value={field.value}
                              name="accountNo"
                              onChange={(e) => {
                                field.onChange(
                                  allowOnlyNumbers(e.target.value, 35),
                                );
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="ifscCode"
                          control={orgForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="IFSC code"
                              value={field.value}
                              name="ifscCode"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="accountHolderName"
                          control={orgForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Account holder name"
                              value={field.value}
                              name="accountHolderName"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="swiftCode"
                          control={orgForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Swift code"
                              value={field.value}
                              name="swiftCode"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="branch"
                          control={orgForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Branch"
                              value={field.value}
                              name="branch"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="upiId"
                          control={orgForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="UPI ID"
                              value={field.value}
                              name="upiId"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                      </>
                    )}
                  </div>
                  <ModalFooter className="flex justify-end">
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
      <Modal
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={statutoryModal.isOpen}
        onOpenChange={statutoryModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add statutory</ModalHeader>
              <ModalBody>
                <form onSubmit={statForm.handleSubmit(onStatSubmit)}>
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto">
                    <Controller
                      name="id"
                      control={statForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired={true}
                          data={ledgerTypeList}
                          label={"Select ledger type"}
                          name={"id"}
                          labelKey={"name"}
                          valueKey={"id"}
                          value={field.value}
                          onChange={(selectedSet) => {
                            field.onChange(selectedSet);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name="hsnSacPresent"
                      control={statForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          label="HSN Sac present"
                          isRequired
                          selectedKeys={
                            field.value !== undefined
                              ? [field.value.toString()]
                              : []
                          }
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0];
                            if (value !== undefined)
                              field.onChange(value === "true");
                            setFlagValues((prev) => ({
                              ...prev,
                              hsnSacPresent: value === "true",
                            }));
                          }}
                          errorMessage={error?.message}
                          isInvalid={!!error}
                        >
                          {[
                            { label: "True", value: true },
                            { label: "False", value: false },
                          ].map((item) => (
                            <SelectItem
                              key={item.value.toString()}
                              value={item.value}
                            >
                              {item.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    {flagValues?.hsnSacPresent && (
                      <>
                        <Controller
                          name="hsnSacDetails"
                          control={statForm.control}
                          render={({ field }) => (
                            <Input
                              isRequired
                              label="HSN sac details"
                              name="hsnSacDetails"
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="hsnSacData"
                          control={statForm.control}
                          render={({ field }) => (
                            <Input
                              isRequired
                              label="HSN sac data"
                              name="hsnSacData"
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="hsnDescription"
                          control={statForm.control}
                          render={({ field }) => (
                            <Input
                              isRequired
                              label="HSN sac description"
                              value={field.value}
                              name="hsnDescription"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                      </>
                    )}

                    <Controller
                      name="gstRateDetailPresent"
                      control={statForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          label="GST rate"
                          isRequired
                          selectedKeys={
                            field.value !== undefined
                              ? [field.value.toString()]
                              : []
                          }
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0];
                            if (value !== undefined)
                              field.onChange(value === "true");
                            setFlagValues((prev) => ({
                              ...prev,
                              gstRateDetailPresent: value === "true",
                            }));
                          }}
                          errorMessage={error?.message}
                          isInvalid={!!error}
                        >
                          {[
                            { label: "True", value: true },
                            { label: "False", value: false },
                          ].map((item) => (
                            <SelectItem
                              key={item.value.toString()}
                              value={item.value}
                            >
                              {item.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    {flagValues?.gstRateDetailPresent && (
                      <>
                        <Controller
                          name="gstRateDetails"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="GST rate detail"
                              value={field.value}
                              name="gstRateDetails"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="taxabilityType"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Taxability type"
                              value={field.value}
                              name="taxabilityType"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="gstRatesData"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="GST rate data"
                              value={field.value}
                              name="gstRatesData"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                      </>
                    )}

                    <Controller
                      name="bankAccountPresent"
                      control={statForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          label="Bank account present"
                          isRequired
                          selectedKeys={
                            field.value !== undefined
                              ? [field.value.toString()]
                              : []
                          }
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0];
                            if (value !== undefined)
                              field.onChange(value === "true");
                            setFlagValues((prev) => ({
                              ...prev,
                              bankAccountPresent: value === "true",
                            }));
                          }}
                          errorMessage={error?.message}
                          isInvalid={!!error}
                        >
                          {[
                            { label: "True", value: true },
                            { label: "False", value: false },
                          ].map((item) => (
                            <SelectItem
                              key={item.value.toString()}
                              value={item.value}
                            >
                              {item.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    {flagValues?.bankAccountPresent && (
                      <>
                        <Controller
                          name="bankName"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Bank name"
                              value={field.value}
                              name="bankName"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="accountNo"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Account number"
                              value={field.value}
                              name="accountNo"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="ifscCode"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="IFSC code"
                              value={field.value}
                              name="ifscCode"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="accountHolderName"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Account holder name"
                              value={field.value}
                              name="accountHolderName"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="swiftCode"
                          control={statForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Swift code"
                              value={field.value}
                              name="swiftCode"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                      </>
                    )}

                    <Controller
                      name="classification"
                      control={statForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Classification"
                          value={field.value}
                          name="classification"
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                  </div>
                  <ModalFooter className="flex justify-end">
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

      <Modal
        size="2xl"
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        isOpen={accountModal.isOpen}
        onOpenChange={accountModal.onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add account detail</ModalHeader>
              <ModalBody>
                <form
                  onSubmit={accountDetailForm.handleSubmit(
                    onAccountDetailSubmit,
                  )}
                >
                  <div className="grid grid-cols-2 gap-4 max-h-[60vh] overflow-auto">
                    <Controller
                      name="bankAccountPresent"
                      control={accountDetailForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          label="Bank account present"
                          isRequired
                          selectedKeys={
                            field.value !== undefined
                              ? [field.value.toString()]
                              : []
                          }
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0];
                            if (value !== undefined)
                              field.onChange(value === "true");
                            setAccountFlag((prev) => ({
                              ...prev,
                              bankAccountPresent: value === "true",
                            }));
                          }}
                          errorMessage={error?.message}
                          isInvalid={!!error}
                        >
                          {[
                            { label: "True", value: true },
                            { label: "False", value: false },
                          ].map((item) => (
                            <SelectItem
                              key={item.value.toString()}
                              value={item.value}
                            >
                              {item.label}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    {accountFlag?.bankAccountPresent && (
                      <>
                        <Controller
                          name="bankName"
                          control={accountDetailForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Bank name"
                              value={field.value}
                              name="bankName"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="branch"
                          control={accountDetailForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Branch"
                              value={field.value}
                              name="branch"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="accountHolderName"
                          control={accountDetailForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Account holder name"
                              value={field.value}
                              name="accountHolderName"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="accountNo"
                          control={accountDetailForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Account number"
                              value={field.value}
                              name="accountNo"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                        <Controller
                          name="ifscCode"
                          control={accountDetailForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="IFSC code"
                              value={field.value}
                              name="ifscCode"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />

                        <Controller
                          name="swiftCode"
                          control={accountDetailForm.control}
                          render={({ field, fieldState: { error } }) => (
                            <Input
                              isRequired
                              label="Swift code"
                              value={field.value}
                              name="swiftCode"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                              }}
                            />
                          )}
                        />
                      </>
                    )}
                  </div>
                  <ModalFooter className="flex justify-end">
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
    </div>
  );
};

export default OrganizationDetail;
