import {
  addToast,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Form,
  getKeyValue,
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
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { Download, EllipsisVertical, FileText, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  addDocumentProduct,
  getSingleProductByProductId,
  importProductCheckListDoument,
} from "../../toolkit/slices/settingSlice";
import NewSelect from "../../components/NewSelect";
import {
  getAllCountries,
  getAllStatesByCountryName,
} from "../../toolkit/slices/commonSlice";
import SingleFileUploader from "../../components/SingleFileUploader";
import { addDocumentsInProductsForOperation } from "../../toolkit/slices/operationSlice";
const iconClass = "w-5 h-5";

const ProductDocument = ({ data, details }) => {
  const dispatch = useDispatch();
  const { userId, productId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const uploadModal = useDisclosure();
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const formValues = {
    productId: productId,
    userId,
    name: "",
    type: "",
    description: "",
    centralName: details?.serviceType === "central" ? "India" : "",
    stateName: "",
    country: "",
  };
  const [formData, setFormData] = useState(formValues);
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    dispatch(getAllCountries());
    dispatch(getAllStatesByCountryName("India"));
  }, [dispatch]);

  const handleSubmit = useCallback(
    (values) => {
      dispatch(addDocumentProduct(formData))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            const docInfo = resp.payload;
            addToast({
              title: "Document added successfully !.",
              color: "success",
            });
            dispatch(
              addDocumentsInProductsForOperation([
                {
                  id: 0,
                  name: "string",
                  description: "string",
                  type: "string",
                  country: "string",
                  centralName: "string",
                  stateName: "string",
                  createdBy: 0,
                  updatedBy: 0,
                  productIds: [0],
                },
              ])
            );
            onOpenChange(false);
            dispatch(getSingleProductByProductId(productId));
            setFormData(formValues);
          } else {
            addToast({ title: "Something went wrong !.", color: "danger" });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" })
        );
    },
    [formData, productId, dispatch]
  );

  const handleSubmitUploadDoc = useCallback(() => {
    dispatch(importProductCheckListDoument(fileUrl))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({ title: "Document uploaded successfully !." });
          setFileUrl("");
          uploadModal.onOpenChange(false);
        } else {
          addToast({ title: "Something went wrong !." });
        }
      })
      .catch(() => addToast({ title: "Something went wrong !." }));
  }, [dispatch, fileUrl]);

  return (
    <>
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2 my-2">
          <FileText className={iconClass} />{" "}
          <h1 className="font-medium">Documents</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="light" onPress={uploadModal.onOpen}>
            <Download className="h-4 w-4" /> Import
          </Button>
          <Button
            size="sm"
            isIconOnly
            variant="light"
            className="w-6 h-6 rounded-full bg-none"
            onPress={onOpen}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Table
        maxTableHeight={"400"}
        aria-label="Example static collection table"
        isHeaderSticky
        classNames={{
          wrapper: "max-h-[60vh]",
        }}
      >
        <TableHeader
          columns={[
            {
              key: "name",
              label: "NAME",
            },
            {
              key: "description",
              label: "DESCRIPTION",
            },
            {
              key: "country",
              label: "COUNTRY",
            },
            {
              key: "centralName",
              label: "CENTRAL",
            },
            {
              key: "stateName",
              label: "STATE",
            },
            {
              key: "actions",
              label: "ACTIONS",
            },
          ]}
        >
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={data || []}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) =>
                columnKey === "actions" ? (
                  <TableCell>
                    <div className="flex justify-start items-center gap-2">
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <EllipsisVertical className="text-default-300" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem key="edit">Edit</DropdownItem>
                          <DropdownItem
                            key="delete"
                            color="danger"
                            // onClick={modal.onOpen}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </TableCell>
                ) : (
                  <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                )
              }
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add product document
              </ModalHeader>
              <ModalBody className="w-full">
                <Form
                  className="w-full"
                  onSubmit={(e) => {
                    e.preventDefault();
                    let data = Object.fromEntries(
                      new FormData(e.currentTarget)
                    );
                    handleSubmit(data);
                  }}
                >
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {details?.serviceType === "international" && (
                      <NewSelect
                        isRequired={true}
                        errorMessage={"please select country"}
                        data={countryList}
                        label="Country"
                        name="country"
                        labelKey="name"
                        valueKey="name"
                        value={formData?.country}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, country: e }))
                        }
                      />
                    )}

                    {details?.serviceType === "state" && (
                      <NewSelect
                        isRequired={true}
                        errorMessage={"please select state"}
                        data={statesList}
                        label="State"
                        name="stateName"
                        labelKey="name"
                        valueKey="name"
                        value={formData?.stateName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, stateName: e }))
                        }
                      />
                    )}
                    <Input
                      isRequired
                      label="Document name"
                      name="name"
                      errorMessage="please enter the document name ."
                      value={formData?.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                    <Textarea
                      isRequired
                      label="Description"
                      name="description"
                      errorMessage="please enter the document description ."
                      value={formData?.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />

                    <Select
                      items={[
                        { label: "Client", key: "client" },
                        { label: "Agent", key: "agent" },
                      ]}
                      isRequired
                      errorMessage="please select type"
                      label="Type"
                      name="type"
                      selectedKeys={[formData?.type]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                    >
                      {(info) => <SelectItem>{info.label}</SelectItem>}
                    </Select>
                  </div>
                  <ModalFooter className="flex justify-end gap-2 w-full">
                    <Button onPress={onClose}>Cancel</Button>
                    <Button color="primary" type="submit">
                      Submit
                    </Button>
                  </ModalFooter>
                </Form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={uploadModal.isOpen}
        onOpenChange={uploadModal.onOpenChange}
        size="xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Upload document</ModalHeader>
              <ModalBody className="w-full">
                <div className="flex flex-col gap-4">
                  <SingleFileUploader
                    fileUrl={fileUrl}
                    setFileUrl={setFileUrl}
                  />
                  <div>
                    <a href="https://erp-corpseed.s3.ap-south-1.amazonaws.com/1753794064357DocumentsChecklist_(2).xlsx">
                      Download the sample document
                    </a>
                  </div>
                </div>
                <ModalFooter className="flex justify-end gap-2 w-full">
                  <Button onPress={onClose}>Cancel</Button>
                  <Button color="primary" onPress={handleSubmitUploadDoc}>
                    Submit
                  </Button>
                </ModalFooter>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProductDocument;
