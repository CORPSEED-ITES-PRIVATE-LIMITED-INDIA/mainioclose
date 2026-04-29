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
import { Check, Plus, Search } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  cancelProposal,
  editLeadPropposal,
  getAllBrochureList,
  getAllProposalByLeadId,
  getAllProposalTemplateList,
  getSingleLeadDataByLeadId,
  sendProposal,
} from "../../toolkit/slices/leadSlice";
import TextEditor from "../../components/TextEditor";
import {
  getAllSolutionList,
  getSolutionDetailByName,
  getSolutionPriceListById,
} from "../../toolkit/slices/settingSlice";
import dayjs from "dayjs";
import ServiceFormFieldsDetail from "../leads/leadEstimate/ServiceFormFieldsDetail";
import { Form } from "antd";
import { getBasicCompanyDetails } from "../../toolkit/slices/companySlice";
import LoadingSpinner from "../../components/LoadingSpinner";

const formSchema = () =>
  z.object({
    mailTo: z
      .array(z.string().email("Invalid email"))
      .min(1, "Please enter at least one valid email"),
    mailCc: z.array(z.string().email("Invalid email")).optional(),
    mailBcc: z.array(z.string().email("Invalid email")).optional(),
    mailSubject: z.string().min(1, "Please give subject"),
    brochureBook: z.array(z.number()).optional(),
    mailBody: z.string().min(1, "Please give mail body"),
    template: z.string().min(1, "Please give proposal"),
  });

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
}) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (val) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (!value.includes(trimmed)) onChange([...value, trimmed]);
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (["Enter", " ", ","].includes(e.key)) {
      e.preventDefault();
      addTag(inputValue);
    }

    if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      e.preventDefault();
      onChange(value.slice(0, value.length - 1));
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 bg-white border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:bg-zinc-900 dark:border-zinc-700 ${className}`}
    >
      {value.map((tag, index) => (
        <div
          key={index}
          className="flex items-center gap-1 rounded-full px-3 py-1 text-sm bg-blue-100 text-blue-800"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            className="cursor-pointer font-medium text-blue-600 hover:text-red-500"
          >
            ×
          </button>
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

const Proposal = () => {
  const dispatch = useDispatch();
  const { userId, leadId } = useParams();

  const templateList = useSelector((state) => state.leads.templateList);
  const brochureList = useSelector((state) => state.leads.brochureList);
  const allProposal = useSelector((state) => state.leads.proposalListByLeadId);
  const leadData = useSelector((state) => state.leads.singleLeadData);
  const userDetail = useSelector((state) => state.auth.currentUser);
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

  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: zodResolver(formSchema()),
    defaultValues,
  });

  const getBrochureIds = (items = []) =>
    items
      .map((item) => (typeof item === "object" ? item.id : item))
      .filter(Boolean);

  const isCancelled = (status) =>
    status === "REJECTED" || status === "CANCELLED";

  useEffect(() => {
    dispatch(getAllProposalByLeadId(leadId));
    dispatch(getAllProposalTemplateList());
    dispatch(getAllBrochureList());
    dispatch(getAllSolutionList(userId));
  }, [dispatch, leadId, userId]);

  useEffect(() => {
    setTemplates(templateList);
  }, [templateList]);

  useEffect(() => {
    dispatch(getBasicCompanyDetails({ leadId, userId }));
    dispatch(getSingleLeadDataByLeadId({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        if (resp?.payload?.clients?.length > 0) {
          setValue(
            "mailTo",
            resp.payload.clients.map((client) => client.emails).filter(Boolean),
          );
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
              setValue(
                "mailSubject",
                `Corpseed Proposal for - ${res?.payload?.name}`,
                {
                  shouldValidate: true,
                },
              );
            }
          });
        }
      }
    });
  }, [dispatch, leadId, userId, setValue]);

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
    setData(proposal?.template || "<h2>Your proposal </h2>");
    setMailBody(proposal?.mailBody || "<h2>Your email body</h2>");
    setBrochureUrl(getBrochureIds(proposal?.brochureBook || []));
    setTemplateName(proposal?.templateName || "");

    reset({
      mailTo: proposal?.mailTo || [],
      mailCc: proposal?.mailCc || [],
      mailBcc: proposal?.mailBcc || [],
      mailSubject: proposal?.mailSubject || "",
      brochureBook: getBrochureIds(proposal?.brochureBook || []),
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

    const hasNonCancelled = (allProposal || []).some(
      (item) => !["REJECTED", "CANCELLED"].includes(item?.status),
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
    setData("<h2>Your proposal </h2>");
    setMailBody("<h2>Your email body</h2>");

    reset({
      ...defaultValues,
      mailTo:
        company?.units?.[0]?.unitContacts
          ?.map((client) => client.emails)
          .filter(Boolean) || [],
      mailSubject: solutionDetail?.name
        ? `Corpseed Proposal for - ${solutionDetail.name}`
        : "",
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
    const variables = {
      userName: userDetail?.username || "",
      userDesignation: userDetail?.roles?.join(", ") || "",
      userPhone: userDetail?.phone || "",
      userEmail: userDetail?.email || "",
    };

    if (item.description) {
      const modifiedTemplate = modifyTemplateHtml(item.description, variables);
      setData(modifiedTemplate);
      setValue("template", modifiedTemplate);
    }

    if (item.body) {
      setMailBody(item.body);
      setValue("mailBody", item.body);
    }

    setTemplateName(item?.name);
    templateModal.onClose();
  };

  const handleSetBrochureData = (id) => {
    const nextSelected = brochureUrl.includes(id)
      ? brochureUrl.filter((selectedId) => selectedId !== id)
      : [...brochureUrl, id];

    setBrochureUrl(nextSelected);
    setValue("brochureBook", nextSelected);
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

    if (!company?.units?.[0]?.unitContacts?.length === 0) {
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

    if (!brochureUrl || brochureUrl.length === 0) {
      addToast({
        title: "Please select at least one brochure",
        color: "danger",
      });
      setStatusLoading("");
      return;
    }

    if (!templateName || values.template === "<h2>Your proposal </h2>") {
      addToast({
        title: "Please select a proposal template",
        color: "danger",
      });
      setStatusLoading("");
      return;
    }

    if (values.mailBody?.replace(/<[^>]*>/g, "").trim().length < 1000) {
      addToast({
        title: "ERROR",
        description: "Please enter at least 1000 characters in the mail body",
        color: "danger",
      });
      setStatusLoading("");
      return;
    }

    const proposalLength = values.template
      ?.replace(/<[^>]*>/g, "")
      .trim().length;

    if (proposalLength < 1000) {
      addToast({
        title: "ERROR",
        description: "Proposal must be at least 1000 characters",
        color: "danger",
      });
      setStatusLoading("");
      return;
    }

    values.leadId = leadId;
    values.solutionId = solutionDetail?.id;
    values.createdById = userId;
    values.templateName = templateName;
    values.brochureBook = brochureUrl;
    values.companyId = company?.id;
    values.companyUnitId = company?.units?.[0]?.id;
    values.contactId = company?.units?.[0]?.unitContacts?.id;

    const antValues = proposalAntForm.getFieldsValue();

    values.lineItems =
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
      dispatch(editLeadPropposal({ id: selectedProposal.id, ...values })).then(
        (resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            setStatusLoading("success");
            addToast({
              title: "SUCCESS",
              description:
                "Your proposal has been sent to the manager for review !.",
              color: "success",
            });
            reset(defaultValues);
            setEditProposal(false);
            setSelectedProposal(null);
            dispatch(getAllProposalByLeadId(leadId));
            proposalFormModal.onClose();
          } else {
            setStatusLoading("rejected");
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        },
      );
    } else {
      dispatch(sendProposal(values)).then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          setStatusLoading("success");
          addToast({
            title: "SUCCESS",
            description:
              "Your proposal has been sent to the manager for review !.",
            color: "success",
          });
          reset(defaultValues);
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

  const renderProposalView = () => (
    <div className="flex justify-center bg-gray-100 py-6 px-2">
      <div className="w-full max-w-5xl space-y-4">
        <div className="bg-white rounded-xl shadow border p-4 md:p-6 flex flex-col gap-4 relative">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Proposal Overview
            </h2>

            {/* <Button
              size="sm"
              color="primary"
              variant="flat"
              className="flex items-center gap-2 shadow-sm"
              onPress={handleEditProposal}
              isDisabled={isCancelled(selectedProposal?.status)}
            >
              Edit
            </Button> */}
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
                        ? item?.name
                        : `Brochure ${index + 1}`;
                    const url =
                      typeof item === "object" ? item?.brochureBook : "#";

                    return (
                      <Tooltip
                        key={typeof item === "object" ? item?.id : index}
                        content={name}
                      >
                        <Link
                          to={url}
                          className="inline-block max-w-[120px] bg-blue-300 rounded-lg py-0.5 px-2 text-xs truncate whitespace-nowrap overflow-hidden"
                        >
                          {name}
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

        <div className="bg-white rounded-xl shadow border p-6 md:p-10">
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
      onFinish={handleSubmit(onSubmit)}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["mailTo", "mailCc", "mailBcc"].map((fieldName) => (
          <Controller
            key={fieldName}
            name={fieldName}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  {fieldName === "mailTo"
                    ? "To *"
                    : fieldName === "mailCc"
                      ? "Cc"
                      : "Bcc"}
                </label>

                <TagsInput {...field} placeholder="Enter email & press enter" />

                {error && (
                  <span className="text-xs text-red-500">{error.message}</span>
                )}
              </div>
            )}
          />
        ))}
      </div>

      <Controller
        name="mailSubject"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Subject *
            </label>

            <Input
              {...field}
              variant="bordered"
              className="cursor-pointer bg-white"
            />

            {error && (
              <span className="text-xs text-red-500">{error.message}</span>
            )}
          </div>
        )}
      />

      <div className="flex flex-wrap gap-3">
        <Button
          className="cursor-pointer"
          onPress={brochureModal.onOpen}
          variant="flat"
        >
          Select Brochure {brochureUrl?.length > 0 && `(${brochureUrl.length})`}
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

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Mail Body *</label>

        <div className="rounded-lg border border-gray-300 overflow-hidden">
          <Controller
            name="mailBody"
            control={control}
            render={({ field }) => (
              <TextEditor
                data={mailBody}
                onChange={(prev, editor) => {
                  const value = editor.getData();
                  field.onChange(value);
                  setMailBody(value);
                }}
              />
            )}
          />

          <p className="text-sm text-gray-400 italic px-2 py-1">
            Min characters required: 1000 <br />
            your characters:{" "}
            {mailBody?.replace(/<[^>]*>/g, "").trim().length || 0}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Proposal *</label>

        <div className="rounded-lg border border-gray-300 overflow-hidden">
          <Controller
            name="template"
            control={control}
            render={({ field }) => (
              <TextEditor
                data={data}
                onChange={(prev, editor) => {
                  const value = editor.getData();
                  field.onChange(value);
                  setData(value);
                }}
              />
            )}
          />

          <p className="text-sm text-gray-400 italic px-2 py-1">
            Min characters required: 1000 <br />
            your characters: {data?.replace(/<[^>]*>/g, "").trim().length || 0}
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white pt-4 border-t">
        <button
          type="submit"
          className="w-full h-11 rounded-lg bg-blue-600 text-white text-lg font-medium cursor-pointer hover:bg-blue-700"
        >
          {editProposal ? "Update Proposal" : "Submit Proposal"}
        </button>
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
                Select a proposal to view, edit, or cancel.
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
                        {proposal?.mailSubject || "-"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 px-2 py-1 text-[11px] rounded-full font-medium ${
                        proposal?.status === "CANCELLED" ||
                        proposal?.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {proposal?.status === "REJECTED" ||
                      proposal?.status === "REJECTED"
                        ? "CANCELLED"
                        : proposal?.status}
                    </span>
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
                      isDisabled={isCancelled(proposal?.status)}
                      onPress={() => {
                        // if (
                        //   leadData?.proposalApproved ||
                        //   leadData?.proposalStatus === "INITIATED"
                        // ) {
                        //   addToast({
                        //     title: "RESTRICTED",
                        //     description:
                        //       "You are not required to cancel initiated or approved proposal.",
                        //     color: "danger",
                        //   });
                        //   return;
                        // }
                        handleOpenCancelModal(proposal);
                      }}
                    >
                      Reject / Cancel
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
                  templates.map((item) => (
                    <div
                      key={`template-${item.id}`}
                      onClick={() => handleSetData(item)}
                      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-2 transition-all duration-150 hover:border-blue-500 hover:bg-blue-50"
                    >
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
                  ))
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
          size="4xl"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">
              <span className="text-base font-semibold">Select Brochures</span>
              <span className="text-xs text-gray-500">
                You can select multiple brochures
              </span>
            </ModalHeader>

            <ModalBody>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {brochureList?.length > 0 ? (
                  brochureList.map((item) => {
                    const isSelected = brochureUrl.includes(item.id);

                    return (
                      <div
                        key={`brochure-${item.id}`}
                        onClick={() => handleSetBrochureData(item.id)}
                        className={`relative cursor-pointer rounded-lg border p-2 transition-all duration-150 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-blue-500 rounded-full p-1">
                            <Check size={12} className="text-white" />
                          </div>
                        )}

                        <div className="flex items-center justify-center h-20 bg-gray-50 rounded mb-2">
                          <img
                            src={template}
                            alt="brochure"
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
                    No brochures available
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter className="border-t pt-3">
              <Button
                size="sm"
                variant="flat"
                className="cursor-pointer"
                onPress={brochureModal.onClose}
              >
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
              <p className="text-sm text-gray-500">
                Please enter the reason for cancelling this proposal.
              </p>

              <Input
                label="Reason"
                placeholder="Enter cancellation reason"
                variant="bordered"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </ModalBody>

            <ModalFooter>
              <Button variant="flat" onPress={cancelModal.onClose}>
                Close
              </Button>

              <Button color="danger" onPress={handleCancelProposal}>
                Cancel Proposal
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
          onOpenChange={proposalFormModal.onOpenChange}
          size="full"
          scrollBehavior="inside"
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
