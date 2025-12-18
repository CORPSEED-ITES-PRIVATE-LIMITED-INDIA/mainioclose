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
  placeholder,
  className,
  inputClassName,
}) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if ([" ", ",", "Enter"].includes(e.key)) {
      e.preventDefault();
      if (inputValue.trim()) {
        onChange([...value, inputValue.trim()]);
        setInputValue("");
      }
    }
  };

  const removeTag = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className={`$${className} flex flex-wrap gap-2 border rounded p-2`}>
      {value.map((tag, index) => (
        <div
          key={index}
          className={`bg-gray-300 dark:text-black px-2 py-1 rounded flex items-center gap-1`}
        >
          {tag}
          <button onClick={() => removeTag(index)}>&times;</button>
        </div>
      ))}
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${inputClassName} flex-grow outline-none`}
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
    (state) => state.product.productDataByLeadName
  );
  const proposalDataDetail = useSelector(
    (state) => state.leads.proposalDataDetail
  );
  const plantSetupData = useSelector((state) => state.leads.plantSetupDetail);
  const childLeads = useSelector((state) => state.leads.allChildLeadList);
  const [templates, setTemplates] = useState([]);
  const [data, setData] = useState("<h2>Your proposal </h2>");
  const templateModal = useDisclosure();
  const brochureModal = useDisclosure();
  const [brochureUrl, setBrochureUrl] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [editProposal, setEditProposal] = useState(false);
  const [mailBody, setMailBody] = useState("<h2>Your email body</h2>");

  useEffect(() => {
    dispatch(getSingleLeadDataByLeadId({ leadId, userId })).then((resp) => {
      if (resp.meta.requestStatus === "fulfilled") {
        dispatch(checkPlantSetUpData(resp?.payload?.originalName)).then(
          (res) => {
            if (res.meta.requestStatus === "fulfilled") {
              if (res.payload) {
                dispatch(getAllChildLeads(resp?.payload?.leadId));
              } else {
                dispatch(getProductListByLeadName(resp?.payload?.originalName));
              }
            }
          }
        );
      }
    });
  }, [dispatch]);

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
  }, [dispatch]);

  useEffect(() => {
    setTemplates(templateList);
  }, [templateList]);

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
      });
    } else {
      reset(defaultValues);
      setData("<h2>Your proposal </h2>");
      setMailBody("<h2>Your email body</h2>");
      setBrochureUrl([]);
    }
  }, [proposalDataDetail, reset]);

  const handleSetData = (item) => {
    if (item.description) {
      setData(item?.description);
      setValue("template", item?.description);
    }
    if (item.body) {
      setMailBody(item?.body);
      setValue("mailBody", item?.body);
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
    if (!plantSetupData) {
      values.leadId = leadId;
    }
    values.productId = productData?.id;
    values.createdById = userId;
    values.templateName = templateName;
    values.brochureBook = brochureUrl;
    if (Object.keys(proposalDataDetail)?.length > 0) {
      dispatch(
        editLeadPropposal({ id: proposalDataDetail?.id, ...values })
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
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Your proposal has been sent to the manager for review !.",
            color: "success",
          });
          reset(defaultValues);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-5 h-[75vh] overflow-auto p-3 w-full">
      {Object.keys(proposalDataDetail)?.length > 0 && (
        <div className="flex justify-between">
          {!editProposal ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">
                  Product name :
                </span>
                <span className="font-medium">
                  {proposalDataDetail?.productName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">
                  Created person email :
                </span>
                <span className="font-medium">
                  {proposalDataDetail?.createdByEmail}
                </span>
              </div>
            </div>
          ) : null}
          <Button
            onPress={() => {
              setEditProposal((prev) => !prev);
            }}
          >
            {editProposal ? "Cancel" : "Edit proposal"}
          </Button>
        </div>
      )}

      {Object.keys(proposalDataDetail)?.length > 0 && !editProposal ? (
        <div
          dangerouslySetInnerHTML={{ __html: proposalDataDetail?.template }}
        />
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 "
        >
          <div className="flex flex-col gap-1">
            <label className="font-medium">
              To <span className="text-red-500">*</span>
            </label>
            <Controller
              name="mailTo"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <TagsInput
                    {...field}
                    placeholder="Enter emails separated by space, comma or enter"
                  />
                  {error && (
                    <span className="text-red-500 text-sm">
                      {error.message || error.root?.message || "Invalid input"}
                    </span>
                  )}
                </>
              )}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Cc</label>
            <Controller
              name="mailCc"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <TagsInput
                    {...field}
                    placeholder="Enter emails separated by space, comma or enter"
                  />
                  {error && (
                    <span className="text-red-500 text-sm">
                      {error.message || error.root?.message || "Invalid input"}
                    </span>
                  )}
                </>
              )}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">Bcc</label>
            <Controller
              name="mailBcc"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <TagsInput
                    {...field}
                    placeholder="Enter emails separated by space, comma or enter"
                  />
                  {error && (
                    <span className="text-red-500 text-sm">
                      {error.message || error.root?.message || "Invalid input"}
                    </span>
                  )}
                </>
              )}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium">
              Subject <span className="text-red-500">*</span>
            </label>
            <Controller
              name="mailSubject"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <Input variant="bordered" {...field} />
                  {error && (
                    <span className="text-red-500 text-sm">
                      {error.message}
                    </span>
                  )}
                </>
              )}
            />
          </div>
          {plantSetupData && (
            <div className="flex flex-col gap-1">
              <label className="font-medium">
                Select service <span className="text-red-500">*</span>
              </label>
              <Controller
                name="leadId"
                control={control}
                render={({ field, fieldState: { error } }) => {
                  return (
                    <NewSelect
                      data={childLeads}
                      labelKey={"childLeadName"}
                      valueKey={"childId"}
                      label={"Select child lead"}
                      value={field.value}
                      onItemSelect={(item) => {
                        dispatch(getProductListByLeadName(item?.childLeadName));
                      }}
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  );
                }}
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="font-medium">Select brochure</label>
            <Button onPress={brochureModal.onOpen}>
              Select brochure{" "}
              {brochureUrl?.length > 0 ? `(${brochureUrl?.length})` : ""}
            </Button>
          </div>

          <div className="flex flex-col gap-1">
            <Button onPress={templateModal.onOpen}>
              Select Proposal template and mail body
            </Button>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium">
              Mail body <span className="text-red-500">*</span>
            </label>
            <Controller
              name="mailBody"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <TextEditor
                    data={mailBody}
                    onChange={(prev, editor) => {
                      const newData = editor?.getData();
                      field.onChange(newData);
                      setMailBody(newData);
                    }}
                  />
                  {error && (
                    <span className="text-red-500 text-sm">
                      {error.message}
                    </span>
                  )}
                </>
              )}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-medium">
              Proposal <span className="text-red-500">*</span>
            </label>
            <Controller
              name="template"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <>
                  <TextEditor
                    data={data}
                    onChange={(prev, editor) => {
                      const newData = editor?.getData();
                      field.onChange(newData);
                      setData(newData);
                    }}
                  />
                  {error && (
                    <span className="text-red-500 text-sm">
                      {error.message}
                    </span>
                  )}
                </>
              )}
            />
          </div>
          <Button type="submit" color="primary">
            Submit
          </Button>
        </form>
      )}
      <Modal
        isOpen={templateModal.isOpen}
        onOpenChange={templateModal.onOpenChange}
        size="3xl"
      >
        <ModalContent>
          <ModalHeader>Select Template</ModalHeader>
          <ModalBody>
            <div className="flex flex-wrap gap-3 max-h-[400px] overflow-auto">
              {templates?.map((item) => (
                <div
                  key={`template${item?.id}`}
                  className="flex flex-col items-center gap-3 shadow-md rounded-lg p-4 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSetData(item)}
                >
                  <img src={template} alt="templates" className="h-24 w-32" />
                  <span className="font-medium">{item?.name}</span>
                </div>
              ))}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onPress={templateModal.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={brochureModal.isOpen}
        onOpenChange={brochureModal.onOpenChange}
        size="3xl"
      >
        <ModalContent>
          <ModalHeader>Select Brochure</ModalHeader>
          <ModalBody>
            <div className="flex flex-wrap gap-3 max-h-[400px] overflow-auto">
              {brochureList?.map((item) => {
                const isSelected = brochureUrl.includes(item.id);
                return (
                  <div
                    key={`brochure${item.id}`}
                    className={`flex flex-col items-center gap-3 shadow-md rounded-lg p-4 cursor-pointer relative ${
                      isSelected
                        ? "border-2 border-blue-500 bg-blue-50"
                        : "hover:bg-gray-100"
                    }`}
                    style={{ width: 140 }}
                    onClick={() => handleSetBrochureData(item.id)}
                  >
                    {isSelected && (
                      <Check
                        className="absolute top-2 right-2 text-green-500"
                        size={24}
                      />
                    )}
                    <img src={template} alt="template" className="h-24 w-32" />
                    <span className="font-medium">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onPress={brochureModal.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default Proposal;
