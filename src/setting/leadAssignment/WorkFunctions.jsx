import React, { useEffect } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from "@heroui/react";
import { useDispatch, useSelector } from "react-redux";
import { getWorkFunctions } from "../../toolkit/slices/settingSlice";

const columns = [
  { name: "#", uid: "id" },
  { name: "CODE", uid: "code" },
  { name: "NAME", uid: "name" },
];

const WorkFunctions = () => {
  const dispatch = useDispatch();
  const workFunctions = useSelector((state) => state.setting.workFunctionsList);

  useEffect(() => {
    dispatch(getWorkFunctions());
  }, [dispatch]);

  const renderCell = (rowData, columnKey) => {
    switch (columnKey) {
      case "code":
        return (
          <Chip size="sm" variant="flat">
            {rowData?.code}
          </Chip>
        );

      case "name":
        return <span className="font-medium">{rowData?.name}</span>;

      default:
        return rowData?.[columnKey];
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-sans text-lg font-semibold mb-2 shrink-0">
        Work Functions
      </h1>

      <Table
        isHeaderSticky
        removeWrapper={false}
        aria-label="Sales work functions table"
        classNames={{
          base: "gap-2.5",
          wrapper:
            "max-h-[calc(100vh-320px)] w-full overflow-y-auto rounded-lg border border-gray-200 dark:border-white/10 shadow-none p-0",
          table: "w-full",
          thead: "[&>tr]:first:rounded-none",
          th: "h-8 py-0 text-[11.5px] tracking-wide bg-gray-50 dark:bg-neutral-900 text-default-500 first:rounded-none last:rounded-none border-b border-gray-200 dark:border-white/10",
          td: "py-1.5 text-[12.5px]",
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.uid} align="start">
              {column.name}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody emptyContent={"No data found"} items={workFunctions || []}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkFunctions;
