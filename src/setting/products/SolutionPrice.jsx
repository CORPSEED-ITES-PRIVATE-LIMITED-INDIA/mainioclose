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
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  addPriceInServiceTypeSolution,
  deletePriceServiceTypeSolution,
  getSolutionPriceListById,
  importProductAmountDoument,
  updatePriceInServiceTypeSolution,
} from "../../toolkit/slices/settingSlice";
import FileUploader from "../../components/FileUploader";
import { inrCurrency } from "../../common";
const iconClass = "w-5 h-5";

const SolutionPrice = () => {
  const dispatch = useDispatch();
  const { userId, solutionId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const deleteModal = useDisclosure();
  const uploadModal = useDisclosure();
  const data = useSelector((state) => state.setting.solutionPriceList);
  const [isEdit, setIsEdit] = useState(false);
  const [itemId, setItemId] = useState(null);
  const formValues = {
    name: "",
    baseAmount: "",
    hsnCode: "",
    gstPercentage: "",
    displayOrder: "",
  };
  const [formData, setFormData] = useState(formValues);
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    dispatch(getSolutionPriceListById({ solutionId, userId }));
  }, [solutionId, userId]);

  const handleDeleteItem = (feeId) => {
    dispatch(deletePriceServiceTypeSolution({ solutionId, feeId:itemId }))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          deleteModal.onClose();
          dispatch(getSolutionPriceListById({ solutionId, userId }));
          setItemId(null);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  };

  const handleEdit = (values) => {
    setFormData({
      name: values?.name,
      baseAmount: values?.baseAmount,
      hsnCode: values?.hsnSacCode,
      gstPercentage: values?.gstPercentage,
      displayOrder: values?.displayOrder,
    });
    setIsEdit(true);
    setItemId(values?.id);
    onOpen();
  };

  const handleSubmit = (values) => {
    if (isEdit) {
      dispatch(
        updatePriceInServiceTypeSolution({
          feeId: itemId,
          solutionId,
          userId,
          data: values,
        })
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Fee details updated successfully !.",
              color: "success",
            });
            onOpenChange(false);
            dispatch(getSolutionPriceListById({ solutionId, userId }));
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
      dispatch(
        addPriceInServiceTypeSolution({ solutionId, userId, data: formData })
      )
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            addToast({
              title: "Fee details created successfully !.",
              color: "success",
            });
            onOpenChange(false);
            dispatch(getSolutionPriceListById({ solutionId, userId }));
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
  };

  const handleSubmitUploadDoc = useCallback(() => {
    dispatch(importProductAmountDoument(fileUrl))
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
            onPress={() => {
              onOpen();
              setFormData(formValues);
            }}
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
              key: "baseAmount",
              label: "FEE",
            },
            {
              key: "hsnSacCode",
              label: "HSN",
            },
            {
              key: "gstPercentage",
              label: "GST %",
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
                            onPress={() => {
                              deleteModal.onOpen();
                              setItemId(item?.id);
                            }}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </TableCell>
                ) : (
                  <TableCell>
                    {columnKey === "baseAmount"
                      ? inrCurrency(getKeyValue(item, columnKey))
                      : getKeyValue(item, columnKey)}
                  </TableCell>
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
                Solution fee detail
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
                      name="baseAmount"
                      type="number"
                      startContent={<IndianRupee className="h-4 w-4" />}
                      value={formData?.baseAmount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          baseAmount: e.target.value,
                        }))
                      }
                    />
                    <Input
                      isRequired
                      label="HSN number"
                      errorMessage="please enter HSN number"
                      name="hsnCode"
                      value={formData?.hsnCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          hsnCode: e.target.value,
                        }))
                      }
                    />
                    <Input
                      isRequired
                      label="GST %"
                      errorMessage="please enter tax %"
                      name="gstPercentage"
                      value={formData?.gstPercentage}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          gstPercentage: e.target.value,
                        }))
                      }
                    />

                    <Input
                      label="Display order"
                      name="displayOrder"
                      value={formData?.displayOrder}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          displayOrder: e.target.value,
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
                      className="text-primary"
                      href="https://erp-corpseed.s3.ap-south-1.amazonaws.com/1753794100973productAmount_(1).xlsx"
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

      <Modal
        isOpen={deleteModal.isOpen}
        onOpenChange={deleteModal.onOpenChange}
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Delete</ModalHeader>
              <ModalBody>
                <p>Are you sure to delete this item ?</p>
              </ModalBody>
              <ModalFooter>
                <Button onPress={onClose}>No</Button>
                <Button color="primary" onPress={handleDeleteItem}>
                  Yes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default SolutionPrice;
