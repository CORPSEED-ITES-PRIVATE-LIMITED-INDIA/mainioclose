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
import { Building, EllipsisVertical, Link, Pencil, Plus } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createContactViaEstimateInCompany,
  getAllCitiesByStateName,
  getAllCountries,
  getAllStatesByCountryName,
  updateContactViaEstimateInCompany,
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
  const selectedUnitGstTypeId = Form.useWatch("gstTypeId", unitForm);

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
  const [isInitializingUnit, setIsInitializingUnit] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const iconClass = "w-4 h-4 text-gray-500";

  const normalizeName = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

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

  const selectedUnitGstTypeName = useMemo(() => {
    return (
      gstTypeList.find(
        (item) => String(item?.id) === String(selectedUnitGstTypeId),
      )?.name || ""
    );
  }, [gstTypeList, selectedUnitGstTypeId]);

  const isInternationalGstType =
    normalizeName(selectedUnitGstTypeName) === "international";

  const isNonIndiaUnitCountry =
    selectedUnitCountry && normalizeName(selectedUnitCountry) !== "india";

  const resetUnitModalState = () => {
    setEditingUnit(null);
    setIsGstMandatory(false);
    unitForm.resetFields();
  };

  const resetContactModalState = () => {
    setEditingContact(null);
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
      leadData?.proposalStatus === "INITIATED" ||
      leadData?.proposalStatus === "DRAFT" ||
      leadData?.proposalSendOrNot
    ) {
      addToast({
        title: "RESTRICTED",
        description: `You are not required perform any action before approval ${
          leadData?.proposalSendOrNot ? ", sent to the client" : ""
        } or Draft or initiation of proposal.`,
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

  const getGstTypeIdByName = (name) => {
    return gstTypeList?.find(
      (item) => normalizeName(item?.name) === normalizeName(name),
    )?.id;
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
    if (editingUnit?.id) {
      return ["Registered", "Unregistered", "SEZ", "International"];
    }

    if (!units || units.length === 0) {
      return ["Registered", "Unregistered", "SEZ", "International"];
    }

    const getName = (unit) =>
      String(getGstTypeName(unit) || "")
        .trim()
        .toLowerCase();

    const firstType = getName(units[0]);

    if (firstType === "international") {
      return ["International"];
    }

    if (firstType === "registered") {
      return ["Registered", "SEZ"];
    }

    if (firstType === "unregistered") {
      return ["Unregistered", "SEZ"];
    }

    if (firstType === "sez") {
      const hasRegistered = units.some(
        (unit) => getName(unit) === "registered",
      );
      const hasUnregistered = units.some(
        (unit) => getName(unit) === "unregistered",
      );

      if (hasRegistered) return ["Registered", "SEZ"];
      if (hasUnregistered) return ["Unregistered", "SEZ"];

      return ["Registered", "Unregistered", "SEZ"];
    }

    return ["Registered", "Unregistered", "SEZ", "International"];
  }, [units, editingUnit, gstTypeList]);

  const filteredGstTypeList = useMemo(() => {
    return gstTypeList.filter((item) =>
      allowedGstTypeNames.some(
        (name) => normalizeName(name) === normalizeName(item?.name),
      ),
    );
  }, [gstTypeList, allowedGstTypeNames]);

  const openAddUnitModal = () => {
    if (!validateCompanySelected()) return;

    if (
      leadData?.proposalStatus === "APPROVED" ||
      leadData?.proposalStatus === "INITIATED" ||
      leadData?.proposalStatus === "DRAFT"
    ) {
      addToast({
        title: "RESTRICTED",
        description:
          "You are not required perform any action before approval or Draft or initiation of proposal.",
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

    const internationalId = getGstTypeIdByName("International");

    if (
      allowedGstTypeNames.length === 1 &&
      allowedGstTypeNames[0] === "International"
    ) {
      setIsGstMandatory(false);

      unitForm.setFieldsValue({
        unitName: "",
        companyTypeId: undefined,
        gstTypeId: internationalId,
        gstNo: "",
        address: "",
        country: undefined,
        state: undefined,
        city: undefined,
        pinCode: "",
      });
    } else {
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
    }

    setUnitModal(true);
  };

  const openEditUnitModal = async (unit) => {
    if (
      leadData?.proposalStatus === "APPROVED" ||
      leadData?.proposalStatus === "INITIATED" ||
      leadData?.proposalStatus === "DRAFT"
    ) {
      addToast({
        title: "RESTRICTED",
        description:
          "You are not required perform any action before approval or Draft or initiation of proposal.",
        color: "danger",
      });
      return;
    }

    setEditingUnit(unit);
    setIsInitializingUnit(true);
    setUnitModal(true);

    const country = unit?.country || "India";
    const state = unit?.state || "";
    const city = unit?.city || "";

    const gstTypeId = unit?.gstTypeId || unit?.gstRegistrationTypeId;

    const selectedGstType = gstTypeList?.find(
      (item) => String(item?.id) === String(gstTypeId),
    );

    setIsGstMandatory(
      selectedGstType?.name === "Registered" || selectedGstType?.name === "SEZ",
    );

    if (country) {
      await dispatch(getAllStatesByCountryName(country));
    }

    if (state) {
      await dispatch(getAllCitiesByStateName(state));
    }

    unitForm.setFieldsValue({
      unitName: unit?.unitName || "",
      companyTypeId: unit?.companyTypeId,
      gstTypeId,
      gstNo: unit?.gstNo || "",
      address: unit?.addressLine1 || unit?.address || "",
      country,
      state,
      city,
      pinCode: unit?.pinCode || "",
    });

    setTimeout(() => {
      setIsInitializingUnit(false);
    }, 300);
  };

  const openAddContactModal = () => {
    if (!validateCompanySelected()) return;

    if (
      leadData?.proposalStatus === "APPROVED" ||
      leadData?.proposalStatus === "INITIATED" ||
      leadData?.proposalStatus === "DRAFT"
    ) {
      addToast({
        title: "RESTRICTED",
        description:
          "You are not required perform any action before approval or Draft or initiation of proposal.",
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

  const openEditContactModal = (contact, unitId) => {
    if (
      leadData?.proposalStatus === "APPROVED" ||
      leadData?.proposalStatus === "INITIATED" ||
      leadData?.proposalStatus === "DRAFT"
    ) {
      addToast({
        title: "RESTRICTED",
        description:
          "You are not required perform any action before approval or Draft or initiation of proposal.",
        color: "danger",
      });
      return;
    }

    setEditingContact(contact);

    contactForm.setFieldsValue({
      title: contact?.title || "",
      name: contact?.name || "",
      emails: contact?.emails || "",
      contactNo: contact?.contactNo || "",
      whatsappNo: contact?.whatsappNo || "",
      clientDesignationId: contact?.clientDesignationId || "",
      companyUnitId: contact?.companyUnitId || unitId || selectedUnitId,
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

            dispatch(
              linkCompanyAndUnitsWithLead({
                companyId: resp?.payload?.id,
                leadId,
                unitId: resp?.payload?.units?.[0]?.id,
                userId,
              }),
            ).then((linkRes) => {
              if (linkRes?.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Company and unit linked successfully.",
                  color: "success",
                });
              } else {
                addToast({
                  title: "ERROR",
                  description:
                    linkRes?.payload?.message ||
                    "Company and Units not linked to Lead !.",
                  color: "danger",
                });
              }
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
              title: "SUCCESS",
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
              if (linkRes?.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Company and unit linked successfully.",
                  color: "success",
                });
              } else {
                addToast({
                  title: "ERROR",
                  description:
                    linkRes?.payload?.message ||
                    "Company and Units not linked to Lead !.",
                  color: "danger",
                });
              }
            });
          } else {
            api.error({
              title: "ERROR",
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

    const isCountryNonIndia =
      values?.country && normalizeName(values.country) !== "india";

    if (
      selectedGstType?.name &&
      !isCountryNonIndia &&
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

    const selectedGstTypeName = String(selectedGstType?.name || "")
      .trim()
      .toLowerCase();

    if (isCountryNonIndia) {
      payload.gstTypeId = getGstTypeIdByName("International");
      payload.gstNo = "";
    } else if (selectedGstTypeName !== "registered") {
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

            dispatch(
              linkCompanyAndUnitsWithLead({
                companyId: editingUnit?.companyId || effectiveCompany?.id,
                leadId,
                unitId: editingUnit?.id,
                userId,
              }),
            ).then((linkRes) => {
              if (linkRes?.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Company and unit linked successfully.",
                  color: "success",
                });
              } else {
                addToast({
                  title: "ERROR",
                  description:
                    linkRes?.payload?.message ||
                    "Company and Units not linked to Lead !.",
                  color: "danger",
                });
              }
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
            api.error({
              title: "ERROR",
              description:
                resp?.payload?.data?.message ||
                resp?.payload?.message ||
                "Failed to update unit",
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

            dispatch(
              linkCompanyAndUnitsWithLead({
                companyId: effectiveCompany?.id,
                leadId,
                unitId: newUnit?.id,
                userId,
              }),
            ).then((linkRes) => {
              if (linkRes?.meta.requestStatus === "fulfilled") {
                addToast({
                  title: "Company and unit linked successfully.",
                  color: "success",
                });
              } else {
                addToast({
                  title: "ERROR",
                  description:
                    linkRes?.payload?.message ||
                    "Company and Units not linked to Lead !.",
                  color: "danger",
                });
              }
            });

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
            api.error({
              title: "ERROR",
              description:
                resp?.payload?.data?.message ||
                resp?.payload?.message ||
                "Failed to create unit",
            });
          }
        })
        .catch(() =>
          api.error({
            title: "ERROR",
            description: "Something went wrong !.",
          }),
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

    const action = editingContact?.id
      ? updateContactViaEstimateInCompany({
          id: editingContact.id,
          userId,
          data: payload,
        })
      : createContactViaEstimateInCompany(payload);

    dispatch(action)
      .then((resp) => {
        if (resp?.meta?.requestStatus === "fulfilled") {
          addToast({
            title: editingContact?.id
              ? "Contact details updated successfully."
              : "Contact details saved.",
            color: "success",
          });

          const savedContact = resp?.payload;

          setContactModal(false);
          resetContactModalState();

          setSelectedContactId(savedContact?.id || null);
          setSelectedContactDetail(savedContact || null);

          companyForm.setFieldsValue({
            existingContactId: savedContact?.id,
          });

          if (selectedCompanyId) {
            refreshSelectedCompanyRelatedData(selectedCompanyId);
          } else {
            refreshLeadCompanyAndUnits();
          }
        } else {
          api.error({
            title: "ERROR",
            description:
              resp?.payload?.message ||
              resp?.payload?.data?.message ||
              resp?.payload ||
              "Failed to save contact",
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

  const handleUnitCountryChange = (value) => {
    const internationalId = getGstTypeIdByName("International");

    unitForm.setFieldsValue({
      country: value,
      state: undefined,
      city: undefined,
    });

    if (!value) return;

    if (normalizeName(value) !== "india") {
      unitForm.setFieldsValue({
        gstTypeId: internationalId,
        gstNo: "",
        state: undefined,
        city: undefined,
      });

      setIsGstMandatory(false);
      dispatch(getAllStatesByCountryName(value));
      return;
    }

    dispatch(getAllStatesByCountryName(value));
  };

  const handleUnitGstTypeChange = (value) => {
    if (isInitializingUnit) return;

    const selectedGstType = gstTypeList.find(
      (item) => String(item?.id) === String(value),
    );

    const gstTypeName = String(selectedGstType?.name || "")
      .trim()
      .toLowerCase();

    const isRegistered = gstTypeName === "registered";

    setIsGstMandatory(isRegistered);

    unitForm.setFieldsValue({
      gstTypeId: value,
      gstNo: isRegistered ? unitForm.getFieldValue("gstNo") : "",
      country: gstTypeName === "international" ? undefined : "India",
      state: undefined,
      city: undefined,
      pinCode: undefined,
    });

    if (gstTypeName !== "international") {
      dispatch(getAllStatesByCountryName("India"));
    }
  };

  useEffect(() => {
    if (!unitModal) return;

    if (
      allowedGstTypeNames.length === 1 &&
      allowedGstTypeNames[0] === "International"
    ) {
      const internationalId = getGstTypeIdByName("International");

      if (internationalId) {
        unitForm.setFieldsValue({
          gstTypeId: internationalId,
          gstNo: "",
        });

        setIsGstMandatory(false);
      }
    }
  }, [unitModal, allowedGstTypeNames, gstTypeList, unitForm]);

  return (
    <>
      {contextHolder}

      <Card className="my-2 overflow-hidden">
        <CardHeader className="px-4 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Building className={iconClass} />
              <p className="truncate text-sm font-medium">Company detail</p>
            </div>

            <Button
              size="sm"
              isIconOnly
              variant="light"
              className="h-6 w-6 shrink-0 rounded-full bg-none"
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

        <CardBody className="max-h-[300px] overflow-y-auto overflow-x-hidden px-4 py-3">
          <div className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-2 text-sm break-words">
            <div className="min-w-0">
              <p className="break-words font-medium text-gray-900">
                {effectiveCompany?.name || "NA"}
              </p>
            </div>

            <p className="min-w-0 break-words text-gray-500">
              <span className="font-medium text-gray-700">PAN:</span>{" "}
              {effectiveCompany?.panNo || "NA"}
            </p>

            <p className="min-w-0 break-words text-gray-500">
              <span className="font-medium text-gray-700">Company Type:</span>{" "}
              {effectiveCompany?.companyTypeName ||
                effectiveCompany?.companyType ||
                "NA"}
            </p>

            <p className="min-w-0 break-words text-gray-500">
              <span className="font-medium text-gray-700">Address:</span>{" "}
              {effectiveCompany?.address || "NA"}
            </p>

            <p className="min-w-0 break-words text-gray-500">
              <span className="font-medium text-gray-700">Location:</span>{" "}
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

      <Card className="my-2 overflow-hidden">
        <CardHeader className="px-4 py-3">
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Building className={iconClass} />
              <p className="truncate text-sm font-medium">
                Company unit detail
              </p>
            </div>

            <Button
              size="sm"
              variant="light"
              isIconOnly
              className="shrink-0"
              onPress={openAddUnitModal}
            >
              <Plus className={iconClass} />
            </Button>
          </div>
        </CardHeader>

        <CardBody className="max-h-[500px] overflow-y-auto overflow-x-hidden px-4 py-3">
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
                    className={`min-w-0 overflow-hidden rounded-lg border bg-white p-3 shadow-sm ${
                      isSelected ? "border-blue-500 ring-1 ring-blue-200" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 break-words font-medium text-gray-900">
                        {[unit?.unitName, unit?.unitType].join(" - ")}
                      </p>

                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={() => handleSelectUnit(unit?.id)}
                        >
                          <Link className={iconClass} />
                        </Button>

                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={() => openEditUnitModal(unit)}
                        >
                          <Pencil className={iconClass} />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 grid min-w-0 grid-cols-1 gap-x-4 gap-y-2 text-sm md:grid-cols-2">
                      <p className="min-w-0 break-words text-gray-500">
                        <span className="font-medium text-gray-700">
                          GST No:
                        </span>{" "}
                        {unit?.gstNo || "NA"}
                      </p>

                      <p className="min-w-0 break-words text-gray-500 md:col-span-2">
                        <span className="font-medium text-gray-700">
                          GST Type:
                        </span>{" "}
                        {unit?.gstTypeName ||
                          unit?.gstType ||
                          unit?.gstRegistrationTypeName ||
                          "NA"}
                      </p>

                      <p className="min-w-0 break-words text-gray-500">
                        <span className="font-medium text-gray-700">
                          Pin Code:
                        </span>{" "}
                        {unit?.pinCode || "NA"}
                      </p>

                      <p className="min-w-0 break-words text-gray-500 md:col-span-2">
                        <span className="font-medium text-gray-700">
                          Address:
                        </span>{" "}
                        {unit?.addressLine1 || unit?.address || "NA"}
                      </p>

                      <p className="min-w-0 break-words text-gray-500 md:col-span-2">
                        <span className="font-medium text-gray-700">
                          Location:
                        </span>{" "}
                        {unit?.city || "NA"}, {unit?.state || "NA"},{" "}
                        {unit?.country || "NA"}
                      </p>

                      <div className="mt-2 min-w-0 rounded-lg border border-gray-100 bg-gray-50 p-3 md:col-span-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="mb-2 min-w-0 truncate text-sm font-semibold text-gray-700">
                            Contact detail
                          </p>

                          <div className="mb-2 flex shrink-0 justify-end">
                            <Button
                              size="sm"
                              variant="light"
                              isIconOnly
                              onPress={openAddContactModal}
                            >
                              <Plus className={iconClass} />
                            </Button>
                          </div>
                        </div>

                        {displayContact ? (
                          <div className="grid min-w-0 grid-cols-1 gap-x-4 gap-y-2 text-sm">
                            <div className="flex min-w-0 items-start justify-between gap-3">
                              <p className="min-w-0 break-words text-gray-500">
                                <span className="font-medium text-gray-700">
                                  Name:
                                </span>{" "}
                                {displayContact?.name || "NA"}
                              </p>

                              <Button
                                size="sm"
                                variant="light"
                                isIconOnly
                                className="shrink-0"
                                onPress={() =>
                                  openEditContactModal(displayContact, unit?.id)
                                }
                              >
                                <Pencil className={iconClass} />
                              </Button>
                            </div>

                            <p className="min-w-0 break-words text-gray-500">
                              <span className="font-medium text-gray-700">
                                Email:
                              </span>{" "}
                              {displayContact?.emails || "NA"}
                            </p>

                            <p className="min-w-0 break-words text-gray-500">
                              <span className="font-medium text-gray-700">
                                Contact No:
                              </span>{" "}
                              {displayContact?.contactNo || "NA"}
                            </p>

                            <p className="min-w-0 break-words text-gray-500">
                              <span className="font-medium text-gray-700">
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
        width="min(96vw, 900px)"
      >
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="break-words text-sm font-medium text-gray-800">
              Use Existing Company / Unit / Contact
            </p>

            <p className="break-words text-xs text-gray-500">
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
          className="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-2"
        >
          {useExistingSelection ? (
            <>
              <Form.Item
                label="Select Company"
                name="existingCompanyId"
                rules={[{ required: true, message: "Please select company" }]}
                className="md:col-span-2"
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
                <div className="mt-2 flex min-w-0 flex-wrap gap-2 md:col-span-2">
                  {selectedCompanyId && (
                    <span className="max-w-full break-words rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                      Company: {effectiveCompany?.name || "Selected"}
                    </span>
                  )}

                  {selectedUnitId && (
                    <span className="max-w-full break-words rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
                      Unit: {selectedUnitDetail?.unitName || "Selected"}
                    </span>
                  )}

                  {selectedContactId && (
                    <span className="max-w-full break-words rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
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

              <Form.Item label="Company Structure" name="companyTypeId">
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
              >
                <Input placeholder="PAN Number" maxLength={10} />
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

              <Form.Item label="State" name="state">
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
        width="min(96vw, 900px)"
      >
        <Form
          layout="vertical"
          form={unitForm}
          onFinish={onSubmitUnit}
          className="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-2"
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
              allowClear={
                allowedGstTypeNames.length > 1 && !isNonIndiaUnitCountry
              }
              options={filteredGstTypeList}
              fieldNames={{ label: "name", value: "id" }}
              placeholder="Select GST Type"
              disabled={
                allowedGstTypeNames.length === 1 || isNonIndiaUnitCountry
              }
              onChange={handleUnitGstTypeChange}
            />
          </Form.Item>

          <Form.Item
            label="GST Number"
            name="gstNo"
            getValueFromEvent={(e) => formatGSTInput(e.target.value)}
            disabled={
              !["registered", "sez"].includes(
                String(selectedUnitGstTypeName || "")
                  .trim()
                  .toLowerCase(),
              )
            }
            rules={[
              {
                required:
                  String(selectedUnitGstTypeName || "")
                    .trim()
                    .toLowerCase() === "registered",
                message: "Please enter GST number",
              },
              () => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  return validateGST(_, value);
                },
              }),
            ]}
          >
            <Input
              placeholder="GST Number"
              maxLength={15}
              disabled={
                String(selectedUnitGstTypeName || "")
                  .trim()
                  .toLowerCase() !== "registered"
              }
            />
          </Form.Item>

          <Form.Item label="Address" name="address">
            <Input placeholder="Address" />
          </Form.Item>

          <Form.Item label="Country" name="country">
            <Select
              showSearch
              allowClear={isInternationalGstType}
              disabled={!isInternationalGstType}
              options={
                isInternationalGstType
                  ? countryList?.filter((country) => country?.name !== "India")
                  : countryList
              }
              fieldNames={{ label: "name", value: "name" }}
              onChange={handleUnitCountryChange}
            />
          </Form.Item>

          <Form.Item label="State" name="state">
            <Select
              showSearch
              allowClear
              optionFilterProp="name"
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
              optionFilterProp="name"
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
        width="min(96vw, 900px)"
      >
        <Form
          layout="vertical"
          form={contactForm}
          onFinish={onSubmitContact}
          className="grid grid-cols-1 gap-x-4 gap-y-1 md:grid-cols-2"
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
