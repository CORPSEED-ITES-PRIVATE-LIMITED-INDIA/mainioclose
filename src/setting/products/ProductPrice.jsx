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
  useDisclosure,
} from "@heroui/react";
import {
  Banknote,
  Download,
  EllipsisVertical,
  IndianRupee,
  Plus,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllCountries,
  getAllStatesByCountryName,
} from "../../toolkit/slices/commonSlice";
import NewSelect from "../../components/NewSelect";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addAmountForProduct,
  editAmountForProduct,
  getSingleProductByProductId,
  importProductAmountDoument,
} from "../../toolkit/slices/settingSlice";
import SingleFileUploader from "../../components/SingleFileUploader";
import FileUploader from "../../components/FileUploader";
const iconClass = "w-5 h-5";

const ProductPrice = ({ data, details }) => {
  const dispatch = useDispatch();
  const { userId, productId } = useParams();
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const uploadModal = useDisclosure();
  const [isEdit, setIsEdit] = useState(false);
  const [itemId, setItemId] = useState(null);
  const formValues = {
    productId: productId,
    categoryId: 0,
    userId,
    name: "",
    fees: 0,
    hsnNo: "",
    taxAmount: "",
    centralName: details?.serviceType === "central" ? "India" : "",
    stateName: "",
    country: "",
  };
  const [formData, setFormData] = useState(formValues);
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    dispatch(getAllCountries());
    dispatch(getAllStatesByCountryName("India"));
  }, []);

  const handleEdit = (values) => {
    setFormData({
      productId: productId,
      categoryId: 0,
      userId,
      name: values?.name,
      fees: values?.fees,
      hsnNo: values?.hsnNo,
      taxAmount: values?.taxAmount,
      centralName: values?.centralName,
      stateName: values?.stateName,
      country: values?.country,
    });
    setIsEdit(true);
    setItemId(values?.id);
    onOpen();
  };

  const handleSubmit = useCallback(
    (values) => {
      if (isEdit) {
        dispatch(editAmountForProduct({ productAmountId: itemId, ...values }))
          .then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              addToast({
                title: "Fee details updated successfully !.",
                color: "success",
              });
              onOpenChange(false);
              dispatch(getSingleProductByProductId(productId));
              setIsEdit(false);
              setItemId(null);
              setFormData(formValues);
            } else {
              addToast({ title: "Something went wrong !.", color: "danger" });
            }
          })
          .catch(() =>
            addToast({ title: "Something went wrong !.", color: "danger" })
          );
      } else {
        dispatch(addAmountForProduct(formData))
          .then((resp) => {
            if (resp.meta.requestStatus === "fulfilled") {
              addToast({
                title: "Fee details created successfully !.",
                color: "success",
              });
              onOpenChange(false);
              dispatch(getSingleProductByProductId(productId));
              setIsEdit(false);
              setItemId(null);
              setFormData(formValues);
            } else {
              addToast({ title: "Something went wrong !.", color: "danger" });
            }
          })
          .catch(() =>
            addToast({ title: "Something went wrong !.", color: "danger" })
          );
      }
    },
    [formData]
  );

  const handleSubmitUploadDoc = useCallback(() => {
    dispatch(importProductAmountDoument(fileUrl))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({ title: "Document uploaded successfully !.",color:"success" });
          setFileUrl("");
          uploadModal.onOpenChange(false);
        } else {
          addToast({ title: "Something went wrong !.",color:"danger" });
        }
      })
      .catch(() => addToast({ title: "Something went wrong !.",color:"danger" }));
  }, [dispatch, fileUrl]);

  return (
    <>
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2 my-2">
          <Banknote className={iconClass} />{" "}
          <h1 className="font-medium">Price</h1>
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
              label: "FEE TYPE",
            },
            {
              key: "fees",
              label: "FEE",
            },
            {
              key: "hsnNo",
              label: "HSN",
            },
            {
              key: "taxAmount",
              label: "TAX %",
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
                          <DropdownItem
                            key="edit"
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            color="danger"
                            // onClick={modal.onOpen} q
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
                Product fee detail
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

                    {details?.serviceType === "central" && (
                      <NewSelect
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

                    <Select
                      items={[
                        {
                          label: "Professional fees",
                          key: "Professional fees",
                        },
                        { label: "Service charges", key: "Service charges" },
                        { label: "Government", key: "Government" },
                        { label: "Other fees", key: "Other fees" },
                      ]}
                      isRequired
                      errorMessage="please select fee name"
                      label="Fee name"
                      name="name"
                      selectedKeys={[formData?.name]}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    >
                      {(info) => <SelectItem>{info.label}</SelectItem>}
                    </Select>
                    <Input
                      isRequired
                      label="Fee"
                      errorMessage="please enter fee amount"
                      name="fees"
                      type="number"
                      startContent={<IndianRupee className="h-4 w-4" />}
                      value={formData?.fees}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fees: e.target.value,
                        }))
                      }
                    />
                    <Input
                      isRequired
                      label="HSN number"
                      errorMessage="please enter HSN number"
                      name="hsnNo"
                      value={formData?.hsnNo}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hsnNo: e.target.value,
                        }))
                      }
                    />
                    <Input
                      isRequired
                      label="Tax %"
                      errorMessage="please enter tax %"
                      name="taxAmount"
                      value={formData?.taxAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          taxAmount: e.target.value,
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
                    <a className="text-primary" href="https://erp-corpseed.s3.ap-south-1.amazonaws.com/1753794100973productAmount_(1).xlsx">
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

export default ProductPrice;
