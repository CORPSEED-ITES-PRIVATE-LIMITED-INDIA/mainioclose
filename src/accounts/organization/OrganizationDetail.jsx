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
} from "../../toolkit/slices/organizationSlice";
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
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
import { EllipsisVertical, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import {
  getAllCountries,
  getAllStatesByCountryName,
} from "../../toolkit/slices/commonSlice";
import NewSelect from "../../components/NewSelect";

const orgFormSchema = z.object({
  name: z.string().min(1, "Please enter organization name."),
  address: z.string().min(1, "Please enter organization name."),
  country: z.string().min(1, "Please select country"),
  state: z.string().min(1, "Please select state"),
  pin: z.string().min(1, "Please enter pin code"),
});

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
  const statutoryModal = useDisclosure();
  const accountModal = useDisclosure();
  const organizationModal = useDisclosure();
  const organizationDetail = useSelector(
    (state) => state.organization.organizationDetail
  );
  const ledgerTypeList = useSelector(
    (state) => state.organization.ledgerTypeList
  );
  const allOrganizationBankDetail = useSelector(
    (state) => state.organization.allOrganizationAccountList
  );
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const [flagValues, setFlagValues] = useState({
    hsnSacPresent: false,
    gstRateDetailPresent: false,
    bankAccountPresent: false,
  });

  const [accountFlag, setAccountFlag] = useState({
    bankAccountPresent: false,
  });

  useEffect(() => {
    dispatch(getOrganizationByName("corpseed"));
  }, [dispatch]);

  useEffect(() => {
    if (organizationDetail?.id) {
      dispatch(getAllOrganizationBankAccounts(organizationDetail?.id));
    }
  }, [organizationDetail]);

  const handleOpenOrgModal = () => {
    dispatch(getAllCountries());
    organizationModal.onOpen();
  };

  const onOrgSubmit = (values) => {
    dispatch(createOrganization(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Organization created successfully !.",
            color: "success",
          });
          dispatch(getAllOrganizations());
          orgForm.reset();
          organizationModal.onOpenChange(false);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  const orgForm = useForm({
    resolver: zodResolver(orgFormSchema),
    defaultValues: orgDefaultValues,
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

  const onStatSubmit = (values) => {
    console.log("dfjghdfjhdjkhkdfh", values);
    dispatch(addStatutory(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Organization created successfully !.",
            color: "success",
          });
          dispatch(getAllOrganizations());
          statForm.reset(statDefaultValues);
          statutoryModal.onClose();
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  const onAccountDetailSubmit = (values) => {
    dispatch(
      addOrganizationBankDetail({
        ...values,
        bankAccountId: organizationDetail?.id,
      })
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
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  return (
    <div className="flex flex-col gap-2 ">
      <div className="flex justify-between py-2 px-1">
        <h1 className="font-sans text-2xl font-medium mb-1">
          Organization details
        </h1>
        <div className="flex gap-3">
          <Button
            onPress={handleOpenStatModal}
            color="primary"
            endContent={<Plus />}
          >
            Add statutory
          </Button>
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
              src={logo}
              width={60}
            />
            <div className="flex flex-col">
              <p className="text-md capitalize font-medium">
                {organizationDetail?.name}
              </p>
              <a
                className="text-small text-default-500 "
                href={"https://www.corpseed.com"}
                target="_blank"
              >
                https://www.corpseed.com
              </a>
            </div>
          </div>
          <Button
            color="primary"
            startContent={<Plus />}
            onPress={() => accountModal.onOpen()}
          >
            Add Bank
          </Button>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Address</span>
              <span className="text-muted-foreground">:</span>
              <span></span>
              {organizationDetail?.address}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">State</span>
              <span className="text-muted-foreground">:</span>
              <span></span>
              {organizationDetail?.state}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Country</span>
              <span className="text-muted-foreground">:</span>
              <span></span>
              {organizationDetail?.country}
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Zip/Pin code</span>
              <span className="text-muted-foreground">:</span>
              <span></span>
              {organizationDetail?.pin}
            </div>
          </div>
          <Table aria-label="Example static collection table" className="mt-3">
            <TableHeader>
              <TableColumn>ID</TableColumn>
              <TableColumn>BANK NAME</TableColumn>
              <TableColumn>BRANCH</TableColumn>
              <TableColumn>ACCOUNT HOLDER</TableColumn>
              <TableColumn>ACCOUNT NO.</TableColumn>
              <TableColumn>IFSC CODE</TableColumn>
              <TableColumn>SWIFT CODE</TableColumn>
            </TableHeader>
            <TableBody>
              {allOrganizationBankDetail?.map((account) => (
                <TableRow key={account?.id}>
                  <TableCell>{account?.id}</TableCell>
                  <TableCell>{account?.bankName}</TableCell>
                  <TableCell>{account?.branch}</TableCell>
                  <TableCell>{account?.accountHolderName}</TableCell>
                  <TableCell>{account?.accountNo}</TableCell>
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
                      name="organization"
                      control={orgForm.control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Organization name"
                          name="organization"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        />
                      )}
                    />
                    <Controller
                      name="address"
                      control={orgForm.control}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired
                          label="Address"
                          value={field.value}
                          errorMessage={error?.message}
                          isInvalid={!!error}
                          name="address"
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
                          label="Country"
                          errorMessage={error?.message}
                          isInvalid={!!error}
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
                          label="State"
                          errorMessage={error?.message}
                          isInvalid={!!error}
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
                      name="pin"
                      control={orgForm.control}
                      render={({ field }) => (
                        <Input
                          isRequired
                          label="Pin code"
                          value={field.value}
                          name="pin"
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
                    onAccountDetailSubmit
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
