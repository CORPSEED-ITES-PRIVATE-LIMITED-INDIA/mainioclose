import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  addSalesTatInProduct,
  getAllSalesTatInProduct,
  getAllStatusData,
  getSingleProductByProductId,
} from "../../toolkit/slices/settingSlice";
import { EllipsisVertical, HandHelping, Plus } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import NewSelect from "../../components/NewSelect";
import {
  getAllCountries,
  getAllStatesByCountryName,
} from "../../toolkit/slices/commonSlice";
const iconClass = "w-5 h-5";

const SalesTAT = ({ details }) => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const data = useSelector((state) => state.setting.salesTatList);
  const statusList = useSelector((state) => state.setting.statusList);
  const countryList = useSelector((state) => state.common.countriesList);
  const statesList = useSelector((state) => state.common.statesList);
  const formValues = {
    productId: productId,
    tat: "",
    statusId: null,
    centralName: details?.serviceType === "central" ? "India" : "",
    stateName: "",
    country: "",
  };
  const [formData, setFormData] = useState(formValues);

  useEffect(() => {
    dispatch(getAllSalesTatInProduct(productId));
    dispatch(getAllStatusData());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllCountries());
    dispatch(getAllStatesByCountryName("India"));
  }, [dispatch]);

  const handleSubmit = useCallback(() => {
    dispatch(addSalesTatInProduct(formData))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          addToast({
            title: "Sales tat added successfully !.",
            color: "success",
          });
          dispatch(getAllSalesTatInProduct(productId));
          setFormData(formValues);
          onOpenChange(false);
        } else {
          addToast({ title: "Something went wrong !.", color: "danger" });
        }
      })
      .catch(() =>
        addToast({ title: "Something went wrong !.", color: "danger" })
      );
  }, [formData, productId]);

  return (
    <>
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-2 my-2">
          <HandHelping className={iconClass} />{" "}
          <h1 className="font-medium">Sales TAT</h1>
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
              key: "id",
              label: "ID",
            },
            {
              key: "status",
              label: "STATUS",
            },
            {
              key: "tat",
              label: "TAT",
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
                    <div className="relative flex justify-start items-center gap-2">
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
                ) : columnKey === "tat" ? (
                  <TableCell>{getKeyValue(item, columnKey)} hours</TableCell>
                ) : (
                  <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                )
              }
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add sales TAT
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

                  {details?.serviceType === "central" && (
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
                  <NewSelect
                    isRequired={true}
                    errorMessage="please select the status"
                    name={"statusId"}
                    label="Select status"
                    data={statusList}
                    labelKey={"name"}
                    value={formData?.statusId}
                    valueKey={"id"}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, statusId: e }))
                    }
                  />
                  <Input
                    isRequired
                    label="TAT (in hours e.g 4 hours or xyz hours)"
                    name="tat"
                    type="number"
                    errorMessage="please enter the tat ."
                    value={formData?.tat}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tat: e.target.value,
                      }))
                    }
                  />

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

export default SalesTAT;
