"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Textarea,
  Button,
  Card,
  CardBody,
  DatePicker,
  addToast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import {
  getLocalTimeZone,
  parseDate,
  toCalendarDate,
  today,
} from "@internationalized/date";
import dayjs from "dayjs";
import { z } from "zod";

import { estimateFormSchema } from "./EstimateFormSchema";
import FormSelect from "../../../components/FormSelect";
import ProductFormFieldsDetails from "./ProductFormFieldsDetails";
import ServiceFormFieldsDetail from "./ServiceFormFieldsDetail";
import NewEstimatePreview from "./NewEstimatePreview";

import { getAllBusinessArrangementBySolutionId } from "../../../toolkit/slices/productSlice";
import {
  getAllSolutionList,
  getClientDesiginationList,
  getSolutionDetailByName,
  getSolutionPriceListById,
} from "../../../toolkit/slices/settingSlice";
import {
  cancelEstimate,
  createNewEstimate,
  getNewEstimateByLeadId,
  getProposalDataByLeadId,
  getSingleLeadDataByLeadId,
} from "../../../toolkit/slices/leadSlice";
import {
  createBasicUnitByCompanyId,
  createBasicUnitByCompanyIdInAccounts,
  createCompanyAndUnitsForAccountsViaLeadEstimate,
  getAllCompanyByUserId,
  getAllCompanyType,
  getAllGstType,
  getAllUnitListByCompanyId,
  getBasicCompanyDetailByCompanyId,
  getBasicCompanyDetails,
  handleResetExistingCompany,
  updateBasicUnitByCompanyId,
} from "../../../toolkit/slices/companySlice";
import {
  createContactViaEstimateInCompany,
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
  getContactDetailListByCompanyId,
} from "../../../toolkit/slices/commonSlice";
import NewSelect from "../../../components/NewSelect";
import {
  allowOnlyNumbers,
  formatEmail,
  formatGSTInput,
  formatPANInput,
  isValidEmail,
} from "../../../common";
import BasicCompany from "../../company/BasicCompany";
import { convertEstimateToPI } from "../../../toolkit/slices/accountSlice";
import { EllipsisVertical } from "lucide-react";
import {
  DatePicker as DtPicker,
  Form,
  Select as AntSelect,
  Space,
  Button as AntButton,
  Input as AntInput,
} from "antd";
/* ===========================
   ✅ Unit Modal Schema (ONLY unitName required)
=========================== */
const unitModalSchema = (isGstMandatory) =>
  z.object({
    unitName: z.string().min(1, "Unit name is required"),
    companyTypeId: z.string().min(1, "Company type is required"),
    gstTypeId: z.string().min(1, "GST type is required"),
    ...(isGstMandatory
      ? {
          gstNo: z.string().min(1, "GST number is required"),
        }
      : {}),
    // panNo: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
    pinCode: z.string().optional().or(z.literal("")),
    country: z.string().optional().or(z.literal("")),
  });

const contactModalSchema = z.object({
  title: z.string().optional().or(z.literal("")),
  name: z.string().min(1, "Name is required"),
  emails: z.string().optional().or(z.literal("")),
  contactNo: z.string().optional().or(z.literal("")),
  whatsappNo: z.string().optional().or(z.literal("")),
  clientDesignationId: z.string().optional().or(z.literal("")),
  companyUnitId: z.string().optional().or(z.literal("")),
});

const LeadEstimates = () => {
  const { userId, leadId } = useParams();
  const isMedium = useMediaQuery({ minWidth: 768, maxWidth: 1535 });
  const dispatch = useDispatch();
  const company = useSelector((state) => state.company.basicCompanyDetail);
  const companyList = useSelector((state) => state.company.basicCompanyList);
  const unitList = useSelector((state) => state.company.basicUnitList);
  const proposalDataDetail = useSelector(
    (state) => state.leads.proposalDataDetail,
  );
  const companyTypeList = useSelector((state) => state.company.companyTypeList);
  const gstTypeList = useSelector((state) => state.company.gstTypeList);
  const leadData = useSelector((state) => state.leads.singleLeadData);
  const solutionDetail = useSelector(
    (state) => state.setting.solutionDetailById,
  );
  const serviceFeeList = useSelector(
    (state) => state.setting.solutionPriceList,
  );
  const newEstimateDetail = useSelector(
    (state) => state.leads.newEstimateByLeadId,
  );
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const citiesList = useSelector((state) => state.common.citiesList);
  const allContactList = useSelector(
    (state) => state.common.contactListByCompanyId,
  );
  const desiginationList = useSelector(
    (state) => state.setting.clientDesiginationList,
  );

  const [showForm, setShowForm] = useState(false);
  const [companyDetail, setCompanyDetail] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [selectedSolutionDetail, setSelectedSolutionDetail] = useState(null);
  const [isDropDownOpen, setIsDropDownOpen] = useState({
    company: false,
    contact: false,
    unit: false,
  });
  const { isOpen, onClose, onOpenChange, onOpen } = useDisclosure();
  const modal = useDisclosure();
  const contactModal = useDisclosure();
  const [unitDetail, setUnitDetail] = useState(null);
  const [viewType, setViewType] = useState("ESTIMATE"); // or "PI"
  const [isCompanyUpdated, setIsCompanyUpdated] = useState(false);
  const [estimateId, setEstimateId] = useState(false);
  const [statusData, setStatusData] = useState({
    rejectionReason: "",
    rejectedByUserId: userId,
  });
  const [isGstMandatory, setIsGstMandatory] = useState(false);

  const sortedEstimates = useMemo(() => {
    const arr = Array.isArray(newEstimateDetail) ? [...newEstimateDetail] : [];
    return arr.sort(
      (a, b) =>
        new Date(b?.createdDate || b?.estimateDate || 0) -
        new Date(a?.createdDate || a?.estimateDate || 0),
    );
  }, [newEstimateDetail]);

  const hasEstimates = sortedEstimates.length > 0;

  const openEstimatePreview = (estimate, type) => {
    setSelectedEstimate(estimate);
    setOpenPreview(true);
    setViewType(type);
  };

  const closeEstimatePreview = () => {
    setOpenPreview(false);
    setSelectedEstimate(null);
  };

  // close overlay on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeEstimatePreview();
    };
    if (openPreview) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openPreview]);

  /* ===========================
     Estimate form (existing)
  =========================== */

  const [form] = Form.useForm();

  // const {
  //   control,
  //   handleSubmit,
  //   formState: { errors },
  //   getValues,
  //   reset,
  //   setValue,
  // } = useForm({
  //   mode: "onChange",
  //   reValidateMode: "onChange",
  //   resolver: zodResolver(estimateFormSchema),
  //   defaultValues: {
  //     billingAddress: {},
  //     shippingAddress: {},
  //     lineItems: [],
  //   },
  // });

  /* ===========================
     ✅ Unit modal form
  =========================== */
  const {
    control: unitControl,
    handleSubmit: handleUnitSubmit,
    reset: resetUnitForm,
    formState: { errors: unitErrors },
    setValue: setUnitValue,
  } = useForm({
    resolver: zodResolver(unitModalSchema(isGstMandatory)),
    defaultValues: {
      unitName: "",
      gstNo: "",
      panNo: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
      country: "",
    },
  });

  const {
    control: contactControl,
    handleSubmit: handleContactSubmit,
    formState: { errors: contactErrors },
    reset: resetContactValue,
    setValue: setContactValue,
  } = useForm({
    resolver: zodResolver(contactModalSchema),
    defaultValues: {},
  });

  useEffect(() => {
    dispatch(getClientDesiginationList());
    dispatch(getAllCompanyByUserId(userId));
    dispatch(getProposalDataByLeadId(leadId));
    dispatch(getAllCompanyType());
    dispatch(getAllGstType());
  }, [dispatch]);

  const handleGstChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatGSTInput(rawValue);
    setUnitValue("gstNo", formattedValue);
  };

  const handlePanChange = (e) => {
    const rawValue = e.target.value;
    const formattedValue = formatPANInput(rawValue);
    setUnitValue("panNo", formattedValue);
  };

  const onOpenUnitModal = () => {
    setUnitDetail(null);
    resetUnitForm((prev) => ({
      ...prev,
      createdById: Number(userId) || 0,
      updatedById: Number(userId) || 0,
    }));
    onOpen();
  };

  useEffect(() => {
    dispatch(getSingleLeadDataByLeadId({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        if (resp?.payload?.originalName) {
          dispatch(
            getSolutionDetailByName({
              name: resp?.payload?.originalName,
              userId,
            }),
          ).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
              if (res.payload?.type === "SERVICE") {
                dispatch(
                  getSolutionPriceListById({
                    solutionId: res?.payload?.id,
                    userId,
                  }),
                );
              } else {
                dispatch(
                  getAllBusinessArrangementBySolutionId({
                    solutionId: res?.payload?.id,
                    userId,
                  }),
                );
              }
            }
          });
        }
      }
    });
  }, [dispatch, leadId, userId]);

  // company + countries
  useEffect(() => {
    dispatch(getBasicCompanyDetails({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        // setValue("companyName", resp?.payload?.name);
        form.setFieldsValue({
          companyName: resp?.payload?.name,
        });

        setCompanyDetail(resp?.payload);
        dispatch(getAllUnitListByCompanyId(resp?.payload?.id));
        dispatch(
          getContactDetailListByCompanyId({
            companyId: resp?.payload?.id,
            userId,
          }),
        );
      }
    });

    dispatch(getAllCountries());
    dispatch(getAllSolutionList(userId));
  }, [dispatch, leadId, userId, isCompanyUpdated, form]);

  // estimates list
  useEffect(() => {
    dispatch(getNewEstimateByLeadId({ leadId, userId }));
  }, [dispatch, leadId, userId]);

  // ✅ Default UI:
  useEffect(() => {
    setShowForm(!hasEstimates);
  }, [hasEstimates]);

  const handleUpdateCompanyUnit = () => {
    if (!unitDetail) {
      addToast({
        title: "Please select unit first to update",
        color: "warning",
      });
    } else {
      dispatch(getAllCountries());
      dispatch(getAllStatesByCountryName(unitDetail?.country));
      dispatch(getAllCitiesByStateName(unitDetail?.state));
      resetUnitForm({
        unitName: unitDetail?.unitName,
        gstNo: unitDetail?.gstNo,
        address: unitDetail?.addressLine1,
        country: unitDetail?.country,
        state: unitDetail?.state,
        city: unitDetail?.city,
        pinCode: unitDetail?.pinCode,
      });
      onOpen();
    }
  };

  const handleCancelEstimate = () => {
    dispatch(cancelEstimate({ estimateId, data: statusData })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "Estimate cancelled successfully",
          color: "success",
        });
        setStatusData({
          rejectionReason: "",
        });
        setEstimateId(null);
        dispatch(getNewEstimateByLeadId({ leadId, userId }));
        modal.onClose();
      } else {
        addToast({
          title: resp?.payload?.data?.message || "Failed to cancel estimate",
          color: "danger",
        });
      }
    });
  };

  // const onSubmit = (data) => {
  //   if (
  //     !leadData?.praposalApproved &&
  //     proposalDataDetail?.status !== "approved"
  //   ) {
  //     addToast({
  //       title: "RESTRICTED !.",
  //       description: "The proposal has neither been sent nor approved yet.",
  //       color: "danger",
  //     });
  //     return;
  //   }

  //   data.companyId = company?.id;
  //   data.solutionType = solutionDetail?.type;
  //   data.solutionId = solutionDetail?.id;
  //   data.solutionName = solutionDetail?.name;
  //   data.createdByUserId = userId;
  //   data.leadId = leadId;

  //   dispatch(
  //     createCompanyAndUnitsForAccountsViaLeadEstimate({
  //       ...company,
  //       companyId: company?.id,
  //       createdById: userId,
  //     }),
  //   )
  //     .then((compRes) => {
  //       if (compRes.meta.requestStatus === "fulfilled") {
  //         addToast({
  //           title: "Company and Its units added suuccessfully in Accounts",
  //           color: "success",
  //         });

  //         dispatch(createNewEstimate(data))
  //           .then((res) => {
  //             if (res.meta.requestStatus === "fulfilled") {
  //               addToast({
  //                 title: "Estimate created successfully !.",
  //                 color: "success",
  //               });
  //               dispatch(getNewEstimateByLeadId({ leadId, userId }));
  //               setShowForm(false);
  //             } else {
  //               addToast({
  //                 title: res?.payload?.data?.message,
  //                 color: "danger",
  //               });
  //             }
  //           })
  //           .catch(() =>
  //             addToast({ title: "Something went wrong !.", color: "danger" }),
  //           );
  //       } else {
  //         addToast({ title: compRes?.payload?.data?.message, color: "danger" });
  //       }
  //     })
  //     .catch(() =>
  //       addToast({ title: "Something went wrong !.", color: "danger" }),
  //     );
  // };

  const onEstimateFinish = (values) => {
    if (serviceFeeList?.length === 0 || !serviceFeeList) {
      addToast({
        title: "RESTRICTED !.",
        description:
          "Service prices are not available. Please select a valid service.",
        color: "danger",
      });
      return;
    }

    if (unitDetail?.companyTypeId) {
      addToast({
        title: "ERROR !.",
        description: "GST Number is not is saved in Unit details !.",
        color: "danger",
      });
      return;
    }

    const formattedValues = {
      ...values,
      estimateDate: values?.estimateDate
        ? dayjs(values.estimateDate).format("YYYY-MM-DD")
        : "",
      validUntil: values?.validUntil
        ? dayjs(values.validUntil).format("YYYY-MM-DD")
        : "",
    };

    if (
      leadData?.proposalStatus === "APPROVED" ||
      leadData?.proposalStatus === "INITIATED"
    ) {
      addToast({
        title: "RESTRICTED",
        description:
          "You are not required perform any action after approval or initiation of proposal.",
        color: "danger",
      });
      return;
    }

    const data = {
      ...formattedValues,
      companyId: company?.id,
      unitId: company?.units?.[0]?.id,
      contactId: company?.units?.[0]?.unitContacts?.id,
      solutionType: solutionDetail?.type,
      solutionId: solutionDetail?.id,
      solutionName: solutionDetail?.name,
      createdByUserId: userId,
      leadId,
    };

    dispatch(
      createCompanyAndUnitsForAccountsViaLeadEstimate({
        ...company,
        companyId: company?.id,
        createdById: userId,
      }),
    )
      .then((compRes) => {
        if (compRes.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Company and Its units added suuccessfully in Accounts",
            color: "success",
          });

          dispatch(createNewEstimate(data))
            .then((res) => {
              if (res.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Estimate created successfully !.",
                  color: "success",
                });
                dispatch(getNewEstimateByLeadId({ leadId, userId }));
                setShowForm(false);
              } else {
                addToast({
                  title: res?.payload?.data?.message,
                  color: "danger",
                });
              }
            })
            .catch(() =>
              addToast({ title: "Something went wrong !.", color: "danger" }),
            );
        } else {
          addToast({ title: compRes?.payload?.data?.message, color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  const getMappedLineItems = () =>
    Array.isArray(serviceFeeList)
      ? serviceFeeList.map((item) => ({
          itemName: item.name,
          unitPriceExGst: item.baseAmount,
          originalAmount: item.baseAmount,
          hsnSacCode: item.hsnSacCode,
          gstRate: item.gstPercentage,
          originalGst: item.gstPercentage,
        }))
      : [];

  const onCancelForm = () => {
    form.resetFields();
    form.setFieldsValue({
      lineItems: getMappedLineItems(),
    });
  };

  const onSaveUnitModal = (data) => {
    data.createdById = userId;
    data.updatedById = userId;

    if (unitDetail) {
      dispatch(
        updateBasicUnitByCompanyId({
          companyId: unitDetail?.companyId,
          unitId: unitDetail?.id,
          userId,
          data,
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({ title: "Unit details saved.", color: "success" });
            dispatch(getAllUnitListByCompanyId(company?.id));
            resetUnitForm();
            onClose();
            dispatch(getBasicCompanyDetails({ leadId, userId }));
          } else {
            addToast({ title: resp.payload?.data?.message, color: "danger" });
          }
        })
        .catch(() => {
          addToast({ title: "Something went wrong !.", color: "danger" });
        });
    } else {
      dispatch(
        createBasicUnitByCompanyId({
          companyId: company?.id,
          updatedBy: userId,
          data,
        }),
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({ title: "Unit details saved.", color: "success" });
            dispatch(getAllUnitListByCompanyId(company?.id));
            resetUnitForm();
            onClose();
            dispatch(getBasicCompanyDetails({ leadId, userId }));
          } else {
            addToast({ title: resp.payload?.message, color: "danger" });
          }
        })
        .catch(() => {
          addToast({ title: "Something went wrong !.", color: "danger" });
        });
    }
  };

  const handleSubmitContact = (data, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    data.companyId = companyDetail?.id;
    dispatch(createContactViaEstimateInCompany(data))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({ title: "Contact details saved.", color: "success" });
          contactModal.onClose();
          resetContactValue();
          dispatch(
            getContactDetailListByCompanyId({
              companyId: companyDetail?.id,
              userId,
            }),
          );
          dispatch(getBasicCompanyDetails({ leadId, userId }));
        } else {
          addToast({
            title: resp.payload?.message || resp?.payload,
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  };

  const handleConvertToPI = (estimate) => {
    dispatch(
      convertEstimateToPI({
        estimateId: estimate?.id,
        userId,
      }),
    )
      .then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Converted to PI successfully",
            color: "success",
          });

          // refresh list
          dispatch(getNewEstimateByLeadId({ leadId, userId }));
        } else {
          addToast({
            title: res?.payload?.data?.message || "Failed to convert",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong", color: "danger" }),
      );
  };

  return (
    <>
      {/* ===================== TOP ACTION BAR (ALWAYS VISIBLE) ===================== */}
      <div className="w-full flex items-center justify-between mb-3 gap-2">
        {!showForm && hasEstimates && (
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Estimates / Proforma Invoice
            </h3>
            <p className="text-sm text-slate-500">
              {sortedEstimates.length} total
            </p>
          </div>
        )}

        {showForm && (
          <div className="text-2xl font-bold  flex items-center justify-between">
            <span className="">Create Estimate</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* <Button
            type="button"
            color="secondary"
            variant="flat"
            size="sm"
            radius="sm"
            onPress={onOpenUnitModal}
          >
            Add Unit Details
          </Button> */}

          {!showForm && (
            <Button
              type="button"
              color="primary"
              size="sm"
              radius="sm"
              onPress={() => {
                const hasAnyNonRejected = sortedEstimates?.some(
                  (item) => item?.status !== "REJECTED",
                );
                if (hasAnyNonRejected) {
                  addToast({
                    title: "RESTRICTED !.",
                    description:
                      "You have to reject all the remaining estimate.",
                    color: "danger",
                  });
                  return;
                }
                setShowForm(true);
              }}
            >
              Create Estimate
            </Button>
          )}

          {showForm && hasEstimates && (
            <Button
              type="button"
              color="default"
              variant="flat"
              size="sm"
              className="cursor-pointer"
              onPress={onCancelForm}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* ===================== LIST MODE ===================== */}
      {!showForm && hasEstimates && (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {sortedEstimates.map((est) => (
              <Card key={est?.id} className="hover:shadow-lg transition-shadow">
                <CardBody className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900">
                      {est?.performanceInvoiceFlag
                        ? `${est?.performanceInvoiceNumber}/ ${est?.estimateNumber}`
                        : est?.estimateNumber}
                    </p>
                    <div className="flex items-center gap-0.5">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${est?.status === "REJECTED" ? "bg-red-600 text-white" : est?.status === "APPROVED" ? "bg-green-600 text-white" : est?.status === "SENT_TO_CLIENT" ? "bg-blue-600 text-white" : "bg-slate-100"} text-slate-600`}
                      >
                        {est?.status}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                        {est?.performanceInvoiceFlag
                          ? "Proforma Invoice / Estimate"
                          : "Estimate"}
                      </span>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            isIconOnly
                            size="sm"
                            radius="full"
                            variant="flat"
                          >
                            <EllipsisVertical />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          selectionMode="single"
                          onSelectionChange={(e) => {}}
                        >
                          <DropdownItem
                            key="previewEstimate"
                            onPress={() => openEstimatePreview(est, "ESTIMATE")}
                          >
                            Preview Estimate
                          </DropdownItem>

                          {est?.performanceInvoiceFlag && (
                            <DropdownItem
                              key="previewPI"
                              onPress={() => openEstimatePreview(est, "PI")}
                            >
                              Preview PI
                            </DropdownItem>
                          )}

                          {!est?.performanceInvoiceFlag &&
                            est?.status !== "REJECTED" && (
                              <DropdownItem
                                key="convertToPI"
                                onPress={() => {
                                  handleConvertToPI(est);
                                }}
                              >
                                Convert to PI
                              </DropdownItem>
                            )}

                          {est?.status !== "REJECTED" && (
                            <DropdownItem
                              key="addPaymentRegister"
                              href={`/erp/${userId}/sales/estimate`}
                            >
                              Add Payment Register
                            </DropdownItem>
                          )}
                          {est?.status !== "REJECTED" && (
                            <DropdownItem
                              key="cancelEstimate"
                              color="danger"
                              onPress={() => {
                                modal.onOpen();
                                setEstimateId(est?.id);
                              }}
                            >
                              Cancel estimate
                            </DropdownItem>
                          )}
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </div>
                  {/* 
                    <p className="text-sm text-slate-600">
                      Order: {est?.orderNumber || "NA"}
                    </p> */}

                  <p className="text-xs text-slate-500">
                    Date:{" "}
                    {est?.estimateDate
                      ? dayjs(est.estimateDate).format("DD MMM YYYY")
                      : "NA"}
                  </p>

                  <p className="text-xs text-slate-500">
                    Valid Till:{" "}
                    {est?.validUntil
                      ? dayjs(est.validUntil).format("DD MMM YYYY")
                      : "NA"}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ===================== FORM MODE ===================== */}
      {showForm && (
        <Form
          form={form}
          layout="vertical"
          className="w-full "
          onFinish={onEstimateFinish}
          initialValues={{
            lineItems: [],
            customerNotes: "",
            internalRemarks: "",
          }}
        >
          <Card className="shadow-xl max-h-[68vh] overflow-auto">
            <CardBody className="space-y-4">
              {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col">
                  <label className="mb-1.5 text-sm  text-[rgba(0,0,0,0.88)]">
                    <span className="text-red-500">*</span> Select Company
                  </label>

                  <Space.Compact className="w-full flex items-start">
                    <Form.Item
                      name="companyName"
                      rules={[
                        { required: true, message: "Please select company" },
                      ]}
                      className="mb-0 flex-1"
                      style={{ width: "100%" }}
                    >
                      <AntSelect
                        showSearch
                        allowClear
                        options={companyList}
                        fieldNames={{ label: "name", value: "name" }}
                        className="w-full"
                        onChange={(value, item) => {
                          form.setFieldsValue({
                            companyName: value,
                            unitId: undefined,
                            contactId: undefined,
                          });

                          if (!item) {
                            dispatch(handleResetExistingCompany());
                            setCompanyDetail(null);
                            return;
                          }

                          dispatch(
                            getBasicCompanyDetailByCompanyId(item?.id),
                          ).then((resp) => {
                            if (resp.meta.requestStatus === "fulfilled") {
                              setCompanyDetail(resp?.payload);
                              dispatch(
                                getContactDetailListByCompanyId({
                                  companyId: resp?.payload?.id,
                                  userId,
                                }),
                              );
                            }
                          });

                          dispatch(getAllUnitListByCompanyId(item?.id));
                        }}
                      />
                    </Form.Item>

                    <BasicCompany
                      setIsDropDownOpen={setIsDropDownOpen}
                      isEstimate={true}
                      companyDetail={companyDetail}
                      setIsCompanyUpdated={setIsCompanyUpdated}
                    />
                  </Space.Compact>
                </div>

                <div className="flex flex-col">
                  <label className="mb-1.5 text-sm text-[rgba(0,0,0,0.88)]">
                    <span className="text-red-500">*</span> Select company
                    unit{" "}
                  </label>

                  <Space.Compact className="w-full overflow-hidden flex items-start">
                    <Form.Item
                      name="unitId"
                      rules={[
                        {
                          required: true,
                          message: "Please select company unit",
                        },
                      ]}
                      className="mb-0 flex-1  overflow-hidden"
                      style={{ width: "100%" }}
                    >
                      <AntSelect
                        showSearch
                        options={unitList}
                        fieldNames={{ label: "unitName", value: "id" }}
                        className="w-full"
                        onSelect={(value, option) => {
                          setUnitDetail(option);
                          setContactValue("companyUnitId", String(value));
                        }}
                      />
                    </Form.Item>

                    <AntButton
                      type="primary"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUpdateCompanyUnit();
                      }}
                    >
                      Update
                    </AntButton>
                  </Space.Compact>
                </div>

                <div className="flex flex-col">
                  <label className="mb-1.5 text-sm text-[rgba(0,0,0,0.88)]">
                    <span className="text-red-500">*</span> Select contact
                  </label>

                  <Space.Compact className="w-full flex items-start">
                    <Form.Item
                      name="contactId"
                      rules={[
                        {
                          required: true,
                          message: "Please select company contact",
                        },
                      ]}
                      className="mb-0 flex-1"
                      style={{ width: "100%" }}
                    >
                      <AntSelect
                        showSearch
                        options={allContactList}
                        fieldNames={{ label: "name", value: "id" }}
                        className="w-full"
                      />
                    </Form.Item>

                    <AntButton
                      type="primary"
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        contactModal.onOpen();
                      }}
                    >
                      + Add
                    </AntButton>
                  </Space.Compact>
                </div>
              </div> */}

              {/* {solutionDetail?.type === "PRODUCT" ? (
                  <ProductFormFieldsDetails
                    control={control}
                    getValues={getValues}
                    reset={reset}
                    setValue={setValue}
                    isMedium={isMedium}
                  />
                ) : ( */}
              <ServiceFormFieldsDetail
                form={form}
                serviceFeeList={serviceFeeList}
              />
              {/* )} */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Form.Item
                  label="Order Date"
                  name="estimateDate"
                  rules={[
                    { required: true, message: "Please select order date" },
                  ]}
                  className="mb-0"
                >
                  <DtPicker
                    className="w-full"
                    disabledDate={(current) =>
                      current && current > dayjs().endOf("day")
                    }
                    format="YYYY-MM-DD"
                  />
                </Form.Item>

                <Form.Item
                  label="Valid till date"
                  name="validUntil"
                  rules={[
                    {
                      required: true,
                      message: "Please select valid till date",
                    },
                  ]}
                  className="mb-0"
                >
                  <DtPicker
                    className="w-full"
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                    format="YYYY-MM-DD"
                  />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Form.Item label="Notes" name="customerNotes" className="mb-0">
                  <AntInput.TextArea rows={3} placeholder="Notes" />
                </Form.Item>

                <Form.Item
                  label="Remarks"
                  name="internalRemarks"
                  className="mb-0"
                >
                  <AntInput.TextArea rows={3} placeholder="Remarks" />
                </Form.Item>
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end mt-4 gap-2">
            <AntButton onClick={onCancelForm}>Cancel</AntButton>

            <AntButton htmlType="submit" type="primary">
              Submit
            </AntButton>
          </div>
        </Form>
      )}

      {/* ===================== ✅ UNIT DETAILS MODAL ===================== */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {unitDetail ? "Update Unit Details" : "Add Unit Details"}
                <span className="text-xs text-slate-500 font-normal">
                  Only Unit Name is mandatory
                </span>
              </ModalHeader>

              <ModalBody>
                <form onSubmit={handleUnitSubmit(onSaveUnitModal)}>
                  <div className="max-h-[80vh] overflow-auto  grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Controller
                      name="unitName"
                      control={unitControl}
                      render={({ field }) => (
                        <Input
                          {...field}
                          label="Unit Name"
                          isRequired
                          isInvalid={!!unitErrors.unitName}
                          errorMessage={unitErrors.unitName?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`companyTypeId`}
                      control={unitControl}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          label="Company Structure"
                          data={companyTypeList || []}
                          labelKey="name"
                          valueKey="id"
                          isRequired
                          value={field.value}
                          isInvalid={!!error}
                          errorMessage={error?.message}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                        />
                      )}
                    />

                    <Controller
                      name={`gstTypeId`}
                      control={unitControl}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          label="GST Type"
                          isRequired
                          data={gstTypeList || []}
                          labelKey="name"
                          valueKey="id"
                          value={field.value}
                          isInvalid={!!error}
                          errorMessage={error?.message}
                          onChange={(value) => {
                            field.onChange(value);
                          }}
                          onItemSelect={(item) => {
                            if (item?.name === "Registered") {
                              setIsGstMandatory(true);
                            } else {
                              setIsGstMandatory(false);
                            }
                          }}
                        />
                      )}
                    />

                    {isGstMandatory && (
                      <Controller
                        name="gstNo"
                        control={unitControl}
                        render={({ field }) => (
                          <Input
                            isRequired
                            value={field.value}
                            onChange={(e) => {
                              handleGstChange(e);
                            }}
                            label="GST No"
                          />
                        )}
                      />
                    )}

                    <Controller
                      name="address"
                      control={unitControl}
                      render={({ field }) => (
                        <Input
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          label="Address"
                        />
                      )}
                    />

                    <Controller
                      name="country"
                      control={unitControl}
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
                      control={unitControl}
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
                      control={unitControl}
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
                      control={unitControl}
                      render={({ field }) => (
                        <Input {...field} label="Pin Code" maxLength={6} />
                      )}
                    />

                    {/* <Controller
                      name="panNo"
                      control={unitControl}
                      render={({ field }) => (
                        <Input
                          value={field.value}
                          onChange={(e) => {
                            handlePanChange(e);
                          }}
                          label="PAN No"
                        />
                      )}
                    /> */}
                  </div>
                  <ModalFooter>
                    <Button
                      type="button"
                      variant="flat"
                      color="default"
                      className="cursor-pointer"
                      onPress={onClose}
                    >
                      Close
                    </Button>

                    <Button
                      type="submit"
                      color="primary"
                      className="cursor-pointer"
                    >
                      Save
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* ===================== FULLSCREEN PREVIEW ===================== */}
      {openPreview && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeEstimatePreview}
          />

          <div className="relative w-[60vw] h-[92vh] bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="h-12 px-4 flex items-center justify-between border-b bg-white">
              <div className="flex items-center gap-3">
                <p className="font-semibold text-slate-900">
                  {viewType === "PI"
                    ? selectedEstimate?.performanceInvoiceNumber
                    : selectedEstimate?.estimateNumber}
                </p>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                  {viewType === "PI" ? "Proforma Invoice" : "Estimate"}
                </span>
              </div>

              <button
                type="button"
                onClick={closeEstimatePreview}
                className="cursor-pointer px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="h-[calc(92vh-3rem)] overflow-auto">
              <NewEstimatePreview
                details={selectedEstimate}
                viewType={viewType}
              />
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={contactModal.isOpen}
        onOpenChange={contactModal.onOpenChange}
        placement="center"
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add contact Details
              </ModalHeader>

              <ModalBody>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleContactSubmit(handleSubmitContact)(e);
                  }}
                >
                  <div className="max-h-[80vh] overflow-auto  grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormSelect
                      label="Select Unit"
                      name="companyUnitId"
                      isRequired
                      control={contactControl}
                      error={contactErrors.companyUnitId}
                      data={company?.units?.map((item) => ({
                        label: item?.unitName,
                        value: item?.id,
                      }))}
                    />
                    <Controller
                      name="title"
                      control={contactControl}
                      render={({ field, fieldState: { error } }) => (
                        <Select
                          isRequired={true}
                          size={isMedium ? "sm" : "md"}
                          label="Salutation"
                          error={contactErrors.title}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value)}
                          items={[
                            { label: "Master.", key: "master" },
                            { label: "Mr.", key: "mr" },
                            { label: "Mrs.", key: "mrs" },
                            { label: "Miss.", key: "miss" },
                          ]}
                        >
                          {(item) => (
                            <SelectItem key={item.key}>{item.label}</SelectItem>
                          )}
                        </Select>
                      )}
                    />
                    <Controller
                      name="name"
                      control={contactControl}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired={true}
                          size={isMedium ? "sm" : "md"}
                          label="Name"
                          error={contactErrors.name}
                          {...field}
                        />
                      )}
                    />
                    <Controller
                      name="clientDesignationId"
                      control={contactControl}
                      render={({ field, fieldState: { error } }) => (
                        <NewSelect
                          isRequired={true}
                          size={isMedium ? "sm" : "md"}
                          label="Designation"
                          error={contactErrors.clientDesignationId}
                          data={desiginationList || []}
                          labelKey="name"
                          valueKey="id"
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        />
                      )}
                    />
                    <Controller
                      name="emails"
                      control={contactControl}
                      rules={{
                        validate: (value) =>
                          !value ||
                          isValidEmail(value) ||
                          "Please enter a valid email address",
                      }}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired={true}
                          size={isMedium ? "sm" : "md"}
                          label="Email"
                          type="email"
                          error={contactErrors.emails}
                          value={field?.value}
                          onChange={(e) =>
                            field.onChange(formatEmail(e.target.value))
                          }
                        />
                      )}
                    />
                    <Controller
                      name="contactNo"
                      control={contactControl}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired={true}
                          size={isMedium ? "sm" : "md"}
                          label="Contact number"
                          error={contactErrors.contactNo}
                          value={field?.value}
                          onChange={(e) =>
                            field.onChange(allowOnlyNumbers(e.target.value))
                          }
                        />
                      )}
                    />
                    <Controller
                      name="whatsappNo"
                      control={contactControl}
                      render={({ field, fieldState: { error } }) => (
                        <Input
                          isRequired={true}
                          size={isMedium ? "sm" : "md"}
                          label="Whatsapp number"
                          error={contactErrors.whatsappNo}
                          value={field?.value}
                          onChange={(e) =>
                            field.onChange(allowOnlyNumbers(e.target.value))
                          }
                        />
                      )}
                    />
                  </div>
                  <ModalFooter>
                    <Button
                      type="button"
                      variant="flat"
                      color="default"
                      onPress={onClose}
                    >
                      Close
                    </Button>

                    <Button
                      type="submit"
                      color="primary"
                      onPress={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      Save
                    </Button>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal isOpen={modal.isOpen} onOpenChange={modal.onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Cancel Estimate
              </ModalHeader>
              <ModalBody>
                <Textarea
                  label="Remark"
                  isRequired
                  value={statusData.remark}
                  onChange={(e) =>
                    setStatusData((prev) => ({
                      ...prev,
                      rejectionReason: e.target.value,
                    }))
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isDisabled={statusData.rejectionReason === ""}
                  onPress={handleCancelEstimate}
                >
                  Submit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default LeadEstimates;
