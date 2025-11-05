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
import { EllipsisVertical, Paperclip, Plus } from "lucide-react";
import SingleFileUploader from "../../components/SingleFileUploader";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  addDocsInProduct,
  getSingleProductByProductId,
} from "../../toolkit/slices/settingSlice";
import FileUploader from "../../components/FileUploader";
const iconClass = "w-5 h-5";

const ProductAttachedDocument = ({ details }) => {
  const dispatch = useDispatch();
  const { productId, userId } = useParams();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const formValues = {
    productId: productId,
    documentsName: "",
    userId,
    name: "",
    type: "",
    description: "",
  };
  const [formData, setFormData] = useState(formValues);

  const handleSubmit = useCallback(() => {
    dispatch(addDocsInProduct(formData))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Document uploaded successfully !.",
            color: "success",
          });
          setFormData(formValues);
          dispatch(getSingleProductByProductId(productId));
          onOpenChange(false);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  }, [formData, productId, dispatch]);

  return (
    <>
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2 my-2">
          <Paperclip className={iconClass} />{" "}
          <h1 className="font-medium">Attached documents</h1>
        </div>
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
              key: "documentsName",
              label: "NAME",
            },
            {
              key: "description",
              label: "DESCRIPTION",
            },
            {
              key: "document",
              label: "Document",
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
        <TableBody items={details?.doc || []}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) =>
                columnKey === "actions" ? (
                  <TableCell>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                          <EllipsisVertical className="text-default-300" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem key="edit">Edit</DropdownItem>
                        <DropdownItem key="delete" color="danger">
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </TableCell>
                ) : columnKey === "document" ? (
                  <TableCell>
                    <Link to={item?.name}>View</Link>
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
                Product upload
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
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Input
                      isRequired
                      label="Document name"
                      name="documentsName"
                      errorMessage="please enter the document name ."
                      value={formData?.documentsName}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          documentsName: e.target.value,
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

                    <FileUploader
                      isRequired
                      label="Document attachement"
                      value={formData?.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e,
                        }))
                      }
                    />

                    <Textarea
                      isRequired
                      label="Description"
                      name="description"
                      value={formData?.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
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
    </>
  );
};

export default ProductAttachedDocument;
