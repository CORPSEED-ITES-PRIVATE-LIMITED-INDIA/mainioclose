import { useEffect, useMemo, useState } from "react";
import template from "../../assets/template.png";
import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  Check,
  ExternalLink,
  FolderOpen,
  Layers,
  Plus,
  Search,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import {
  cancelProposal,
  editLeadPropposal,
  getAllProposalByLeadId,
  getSingleLeadDataByLeadId,
  sendProposal,
  sendProposalToManager,
} from "../../toolkit/slices/leadSlice";
import {
  getAllPaymentTermList,
  getAllSolutionList,
  getServiceBrouchersServiceDetailBySolutionId,
  getSolutionDetailByName,
  getSolutionPriceListById,
} from "../../toolkit/slices/settingSlice";
import dayjs from "dayjs";
import ServiceFormFieldsDetail from "../leads/leadEstimate/ServiceFormFieldsDetail";
import { Form, Input as AntInput, Select } from "antd";
import {
  getBasicCompanyDetails,
  getGstListByCompanyId,
} from "../../toolkit/slices/companySlice";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getEstimatesByLeadId } from "../../toolkit/slices/accountSlice";
import NewTextEditor from "../../components/NewTextEditor";

const defaultValues = {
  mailTo: [],
  mailCc: [],
  mailBcc: [],
  emailSubject: "",
  paymentTerm: "",
  paymentTermDescription: "",
  emailBody: "<p></p>",
  scopeOfWork: "<p></p>",
};

const PAYMENT_TERM_OPTIONS = [
  {
    label: "100% Advance",
    value: "FULL_ADVANCE",
  },
  {
    label: "50% Advance + 50% Before Delivery",
    value: "FIFTY_ADVANCE_FIFTY_BEFORE_DELIVERY",
  },
  {
    label: "Milestone Based Payment",
    value: "MILESTONE_BASED",
  },
  {
    label: "Payment After Completion",
    value: "PAYMENT_AFTER_COMPLETION",
  },
  {
    label: "Custom Payment Terms",
    value: "CUSTOM",
  },
];

export function TagsInput({
  value = [],
  onChange,
  placeholder = "",
  className = "",
  inputClassName = "",
  lockedValues = [],
}) {
  const [inputValue, setInputValue] = useState("");

  const normalizeEmail = (email) =>
    String(email || "")
      .trim()
      .toLowerCase();

  const isLocked = (tag) =>
    lockedValues.some(
      (lockedEmail) => normalizeEmail(lockedEmail) === normalizeEmail(tag),
    );

  const safeOnChange = (nextValue = []) => {
    const finalValue = [
      ...lockedValues,
      ...nextValue.filter((email) => !isLocked(email)),
    ].filter(Boolean);

    const uniqueValue = [...new Set(finalValue)];

    onChange(uniqueValue);
  };

  const addTag = (val) => {
    const trimmed = val.trim();

    if (!trimmed) return;

    if (
      !value.some((email) => normalizeEmail(email) === normalizeEmail(trimmed))
    ) {
      safeOnChange([...value, trimmed]);
    }

    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (["Enter", " ", ","].includes(e.key)) {
      e.preventDefault();
      addTag(inputValue);
      return;
    }

    // IMPORTANT:
    // Do not remove email tags using Backspace.
    // Locked/default emails must never be removed accidentally.
    if (e.key === "Backspace" && inputValue === "") {
      e.preventDefault();
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 bg-white border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:bg-zinc-900 dark:border-zinc-700 ${className}`}
    >
      {value.map((tag, index) => (
        <div
          key={index}
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
            isLocked(tag)
              ? "bg-gray-100 text-gray-700 border border-gray-300"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {tag}

          {!isLocked(tag) && (
            <button
              type="button"
              onClick={() => safeOnChange(value.filter((_, i) => i !== index))}
              className="cursor-pointer font-medium text-blue-600 hover:text-red-500"
            >
              ×
            </button>
          )}
        </div>
      ))}

      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue)}
        placeholder={placeholder}
        className={`flex-1 min-w-[180px] border-none outline-none text-sm bg-transparent text-gray-900 placeholder-gray-400 ${inputClassName}`}
      />
    </div>
  );
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmailArray = (required = false) => ({
  validator: (_, value = []) => {
    if (required && (!Array.isArray(value) || value.length === 0)) {
      return Promise.reject(new Error("Please enter at least one valid email"));
    }

    if (Array.isArray(value) && value.length > 0) {
      const invalidEmail = value.find((email) => !emailRegex.test(email));

      if (invalidEmail) {
        return Promise.reject(new Error(`Invalid email: ${invalidEmail}`));
      }
    }

    return Promise.resolve();
  },
});

const getPlainTextLength = (html = "") =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim().length;

const Proposal = () => {
  const dispatch = useDispatch();
  const { userId, leadId } = useParams();

  const templateList = useSelector((state) => state.leads.templateList);
  const brochureList = useSelector((state) => state.leads.brochureList);
  const allProposal = useSelector((state) => state.leads.proposalListByLeadId);
  const leadData = useSelector((state) => state.leads.singleLeadData);
  const userDetail = useSelector((state) => state.auth.currentUser);
  const estimateList = useSelector((state) => state.account.estimateList);
  const solutionDetail = useSelector(
    (state) => state.setting.solutionDetailById,
  );
  const serviceFeeList = useSelector(
    (state) => state.setting.solutionPriceList,
  );
  const serviceBrouchersDetail = useSelector(
    (state) => state.setting.serviceBrouchersDetail,
  );
  const company = useSelector((state) => state.company.basicCompanyDetail);
  const companyGstList = useSelector((state) => state.company.companyGstList);
  const paymentTerms = useSelector((state) => state.setting.paymentTermList);

  const [proposalAntForm] = Form.useForm();

  const [templates, setTemplates] = useState([]);
  const [data, setData] = useState("<h2>Your proposal </h2>");
  const [mailBody, setMailBody] = useState("<h2>Your email body</h2>");
  const [editProposal, setEditProposal] = useState(false);
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [proposalToCancel, setProposalToCancel] = useState(null);
  const [statusLoading, setStatusLoading] = useState("");
  const [lockedMailTo, setLockedMailTo] = useState([]);
  const [pendingSubmitValues, setPendingSubmitValues] = useState(null);

  const templateModal = useDisclosure();
  const brochureModal = useDisclosure();
  const cancelModal = useDisclosure();
  const proposalViewModal = useDisclosure();
  const proposalFormModal = useDisclosure();
  const submitConfirmModal = useDisclosure();

  const proposalList = useMemo(() => {
    if (Array.isArray(allProposal)) return allProposal;

    if (Array.isArray(allProposal?.data)) return allProposal.data;

    if (Array.isArray(allProposal?.data?.data)) return allProposal.data.data;

    if (Array.isArray(allProposal?.data?.content))
      return allProposal.data.content;

    if (Array.isArray(allProposal?.content)) return allProposal.content;

    if (Array.isArray(allProposal?.response)) return allProposal.response;

    if (Array.isArray(allProposal?.proposalList))
      return allProposal.proposalList;

    return [];
  }, [allProposal]);

  const companyGstUnitList = useMemo(() => {
    if (Array.isArray(companyGstList)) return companyGstList;

    if (Array.isArray(companyGstList?.data)) return companyGstList.data;

    if (Array.isArray(companyGstList?.content)) return companyGstList.content;

    if (Array.isArray(companyGstList?.response)) return companyGstList.response;

    return [];
  }, [companyGstList]);

  const latestEstimate = useMemo(() => {
    if (!Array.isArray(estimateList) || estimateList.length === 0) return null;

    return [...estimateList].sort((a, b) => {
      const dateA = dayjs(
        a?.createdAt ||
          a?.updatedAt ||
          a?.estimateDate ||
          a?.createdDate ||
          a?.createDate,
      ).valueOf();

      const dateB = dayjs(
        b?.createdAt ||
          b?.updatedAt ||
          b?.estimateDate ||
          b?.createdDate ||
          b?.createDate,
      ).valueOf();

      if (dateB !== dateA) return dateB - dateA;

      return Number(b?.id || 0) - Number(a?.id || 0);
    })[0];
  }, [estimateList]);

  const isLatestEstimateRejected =
    latestEstimate?.status?.toUpperCase() === "REJECTED";

  const getBrochureIds = (items = []) =>
    items
      .map((item) => (typeof item === "object" ? item.id : item))
      .filter(Boolean);

  const isProposalAlreadyClosed = (status) =>
    ["CANCELLED", "INITIATED"].includes(status?.toUpperCase());

  useEffect(() => {
    dispatch(getAllPaymentTermList());
    dispatch(getAllProposalByLeadId(leadId));
    dispatch(getAllSolutionList(userId));
    dispatch(getEstimatesByLeadId(leadId));
  }, [dispatch, leadId, userId]);

  useEffect(() => {
    setTemplates(templateList);
  }, [templateList]);

  useEffect(() => {
    dispatch(getBasicCompanyDetails({ leadId, userId }));
    dispatch(getSingleLeadDataByLeadId({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        if (resp?.payload?.clients?.length > 0) {
          proposalAntForm.setFieldsValue({
            mailTo: resp.payload.clients
              .map((client) => client.emails)
              .filter(Boolean),
          });
        }

        if (resp?.payload?.originalName) {
          dispatch(
            getSolutionDetailByName({
              name: resp.payload.originalName,
              userId,
            }),
          ).then((res) => {
            if (res.meta.requestStatus === "fulfilled") {
              dispatch(
                getSolutionPriceListById({
                  solutionId: res?.payload?.id,
                  userId,
                }),
              );
              if (res?.payload?.id) {
                dispatch(
                  getServiceBrouchersServiceDetailBySolutionId(
                    res?.payload?.id,
                  ),
                );
              }
              proposalAntForm.setFieldsValue({
                emailSubject: `Corpseed Proposal for - ${res?.payload?.name}`,
              });
            }
          });
        }
      }
    });
  }, [dispatch, leadId, userId]);

  useEffect(() => {
    if (!company?.id) return;

    dispatch(getGstListByCompanyId(company.id));
  }, [dispatch, company?.id]);

  useEffect(() => {
    if (
      !isCreatingProposal &&
      !editProposal &&
      proposalList.length > 0 &&
      !selectedProposal
    ) {
      setSelectedProposal(proposalList[0]);
    }
  }, [proposalList, selectedProposal, isCreatingProposal, editProposal]);

  useEffect(() => {
    if (!serviceBrouchersDetail) return;

    const emailTemplate = serviceBrouchersDetail?.solution?.emailTemplate;

    const apiMailBody = emailTemplate?.emailBody || "<p></p>";
    const apiScopeOfWork = emailTemplate?.scopeOfWork || "<p></p>";
    const apiSubject = emailTemplate?.emailSubject || "";

    setMailBody(apiMailBody);
    setData(apiScopeOfWork);

    const currentSubject = proposalAntForm.getFieldValue("emailSubject");

    proposalAntForm.setFieldsValue({
      emailSubject: apiSubject || currentSubject || "",
      emailBody: apiMailBody,
      scopeOfWork: apiScopeOfWork,
    });
  }, [serviceBrouchersDetail, proposalAntForm]);

  const loadProposalInForm = (proposal) => {
    const emailTemplate = serviceBrouchersDetail?.solution?.emailTemplate;

    const finalMailBody =
      proposal?.mailBody || emailTemplate?.emailBody || "<p></p>";

    const finalScopeOfWork =
      proposal?.scopeOfWork ||
      proposal?.template ||
      emailTemplate?.scopeOfWork ||
      "<p></p>";

    setData(finalScopeOfWork);
    setMailBody(finalMailBody);

    const existingMailTo = proposal?.mailTo || [];

    setLockedMailTo(existingMailTo);

    proposalAntForm.setFieldsValue({
      mailTo: proposal?.mailTo || [],
      mailCc: proposal?.mailCc || [],
      mailBcc: proposal?.mailBcc || [],
      emailSubject: proposal?.emailSubject || "",
      paymentTerm: proposal?.paymentTerm || "",
      paymentTermDescription: proposal?.paymentTermDescription || "",
      emailBody: finalMailBody,
      scopeOfWork: finalScopeOfWork,
    });
  };

  const handleViewProposal = (proposal) => {
    setSelectedProposal(proposal);
    setIsCreatingProposal(false);
    setEditProposal(false);
    proposalViewModal.onOpen();
  };

  const prepareCreateProposal = () => {
    if (!company?.id) {
      addToast({
        title: "RESTRICTED",
        description: "Please add company first !.",
        color: "danger",
      });
      return;
    }

    const hasNonCancelled = proposalList.some((item) =>
      ["REJECTED", "APPROVED", "INITIATED", "DRAFT"].includes(
        item?.status?.toUpperCase(),
      ),
    );

    if (hasNonCancelled) {
      addToast({
        title: "RESTRICTED",
        description: "Please cancel the existing proposals !.",
        color: "danger",
      });
      return;
    }

    dispatch(getGstListByCompanyId(company.id));

    setIsCreatingProposal(true);
    setEditProposal(false);
    setSelectedProposal(null);

    proposalAntForm.resetFields();

    const existingMailTo =
      company?.units?.[0]?.unitContacts
        ?.map((client) => client.emails)
        .filter(Boolean) || [];

    const emailTemplate = serviceBrouchersDetail?.solution?.emailTemplate;

    const apiMailBody = emailTemplate?.emailBody || "<p></p>";
    const apiScopeOfWork = emailTemplate?.scopeOfWork || "<p></p>";
    const apiSubject = emailTemplate?.emailSubject || "";

    setLockedMailTo(existingMailTo);
    setMailBody(apiMailBody);
    setData(apiScopeOfWork);

    proposalAntForm.setFieldsValue({
      mailTo: existingMailTo,
      mailCc: [],
      mailBcc: [],
      emailSubject:
        apiSubject ||
        (solutionDetail?.name
          ? `Corpseed Proposal for - ${solutionDetail.name}`
          : ""),
      paymentTerm: "",
      paymentTermDescription: "",
      emailBody: apiMailBody,
      scopeOfWork: apiScopeOfWork,
    });

    proposalAntForm.setFields([
      { name: "emailBody", errors: [] },
      { name: "scopeOfWork", errors: [] },
    ]);

    proposalFormModal.onOpen();
  };

  const modifyTemplateHtml = (html, variables) => {
    if (!html) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const body = doc.body;

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;

    body.querySelectorAll("td, p, div").forEach((el) => {
      if (el.textContent.trim().startsWith("Date-")) {
        el.innerHTML = `Date- ${formattedDate}`;
      }
    });

    const tables = body.querySelectorAll("table");

    if (tables.length > 0) {
      const firstTable = tables[0];
      firstTable.removeAttribute("width");
      firstTable.style.width = "100%";
      firstTable.style.maxWidth = "100%";
      firstTable.style.minWidth = "100%";
      firstTable.style.margin = "0";
      firstTable.style.tableLayout = "fixed";
      firstTable.style.borderCollapse = "collapse";

      firstTable.querySelectorAll("tr, td, th").forEach((cell) => {
        cell.removeAttribute("width");
        cell.style.width = "auto";
        cell.style.maxWidth = "100%";
        cell.style.minWidth = "auto";
      });
    }

    let removeCount = 0;

    for (let i = body.children.length - 1; i >= 0; i--) {
      const el = body.children[i];

      if (["P", "DIV"].includes(el.tagName)) {
        body.removeChild(el);
        removeCount++;
      }

      if (removeCount >= 4) break;
    }

    const signatureDiv = doc.createElement("div");
    signatureDiv.style.textAlign = "right";
    signatureDiv.style.marginTop = "40px";

    signatureDiv.innerHTML = `
      <strong>Warm Regards,</strong><br/>
      ${variables.userName || ""}<br/>
      ${variables.userDesignation || ""}<br/>
      ${variables.userEmail || ""} ${variables.userPhone ? `| ${variables.userPhone}` : ""}<br/>
      <strong>Corpseed ITES Private Limited</strong>
    `;

    body.appendChild(signatureDiv);

    return body.innerHTML;
  };

  const handleSetData = (item) => {
    const isSameTemplateSelected = templateName === item?.name;

    if (isSameTemplateSelected) {
      setData("<h2>Your proposal </h2>");
      setMailBody("<h2>Your email body</h2>");

      proposalAntForm.setFieldsValue({
        template: "<h2>Your proposal </h2>",
        emailBody: "<h2>Your email body</h2>",
      });

      proposalAntForm.validateFields(["template", "emailBody"]);
      templateModal.onClose();
      return;
    }

    const variables = {
      userName: userDetail?.username || "",
      userDesignation: userDetail?.roles?.join(", ") || "",
      userPhone: userDetail?.phone || "",
      userEmail: userDetail?.email || "",
    };

    if (item.description) {
      const modifiedTemplate = modifyTemplateHtml(item.description, variables);
      setData(modifiedTemplate);

      proposalAntForm.setFieldsValue({
        template: modifiedTemplate,
      });

      proposalAntForm.validateFields(["template"]);
    }

    if (item.body) {
      setMailBody(item.body);

      proposalAntForm.setFieldsValue({
        emailBody: item.body,
      });

      proposalAntForm.validateFields(["emailBody"]);
    }
    templateModal.onClose();
  };

  const handleEditProposal = () => {
    loadProposalInForm(selectedProposal);
    setEditProposal(true);
    setIsCreatingProposal(false);
    proposalViewModal.onClose();
    proposalFormModal.onOpen();
  };

  const handleOpenCancelModal = (proposal) => {
    setProposalToCancel(proposal);
    setCancelReason("");
    cancelModal.onOpen();
  };

  const handleCancelProposal = () => {
    if (!cancelReason.trim()) {
      addToast({
        title: "Reason required",
        description: "Please enter cancellation reason.",
        color: "danger",
      });
      return;
    }

    dispatch(
      cancelProposal({
        userId,
        proposalId: proposalToCancel?.id,
        reason: encodeURIComponent(cancelReason.trim()),

        // send this to backend
        isProposalRejectedByClient: false,
      }),
    ).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        addToast({
          title: "SUCCESS",
          description: "Proposal cancelled successfully.",
          color: "success",
        });

        cancelModal.onClose();
        setProposalToCancel(null);
        setCancelReason("");
        setSelectedProposal(null);
        dispatch(getAllProposalByLeadId(leadId));
      } else {
        addToast({
          title: "Something went wrong",
          description:
            resp?.payload?.data?.message || "Unable to cancel proposal.",
          color: "danger",
        });
      }
    });
  };

  const getSelectedUnitName = () => {
    const selectedUnitId = company?.units?.[0]?.id;

    const unitFromGstList = selectedUnitId
      ? companyGstUnitList.find(
          (unit) => String(unit?.id) === String(selectedUnitId),
        )
      : null;

    const unit = unitFromGstList || companyGstUnitList?.[0];

    return (
      unit?.unitName ||
      unit?.name ||
      unit?.companyUnitName ||
      unit?.businessName ||
      "-"
    );
  };

  const getCompanyUnitsForWarning = () => {
    if (!Array.isArray(companyGstUnitList)) return [];

    return companyGstUnitList.map((unit, index) => {
      const unitName =
        unit?.unitName ||
        unit?.name ||
        unit?.companyUnitName ||
        unit?.businessName ||
        `Unit ${index + 1}`;

      const unitAddress = [
        unit?.addressLine1,
        unit?.addressLine2,
        unit?.city,
        unit?.state,
        unit?.country,
        unit?.pinCode,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        id: unit?.id || index,
        name: unitName,
        address: unitAddress || "Address not available",
        gstRegistrationTypeName: unit?.gstRegistrationTypeName || "-",
        status: unit?.status || "-",
        isSelected:
          company?.units?.[0]?.id &&
          String(unit?.id) === String(company?.units?.[0]?.id),
      };
    });
  };

  const handleProposalFormFinish = (values) => {
    setPendingSubmitValues(values);
    submitConfirmModal.onOpen();
  };

  const handleConfirmProposalSubmit = () => {
    if (!pendingSubmitValues) return;

    const valuesToSubmit = pendingSubmitValues;

    setPendingSubmitValues(null);
    submitConfirmModal.onClose();
    onSubmit(valuesToSubmit);
  };

  const onSubmit = (values) => {
    setStatusLoading("pending");

    if (serviceFeeList?.length === 0 || !serviceFeeList) {
      addToast({
        title: "RESTRICTED !.",
        description:
          "Service prices are not available. Please select a valid service.",
        color: "danger",
      });
      setStatusLoading("");
      return;
    }

    if (!company?.id || !company?.units?.[0]?.id) {
      addToast({
        title: "RESTRICTED",
        description:
          "Please add company and unit details before creating proposal.",
        color: "danger",
      });
      setStatusLoading("");
      return;
    }

    if (company?.units?.[0]?.unitContacts?.length === 0) {
      addToast({
        title: "RESTRICTED",
        description: "Please add contacts in company unit.",
        color: "danger",
      });
      setStatusLoading("");
      return;
    }

    if (!leadData?.originalName) {
      addToast({
        title: "RESTRICTED !.",
        description: "No slug has been selected for this lead service. !.",
        color: "danger",
      });
      setStatusLoading("");
      return;
    }

    const antValues = proposalAntForm.getFieldsValue();

    const finalValues = {
      leadId: Number(leadId),
      createdById: Number(userId),
      companyId: Number(company?.id),
      companyUnitId: Number(company?.units?.[0]?.id),
      contactId: Number(company?.units?.[0]?.unitContacts?.[0]?.id),
      solutionId: Number(solutionDetail?.id),
      emailSubject: values?.emailSubject || "",
      paymentTerm: values?.paymentTerm || "",
      paymentTermDescription: values?.paymentTermDescription || "",
      emailBody: values?.emailBody || "<p></p>",
      scopeOfWork: values?.scopeOfWork || "<p></p>",

      mailTo: Array.isArray(values?.mailTo) ? values.mailTo : [],
      mailCc: Array.isArray(values?.mailCc) ? values.mailCc : [],
      mailBcc: Array.isArray(values?.mailBcc) ? values.mailBcc : [],

      lineItems:
        antValues?.lineItems?.map((item) => ({
          sourceItemId: Number(item?.sourceItemId || 0),
          itemName: item?.itemName || "",
          description: item?.description || "",
          hsnSacCode: item?.hsnSacCode || "",
          quantity: Number(item?.quantity || 1),
          unit: item?.unit || "Nos",
          unitPriceExGst: Number(item?.unitPriceExGst || 0),
          gstRate: Number(item?.gstRate || 0),
          igstFlag: item?.igstFlag ?? true,
          categoryCode: item?.categoryCode || "",
          feeType: item?.feeType || "PROFESSIONAL_FEE",
        })) || [],
    };

    if (editProposal && selectedProposal?.id) {
      dispatch(
        editLeadPropposal({
          data: { id: selectedProposal.id, ...finalValues },
          userId,
        }),
      ).then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          setStatusLoading("success");

          addToast({
            title: "SUCCESS",
            description: "Proposal updated successfully.",
            color: "success",
          });

          proposalAntForm.resetFields();
          proposalAntForm.setFieldsValue(defaultValues);

          setLockedMailTo([]);
          setEditProposal(false);
          setSelectedProposal(null);
          setData("<p></p>");
          setMailBody("<p></p>");

          dispatch(getAllProposalByLeadId(leadId));
          proposalFormModal.onClose();
        } else {
          setStatusLoading("rejected");

          addToast({
            title: "Something went wrong !.",
            description:
              resp?.payload?.data?.message || "Unable to update proposal.",
            color: "danger",
          });
        }
      });
    } else {
      dispatch(sendProposal(finalValues)).then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          setStatusLoading("success");

          addToast({
            title: "SUCCESS",
            description: "Your proposal has been created successfully.",
            color: "success",
          });

          proposalAntForm.resetFields();
          proposalAntForm.setFieldsValue(defaultValues);

          setData("<p></p>");
          setMailBody("<p></p>");
          setIsCreatingProposal(false);

          dispatch(getAllProposalByLeadId(leadId));
          proposalFormModal.onClose();
        } else {
          setStatusLoading("rejected");

          addToast({
            title: resp?.payload?.data?.errorCode || "ERROR",
            description:
              resp?.payload?.data?.message || "Something went wrong.",
            color: "danger",
          });
        }
      });
    }
  };

  const handleProposalSendToManager = (proposal) => {
    setStatusLoading("pending");
    dispatch(sendProposalToManager({ proposalId: proposal.id, userId })).then(
      (resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          setStatusLoading("success");
          addToast({
            title: "SUCCESS",
            description: "Proposal sent to manager for review.",
            color: "success",
          });
          setSelectedProposal(null);
          dispatch(getAllProposalByLeadId(leadId));
        } else {
          setStatusLoading("rejected");
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      },
    );
  };

  const hasHtmlContent = (html = "") => {
    return (
      String(html || "")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim().length > 0
    );
  };

  const formatPreviewFileSize = (bytes) => {
    const size = Number(bytes || 0);

    if (!size) return "---";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatPreviewDate = (value) => {
    if (!value) return "---";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "---";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isImageBrochure = (brochure) => {
    return brochure?.contentType?.startsWith("image/");
  };

  const isPdfBrochure = (brochure) => {
    return brochure?.contentType === "application/pdf";
  };

  const getProposalBrochures = (proposal) => {
    return [
      {
        key: "menu",
        title: "Menu Brochure",
        name: proposal?.menu?.name,
        brochure: proposal?.menu?.brochure,
      },
      {
        key: "menuCategory",
        title: "Category Brochure",
        name: proposal?.menuCategory?.name,
        brochure: proposal?.menuCategory?.brochure,
      },
      {
        key: "subCategory",
        title: "Subcategory Brochure",
        name: proposal?.subCategory?.name,
        brochure: proposal?.subCategory?.brochure,
      },
      {
        key: "solution",
        title: "Service / Solution Brochure",
        name: proposal?.solution?.name,
        brochure: proposal?.solution?.brochure,
      },
    ];
  };

  const HtmlPreviewCard = ({ title, description, html, emptyText }) => {
    const hasContent = hasHtmlContent(html);

    return (
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="border-b bg-gray-50 px-5 py-3">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>

          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>

        <div className="p-5 md:p-6">
          {hasContent ? (
            <div
              className="proposal-content tiptap-preview force-preview-text"
              dangerouslySetInnerHTML={{
                __html: html,
              }}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-8 text-center">
              <p className="text-sm font-semibold text-gray-700">{emptyText}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const ProposalPdfPreview = ({ pdfUrl, pdfFileName }) => {
    return (
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-gray-50 px-5 py-3">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              Proposal PDF
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              {pdfFileName || "Generated proposal PDF"}
            </p>
          </div>

          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Open PDF <ExternalLink size={13} />
            </a>
          )}
        </div>

        {pdfUrl ? (
          <div className="bg-gray-100 p-3">
            <iframe
              src={pdfUrl}
              title={pdfFileName || "Proposal PDF"}
              className="h-[78vh] w-full rounded-lg border bg-white"
            />
          </div>
        ) : (
          <div className="p-5">
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
              <p className="text-sm font-semibold text-gray-700">
                No proposal PDF found
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ProposalBrochurePreviewCard = ({ title, name, brochure }) => {
    const hasBrochure = Boolean(brochure?.filePath);
    const isImage = isImageBrochure(brochure);
    const isPdf = isPdfBrochure(brochure);

    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{title}</p>

              <p className="mt-1 truncate text-xs text-gray-500">
                {name || "---"}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                hasBrochure
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 bg-gray-50 text-gray-500"
              }`}
            >
              {hasBrochure ? "Available" : "Not Added"}
            </span>
          </div>
        </div>

        <div className="p-4">
          {hasBrochure ? (
            <>
              <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                {isImage ? (
                  <img
                    src={brochure.filePath}
                    alt={brochure.fileName || title}
                    className="h-full w-full object-cover"
                  />
                ) : isPdf ? (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-red-50 text-center">
                    <p className="text-4xl">📄</p>
                    <p className="mt-2 text-xs font-semibold text-red-700">
                      PDF Document
                    </p>
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-center">
                    <p className="text-4xl">📎</p>
                    <p className="mt-2 text-xs font-semibold text-gray-600">
                      Attachment
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <p className="break-words">
                  <span className="font-semibold text-gray-900">File:</span>{" "}
                  {brochure.fileName || "---"}
                </p>

                <p>
                  <span className="font-semibold text-gray-900">Type:</span>{" "}
                  {brochure.contentType || "---"}
                </p>

                <p>
                  <span className="font-semibold text-gray-900">Size:</span>{" "}
                  {formatPreviewFileSize(brochure.fileSize)}
                </p>

                <p>
                  <span className="font-semibold text-gray-900">Uploaded:</span>{" "}
                  {formatPreviewDate(brochure.uploadedAt)}
                </p>

                <p className="break-words">
                  <span className="font-semibold text-gray-900">
                    Description:
                  </span>{" "}
                  {brochure.description || "---"}
                </p>
              </div>

              <a
                href={brochure.filePath}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                View Brochure <ExternalLink size={14} />
              </a>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm font-semibold text-gray-700">
                No brochure found
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Brochure is not available for this level.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProposalView = () => {
    const proposalBrochures = getProposalBrochures(selectedProposal);

    const emailBodyHtml =
      selectedProposal?.emailBody || selectedProposal?.mailBody || "";

    const scopeOfWorkHtml =
      selectedProposal?.scopeOfWork || selectedProposal?.template || "";

    const subject =
      selectedProposal?.emailSubject || selectedProposal?.mailSubject || "-";

    return (
      <div className="flex justify-center bg-gray-100 py-6 px-2">
        <div className="w-full max-w-6xl space-y-5">
          <div className="bg-white rounded-xl shadow border p-4 md:p-6 flex flex-col gap-4 relative">
            <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Proposal Overview
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {selectedProposal?.proposalNumber || "-"} •{" "}
                  {selectedProposal?.companyName || "-"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {selectedProposal?.pdfUrl && (
                  <a
                    href={selectedProposal.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Open PDF <ExternalLink size={13} />
                  </a>
                )}

                {selectedProposal?.status === "DRAFT" && (
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="flex items-center gap-2 shadow-sm"
                    onPress={handleEditProposal}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500">Service</p>
                <p className="font-semibold text-gray-800">
                  {selectedProposal?.solution?.name ||
                    selectedProposal?.solutionName ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Created By</p>
                <p className="font-medium text-gray-800">
                  {selectedProposal?.createdByName ||
                    selectedProposal?.createdByEmail ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Created Date</p>
                <p className="font-medium text-gray-800">
                  {selectedProposal?.createDate
                    ? dayjs(selectedProposal.createDate).format("DD-MM-YYYY")
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Status</p>
                <span
                  className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                    selectedProposal?.status === "CANCELLED" ||
                    selectedProposal?.status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {selectedProposal?.status || "-"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <p className="text-xs text-gray-500">Menu</p>
                <p className="font-medium text-gray-800">
                  {selectedProposal?.menu?.name || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Category</p>
                <p className="font-medium text-gray-800">
                  {selectedProposal?.menuCategory?.name || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Subcategory</p>
                <p className="font-medium text-gray-800">
                  {selectedProposal?.subCategory?.name || "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Subject</p>
                <p
                  className="font-medium text-gray-800 truncate"
                  title={subject}
                >
                  {subject}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Mail To</p>

                <div className="flex flex-wrap gap-2">
                  {selectedProposal?.mailTo?.length > 0 ? (
                    selectedProposal.mailTo.map((email, i) => (
                      <span
                        key={`${email}-${i}`}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                      >
                        {email}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No recipients</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Mail Cc</p>

                <div className="flex flex-wrap gap-2">
                  {selectedProposal?.mailCc?.length > 0 ? (
                    selectedProposal.mailCc.map((email, i) => (
                      <span
                        key={`${email}-${i}`}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                      >
                        {email}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No recipients</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Mail Bcc</p>

                <div className="flex flex-wrap gap-2">
                  {selectedProposal?.mailBcc?.length > 0 ? (
                    selectedProposal.mailBcc.map((email, i) => (
                      <span
                        key={`${email}-${i}`}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                      >
                        {email}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No recipients</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow border overflow-hidden">
            <div className="border-b bg-gray-50 px-5 py-3">
              <h3 className="text-base font-semibold text-gray-800">
                Attached Brochures
              </h3>

              <p className="text-xs text-gray-500 mt-1">
                Menu, category, subcategory and service level brochures.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
              {proposalBrochures.map((item) => (
                <ProposalBrochurePreviewCard
                  key={item.key}
                  title={item.title}
                  name={item.name}
                  brochure={item.brochure}
                />
              ))}
            </div>
          </div>

          <HtmlPreviewCard
            title="Email Body"
            description="This email body is coming from proposal response."
            html={emailBodyHtml}
            emptyText="No email body found."
          />

          <HtmlPreviewCard
            title="Scope of Work"
            description="This scope of work is coming from proposal response."
            html={scopeOfWorkHtml}
            emptyText="No scope of work found."
          />

          <ProposalPdfPreview
            pdfUrl={selectedProposal?.pdfUrl}
            pdfFileName={selectedProposal?.pdfFileName}
          />

          {selectedProposal?.lineItems?.length > 0 && (
            <div className="bg-white rounded-xl shadow border overflow-hidden">
              <div className="border-b bg-gray-50 px-5 py-3">
                <h3 className="text-base font-semibold text-gray-800">
                  Line Items
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  Service fee and GST details.
                </p>
              </div>

              <div className="overflow-auto p-4">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left">
                      <th className="px-3 py-2 font-semibold text-gray-700">
                        Item
                      </th>
                      <th className="px-3 py-2 font-semibold text-gray-700">
                        HSN/SAC
                      </th>
                      <th className="px-3 py-2 font-semibold text-gray-700">
                        Qty
                      </th>
                      <th className="px-3 py-2 font-semibold text-gray-700">
                        Unit
                      </th>
                      <th className="px-3 py-2 font-semibold text-gray-700">
                        Price Ex GST
                      </th>
                      <th className="px-3 py-2 font-semibold text-gray-700">
                        GST %
                      </th>
                      <th className="px-3 py-2 font-semibold text-gray-700">
                        Fee Type
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedProposal.lineItems.map((item) => (
                      <tr key={item.id} className="border-b last:border-b-0">
                        <td className="px-3 py-2 text-gray-800">
                          {item?.itemName || "-"}
                        </td>

                        <td className="px-3 py-2 text-gray-600">
                          {item?.hsnSacCode || "-"}
                        </td>

                        <td className="px-3 py-2 text-gray-600">
                          {item?.quantity ?? "-"}
                        </td>

                        <td className="px-3 py-2 text-gray-600">
                          {item?.unit || "-"}
                        </td>

                        <td className="px-3 py-2 text-gray-600">
                          ₹{Number(item?.unitPriceExGst || 0).toFixed(2)}
                        </td>

                        <td className="px-3 py-2 text-gray-600">
                          {Number(item?.gstRate || 0).toFixed(2)}%
                        </td>

                        <td className="px-3 py-2 text-gray-600">
                          {item?.feeType || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProposalForm = () => (
    <Form
      form={proposalAntForm}
      layout="vertical"
      className="space-y-6"
      initialValues={defaultValues}
      onFinish={handleProposalFormFinish}
      onFinishFailed={(errorInfo) => {
        console.log("Proposal AntD validation failed:", errorInfo);

        const firstError = errorInfo?.errorFields?.[0]?.errors?.[0];

        addToast({
          title: "Validation Error",
          description:
            firstError || "Please fill all required proposal fields.",
          color: "danger",
        });
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Form.Item label="To" name="mailTo" rules={[validateEmailArray(true)]}>
          <TagsInput
            placeholder="Enter email & press enter"
            lockedValues={lockedMailTo}
          />
        </Form.Item>

        <Form.Item label="Cc" name="mailCc" rules={[validateEmailArray(false)]}>
          <TagsInput placeholder="Enter email & press enter" />
        </Form.Item>

        <Form.Item
          label="Bcc"
          name="mailBcc"
          rules={[validateEmailArray(false)]}
        >
          <TagsInput placeholder="Enter email & press enter" />
        </Form.Item>
      </div>

      <Form.Item
        label="Subject"
        name="emailSubject"
        rules={[{ required: true, message: "Please give subject" }]}
      >
        <AntInput placeholder="Enter proposal subject" />
      </Form.Item>

      <Form.Item
        label="Payment Term"
        name="paymentTerm"
        rules={[{ required: true, message: "Please select payment term" }]}
      >
        <Select
          size="large"
          placeholder="Select payment term"
          options={paymentTerms?.map((item) => ({
            label: item.name,
            value: item.name,
            description: item.description || "",
            ...item,
          }))}
          allowClear
          onChange={(value, option) => {
            proposalAntForm.setFieldsValue({
              paymentTerm: value || "",
              paymentTermDescription: option?.description || "",
            });
          }}
          onClear={() => {
            proposalAntForm.setFieldsValue({
              paymentTerm: "",
              paymentTermDescription: "",
            });
          }}
        />
      </Form.Item>

      <Form.Item name="paymentTermDescription" hidden>
        <AntInput />
      </Form.Item>

      <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Attached Brochures
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                These brochures are fetched automatically from menu, category,
                subcategory and service mapping.
              </p>
            </div>

            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              Auto Fetched
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          <AttachedBrochureCard
            title="Menu Brochure"
            name={serviceBrouchersDetail?.menu?.name}
            brochure={serviceBrouchersDetail?.menu?.brochure}
          />

          <AttachedBrochureCard
            title="Category Brochure"
            name={serviceBrouchersDetail?.menuCategory?.name}
            brochure={serviceBrouchersDetail?.menuCategory?.brochure}
          />

          <AttachedBrochureCard
            title="Subcategory Brochure"
            name={serviceBrouchersDetail?.subCategory?.name}
            brochure={serviceBrouchersDetail?.subCategory?.brochure}
          />

          <AttachedBrochureCard
            title="Service / Solution Brochure"
            name={serviceBrouchersDetail?.solution?.name}
            brochure={serviceBrouchersDetail?.solution?.brochure}
          />
        </div>
      </div>

      <ServiceFormFieldsDetail
        form={proposalAntForm}
        serviceFeeList={serviceFeeList}
      />

      <Form.Item
        name="emailBody"
        hidden
        rules={[
          {
            validator: (_, value) => {
              if (getPlainTextLength(value) === 0) {
                return Promise.reject(new Error("Please give mail body"));
              }

              return Promise.resolve();
            },
          },
        ]}
      >
        <AntInput />
      </Form.Item>

      <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Mail Body <span className="text-red-500">*</span>
            </label>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Email body is fetched from service email template and can be
              modified.
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {getPlainTextLength(mailBody)} chars
          </span>
        </div>

        <div className="bg-white">
          <NewTextEditor
            data={mailBody || "<p></p>"}
            onChange={(value) => {
              setMailBody(value);

              proposalAntForm.setFieldsValue({
                emailBody: value,
              });

              proposalAntForm.validateFields(["emailBody"]);
            }}
          />
        </div>
      </div>

      <Form.Item
        name="scopeOfWork"
        hidden
        rules={[
          {
            validator: (_, value) => {
              if (getPlainTextLength(value) === 0) {
                return Promise.reject(new Error("Please give scope of work"));
              }

              return Promise.resolve();
            },
          },
        ]}
      >
        <AntInput />
      </Form.Item>

      <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Scope of Work <span className="text-red-500">*</span>
            </label>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Scope of work is fetched from service email template and can be
              modified.
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {getPlainTextLength(data)} chars
          </span>
        </div>

        <div className="bg-white">
          <NewTextEditor
            data={data || "<p></p>"}
            onChange={(value) => {
              setData(value);

              proposalAntForm.setFieldsValue({
                scopeOfWork: value,
              });

              proposalAntForm.validateFields(["scopeOfWork"]);
            }}
          />
        </div>
      </div>

      <div className="sticky bottom-0 bg-white pt-4 border-t">
        <Button
          type="submit"
          color="primary"
          className="w-full h-11 rounded-lg text-white text-lg font-medium cursor-pointer"
          isLoading={statusLoading === "pending"}
        >
          {editProposal ? "Update Proposal" : "Submit Proposal"}
        </Button>
      </div>
    </Form>
  );

  const formatFileSize = (bytes) => {
    const size = Number(bytes || 0);

    if (!size) return "---";
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const AttachedBrochureCard = ({ title, name, brochure }) => {
    const hasBrochure = Boolean(brochure?.filePath);
    const isImage = brochure?.contentType?.startsWith("image/");

    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{title}</p>

              <p className="mt-1 truncate text-xs text-gray-500">
                {name || "---"}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                hasBrochure
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 bg-gray-50 text-gray-500"
              }`}
            >
              {hasBrochure ? "Attached" : "Not Added"}
            </span>
          </div>
        </div>

        <div className="p-4">
          {hasBrochure ? (
            <>
              <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                {isImage ? (
                  <img
                    src={brochure.filePath}
                    alt={brochure.fileName || title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-3xl">📄</p>
                    <p className="mt-1 text-xs font-medium text-gray-500">
                      Document
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2 text-xs text-gray-600">
                <p className="break-words">
                  <span className="font-semibold text-gray-900">File:</span>{" "}
                  {brochure.fileName || "---"}
                </p>

                <p>
                  <span className="font-semibold text-gray-900">Type:</span>{" "}
                  {brochure.contentType || "---"}
                </p>

                <p>
                  <span className="font-semibold text-gray-900">Size:</span>{" "}
                  {formatFileSize(brochure.fileSize)}
                </p>

                <p className="break-words">
                  <span className="font-semibold text-gray-900">
                    Description:
                  </span>{" "}
                  {brochure.description || "---"}
                </p>
              </div>

              <a
                href={brochure.filePath}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                View Brochure
              </a>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <p className="text-sm font-semibold text-gray-700">
                No brochure found
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Brochure is not available for this level.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {statusLoading === "pending" && <LoadingSpinner />}
      <div className="flex flex-col gap-5 h-[75vh] overflow-auto p-3 w-full">
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Proposals</h2>
              <p className="text-sm text-gray-500">
                Proposal to view or cancel.
              </p>
            </div>

            <Button
              color="primary"
              startContent={<Plus size={16} />}
              onPress={prepareCreateProposal}
            >
              Add Proposal
            </Button>
          </div>

          {proposalList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {proposalList.map((proposal) => (
                <div
                  key={proposal.id}
                  className={`rounded-xl border p-4 bg-white transition-all ${
                    selectedProposal?.id === proposal.id &&
                    !isCreatingProposal &&
                    !editProposal
                      ? "border-blue-500 shadow-md"
                      : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {proposal?.solutionName ||
                          proposal?.templateName ||
                          "Proposal"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {proposal?.proposalNumber || "-"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {proposal?.emailSubject || "-"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {proposal?.isSentToClient && (
                        <Tooltip content="Sent to client">
                          <p className="text-xs bg-green-100 py-1 px-4 rounded-full text-center text-green-700 w-full">
                            SENT
                          </p>
                        </Tooltip>
                      )}

                      {proposal?.status === "DRAFT" && (
                        <button
                          type="button"
                          onClick={() => handleProposalSendToManager(proposal)}
                          className="
      w-[116px] h-[26px]
      shrink-0
      rounded-full
      bg-gray-300
      text-gray-700
      text-[11px]
      font-semibold
      leading-[13px]
      flex items-center justify-center
      text-center
      px-1
      hover:bg-slate-400
      active:scale-[0.98]
      transition-all duration-200
      shadow-sm cursor-pointer
    "
                        >
                          Send for Approval
                        </button>
                      )}

                      <span
                        className={`shrink-0 px-2 py-1 text-[11px] rounded-full text-center font-medium ${
                          proposal?.status === "CANCELLED" ||
                          proposal?.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {proposal?.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Created By</p>
                      <p className="font-medium text-gray-800 truncate">
                        {proposal?.createdByEmail || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500">Date</p>
                      <p className="font-medium text-gray-800">
                        {proposal?.createDate
                          ? dayjs(proposal.createDate).format("DD-MM-YYYY")
                          : "-"}
                      </p>
                    </div>
                    {proposal?.rejectionReason && (
                      <p className="text-xs text-gray-900 bg-red-200 py-0.5 px-1.5 mt-1 rounded-xs truncate">
                        Reject reason : {proposal?.rejectionReason || "-"}
                      </p>
                    )}
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Mail To</p>
                    <div className="flex flex-wrap gap-1">
                      {proposal?.mailTo?.slice(0, 2).map((email, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs max-w-[130px] truncate"
                        >
                          {email}
                        </span>
                      ))}
                      {proposal?.mailTo?.length > 2 && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                          +{proposal.mailTo.length - 2}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="flex-1"
                      onPress={() => handleViewProposal(proposal)}
                    >
                      View
                    </Button>

                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      className="flex-1"
                      isDisabled={isProposalAlreadyClosed(proposal?.status)}
                      onPress={() => handleOpenCancelModal(proposal)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed py-8 text-center text-gray-500">
              No proposals found. Click Add Proposal to create one.
            </div>
          )}
        </div>

        <Modal
          isOpen={cancelModal.isOpen}
          onOpenChange={cancelModal.onOpenChange}
        >
          <ModalContent>
            <ModalHeader>Cancel Proposal</ModalHeader>

            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Reason"
                  variant="bordered"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="flat"
                onPress={() => {
                  cancelModal.onClose();
                  setProposalToCancel(null);
                  setCancelReason("");
                }}
              >
                Close
              </Button>

              <Button color="danger" onPress={handleCancelProposal}>
                Submit
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={proposalViewModal.isOpen}
          onOpenChange={proposalViewModal.onOpenChange}
          size="full"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader className="border-b">Proposal Overview</ModalHeader>

            <ModalBody className="bg-gray-100 p-0">
              {selectedProposal && renderProposalView()}
            </ModalBody>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={proposalFormModal.isOpen}
          onOpenChange={(open) => {
            if (!open && (templateModal.isOpen || brochureModal.isOpen)) {
              return;
            }

            proposalFormModal.onOpenChange(open);
          }}
          size="full"
          scrollBehavior="inside"
          isDismissable={false}
          isKeyboardDismissDisabled={true}
        >
          <ModalContent>
            <ModalHeader className="border-b">
              {editProposal ? "Edit Proposal" : "Create Proposal"}
            </ModalHeader>

            <ModalBody className="bg-gray-50 p-4">
              <div className="max-w-6xl mx-auto w-full bg-white rounded-xl border shadow-sm p-4">
                {renderProposalForm()}
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={submitConfirmModal.isOpen}
          onOpenChange={(open) => {
            if (!open) {
              setPendingSubmitValues(null);
            }

            submitConfirmModal.onOpenChange(open);
          }}
          isDismissable={false}
          isKeyboardDismissDisabled={true}
        >
          <ModalContent>
            <ModalHeader className="border-b border-warning-200 bg-warning-50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-100 text-xl text-warning-700">
                  ⚠️
                </div>

                <div>
                  <h3 className="text-base font-semibold text-warning-800">
                    Confirm Proposal Submission
                  </h3>
                  <p className="text-xs font-normal text-warning-700">
                    Please review company unit details before sending.
                  </p>
                </div>
              </div>
            </ModalHeader>

            <ModalBody className="bg-warning-50/40 py-5">
              <div className="space-y-4">
                <div className="rounded-xl border border-warning-200 bg-white p-4 shadow-sm">
                  <p className="text-sm leading-6 text-gray-700">
                    Do you want to send proposal to company unit
                    <span className="font-semibold text-warning-800">
                      {" "}
                      {getSelectedUnitName()}
                    </span>
                    ?
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    All available units are fetched from the company GST/unit
                    API.
                  </p>
                </div>

                <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1">
                  {getCompanyUnitsForWarning().length > 0 ? (
                    getCompanyUnitsForWarning().map((unit, index) => (
                      <div
                        key={unit.id}
                        className="rounded-2xl border border-warning-200 bg-white p-4 shadow-sm transition-all hover:border-warning-300 hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning-100 text-sm font-bold text-warning-700">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-gray-900">
                                {unit.name}
                              </p>

                              {unit.isSelected && (
                                <span className="rounded-full border border-warning-200 bg-warning-50 px-2 py-0.5 text-[11px] font-semibold text-warning-700">
                                  Selected
                                </span>
                              )}

                              {unit.status !== "-" && (
                                <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                                  {unit.status}
                                </span>
                              )}
                            </div>

                            <p className="mt-2 text-sm leading-5 text-gray-600">
                              {unit.address}
                            </p>

                            <p className="mt-2 inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                              GST Type: {unit.gstRegistrationTypeName}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-warning-300 bg-white p-5 text-center">
                      <p className="text-sm font-semibold text-gray-700">
                        No unit details found.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>

            <ModalFooter className="border-t bg-gray-50">
              <Button
                variant="flat"
                color="default"
                onPress={() => {
                  setPendingSubmitValues(null);
                  submitConfirmModal.onClose();
                }}
                isDisabled={statusLoading === "pending"}
              >
                No, Cancel
              </Button>

              <Button
                color="warning"
                onPress={handleConfirmProposalSubmit}
                isLoading={statusLoading === "pending"}
              >
                Yes, Send Proposal
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </>
  );
};

export default Proposal;
