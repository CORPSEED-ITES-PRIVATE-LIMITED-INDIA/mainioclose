import { useEffect, useState } from "react";
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
  useDisclosure,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { Check, ChevronDown, Plus, Search } from "lucide-react";
import { useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  checkPlantSetUpData,
  editLeadPropposal,
  getAllBrochureList,
  getAllChildLeads,
  getAllProposalTemplateList,
  getProposalDataByLeadId,
  getSingleLeadDataByLeadId,
  sendProposal,
} from "../../toolkit/slices/leadSlice";
import TextEditor from "../../components/TextEditor";
import { getProductListByLeadName } from "../../toolkit/slices/productSlice";
import NewSelect from "../../components/NewSelect";
import { getAllSolutionList } from "../../toolkit/slices/settingSlice";
import dayjs from "dayjs";

const formSchema = (flag) =>
  z.object({
    ...(flag
      ? {
          leadId: z.string().min("please select the service"),
        }
      : {}),
    mailTo: z
      .array(z.string().email("Invalid email"))
      .min(1, "Please enter at least one valid email"),
    mailCc: z.array(z.string().email("Invalid email")).optional(),
    mailBcc: z.array(z.string().email("Invalid email")).optional(),
    mailSubject: z.string().min(1, "Please give subject"),
    // solutionId: z.string().min(1, "Please give solution"),
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

    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
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

  const handleBlur = () => {
    addTag(inputValue);
  };

  const removeTag = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div
      className={`
        flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2
        bg-white border-gray-300
        focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100

        dark:bg-zinc-900 dark:border-zinc-700
        dark:focus-within:border-blue-400 dark:focus-within:ring-blue-400/20

        ${className}
      `}
    >
      {value.map((tag, index) => (
        <div
          key={index}
          className="
            flex items-center gap-1 rounded-full px-3 py-1 text-sm
            bg-blue-100 text-blue-800
            dark:bg-blue-500/15 dark:text-blue-300
          "
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="
              cursor-pointer font-medium
              text-blue-600 hover:text-red-500
              dark:text-blue-400 dark:hover:text-red-400
            "
          >
            ×
          </button>
        </div>
      ))}

      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`
          flex-1 min-w-[180px] border-none outline-none text-sm
          bg-transparent text-gray-900 placeholder-gray-400

          dark:text-gray-100 dark:placeholder-gray-500

          ${inputClassName}
        `}
      />
    </div>
  );
}

const Proposal = () => {
  const dispatch = useDispatch();
  const { userId, leadId } = useParams();
  const templateList = useSelector((state) => state.leads.templateList);
  const brochureList = useSelector((state) => state.leads.brochureList);
  const productData = useSelector(
    (state) => state.product.productDataByLeadName,
  );
  const proposalDataDetail = useSelector(
    (state) => state.leads.proposalDataDetail,
  );
  const leadData = useSelector((state) => state.leads.singleLeadData);
  const userDetail = useSelector((state) => state.auth.currentUser);
  const plantSetupData = useSelector((state) => state.leads.plantSetupDetail);
  const childLeads = useSelector((state) => state.leads.allChildLeadList);
  const solutionList = useSelector((state) => state.setting.allSolutionList);
  const [templates, setTemplates] = useState([]);
  const [data, setData] = useState("<h2>Your proposal </h2>");
  const templateModal = useDisclosure();
  const brochureModal = useDisclosure();
  const [brochureUrl, setBrochureUrl] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [editProposal, setEditProposal] = useState(false);
  const [mailBody, setMailBody] = useState("<h2>Your email body</h2>");

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(formSchema(plantSetupData)),
    defaultValues,
  });

  useEffect(() => {
    dispatch(getProposalDataByLeadId(leadId));
    dispatch(getAllProposalTemplateList());
    dispatch(getAllBrochureList());
    dispatch(getAllSolutionList(userId));
  }, [dispatch]);

  useEffect(() => {
    setTemplates(templateList);
  }, [templateList]);

  useEffect(() => {
    dispatch(getSingleLeadDataByLeadId({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        setValue(
          "mailTo",
          resp?.payload?.clients?.map((client) => client.emails) || [],
        );
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if (Object.keys(proposalDataDetail)?.length > 0) {
      setData(proposalDataDetail?.template);
      setMailBody(proposalDataDetail?.mailBody);
      setBrochureUrl(proposalDataDetail?.brochureBook || []);
      reset({
        mailTo: proposalDataDetail?.mailTo || [],
        mailCc: proposalDataDetail?.mailCc || [],
        mailBcc: proposalDataDetail?.mailBcc || [],
        mailSubject: proposalDataDetail?.mailSubject,
        brochureBook: proposalDataDetail?.brochureBook || [],
        mailBody: proposalDataDetail?.mailBody,
        template: proposalDataDetail?.template,
        // solutionId: String(proposalDataDetail?.solutionId),
      });
    } else {
      reset(defaultValues);
      setData("<h2>Your proposal </h2>");
      setMailBody("<h2>Your email body</h2>");
      setBrochureUrl([]);
    }
  }, [proposalDataDetail, reset]);

  const modifyTemplateHtml = (html, variables) => {
    if (!html) return "";

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const body = doc.body;

    // =====================================
    // 1️⃣ AUTO DATE
    // =====================================
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, "0")}.${String(
      today.getMonth() + 1,
    ).padStart(2, "0")}.${today.getFullYear()}`;

    body.querySelectorAll("td, p, div").forEach((el) => {
      if (el.textContent.trim().startsWith("Date-")) {
        el.innerHTML = `Date- ${formattedDate}`;
      }
    });

    // =====================================
    // 2️⃣ FORCE HEADER FULL WIDTH (AGGRESSIVE CLEAN)
    // =====================================
    const tables = body.querySelectorAll("table");

    if (tables.length > 0) {
      const firstTable = tables[0];

      // Remove width attributes
      firstTable.removeAttribute("width");

      // Remove inline width styles (px / pt / %)
      firstTable.style.width = "100%";
      firstTable.style.maxWidth = "100%";
      firstTable.style.minWidth = "100%";
      firstTable.style.margin = "0";
      firstTable.style.tableLayout = "fixed";
      firstTable.style.borderCollapse = "collapse";

      // Remove width from all cells
      firstTable.querySelectorAll("tr, td, th").forEach((cell) => {
        cell.removeAttribute("width");

        cell.style.width = "auto";
        cell.style.maxWidth = "100%";
        cell.style.minWidth = "auto";
      });
    }

    // =====================================
    // 3️⃣ REMOVE OLD SIGNATURE
    // =====================================
    const blockTags = ["P", "DIV"];
    let removeCount = 0;

    for (let i = body.children.length - 1; i >= 0; i--) {
      const el = body.children[i];

      if (blockTags.includes(el.tagName)) {
        body.removeChild(el);
        removeCount++;
      }

      if (removeCount >= 4) break;
    }

    // =====================================
    // 4️⃣ ADD NEW SIGNATURE
    // =====================================
    const signatureDiv = doc.createElement("div");
    signatureDiv.style.textAlign = "right";
    signatureDiv.style.marginTop = "40px";

    signatureDiv.innerHTML = `
    <strong>Warm Regards,</strong><br/>
    ${variables.userName || ""}<br/>
    ${variables.userDesignation || ""}<br/>
    ${variables.userEmail || ""} ${
      variables.userPhone ? `| ${variables.userPhone}` : ""
    }<br/>
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

  const onSubmit = (values) => {
    if (!brochureUrl || brochureUrl.length === 0) {
      addToast({
        title: "Please select at least one brochure",
        color: "danger",
      });
      return;
    }

    if (!templateName || values.template === "<h2>Your proposal </h2>") {
      addToast({
        title: "Please select a proposal template",
        color: "danger",
      });
      return;
    }

    if (values.mailBody?.replace(/<[^>]*>/g, "").trim().length < 1000) {
      addToast({
        title: "ERROR",
        description: "Please enter at least 1000 characters in the mail body",
        color: "danger",
      });
      return;
    }

    if (!plantSetupData) {
      values.leadId = leadId;
    }
    values.productId = productData?.id;
    values.createdById = userId;
    values.templateName = templateName;
    values.brochureBook = brochureUrl;
    if (Object.keys(proposalDataDetail)?.length > 0) {
      dispatch(
        editLeadPropposal({ id: proposalDataDetail?.id, ...values }),
      ).then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Your proposal has been sent to the manager for review !.",
            color: "success",
          });
          reset(defaultValues);
          dispatch(getProposalDataByLeadId(leadId));
          setEditProposal(false);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      });
    } else {
      dispatch(sendProposal(values)).then((resp) => {
        console.log("send proposal resp", resp);
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Your proposal has been sent to the manager for review !.",
            color: "success",
          });
          reset(defaultValues);
          setBrochureUrl([]);
          setTemplateName("");
          setData("<h2>Your proposal </h2>");
          setMailBody("<h2>Your email body</h2>");
          dispatch(getProposalDataByLeadId(leadId));
        } else {
          addToast({
            title: resp?.payload?.data?.errorCode,
            description: resp?.payload?.data?.message,
            color: "danger",
          });
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-5 h-[75vh] overflow-auto p-3 w-full">
      {Object.keys(proposalDataDetail)?.length > 0 && !editProposal ? (
        <div className="flex justify-center bg-gray-100 py-6 px-2">
          <div className="w-full max-w-5xl space-y-4">
            {/* 🔷 HEADER CARD */}
            <div className="bg-white rounded-xl shadow border p-4 md:p-6 flex flex-col gap-4 relative">
              {/* 🔷 ACTION BAR */}
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  Proposal Overview
                </h2>

                <Button
                  size="sm"
                  color={editProposal ? "danger" : "primary"}
                  variant="flat"
                  className="flex items-center gap-2 shadow-sm"
                  onPress={() => setEditProposal((prev) => !prev)}
                >
                  {editProposal ? "Cancel" : "Edit"}
                </Button>
              </div>

              {/* 🔷 META INFO */}
              <div className="flex flex-wrap justify-between gap-4 pt-2">
                <div>
                  <p className="text-xs text-gray-500">Service</p>
                  <p className="font-semibold text-gray-800">
                    {proposalDataDetail?.solutionName || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Created By</p>
                  <p className="font-medium text-gray-800">
                    {proposalDataDetail?.createdByEmail || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Created Date</p>
                  <p className="font-medium text-gray-800">
                    {proposalDataDetail?.createDate
                      ? dayjs(proposalDataDetail.createDate).format(
                          "DD-MM-YYYY",
                        )
                      : "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                    {proposalDataDetail?.status}
                  </span>
                </div>
              </div>

              {/* 🔷 MAIL TO */}
              <div>
                <p className="text-xs text-gray-500 mb-1">Mail To</p>
                <div className="flex flex-wrap gap-2">
                  {proposalDataDetail?.mailTo?.length > 0 ? (
                    proposalDataDetail.mailTo.map((email, i) => (
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
            </div>

            {/* 📄 PROPOSAL DOCUMENT */}
            <div className="bg-white rounded-xl shadow border p-6 md:p-10">
              <div
                className="proposal-content"
                dangerouslySetInnerHTML={{
                  __html: proposalDataDetail?.template,
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["mailTo", "mailCc", "mailBcc"].map((fieldName, index) => (
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
                    <TagsInput
                      {...field}
                      placeholder="Enter email & press enter"
                    />
                    {error && (
                      <span className="text-xs text-red-500">
                        {error.message}
                      </span>
                    )}
                  </div>
                )}
              />
            ))}
          </div>

          {/* <Controller
            name="solutionId"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Select service *
                </label>
                <NewSelect
                  className="bg-white"
                  isRequired={true}
                  data={solutionList || []}
                  labelKey="name"
                  valueKey="id"
                  variant="bordered"
                  value={field?.value}
                  errorMessage={"please select solution"}
                  onItemSelect={(item) => {
                    setValue("mailSubject", `Proposal for ${item.name}`, {
                      shouldDirty: true,
                    });
                  }}
                  onChange={(value) => {
                    field.onChange(value);
                  }}
                />
                {error && (
                  <span className="text-xs text-red-500">{error.message}</span>
                )}
              </div>
            )}
          /> */}

          {/* Subject */}
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

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              className="cursor-pointer"
              onPress={brochureModal.onOpen}
              variant="flat"
            >
              Select Brochure{" "}
              {brochureUrl?.length > 0 && `(${brochureUrl.length})`}
            </Button>

            <Button
              className="cursor-pointer"
              onPress={templateModal.onOpen}
              variant="flat"
            >
              Select Proposal Template
            </Button>
          </div>

          {/* Mail Body */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Mail Body *
            </label>
            <div className="rounded-lg border border-gray-300 overflow-hidden">
              <Controller
                name="mailBody"
                control={control}
                render={({ field }) => (
                  <TextEditor
                    data={mailBody}
                    // onChange={(prev, editor) => {
                    //   const data = editor.getData();
                    //   field.onChange(data);
                    //   setMailBody(data);
                    // }}

                    onChange={(prev, editor) => {
                      const data = editor.getData();
                      field.onChange(data);
                      setMailBody(data);
                    }}
                  />
                )}
              />
              <p className="text-sm text-gray-400 italic px-2 py-1">
                Min characters required: 1000 <br />
                your characters:{" "}
                {mailBody?.replace(/<[^>]*>/g, "").trim().length || 0} out of
                1000
              </p>
            </div>
          </div>

          {/* Proposal */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Proposal *
            </label>
            <div className="rounded-lg border border-gray-300 overflow-hidden">
              <Controller
                name="template"
                control={control}
                render={({ field }) => (
                  <TextEditor
                    data={data}
                    onChange={(prev, editor) => {
                      const data = editor.getData();
                      field.onChange(data);
                      setData(data);
                    }}
                  />
                )}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="sticky bottom-0 bg-white pt-4 border-t">
            <Button
              type="submit"
              color="primary"
              className="w-full cursor-pointer text-lg"
            >
              Submit Proposal
            </Button>
          </div>
        </form>
      )}
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
            {/* Search */}
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

            {/* Small Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {templates?.length > 0 ? (
                templates.map((item) => (
                  <div
                    key={`template-${item.id}`}
                    onClick={() => handleSetData(item)}
                    className="cursor-pointer rounded-lg border border-gray-200 bg-white p-2 transition-all duration-150 hover:border-blue-500 hover:bg-blue-50"
                  >
                    {/* Thumbnail */}
                    <div className="flex items-center justify-center h-20 bg-gray-50 rounded mb-2">
                      <img
                        src={template}
                        alt="template"
                        className="h-12 w-auto object-contain"
                      />
                    </div>

                    {/* Name */}
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
            {/* Small Card Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {brochureList?.length > 0 ? (
                brochureList.map((item) => {
                  const isSelected = brochureUrl.includes(item.id);

                  return (
                    <div
                      key={`brochure-${item.id}`}
                      onClick={() => handleSetBrochureData(item.id)}
                      className={`relative cursor-pointer rounded-lg border p-2 transition-all duration-150
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50"
                  }`}
                    >
                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 bg-blue-500 rounded-full p-1">
                          <Check size={12} className="text-white" />
                        </div>
                      )}

                      {/* Thumbnail */}
                      <div className="flex items-center justify-center h-20 bg-gray-50 rounded mb-2">
                        <img
                          src={template}
                          alt="brochure"
                          className="h-12 w-auto object-contain"
                        />
                      </div>

                      {/* Name */}
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
    </div>
  );
};

export default Proposal;
