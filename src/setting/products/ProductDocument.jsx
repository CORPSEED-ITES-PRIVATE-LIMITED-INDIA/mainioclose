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
  addDocumentProduct,
  getApplicantTypeList,
  getSingleProductByProductId,
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
  const { userId, productId } = useParams();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const uploadModal = useDisclosure();
  const applicantTypeList = useSelector(
    (state) => state.setting.applicantTypeList
  );
  const allDocumentList = useSelector((state) => state.product.allDocumentList);
  const data = useSelector(
    (state) => state.product.allDocumentCheckListForProduct
  );
  const formValues = {
    productId: productId,
    applicantTypeId: null,
    requiredDocumentIds: [],
    updatedBy: userId,
  };
  const [formData, setFormData] = useState(formValues);
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    dispatch(getAllDocumentCheckListByProductId(productId));
    dispatch(getAllCountries());
    dispatch(getAllStatesByCountryName("India"));
    dispatch(getApplicantTypeList({ page: 0, size: 1000 }));
    dispatch(getAllDocumentsForProduct(userId));
  }, [dispatch]);

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
            dispatch(getAllDocumentCheckListByProductId(productId));
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
          addToast({ title: "Something went wrong !.", color: "danger" })
        );
    },
    [formData, productId, dispatch]
  );

  const renderCell = useCallback((rowData, columnKey) => {
    switch (columnKey) {
      case "mandatory":
        return (
          <div className="flex gap-1.5 flex-wrap">
            {rowData?.mandatory ? "Yes" : "No"}
          </div>
        );
      case "maxValidityYears":
        return (
          <div className="flex gap-1.5 flex-wrap">
            {rowData?.maxValidityYears} yrs
          </div>
        );
      // case "actions":
      //   return (
      //     <div className="flex justify-start items-center gap-2">
      //       <Dropdown>
      //         <DropdownTrigger>
      //           <Button isIconOnly size="sm" variant="light">
      //             <EllipsisVertical className="text-default-300" />
      //           </Button>
      //         </DropdownTrigger>
      //         <DropdownMenu>
      //           <DropdownItem key="edit">Edit</DropdownItem>
      //           <DropdownItem
      //             key="delete"
      //             color="danger"
      //             // onClick={modal.onOpen}
      //           >
      //             Delete
      //           </DropdownItem>
      //         </DropdownMenu>
      //       </Dropdown>
      //     </div>
      //   );

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
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
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
              key: "mappingId",
              label: "ID",
            },
            {
              key: "documentName",
              label: "DOCUMENT NAME",
            },
            {
              key: "applicantTypeName",
              label: "APPLICANT TYPE NAME",
            },
            {
              key: "documentType",
              label: "DOCUMENT NAME",
            },
            {
              key: "description",
              label: "DESCRIPTION",
            },
            {
              key: "allowedFormats",
              label: "ALLOWED FORMATS",
            },
            {
              key: "mandatory",
              label: "MANDATORY",
            },
            {
              key: "maxValidityYears",
              label: "VALIDITY",
            },
          ]}
        >
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={data || []}>
          {(item) => (
            <TableRow key={item.mappingId}>
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
                      new FormData(e.currentTarget)
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
