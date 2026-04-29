import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import {
  Form,
  Input,
  Modal,
  Button as AntButton,
  notification,
  Select,
  Space,
  Switch,
} from "antd";
import { Building, EllipsisVertical, Pencil, Plus } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createContactViaEstimateInCompany,
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
} from "../../toolkit/slices/commonSlice";
import {
  addBasicCompanyDetail,
  createBasicUnitByCompanyId,
  getAllCompanyByUserId,
  getAllCompanyType,
  getAllGstType,
  getAllUnitListByCompanyId,
  getBasicCompanyDetailByCompanyId,
  getBasicCompanyDetails,
  linkCompanyAndUnitsWithLead,
  updateBasicCompanyDetail,
  updateBasicUnitByCompanyId,
} from "../../toolkit/slices/companySlice";
import {
  allowOnlyNumbers,
  formatGSTInput,
  formatPANInput,
  validateGST,
  validatePAN,
} from "../../common";
import { useParams } from "react-router-dom";

const CompanyAndUnitsInLead = () => {
  const { leadId, userId } = useParams();
  const dispatch = useDispatch();
  const [api, contextHolder] = notification.useNotification();

  const [companyForm] = Form.useForm();
  const [unitForm] = Form.useForm();
  const [contactForm] = Form.useForm();

  const selectedCompanyCountry = Form.useWatch("country", companyForm);
  const selectedCompanyState = Form.useWatch("state", companyForm);

  const selectedUnitCountry = Form.useWatch("country", unitForm);
  const selectedUnitState = Form.useWatch("state", unitForm);

  const countryList = useSelector((state) => state.common.countriesList || []);
  const statesList = useSelector((state) => state.common.statesList || []);
  const citiesList = useSelector((state) => state.common.citiesList || []);

  const company = useSelector((state) => state.company.basicCompanyDetail);
  const companyList = useSelector(
    (state) => state.company.basicCompanyList || [],
  );
  const unitList = useSelector((state) => state.company.basicUnitList || []);
  const companyTypeList = useSelector(
    (state) => state.company.companyTypeList || [],
  );
  const gstTypeList = useSelector((state) => state.company.gstTypeList || []);
  const leadData = useSelector((state) => state.leads.singleLeadData);

  const [companyModal, setCompanyModal] = useState(false);
  const [unitModal, setUnitModal] = useState(false);
  const [contactModal, setContactModal] = useState(false);

  const [companyLoading, setCompanyLoading] = useState(false);
  const [unitLoading, setUnitLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const [editingUnit, setEditingUnit] = useState(null);
  const [isGstMandatory, setIsGstMandatory] = useState(false);
  const [useExistingSelection, setUseExistingSelection] = useState(false);

  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedCompanyDetail, setSelectedCompanyDetail] = useState(null);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [selectedUnitDetail, setSelectedUnitDetail] = useState(null);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedContactDetail, setSelectedContactDetail] = useState(null);

  const iconClass = "w-4 h-4 text-gray-500";

  useEffect(() => {
    dispatch(getAllCountries());
    dispatch(getAllCompanyType());
    dispatch(getAllGstType());
    dispatch(getAllCompanyByUserId(userId));

    dispatch(getBasicCompanyDetails({ leadId, userId })).then((resp) => {
      if (resp?.meta?.requestStatus === "fulfilled" && resp?.payload?.id) {
        dispatch(getAllUnitListByCompanyId(resp.payload.id));
      }
    });
  }, [dispatch, leadId, userId]);

  const effectiveCompany = selectedCompanyDetail || company;

  const units = useMemo(() => {
    if (selectedCompanyDetail?.id) {
      return Array.isArray(selectedCompanyDetail?.units)
        ? selectedCompanyDetail.units
        : [];
    }

    if (company?.id && Array.isArray(company?.units) && company.units.length) {
      return company.units;
    }

    if (Array.isArray(unitList) && unitList.length) {
      return unitList;
    }

    return [];
  }, [selectedCompanyDetail, company, unitList]);

  const contacts = useMemo(() => {
    return Array.isArray(selectedUnitDetail?.unitContacts)
      ? selectedUnitDetail.unitContacts
      : [];
  }, [selectedUnitDetail]);

  const refreshLeadCompanyAndUnits = () => {
    dispatch(getAllCompanyByUserId(userId));
    dispatch(getBasicCompanyDetails({ leadId, userId })).then((resp) => {
      if (resp?.meta?.requestStatus === "fulfilled" && resp?.payload?.id) {
        dispatch(getAllUnitListByCompanyId(resp.payload.id));
      }
    });
  };

  const refreshSelectedCompanyRelatedData = (companyId) => {
    if (!companyId) return;

    dispatch(getBasicCompanyDetailByCompanyId(companyId)).then((resp) => {
      if (resp?.meta?.requestStatus === "fulfilled") {
        setSelectedCompanyDetail(resp?.payload);

        const nextUnits = Array.isArray(resp?.payload?.units)
          ? resp.payload.units
          : [];

        const stillSelectedUnit = nextUnits.find(
          (item) => String(item?.id) === String(selectedUnitId),
        );

        if (stillSelectedUnit) {
          setSelectedUnitDetail(stillSelectedUnit);

          const nextContacts = Array.isArray(stillSelectedUnit?.unitContacts)
            ? stillSelectedUnit.unitContacts
            : [];

          const stillSelectedContact = nextContacts.find(
            (item) => String(item?.id) === String(selectedContactId),
          );

          setSelectedContactDetail(stillSelectedContact || null);
        } else {
          setSelectedUnitId(null);
          setSelectedUnitDetail(null);
          setSelectedContactId(null);
          setSelectedContactDetail(null);

          companyForm.setFieldsValue({
            existingUnitId: undefined,
            existingContactId: undefined,
          });
        }
      }
    });
  };

  const resetUnitModalState = () => {
    setEditingUnit(null);
    setIsGstMandatory(false);
    unitForm.resetFields();
  };

  const resetContactModalState = () => {
    contactForm.resetFields();
  };

  const handleSelectExistingCompany = (companyId) => {
    setSelectedCompanyId(companyId);
    setSelectedUnitId(null);
    setSelectedContactId(null);
    setSelectedUnitDetail(null);
    setSelectedContactDetail(null);

    companyForm.setFieldsValue({
      existingCompanyId: companyId,
      existingUnitId: undefined,
      existingContactId: undefined,
    });

    if (!companyId) {
      setSelectedCompanyDetail(null);
      return;
    }

    dispatch(getBasicCompanyDetailByCompanyId(companyId)).then((resp) => {
      if (resp?.meta?.requestStatus === "fulfilled") {
        setSelectedCompanyDetail(resp?.payload);
      }
    });
  };

  const handleSelectUnit = async (unitId) => {
    const resp = await dispatch(
      linkCompanyAndUnitsWithLead({
        companyId: company?.id,
        leadId,
        unitId: unitId,
        userId,
      }),
    );

    if (resp?.meta?.requestStatus === "fulfilled") {
      addToast({
        title: "Company and unit linked successfully.",
        color: "success",
      });
    }

    setSelectedUnitId(unitId);
    setSelectedContactId(null);
    setSelectedContactDetail(null);

    companyForm.setFieldsValue({
      existingUnitId: unitId,
      existingContactId: undefined,
    });

    const selected = units?.find((item) => String(item?.id) === String(unitId));
    setSelectedUnitDetail(selected || null);
  };

  const handleSelectContact = (contactId) => {
    setSelectedContactId(contactId);
    companyForm.setFieldsValue({ existingContactId: contactId });

    const selected = contacts?.find(
      (item) => String(item?.id) === String(contactId),
    );
    setSelectedContactDetail(selected || null);
  };

  const openCompanyModal = () => {
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

    setUseExistingSelection(false);

    companyForm.setFieldsValue({
      name: effectiveCompany?.name || "",
      gstNo: effectiveCompany?.gstNo || "",
      companyTypeId: effectiveCompany?.companyTypeId || "",
      panNo: effectiveCompany?.panNo || "",
      address: effectiveCompany?.address || "",
      country: effectiveCompany?.country || "",
      state: effectiveCompany?.state || "",
      city: effectiveCompany?.city || "",
      pinCode:
        effectiveCompany?.primaryPinCode || effectiveCompany?.pinCode || "",

      existingCompanyId: selectedCompanyId || undefined,
      existingUnitId: selectedUnitId || undefined,
      existingContactId: selectedContactId || undefined,
    });

    if (effectiveCompany?.country) {
      dispatch(getAllStatesByCountryName(effectiveCompany.country));
    }
    if (effectiveCompany?.state) {
      dispatch(getAllCitiesByStateName(effectiveCompany.state));
    }

    setCompanyModal(true);
  };

  const handleCloseCompanyModal = () => {
    setCompanyModal(false);
    setUseExistingSelection(false);
    companyForm.resetFields();
  };

  const openAddUnitModal = () => {
    if (!validateCompanySelected()) return;

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

    if (!effectiveCompany?.id && !selectedCompanyId) {
      addToast({
        title: "Please select company first",
        color: "warning",
      });
      return;
    }

    resetUnitModalState();

    unitForm.setFieldsValue({
      unitName: "",
      companyTypeId: undefined,
      gstTypeId: undefined,
      gstNo: "",
      address: "",
      country: "",
      state: "",
      city: "",
      pinCode: "",
    });

    setUnitModal(true);
  };

  const openEditUnitModal = (unit) => {
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

    setEditingUnit(unit);

    dispatch(getAllCountries());
    if (unit?.country) {
      dispatch(getAllStatesByCountryName(unit.country));
    }
    if (unit?.state) {
      dispatch(getAllCitiesByStateName(unit.state));
    }

    const selectedGstType = gstTypeList?.find(
      (item) => String(item?.id) === String(unit?.gstTypeId),
    );
    setIsGstMandatory(
      selectedGstType?.name === "Registered" || selectedGstType?.name === "SEZ",
    );

    const currentGstTypeName =
      selectedGstType?.name ||
      unit?.gstTypeName ||
      unit?.gstType ||
      unit?.gstRegistrationTypeName;

    const isCurrentAllowed = allowedGstTypeNames.includes(currentGstTypeName);

    unitForm.setFieldsValue({
      unitName: unit?.unitName || "",
      companyTypeId: unit?.companyTypeId,
      gstTypeId: isCurrentAllowed
        ? unit?.gstTypeId || unit?.gstRegistrationTypeId
        : undefined,
      gstNo: unit?.gstNo || "",
      address: unit?.addressLine1 || unit?.address || "",
      country: unit?.country || "",
      state: unit?.state || "",
      city: unit?.city || "",
      pinCode: unit?.pinCode || "",
    });

    setUnitModal(true);
  };

  const openAddContactModal = () => {
    if (!validateCompanySelected()) return;

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

    if (!effectiveCompany?.id) {
      addToast({
        title: "Please select company first",
        color: "warning",
      });
      return;
    }

    // if (!selectedUnitId) {
    //   addToast({
    //     title: "Please select unit first",
    //     color: "warning",
    //   });
    //   return;
    // }

    resetContactModalState();

    contactForm.setFieldsValue({
      title: "",
      name: "",
      emails: "",
      contactNo: "",
      whatsappNo: "",
      clientDesignationId: "",
      companyUnitId: selectedUnitId,
    });

    setContactModal(true);
  };

  const handleLinkExistingCompany = async () => {
    try {
      const values = await companyForm.validateFields([
        "existingCompanyId",
        "existingUnitId",
        "existingContactId",
      ]);

      setCompanyLoading(true);

      const resp = await dispatch(
        linkCompanyAndUnitsWithLead({
          companyId: values.existingCompanyId,
          leadId,
          unitId: values.existingUnitId,
          userId,
        }),
      );

      if (resp?.meta?.requestStatus === "fulfilled") {
        addToast({
          title: "Company and unit linked successfully.",
          color: "success",
        });

        setSelectedCompanyId(values.existingCompanyId);
        setSelectedUnitId(values.existingUnitId);
        setSelectedContactId(values.existingContactId || null);

        handleCloseCompanyModal();
        refreshLeadCompanyAndUnits();
        refreshSelectedCompanyRelatedData(values.existingCompanyId);
      } else {
        addToast({
          title: resp?.payload?.data?.errorCode || "ERROR",
          description:
            resp?.payload?.data?.message ||
            "Failed to link company and unit with lead",
          color: "danger",
        });
      }
    } catch (error) {
    } finally {
      setCompanyLoading(false);
    }
  };

  const onSubmitCompany = (values) => {
    const payload = {
      ...values,
      leadId,
      createdById: userId,
      updatedById: userId,
    };

    setCompanyLoading(true);

    if (effectiveCompany?.id && !selectedCompanyId) {
      dispatch(
        updateBasicCompanyDetail({
          companyId: effectiveCompany?.id,
          userId,
          data: payload,
        }),
      )
        .then((resp) => {
          if (resp?.meta?.requestStatus === "fulfilled") {
            addToast({
              title: "Company details updated successfully.",
              color: "success",
            });
            handleCloseCompanyModal();
            refreshLeadCompanyAndUnits();
          } else {
            addToast({
              title: resp?.payload?.data?.errorCode || "ERROR",
              description:
                resp?.payload?.data?.message || "Failed to update company",
              color: "danger",
            });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        )
        .finally(() => setCompanyLoading(false));
    } else {
      dispatch(addBasicCompanyDetail(payload))
        .then((resp) => {
          if (resp?.meta?.requestStatus === "fulfilled") {
            api.success({
              message: "SUCCESS",
              description: "Company details added successfully.",
            });
            handleCloseCompanyModal();
            refreshLeadCompanyAndUnits();
            dispatch(
              linkCompanyAndUnitsWithLead({
                companyId: resp?.payload?.id,
                leadId,
                unitId: resp?.payload?.units?.[0]?.id,
                userId,
              }),
            ).then((linkRes) => {
              console.log("werfgkqweguiyg", linkRes);
              if (linkRes?.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Company and unit linked successfully.",
                  color: "success",
                });
              } else {
                addToast({
                  title: "Something went wrong !.",
                  description: "Company and Units not linked to Lead !.",
                  color: "danger",
                });
              }
            });
          } else {
            api.error({
              message: "ERROR",
              description: resp?.payload || "Failed to add company details",
            });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        )
        .finally(() => setCompanyLoading(false));
    }
  };

  const onSubmitUnit = (values) => {
    if (!effectiveCompany?.id) {
      addToast({
        title: "Please select or create company first",
        color: "warning",
      });
      return;
    }

    const selectedGstType = gstTypeList.find(
      (item) => String(item?.id) === String(values?.gstTypeId),
    );

    if (
      selectedGstType?.name &&
      !allowedGstTypeNames.includes(selectedGstType.name)
    ) {
      addToast({
        title: "Invalid GST Type",
        description: `Allowed GST types are ${allowedGstTypeNames.join(", ")} only.`,
        color: "danger",
      });
      return;
    }

    const payload = {
      ...values,
      createdById: userId,
      updatedById: userId,
    };

    if (!isGstMandatory) {
      payload.gstNo = "";
    }

    setUnitLoading(true);

    if (editingUnit?.id) {
      dispatch(
        updateBasicUnitByCompanyId({
          companyId: editingUnit?.companyId || effectiveCompany?.id,
          unitId: editingUnit?.id,
          userId,
          data: payload,
        }),
      )
        .then((resp) => {
          if (resp?.meta?.requestStatus === "fulfilled") {
            addToast({
              title: "Unit details updated successfully.",
              color: "success",
            });
            setUnitModal(false);
            resetUnitModalState();
            refreshLeadCompanyAndUnits();
            if (selectedCompanyId) {
              refreshSelectedCompanyRelatedData(selectedCompanyId);
            } else {
              refreshLeadCompanyAndUnits();
            }
          } else {
            addToast({
              title:
                resp?.payload?.data?.message ||
                resp?.payload?.message ||
                "Failed to update unit",
              color: "danger",
            });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        )
        .finally(() => setUnitLoading(false));
    } else {
      dispatch(
        createBasicUnitByCompanyId({
          companyId: effectiveCompany?.id,
          updatedBy: userId,
          data: payload,
        }),
      )
        .then((resp) => {
          if (resp?.meta?.requestStatus === "fulfilled") {
            addToast({
              title: "Unit details saved.",
              color: "success",
            });

            const newUnit = resp?.payload;
            refreshLeadCompanyAndUnits();
            setUnitModal(false);
            resetUnitModalState();

            setSelectedUnitId(newUnit?.id || null);
            setSelectedUnitDetail(newUnit || null);
            setSelectedContactId(null);
            setSelectedContactDetail(null);

            companyForm.setFieldsValue({
              existingUnitId: newUnit?.id,
              existingContactId: undefined,
            });

            dispatch(
              linkCompanyAndUnitsWithLead({
                companyId:
                  newUnit?.companyId ||
                  selectedCompanyId ||
                  effectiveCompany?.id,
                leadId,
                unitId: newUnit?.id,
                userId,
              }),
            ).then((linkRes) => {
              if (linkRes?.meta?.requestStatus === "fulfilled") {
                refreshLeadCompanyAndUnits();
                addToast({
                  title: "Company and unit linked successfully.",
                  color: "success",
                });
              } else {
                addToast({
                  title: "Something went wrong !.",
                  color: "danger",
                });
              }
            });

            if (selectedCompanyId) {
              refreshSelectedCompanyRelatedData(selectedCompanyId);
            } else {
              refreshLeadCompanyAndUnits();
            }
          } else {
            addToast({
              title:
                resp?.payload?.data?.message ||
                resp?.payload?.message ||
                "Failed to create unit",
              color: "danger",
            });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        )
        .finally(() => setUnitLoading(false));
    }
  };

  const onSubmitContact = (values) => {
    if (!effectiveCompany?.id) {
      addToast({
        title: "Please select or create company first",
        color: "warning",
      });
      return;
    }

    const payload = {
      ...values,
      companyId: effectiveCompany?.id,
      companyUnitId: values?.companyUnitId || selectedUnitId || null,
    };

    setContactLoading(true);

    dispatch(createContactViaEstimateInCompany(payload))
      .then((resp) => {
        if (resp?.meta?.requestStatus === "fulfilled") {
          addToast({
            title: "Contact details saved.",
            color: "success",
          });

          const newContact = resp?.payload;

          setContactModal(false);
          resetContactModalState();

          setSelectedContactId(newContact?.id || null);
          setSelectedContactDetail(newContact || null);

          companyForm.setFieldsValue({
            existingContactId: newContact?.id,
          });

          if (selectedCompanyId) {
            refreshSelectedCompanyRelatedData(selectedCompanyId);
          } else {
            refreshLeadCompanyAndUnits();
          }
        } else {
          addToast({
            title:
              resp?.payload?.message ||
              resp?.payload?.data?.message ||
              "Failed to add contact",
            color: "danger",
          });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      )
      .finally(() => setContactLoading(false));
  };

  const validateCompanySelected = () => {
    if (!effectiveCompany?.id && !selectedCompanyId) {
      addToast({
        title: "Company not selected",
        description: "Please select or create a company first.",
        color: "warning",
      });
      return false;
    }
    return true;
  };

  const getGstTypeName = (unit) => {
    return (
      unit?.gstTypeName ||
      unit?.gstType ||
      unit?.gstRegistrationTypeName ||
      gstTypeList?.find(
        (item) =>
          String(item?.id) ===
          String(unit?.gstTypeId || unit?.gstRegistrationTypeId),
      )?.name ||
      ""
    );
  };

  const allowedGstTypeNames = useMemo(() => {
    const otherUnits = editingUnit?.id
      ? units.filter((unit) => String(unit?.id) !== String(editingUnit.id))
      : units;

    if (!otherUnits.length) {
      return ["Registered", "Unregistered", "SEZ", "International"];
    }

    const firstUnitType = getGstTypeName(otherUnits[0]);

    const hasRegistered = otherUnits.some(
      (unit) => getGstTypeName(unit) === "Registered",
    );

    const hasUnregistered = otherUnits.some(
      (unit) => getGstTypeName(unit) === "Unregistered",
    );

    if (firstUnitType === "International") {
      return ["Registered", "Unregistered", "SEZ", "International"];
    }

    if (hasRegistered) {
      return ["Registered", "SEZ"];
    }

    if (hasUnregistered) {
      return ["Unregistered", "SEZ"];
    }

    if (firstUnitType === "SEZ") {
      return ["Registered", "Unregistered", "SEZ"];
    }

    return ["Registered", "Unregistered", "SEZ"];
  }, [units, editingUnit, gstTypeList]);

  const filteredGstTypeList = useMemo(() => {
    return gstTypeList.filter((item) =>
      allowedGstTypeNames.includes(item?.name),
    );
  }, [gstTypeList, allowedGstTypeNames]);

  return (
    <>
      {contextHolder}

      <Card className="my-2">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <Building className={iconClass} />
              <p className="text-sm font-medium">Company detail</p>
            </div>

            <Button
              size="sm"
              isIconOnly
              variant="light"
              className="w-6 h-6 rounded-full bg-none"
              onClick={openCompanyModal}
            >
              {effectiveCompany?.id ? (
                <Pencil className={iconClass} />
              ) : (
                <Plus className={iconClass} />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardBody className="max-h-[300px] overflow-auto">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="col-span-2">
              <p className="font-medium text-gray-900">
                {effectiveCompany?.name || "NA"}
              </p>
            </div>

            <p className="text-gray-500 col-span-2">
              <span className="text-gray-700 font-medium">PAN:</span>{" "}
              {effectiveCompany?.panNo || "NA"}
            </p>

            <p className="text-gray-500 col-span-2">
              <span className="text-gray-700 font-medium">Company Type:</span>{" "}
              {effectiveCompany?.companyTypeName ||
                effectiveCompany?.companyType ||
                "NA"}
            </p>

            <p className="text-gray-500 col-span-2">
              <span className="text-gray-700 font-medium">Address:</span>{" "}
              {effectiveCompany?.address || "NA"}
            </p>

            <p className="text-gray-500 col-span-2">
              <span className="text-gray-700 font-medium">Location:</span>{" "}
              {effectiveCompany?.city || "NA"},{" "}
              {effectiveCompany?.state || "NA"},{" "}
              {effectiveCompany?.country || "NA"} -{" "}
              {effectiveCompany?.primaryPinCode ||
                effectiveCompany?.pinCode ||
                "NA"}
            </p>
          </div>
        </CardBody>
      </Card>

      <Card className="my-2">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <Building className={iconClass} />
              <p className="text-sm font-medium">Company unit detail</p>
            </div>

            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" radius="full" variant="flat">
                  <EllipsisVertical />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                selectionMode="single"
                onSelectionChange={(e) => {}}
              >
                <DropdownItem key="addContact" onPress={openAddContactModal}>
                  Add contact in unit
                </DropdownItem>
                <DropdownItem key="addUnit" onPress={openAddUnitModal}>
                  Add company unit
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </CardHeader>

        <CardBody className="max-h-[500px] overflow-auto">
          {!effectiveCompany?.id ? (
            <p className="text-sm text-gray-500">No company selected yet.</p>
          ) : units?.length > 0 ? (
            <div className="space-y-3">
              {units.map((unit) => {
                const isSelected = String(selectedUnitId) === String(unit?.id);
                const unitContacts = Array.isArray(unit?.unitContacts)
                  ? unit.unitContacts
                  : [];
                const displayContact = isSelected
                  ? selectedContactDetail || unitContacts[0]
                  : unitContacts[0];

                return (
                  <div
                    key={unit?.id}
                    className={`border rounded-lg p-3 bg-white shadow-sm ${
                      isSelected ? "border-blue-500 ring-1 ring-blue-200" : ""
                    }`}
                  >
                    <div className="flex justify-between gap-3">
                      <p className="font-medium text-gray-900">
                        {unit?.unitName || "NA"}
                      </p>

                      <div className="flex gap-2">
                        {/* <Button
                          size="sm"
                          variant="flat"
                          color="default"
                          onClick={() => {
                            handleSelectUnit(unit?.id);

                            const firstContact =
                              Array.isArray(unit?.unitContacts) &&
                              unit.unitContacts.length
                                ? unit.unitContacts[0]
                                : null;

                            if (firstContact) {
                              handleSelectContact(firstContact.id);
                            }
                          }}
                        >
                          Select
                        </Button> */}

                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          onClick={() => openEditUnitModal(unit)}
                        >
                          Update
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <p className="text-gray-500">
                        <span className="text-gray-700 font-medium grid-cols-2">
                          GST No:
                        </span>{" "}
                        {unit?.gstNo || "NA"}
                      </p>

                      <p className="text-gray-500 md:col-span-2">
                        <span className="text-gray-700 font-medium">
                          GST Type:
                        </span>{" "}
                        {unit?.gstTypeName ||
                          unit?.gstType ||
                          unit?.gstRegistrationTypeName ||
                          "NA"}
                      </p>

                      <p className="text-gray-500 ">
                        <span className="text-gray-700 font-medium">
                          Pin Code:
                        </span>{" "}
                        {unit?.pinCode || "NA"}
                      </p>

                      <p className="text-gray-500 md:col-span-2">
                        <span className="text-gray-700 font-medium">
                          Address:
                        </span>{" "}
                        {unit?.addressLine1 || unit?.address || "NA"}
                      </p>

                      <p className="text-gray-500 md:col-span-2">
                        <span className="text-gray-700 font-medium">
                          Location:
                        </span>{" "}
                        {unit?.city || "NA"}, {unit?.state || "NA"},{" "}
                        {unit?.country || "NA"}
                      </p>

                      <div className="md:col-span-2 mt-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Contact detail
                        </p>

                        {displayContact ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <p className="text-gray-500">
                              <span className="text-gray-700 font-medium">
                                Name:
                              </span>{" "}
                              {displayContact?.name || "NA"}
                            </p>

                            <p className="text-gray-500">
                              <span className="text-gray-700 font-medium">
                                Email:
                              </span>{" "}
                              {displayContact?.emails || "NA"}
                            </p>

                            <p className="text-gray-500">
                              <span className="text-gray-700 font-medium">
                                Contact No:
                              </span>{" "}
                              {displayContact?.contactNo || "NA"}
                            </p>

                            <p className="text-gray-500">
                              <span className="text-gray-700 font-medium">
                                Whatsapp No:
                              </span>{" "}
                              {displayContact?.whatsappNo || "NA"}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">
                            No contact available for this unit.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No unit details added yet.</p>
          )}
        </CardBody>
      </Card>

      <Modal
        open={companyModal}
        onCancel={handleCloseCompanyModal}
        title={
          useExistingSelection
            ? "Use Existing Company / Unit / Contact"
            : effectiveCompany?.id && !selectedCompanyId
              ? "Update Company Detail"
              : "Company Detail"
        }
        onOk={() => {
          if (useExistingSelection) {
            handleLinkExistingCompany();
          } else {
            companyForm.submit();
          }
        }}
        okText={
          useExistingSelection
            ? "Link"
            : effectiveCompany?.id && !selectedCompanyId
              ? "Update"
              : "Submit"
        }
        confirmLoading={companyLoading}
        width="48%"
      >
        <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <div>
            <p className="text-sm font-medium text-gray-800">
              Use Existing Company / Unit / Contact
            </p>
            <p className="text-xs text-gray-500">
              Turn on to select from existing records
            </p>
          </div>

          <Switch
            checked={useExistingSelection}
            onChange={(checked) => {
              setUseExistingSelection(checked);

              if (checked) {
                const companyId =
                  selectedCompanyId || effectiveCompany?.id || undefined;

                setSelectedCompanyId(companyId);

                companyForm.setFieldsValue({
                  existingCompanyId: companyId,
                  existingUnitId: selectedUnitId || undefined,
                  existingContactId: selectedContactId || undefined,
                });

                if (companyId) {
                  dispatch(getBasicCompanyDetailByCompanyId(companyId)).then(
                    (resp) => {
                      if (resp?.meta?.requestStatus === "fulfilled") {
                        setSelectedCompanyDetail(resp?.payload);
                      }
                    },
                  );
                }
              }
            }}
          />
        </div>

        <Form
          layout="vertical"
          form={companyForm}
          onFinish={onSubmitCompany}
          className="grid grid-cols-2 gap-2"
        >
          {useExistingSelection ? (
            <>
              <Form.Item
                label="Select Company"
                name="existingCompanyId"
                rules={[{ required: true, message: "Please select company" }]}
                className="col-span-2"
              >
                <Select
                  showSearch
                  allowClear
                  options={companyList}
                  fieldNames={{ label: "name", value: "id" }}
                  filterOption={(input, option) =>
                    String(option?.name || "")
                      .toLowerCase()
                      .includes(input.trim().toLowerCase())
                  }
                  placeholder="Choose company"
                  onChange={handleSelectExistingCompany}
                  className="w-full"
                />
              </Form.Item>

              <Form.Item label="Select Unit" required className="mb-0">
                <Space.Compact className="w-full">
                  <Form.Item
                    name="existingUnitId"
                    noStyle
                    rules={[{ required: true, message: "Please select unit" }]}
                  >
                    <Select
                      showSearch
                      allowClear
                      options={units}
                      fieldNames={{ label: "unitName", value: "id" }}
                      filterOption={(input, option) =>
                        String(option?.unitName || "")
                          .toLowerCase()
                          .includes(input.trim().toLowerCase())
                      }
                      placeholder="Choose unit"
                      disabled={!effectiveCompany?.id && !selectedCompanyId}
                      onChange={handleSelectUnit}
                      className="w-full"
                    />
                  </Form.Item>

                  <AntButton
                    type="primary"
                    icon={<Plus size={15} />}
                    disabled={!effectiveCompany?.id && !selectedCompanyId}
                    onClick={openAddUnitModal}
                  >
                    Unit
                  </AntButton>
                </Space.Compact>
              </Form.Item>

              <Form.Item label="Select Contact" className="mb-0">
                <Space.Compact className="w-full">
                  <Form.Item name="existingContactId" noStyle>
                    <Select
                      showSearch
                      allowClear
                      options={contacts}
                      fieldNames={{ label: "name", value: "id" }}
                      placeholder="Choose contact"
                      filterOption={(input, option) =>
                        String(option?.name || "")
                          .toLowerCase()
                          .includes(input.trim().toLowerCase())
                      }
                      disabled={!selectedUnitDetail?.id}
                      onChange={handleSelectContact}
                      className="w-full"
                    />
                  </Form.Item>

                  <AntButton
                    type="primary"
                    icon={<Plus size={15} />}
                    disabled={!selectedUnitId}
                    onClick={openAddContactModal}
                  >
                    Contact
                  </AntButton>
                </Space.Compact>
              </Form.Item>

              {(selectedCompanyId || selectedUnitId || selectedContactId) && (
                <div className="col-span-2 mt-2 flex flex-wrap gap-2">
                  {selectedCompanyId && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                      Company: {effectiveCompany?.name || "Selected"}
                    </span>
                  )}

                  {selectedUnitId && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                      Unit: {selectedUnitDetail?.unitName || "Selected"}
                    </span>
                  )}

                  {selectedContactId && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-700">
                      Contact: {selectedContactDetail?.name || "Selected"}
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <Form.Item
                label="Company Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter company name" },
                ]}
              >
                <Input placeholder="Company Name" />
              </Form.Item>

              <Form.Item
                label="Company Structure"
                name="companyTypeId"
                // rules={[
                //   { required: true, message: "Please select company type" },
                // ]}
              >
                <Select
                  showSearch
                  allowClear
                  options={companyTypeList}
                  fieldNames={{ label: "name", value: "id" }}
                  placeholder="Select Company Structure"
                />
              </Form.Item>

              <Form.Item
                label="PAN Number"
                name="panNo"
                getValueFromEvent={(e) => formatPANInput(e.target.value)}
                // rules={[
                //   { required: true, message: "Please enter PAN number" },
                //   { validator: validatePAN },
                // ]}
              >
                <Input placeholder="PAN Number" maxLength={10} />
              </Form.Item>

              <Form.Item
                label="Address"
                name="address"
                // rules={[{ required: true, message: "Please enter address" }]}
              >
                <Input placeholder="Address" />
              </Form.Item>

              <Form.Item
                label="Country"
                name="country"
                // rules={[{ required: true, message: "Please select country" }]}
              >
                <Select
                  showSearch
                  allowClear
                  options={countryList}
                  fieldNames={{ label: "name", value: "name" }}
                  onChange={(value) => {
                    companyForm.setFieldsValue({
                      state: undefined,
                      city: undefined,
                    });

                    if (value) {
                      dispatch(getAllStatesByCountryName(value));
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label="State"
                name="state"
                // rules={[{ required: true, message: "Please select state" }]}
              >
                <Select
                  showSearch
                  allowClear
                  options={statesList}
                  fieldNames={{ label: "name", value: "name" }}
                  onChange={(value) => {
                    companyForm.setFieldsValue({ city: undefined });
                    dispatch(getAllCitiesByStateName(value));
                  }}
                />
              </Form.Item>

              <Form.Item
                label="City"
                name="city"
                // rules={[{ required: true, message: "Please select city" }]}
              >
                <Select
                  showSearch
                  allowClear
                  options={citiesList}
                  fieldNames={{ label: "name", value: "name" }}
                />
              </Form.Item>

              <Form.Item
                label="Pin Code"
                name="pinCode"
                getValueFromEvent={(e) => allowOnlyNumbers(e.target.value)}
                // rules={[{ required: true, message: "Please enter pin code" }]}
              >
                <Input placeholder="Pin Code" maxLength={6} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      <Modal
        open={unitModal}
        onCancel={() => {
          setUnitModal(false);
          resetUnitModalState();
        }}
        title={editingUnit ? "Update Unit Detail" : "Add Unit Detail"}
        onOk={() => unitForm.submit()}
        okText={editingUnit ? "Update" : "Submit"}
        confirmLoading={unitLoading}
        width="48%"
      >
        <Form
          layout="vertical"
          form={unitForm}
          onFinish={onSubmitUnit}
          className="grid grid-cols-2 gap-2"
        >
          <Form.Item
            label="Unit Name"
            name="unitName"
            rules={[{ required: true, message: "Please enter unit name" }]}
          >
            <Input placeholder="Unit Name" />
          </Form.Item>

          <Form.Item
            label="GST Type"
            name="gstTypeId"
            rules={[{ required: true, message: "Please select GST type" }]}
          >
            <Select
              showSearch
              allowClear
              options={filteredGstTypeList}
              fieldNames={{ label: "name", value: "id" }}
              placeholder="Select GST Type"
              onChange={(value) => {
                const selectedGstType = gstTypeList.find(
                  (item) => String(item?.id) === String(value),
                );

                const canEnterGst =
                  selectedGstType?.name === "Registered" ||
                  selectedGstType?.name === "SEZ";

                setIsGstMandatory(canEnterGst);

                unitForm.setFieldsValue({
                  gstTypeId: value,
                  gstNo: canEnterGst ? unitForm.getFieldValue("gstNo") : "",
                });
              }}
            />
          </Form.Item>

          <Form.Item
            label="GST Number"
            name="gstNo"
            getValueFromEvent={(e) => formatGSTInput(e.target.value)}
            // rules={[
            //   {
            //     required: isGstMandatory,
            //     message: "Please enter GST number",
            //   },
            //   () => ({
            //     validator(_, value) {
            //       if (!isGstMandatory && !value) return Promise.resolve();
            //       if (!value) return Promise.resolve();
            //       return validateGST(_, value);
            //     },
            //   }),
            // ]}
          >
            <Input
              placeholder="GST Number"
              maxLength={15}
              disabled={!isGstMandatory}
            />
          </Form.Item>

          <Form.Item label="Address" name="address">
            <Input placeholder="Address" />
          </Form.Item>

          <Form.Item label="Country" name="country">
            <Select
              showSearch
              allowClear
              options={countryList}
              fieldNames={{ label: "name", value: "name" }}
              onChange={(value) => {
                unitForm.setFieldsValue({ state: undefined, city: undefined });
                dispatch(getAllStatesByCountryName(value));
              }}
            />
          </Form.Item>

          <Form.Item label="State" name="state">
            <Select
              showSearch
              allowClear
              options={statesList}
              fieldNames={{ label: "name", value: "name" }}
              onChange={(value) => {
                unitForm.setFieldsValue({ city: undefined });
                dispatch(getAllCitiesByStateName(value));
              }}
            />
          </Form.Item>

          <Form.Item label="City" name="city">
            <Select
              showSearch
              allowClear
              options={citiesList}
              fieldNames={{ label: "name", value: "name" }}
            />
          </Form.Item>

          <Form.Item
            label="Pin Code"
            name="pinCode"
            getValueFromEvent={(e) => allowOnlyNumbers(e.target.value)}
          >
            <Input placeholder="Pin Code" maxLength={6} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={contactModal}
        onCancel={() => {
          setContactModal(false);
          resetContactModalState();
        }}
        title="Add Contact Detail"
        onOk={() => contactForm.submit()}
        okText="Save"
        confirmLoading={contactLoading}
        width="48%"
      >
        <Form
          layout="vertical"
          form={contactForm}
          onFinish={onSubmitContact}
          className="grid grid-cols-2 gap-2"
        >
          <Form.Item
            label="Unit"
            name="companyUnitId"
            rules={[
              {
                required: true,
                message: "please select unit.",
              },
            ]}
          >
            <Select
              showSearch
              allowClear
              options={units}
              fieldNames={{ label: "unitName", value: "id" }}
              placeholder="Select unit"
            />
          </Form.Item>
          <Form.Item label="Title" name="title">
            <Select
              allowClear
              placeholder="Select title"
              options={[
                { label: "Mr", value: "mr" },
                { label: "Mrs", value: "mrs" },
                { label: "Ms", value: "ms" },
                { label: "Dr", value: "dr" },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input placeholder="Name" />
          </Form.Item>

          <Form.Item label="Email" name="emails">
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item label="Contact No" name="contactNo">
            <Input
              placeholder="Contact Number"
              maxLength={10}
              onChange={(e) => {
                contactForm.setFieldsValue({
                  contactNo: allowOnlyNumbers(e.target.value),
                });
              }}
            />
          </Form.Item>

          <Form.Item label="Whatsapp No" name="whatsappNo">
            <Input
              placeholder="Whatsapp Number"
              maxLength={10}
              onChange={(e) => {
                contactForm.setFieldsValue({
                  whatsappNo: allowOnlyNumbers(e.target.value),
                });
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CompanyAndUnitsInLead;
