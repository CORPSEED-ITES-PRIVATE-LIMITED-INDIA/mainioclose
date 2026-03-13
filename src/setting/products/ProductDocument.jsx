import {
  addToast,
  Button,
  Chip,
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
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { Download, EllipsisVertical, FileText, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getApplicantTypeList,
  importProductCheckListDoument,
} from "../../toolkit/slices/settingSlice";
import NewSelect from "../../components/NewSelect";
import {
  getAllCountries,
  getAllStatesByCountryName,
} from "../../toolkit/slices/commonSlice";
import { addDocumentsInProductsForOperation } from "../../toolkit/slices/operationSlice";
import FileUploader from "../../components/FileUploader";
import {
  getAllDocumentCheckListByProductId,
  getAllDocumentsForProduct,
  mapDocumentToProduct,
} from "../../toolkit/slices/productSlice";
const iconClass = "w-5 h-5";

const ProductDocument = () => {
  const dispatch = useDispatch();
  const { userId, solutionId } = useParams();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const uploadModal = useDisclosure();
  const applicantTypeList = useSelector(
    (state) => state.setting.applicantTypeList,
  );
  const allDocumentList = useSelector((state) => state.product.allDocumentList);
  const data = useSelector(
    (state) => state.product.allDocumentCheckListForProduct,
  );
  const formValues = {
    productId: solutionId,
    applicantTypeId: null,
    requiredDocumentIds: [],
    updatedBy: userId,
  };
  const [formData, setFormData] = useState(formValues);
  const [fileUrl, setFileUrl] = useState("");
  const [applicantTypeId, setApplicatTypeId] = useState("-1");

  useEffect(() => {
    dispatch(
      getAllDocumentCheckListByProductId({
        productId: solutionId,
        applicantTypeId,
      }),
    );
    dispatch(getAllCountries());
    dispatch(getAllStatesByCountryName("India"));
    dispatch(getApplicantTypeList({ page: 0, size: 1000 }));
    dispatch(getAllDocumentsForProduct({ page: 1, size: 1000, userId }));
  }, [dispatch, applicantTypeId]);

  const handleSubmit = useCallback(
    (values) => {
      dispatch(mapDocumentToProduct(formData))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Product mapped with document successfully !.",
              color: "success",
            });
            onClose();
            dispatch(
              getAllDocumentCheckListByProductId({
                applicantTypeId,
                productId: solutionId,
              }),
            );
            setFormData(formValues);
          } else {
            addToast({
              title: resp?.payload?.status,
              color: "danger",
              description: resp?.payload?.message,
            });
          }
        })
        .catch(() =>
          addToast({ title: "Something went wrong !.", color: "danger" }),
        );
    },
    [formData, solutionId, dispatch],
  );

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "documents":
        return (
          <div className="flex gap-1.5 flex-wrap">
            {rowData?.documents?.map((doc) => (
              <Tooltip
                showArrow
                content={
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-1">
                      <span className="text-tiny text-default-500">
                        Document type :
                      </span>
                      <span className="text-tiny font-medium">
                        {doc.documentType}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-tiny text-default-500">
                        Document type :
                      </span>
                      <span className="text-tiny font-medium">
                        {doc.allowedFormats}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-tiny text-default-500">
                        Expiry type :
                      </span>
                      <span className="text-tiny font-medium">
                        {doc.expiryType}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-tiny text-default-500">
                        Maximum validity :
                      </span>
                      <span className="text-tiny font-medium">
                        {doc.maxValidityYears} yrs
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <span className="text-tiny text-default-500">
                        Is mandatory :
                      </span>
                      <span className="text-tiny font-medium">
                        {doc.mandatory ? "YES" : "NO"}
                      </span>
                    </div>
                    <div className="flex gap-1 ">
                      <span className="text-tiny inline text-default-500">
                        Description :
                      </span>
                      <div className="text-tiny font-medium max-w-[300px]">
                        {doc.description}
                      </div>
                    </div>
                  </div>
                }
              >
                <Chip key={doc.requiredDocumentId}>{doc.documentName}</Chip>
              </Tooltip>
            ))}
          </div>
        );
      case "actions":
        return (
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
        );

      default:
        return rowData[columnKey] || "-";
    }
  }, []);

  const handleSubmitUploadDoc = useCallback(() => {
    dispatch(importProductCheckListDoument(fileUrl))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Document uploaded successfully !.",
            color: "success",
          });
          setFileUrl("");
          uploadModal.onOpenChange(false);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" }),
      );
  }, [dispatch, fileUrl]);

  return (
    <>
      <div className="flex justify-between items-center w-full my-2.5">
        <div className="flex items-center gap-2 my-2">
          <FileText className={iconClass} />{" "}
          <h1 className="font-medium">Documents</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="min-w-[200px]">
            <NewSelect
              // label={"Applicant type"}
              data={[{ id: "-1", name: "All" }, ...applicantTypeList]}
              labelKey="name"
              valueKey="id"
              value={applicantTypeId}
              onChange={(e) => setApplicatTypeId(e)}
            />
          </div>
          <Button variant="light" onPress={uploadModal.onOpen}>
            <Download className="h-4 w-4" /> Import
          </Button>

          <Button
            size="sm"
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onPress={onOpen}
          >
            Add
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
              key: "requiredDocumentId",
              label: "ID",
            },
            {
              key: "documentName",
              label: "DOCUMENT name",
            },
            {
              key: "applicantTypeName",
              label: "APPLICANT TYPE",
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
            <TableRow key={item.requiredDocumentId}>
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
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
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
                      new FormData(e.currentTarget),
                    );
                    handleSubmit(data);
                  }}
                >
                  <div className="grid gap-2 w-full">
                    <NewSelect
                      isRequired={true}
                      errorMessage={"please select applicant type ."}
                      data={applicantTypeList}
                      label="Applicant type"
                      name="name"
                      labelKey="name"
                      valueKey="id"
                      value={formData?.applicantTypeId}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, applicantTypeId: e }))
                      }
                    />

                    <NewSelect
                      isRequired={true}
                      selectionMode="multiple"
                      errorMessage={"please select documents ."}
                      data={allDocumentList}
                      label="Select Document"
                      name="name"
                      labelKey="name"
                      valueKey="id"
                      value={formData?.requiredDocumentIds}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          requiredDocumentIds: e,
                        }))
                      }
                    />
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
                  <FileUploader
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e)}
                  />
                  <div>
                    <a
                      className="text-primary-500"
                      href="https://erp-corpseed.s3.ap-south-1.amazonaws.com/1753794064357DocumentsChecklist_(2).xlsx"
                    >
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
