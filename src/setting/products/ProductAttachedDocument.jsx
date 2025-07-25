import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { EllipsisVertical, Paperclip, Plus } from "lucide-react";
const iconClass = "w-5 h-5";

const ProductAttachedDocument = () => {
  return (
    <Card className="dark:bg-gray-700 my-2">
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2">
            <Paperclip className={iconClass} /> <h1>Attached documents</h1>
          </div>
          <Button
            size="sm"
            isIconOnly
            variant="light"
            className="w-6 h-6 rounded-full bg-none"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <Table
          maxTableHeight={"200"}
          aria-label="Example static collection table"
          isHeaderSticky
          classNames={{
            wrapper: "max-h-[250px]",
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
                key: "actions",
                label: "ACTIONS",
              },
            ]}
          >
            {(column) => (
              <TableColumn key={column.key}>{column.label}</TableColumn>
            )}
          </TableHeader>
          <TableBody items={details?.productDoc || []}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) =>
                  columnKey === "actions" ? (
                    <TableCell>
                      <div className="relative flex justify-center items-center gap-2">
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
      </CardBody>
    </Card>
  );
};

export default ProductAttachedDocument;
