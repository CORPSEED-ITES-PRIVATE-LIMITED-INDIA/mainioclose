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
  getAllBrochureList,
  getAllProposalByLeadId,
  getAllProposalTemplateList,
  getSingleLeadDataByLeadId,
  sendProposal,
  sendProposalToManager,
} from "../../toolkit/slices/leadSlice";
import TextEditor from "../../components/TextEditor";
import {
  getAllSolutionList,
  getSolutionDetailByName,
  getSolutionPriceListById,
} from "../../toolkit/slices/settingSlice";
import dayjs from "dayjs";
import ServiceFormFieldsDetail from "../leads/leadEstimate/ServiceFormFieldsDetail";
import { Form, Input as AntInput } from "antd";
import { getBasicCompanyDetails } from "../../toolkit/slices/companySlice";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getEstimatesByLeadId } from "../../toolkit/slices/accountSlice";
import NewTextEditor from "../../components/NewTextEditor";
import { brochureSelectionData } from "../../common";

const defaultValues = {
  mailTo: [],
  mailCc: [],
  mailBcc: [],
  mailSubject: "",
  brochureBook: [],
  mailBody: "<h2>Your email body</h2>",
  template: "<h2>Your proposal </h2>",
};

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
  const company = useSelector((state) => state.company.basicCompanyDetail);

  const [proposalAntForm] = Form.useForm();

  const [templates, setTemplates] = useState([]);
  const [data, setData] = useState("<h2>Your proposal </h2>");
  const [mailBody, setMailBody] = useState("<h2>Your email body</h2>");
  const [brochureUrl, setBrochureUrl] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [editProposal, setEditProposal] = useState(false);
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [proposalToCancel, setProposalToCancel] = useState(null);
  const [statusLoading, setStatusLoading] = useState("");
  const [lockedMailTo, setLockedMailTo] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
  const [selectedSubSubCategoryId, setSelectedSubSubCategoryId] =
    useState(null);
  const [selectedBrochureObjects, setSelectedBrochureObjects] = useState([]);
  const [brochureSearchValue, setBrochureSearchValue] = useState("");

  const templateModal = useDisclosure();
  const brochureModal = useDisclosure();
  const cancelModal = useDisclosure();
  const proposalViewModal = useDisclosure();
  const proposalFormModal = useDisclosure();

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

  const selectedMenu = useMemo(() => {
    return brochureSelectionData.find((item) => item.id === selectedMenuId);
  }, [selectedMenuId]);

  const selectedCategory = useMemo(() => {
    return selectedMenu?.categories?.find(
      (item) => item.id === selectedCategoryId,
    );
  }, [selectedMenu, selectedCategoryId]);

  const selectedSubCategory = useMemo(() => {
    return selectedCategory?.subCategories?.find(
      (item) => item.id === selectedSubCategoryId,
    );
  }, [selectedCategory, selectedSubCategoryId]);

  const selectedSubSubCategory = useMemo(() => {
    return selectedSubCategory?.subSubCategories?.find(
      (item) => item.id === selectedSubSubCategoryId,
    );
  }, [selectedSubCategory, selectedSubSubCategoryId]);

  const filteredFinalBrochures = useMemo(() => {
    const list = selectedSubSubCategory?.brochures || [];

    if (!brochureSearchValue.trim()) return list;

    return list.filter((item) =>
      item?.brochureName
        ?.toLowerCase()
        .includes(brochureSearchValue.toLowerCase()),
    );
  }, [selectedSubSubCategory, brochureSearchValue]);

  const isLatestEstimateRejected =
    latestEstimate?.status?.toUpperCase() === "REJECTED";

  const getBrochureIds = (items = []) =>
    items
      .map((item) => (typeof item === "object" ? item.id : item))
      .filter(Boolean);

  const isProposalAlreadyClosed = (status) =>
    ["CANCELLED", "INITIATED"].includes(status?.toUpperCase());

  useEffect(() => {
    dispatch(getAllProposalByLeadId(leadId));
    dispatch(getAllProposalTemplateList());
    dispatch(getAllBrochureList());
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
              proposalAntForm.setFieldsValue({
                mailSubject: `Corpseed Proposal for - ${res?.payload?.name}`,
              });
            }
          });
        }
      }
    });
  }, [dispatch, leadId, userId]);

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

  const loadProposalInForm = (proposal) => {
    const brochureIds = getBrochureIds(proposal?.brochureBook || []);

    const existingBrochureObjects = Array.isArray(proposal?.brochureBook)
      ? proposal.brochureBook
          .filter((item) => typeof item === "object")
          .map((item) => ({
            id: item?.id,
            brochureName:
              item?.brochureName || item?.name || `Brochure ${item?.id}`,
            brochureUrl:
              item?.brochureUrl || item?.brochureBook || item?.url || "#",
          }))
      : [];

    setData(proposal?.template || "<h2>Your proposal </h2>");
    setMailBody(proposal?.mailBody || "<h2>Your email body</h2>");
    setBrochureUrl(brochureIds);
    setSelectedBrochureObjects(existingBrochureObjects);
    setTemplateName(proposal?.templateName || "");

    const existingMailTo = proposal?.mailTo || [];

    setLockedMailTo(existingMailTo);

    proposalAntForm.setFieldsValue({
      mailTo: proposal?.mailTo || [],
      mailCc: proposal?.mailCc || [],
      mailBcc: proposal?.mailBcc || [],
      mailSubject: proposal?.mailSubject || "",
      brochureBook: brochureIds,
      mailBody: proposal?.mailBody || "<h2>Your email body</h2>",
      template: proposal?.template || "<h2>Your proposal </h2>",
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

    setIsCreatingProposal(true);
    setEditProposal(false);
    setSelectedProposal(null);
    setTemplateName("");
    setBrochureUrl([]);
    setSelectedBrochureObjects([]);
    setSelectedMenuId(null);
    setSelectedCategoryId(null);
    setSelectedSubCategoryId(null);
    setSelectedSubSubCategoryId(null);
    setBrochureSearchValue("");
    setData("<h2>Your proposal </h2>");
    setMailBody("<h2>Your email body</h2>");

    proposalAntForm.resetFields();

    const existingMailTo =
      company?.units?.[0]?.unitContacts
        ?.map((client) => client.emails)
        .filter(Boolean) || [];

    setLockedMailTo(existingMailTo);

    proposalAntForm.setFieldsValue({
      ...defaultValues,
      mailTo: existingMailTo,
      mailSubject: solutionDetail?.name
        ? `Corpseed Proposal for - ${solutionDetail.name}`
        : "",
      brochureBook: [],
    });

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
      setTemplateName("");
      setData("<h2>Your proposal </h2>");
      setMailBody("<h2>Your email body</h2>");

      proposalAntForm.setFieldsValue({
        template: "<h2>Your proposal </h2>",
        mailBody: "<h2>Your email body</h2>",
      });

      proposalAntForm.validateFields(["template", "mailBody"]);
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
        mailBody: item.body,
      });

      proposalAntForm.validateFields(["mailBody"]);
    }

    setTemplateName(item?.name);
    templateModal.onClose();
  };

  const handleSetBrochureData = (brochure) => {
    const alreadySelected = selectedBrochureObjects.some(
      (item) => item.id === brochure.id,
    );

    const nextSelectedObjects = alreadySelected
      ? selectedBrochureObjects.filter((item) => item.id !== brochure.id)
      : [
          ...selectedBrochureObjects,
          {
            ...brochure,
            menuId: selectedMenu?.id,
            menuName: selectedMenu?.menuName,
            categoryId: selectedCategory?.id,
            categoryName: selectedCategory?.categoryName,
            subCategoryId: selectedSubCategory?.id,
            subCategoryName: selectedSubCategory?.subCategoryName,
            subSubCategoryId: selectedSubSubCategory?.id,
            subSubCategoryName: selectedSubSubCategory?.subSubCategoryName,
          },
        ];

    const nextSelectedIds = nextSelectedObjects.map((item) => item.id);

    setSelectedBrochureObjects(nextSelectedObjects);
    setBrochureUrl(nextSelectedIds);

    proposalAntForm.setFieldsValue({
      brochureBook: nextSelectedIds,
    });

    proposalAntForm.validateFields(["brochureBook"]);
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

  const onSubmit = (values) => {
    setStatusLoading("pending");

    const hadRejectedProposal = proposalList.some(
      (p) => p.status?.toUpperCase() === "REJECTED",
    );

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

    const finalValues = {
      ...values,
      leadId,
      solutionId: solutionDetail?.id,
      createdById: userId,
      templateName,
      brochureBook: brochureUrl,
      brochureSelectionPath: selectedBrochureObjects,
      companyId: company?.id,
      companyUnitId: company?.units?.[0]?.id,
      contactId: company?.units?.[0]?.unitContacts?.[0]?.id,
    };

    const antValues = proposalAntForm.getFieldsValue();

    finalValues.lineItems =
      antValues?.lineItems?.map((item) => ({
        sourceItemId: item?.sourceItemId || 0,
        itemName: item?.itemName || "",
        description: item?.description || "",
        hsnSacCode: item?.hsnSacCode || "",
        quantity: item?.quantity || 1,
        unit: item?.unit || "Nos",
        unitPriceExGst: Number(item?.unitPriceExGst || 0),
        gstRate: Number(item?.gstRate || 0),
        igstFlag: item?.igstFlag ?? true,
        categoryCode: item?.categoryCode || "",
        feeType: item?.feeType || "PROFESSIONAL_FEE",
      })) || [];

    if (editProposal && selectedProposal?.id) {
      dispatch(
        editLeadPropposal({ id: selectedProposal.id, ...finalValues }),
      ).then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          setStatusLoading("success");

          addToast({
            title: "SUCCESS",
            description: "Your proposal has been created as DRAFT !.",
            color: "success",
          });

          proposalAntForm.resetFields();
          proposalAntForm.setFieldsValue(defaultValues);
          setLockedMailTo([]);
          setEditProposal(false);
          setSelectedProposal(null);
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
            description: "Your proposal has been created as DRAFT !.",
            color: "success",
          });

          proposalAntForm.resetFields();
          proposalAntForm.setFieldsValue(defaultValues);

          setBrochureUrl([]);
          setTemplateName("");
          setData("<h2>Your proposal </h2>");
          setMailBody("<h2>Your email body</h2>");
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

  const renderProposalView = () => (
    <div className="flex justify-center bg-gray-100 py-6 px-2">
      <div className="w-full max-w-5xl space-y-4">
        <div className="bg-white rounded-xl shadow border p-4 md:p-6 flex flex-col gap-4 relative">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Proposal Overview
            </h2>

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

          <div className="flex flex-wrap justify-between gap-4 pt-2">
            <div>
              <p className="text-xs text-gray-500">Service</p>
              <p className="font-semibold text-gray-800">
                {selectedProposal?.solutionName || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Created By</p>
              <p className="font-medium text-gray-800">
                {selectedProposal?.createdByEmail || "-"}
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
                className={`px-2 py-1 text-xs rounded-full font-medium ${
                  selectedProposal?.status === "CANCELLED" ||
                  selectedProposal?.status === "REJECTED"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {selectedProposal?.status === "REJECTED" ||
                selectedProposal?.status === "REJECTED"
                  ? "CANCELLED"
                  : selectedProposal?.status}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-4 pt-2">
            <div>
              <p className="text-xs text-gray-500 mb-1">Mail To</p>
              <div className="flex flex-wrap gap-2">
                {selectedProposal?.mailTo?.length > 0 ? (
                  selectedProposal.mailTo.map((email, i) => (
                    <span
                      key={i}
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
                      key={i}
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
              <p className="text-xs text-gray-500">Brochure Books</p>
              <div className="flex gap-1 flex-wrap">
                {selectedProposal?.brochureBook?.length > 0 ? (
                  selectedProposal.brochureBook.map((item, index) => {
                    const name =
                      typeof item === "object"
                        ? item?.brochureName ||
                          item?.name ||
                          `Brochure ${index + 1}`
                        : `Brochure ${index + 1}`;

                    const url =
                      typeof item === "object"
                        ? item?.brochureUrl ||
                          item?.brochureBook ||
                          item?.url ||
                          "#"
                        : "#";

                    return (
                      <Tooltip
                        key={typeof item === "object" ? item?.id : index}
                        content={name}
                      >
                        <Link
                          to={url}
                          target="_blank"
                          className="inline-flex items-center gap-1 max-w-[180px] bg-blue-50 text-blue-700 border border-blue-200 rounded-full py-1 px-3 text-xs truncate whitespace-nowrap overflow-hidden hover:bg-blue-100"
                        >
                          <span className="truncate">{name}</span>
                          <ExternalLink size={12} />
                        </Link>
                      </Tooltip>
                    );
                  })
                ) : (
                  <span className="text-sm text-gray-500">No brochure</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {selectedProposal?.mailBody && (
          <div className="bg-white rounded-xl shadow border p-6 md:p-8">
            <div className="border-b pb-3 mb-4">
              <h3 className="text-base font-semibold text-gray-800">
                Mail Body Preview
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                This is the email body that will be sent to the client.
              </p>
            </div>

            <div
              className="proposal-content"
              dangerouslySetInnerHTML={{
                __html: selectedProposal.mailBody,
              }}
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow border p-6 md:p-10">
          <div className="border-b pb-3 mb-4">
            <h3 className="text-base font-semibold text-gray-800">
              Proposal Preview
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              This is the proposal content attached with the email.
            </p>
          </div>

          <div
            className="proposal-content"
            dangerouslySetInnerHTML={{
              __html: selectedProposal?.template,
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderProposalForm = () => (
    <Form
      form={proposalAntForm}
      layout="vertical"
      className="space-y-6"
      initialValues={defaultValues}
      onFinish={onSubmit}
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
        name="mailSubject"
        rules={[{ required: true, message: "Please give subject" }]}
      >
        <AntInput placeholder="Enter proposal subject" />
      </Form.Item>

      <Form.Item
        name="brochureBook"
        rules={[
          {
            validator: (_, value = []) => {
              if (!Array.isArray(value) || value.length === 0) {
                return Promise.reject(
                  new Error("Please select at least one brochure"),
                );
              }

              return Promise.resolve();
            },
          },
        ]}
      >
        <input type="hidden" />
      </Form.Item>

      <div className="flex flex-wrap gap-3">
        <Button
          className="cursor-pointer"
          onPress={brochureModal.onOpen}
          variant="flat"
          color={brochureUrl?.length > 0 ? "primary" : "default"}
        >
          Select Brochures
          {brochureUrl?.length > 0 && `(${brochureUrl.length})`}
        </Button>

        <Button
          className="cursor-pointer"
          onPress={templateModal.onOpen}
          variant="flat"
        >
          Select Proposal Template {templateName && `(1) - ${templateName}`}
        </Button>
      </div>

      <ServiceFormFieldsDetail
        form={proposalAntForm}
        serviceFeeList={serviceFeeList}
      />

      <Form.Item
        name="mailBody"
        noStyle
        rules={[
          { required: true, message: "Please give mail body" },
          {
            validator: (_, value) => {
              const plainTextLength = getPlainTextLength(value);

              if (plainTextLength < 1000) {
                return Promise.reject(
                  new Error(
                    "Please enter at least 1000 characters in the mail body",
                  ),
                );
              }

              return Promise.resolve();
            },
          },
        ]}
      >
        <input type="hidden" />
      </Form.Item>

      <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2">
          <div>
            <label className="block text-sm font-semibold text-gray-900">
              Mail Body <span className="text-red-500">*</span>
            </label>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              This content will be sent to the client in email body.
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {getPlainTextLength(mailBody)} / 1000
          </span>
        </div>

        <div className="bg-white">
          <NewTextEditor
            data={mailBody || "<p></p>"}
            onChange={(value) => {
              setMailBody(value);

              proposalAntForm.setFieldsValue({
                mailBody: value,
              });

              proposalAntForm.validateFields(["mailBody"]);
            }}
          />
        </div>

        <div className="border-t border-gray-100 bg-white px-4 py-2">
          <p className="text-xs italic text-gray-400">
            Minimum characters required: 1000
          </p>
        </div>
      </div>

      <Form.Item
        name="template"
        hidden
        rules={[
          { required: true, message: "Please give proposal" },
          {
            validator: (_, value) => {
              if (!templateName || value === "<h2>Your proposal </h2>") {
                return Promise.reject(
                  new Error("Please select a proposal template"),
                );
              }

              const plainTextLength = getPlainTextLength(value);

              if (plainTextLength < 1000) {
                return Promise.reject(
                  new Error("Proposal must be at least 1000 characters"),
                );
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
              Proposal <span className="text-red-500">*</span>
            </label>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              This content will be attached as the proposal document.
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {getPlainTextLength(data)} / 1000
          </span>
        </div>

        <div className="bg-white">
          <NewTextEditor
            data={data || "<p></p>"}
            onChange={(value) => {
              setData(value);

              proposalAntForm.setFieldsValue({
                template: value,
              });

              proposalAntForm.validateFields(["template"]);
            }}
          />
        </div>

        <div className="border-t border-gray-100 bg-white px-4 py-2">
          <p className="text-xs italic text-gray-400">
            Minimum characters required: 1000
          </p>
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
                        {proposal?.mailSubject || "-"}
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
          isOpen={templateModal.isOpen}
          onOpenChange={templateModal.onOpenChange}
          size="4xl"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <span className="text-base font-semibold">
                Select Proposal Template
              </span>
              <span className="text-xs text-gray-500">
                Click a template to apply it instantly
              </span>
            </ModalHeader>

            <ModalBody>
              <div className="mb-3">
                <Input
                  size="sm"
                  placeholder="Search template..."
                  startContent={<Search size={14} />}
                  className="cursor-pointer"
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    setTemplates(
                      templateList.filter((t) =>
                        t.name.toLowerCase().includes(value),
                      ),
                    );
                  }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {templates?.length > 0 ? (
                  templates.map((item) => {
                    const isSelected = templateName === item?.name;

                    return (
                      <div
                        key={`template-${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSetData(item);
                        }}
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className={`relative cursor-pointer rounded-lg border p-2 transition-all duration-150 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-blue-500 rounded-full p-1 shadow">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                        <div className="flex items-center justify-center h-20 bg-gray-50 rounded mb-2">
                          <img
                            src={template}
                            alt="template"
                            className="h-12 w-auto object-contain"
                          />
                        </div>

                        <p
                          className="text-xs font-medium text-gray-800 truncate text-center"
                          title={item.name}
                        >
                          {item.name}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center text-gray-500 py-8 text-sm">
                    No templates found
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter className="border-t pt-3">
              <Button
                size="sm"
                variant="flat"
                className="cursor-pointer"
                onPress={templateModal.onClose}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal
          isOpen={brochureModal.isOpen}
          onOpenChange={brochureModal.onOpenChange}
          size="5xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1 border-b">
              <span className="text-lg font-semibold">
                Select Brochures / Services
              </span>
              <span className="text-xs text-gray-500">
                Select step by step: Menu → Category → Sub Category → Sub Sub
                Category → Brochure
              </span>
            </ModalHeader>

            <ModalBody className="bg-gray-50">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-3 bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <p className="text-sm font-semibold text-gray-800">
                      1. Menu
                    </p>
                  </div>

                  <div className="p-2 space-y-2 max-h-[420px] overflow-y-auto">
                    {brochureSelectionData.map((menu) => {
                      const isSelected = selectedMenuId === menu.id;

                      return (
                        <button
                          key={menu.id}
                          type="button"
                          onClick={() => {
                            setSelectedMenuId(menu.id);
                            setSelectedCategoryId(null);
                            setSelectedSubCategoryId(null);
                            setSelectedSubSubCategoryId(null);
                            setBrochureSearchValue("");
                          }}
                          className={`w-full text-left rounded-lg border px-3 py-2 transition-all ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 shadow-sm"
                              : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <FolderOpen
                              size={15}
                              className={
                                isSelected ? "text-blue-600" : "text-gray-500"
                              }
                            />
                            <span className="text-sm font-medium text-gray-800 line-clamp-2">
                              {menu.menuName}
                            </span>
                          </div>

                          {menu.menuBrochureUrl && (
                            <a
                              href={menu.menuBrochureUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                            >
                              Preview <ExternalLink size={11} />
                            </a>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-3 bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <p className="text-sm font-semibold text-gray-800">
                      2. Category
                    </p>
                  </div>

                  <div className="p-2 space-y-2 max-h-[420px] overflow-y-auto">
                    {!selectedMenu ? (
                      <div className="py-10 text-center text-sm text-gray-400">
                        Please select menu first
                      </div>
                    ) : (
                      selectedMenu?.categories?.map((category) => {
                        const isSelected = selectedCategoryId === category.id;

                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategoryId(category.id);
                              setSelectedSubCategoryId(null);
                              setSelectedSubSubCategoryId(null);
                              setBrochureSearchValue("");
                            }}
                            className={`w-full text-left rounded-lg border px-3 py-2 transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Layers
                                size={15}
                                className={
                                  isSelected ? "text-blue-600" : "text-gray-500"
                                }
                              />
                              <span className="text-sm font-medium text-gray-800 line-clamp-2">
                                {category.categoryName}
                              </span>
                            </div>

                            {category.categoryBrochureUrl && (
                              <a
                                href={category.categoryBrochureUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                              >
                                Preview <ExternalLink size={11} />
                              </a>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="lg:col-span-3 bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <p className="text-sm font-semibold text-gray-800">
                      3. Sub Category
                    </p>
                  </div>

                  <div className="p-2 space-y-2 max-h-[420px] overflow-y-auto">
                    {!selectedCategory ? (
                      <div className="py-10 text-center text-sm text-gray-400">
                        Please select category first
                      </div>
                    ) : (
                      selectedCategory?.subCategories?.map((subCategory) => {
                        const isSelected =
                          selectedSubCategoryId === subCategory.id;

                        return (
                          <button
                            key={subCategory.id}
                            type="button"
                            onClick={() => {
                              setSelectedSubCategoryId(subCategory.id);
                              setSelectedSubSubCategoryId(null);
                              setBrochureSearchValue("");
                            }}
                            className={`w-full text-left rounded-lg border px-3 py-2 transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            <span className="text-sm font-medium text-gray-800 line-clamp-2">
                              {subCategory.subCategoryName}
                            </span>

                            {subCategory.subCategoryBrochureUrl && (
                              <a
                                href={subCategory.subCategoryBrochureUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                              >
                                Preview <ExternalLink size={11} />
                              </a>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="lg:col-span-3 bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <p className="text-sm font-semibold text-gray-800">
                      4. Sub Sub Category
                    </p>
                  </div>

                  <div className="p-2 space-y-2 max-h-[420px] overflow-y-auto">
                    {!selectedSubCategory ? (
                      <div className="py-10 text-center text-sm text-gray-400">
                        Please select sub category first
                      </div>
                    ) : (
                      selectedSubCategory?.subSubCategories?.map(
                        (subSubCategory) => {
                          const isSelected =
                            selectedSubSubCategoryId === subSubCategory.id;

                          return (
                            <button
                              key={subSubCategory.id}
                              type="button"
                              onClick={() => {
                                setSelectedSubSubCategoryId(subSubCategory.id);
                                setBrochureSearchValue("");
                              }}
                              className={`w-full text-left rounded-lg border px-3 py-2 transition-all ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 shadow-sm"
                                  : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            >
                              <span className="text-sm font-medium text-gray-800 line-clamp-2">
                                {subSubCategory.subSubCategoryName}
                              </span>

                              {subSubCategory.subSubCategoryBrochureUrl && (
                                <a
                                  href={
                                    subSubCategory.subSubCategoryBrochureUrl
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline"
                                >
                                  Preview <ExternalLink size={11} />
                                </a>
                              )}
                            </button>
                          );
                        },
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border shadow-sm mt-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3 border-b bg-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      5. Select Final Brochures / Services
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedBrochureObjects.length} brochure selected
                    </p>
                  </div>

                  <Input
                    size="sm"
                    placeholder="Search brochure..."
                    startContent={<Search size={14} />}
                    value={brochureSearchValue}
                    onChange={(e) => setBrochureSearchValue(e.target.value)}
                    className="md:max-w-xs"
                    isDisabled={!selectedSubSubCategory}
                  />
                </div>

                <div className="p-4">
                  {!selectedSubSubCategory ? (
                    <div className="rounded-xl border border-dashed py-10 text-center text-sm text-gray-400">
                      Please complete above selection to view brochures.
                    </div>
                  ) : filteredFinalBrochures.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredFinalBrochures.map((brochure) => {
                        const isSelected = selectedBrochureObjects.some(
                          (item) => item.id === brochure.id,
                        );

                        return (
                          <div
                            key={brochure.id}
                            className={`relative rounded-xl border p-4 transition-all ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 shadow-sm"
                                : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm"
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-3 right-3 bg-blue-500 rounded-full p-1">
                                <Check size={13} className="text-white" />
                              </div>
                            )}

                            <div className="pr-8">
                              <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                                {brochure.brochureName}
                              </p>

                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {selectedSubSubCategory?.subSubCategoryName}
                              </p>
                            </div>

                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                color={isSelected ? "danger" : "primary"}
                                variant={isSelected ? "flat" : "solid"}
                                className="flex-1"
                                onPress={() => handleSetBrochureData(brochure)}
                              >
                                {isSelected ? "Remove" : "Select"}
                              </Button>

                              <Button
                                size="sm"
                                variant="flat"
                                as="a"
                                href={brochure.brochureUrl}
                                target="_blank"
                                rel="noreferrer"
                                endContent={<ExternalLink size={13} />}
                              >
                                Preview
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed py-10 text-center text-sm text-gray-400">
                      No brochure found.
                    </div>
                  )}
                </div>
              </div>

              {selectedBrochureObjects.length > 0 && (
                <div className="bg-white rounded-xl border shadow-sm mt-4">
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <p className="text-sm font-semibold text-gray-800">
                      Selected Brochures
                    </p>
                  </div>

                  <div className="p-4 flex flex-wrap gap-2">
                    {selectedBrochureObjects.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5"
                      >
                        <span className="text-xs font-medium text-blue-700 max-w-[220px] truncate">
                          {item.brochureName}
                        </span>

                        <a
                          href={item.brochureUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink size={13} />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleSetBrochureData(item)}
                          className="text-xs font-semibold text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ModalBody>

            <ModalFooter className="border-t">
              <Button
                variant="flat"
                onPress={() => {
                  setSelectedMenuId(null);
                  setSelectedCategoryId(null);
                  setSelectedSubCategoryId(null);
                  setSelectedSubSubCategoryId(null);
                  setBrochureSearchValue("");
                }}
              >
                Reset Steps
              </Button>

              <Button color="primary" onPress={brochureModal.onClose}>
                Done
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

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
      </div>
    </>
  );
};

export default Proposal;
