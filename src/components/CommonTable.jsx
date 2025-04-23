import { Button, Pagination, Table } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import "./CommonTable.scss";

const CommonTable = ({
  data,
  columns,
  scroll,
  pagination,
  rowSelection,
  onRowSelection,
  selectedRowKeys,
  rowClassName,
  footerContent,
  rowKey,
  page,
  handlePagination,
  totalCount,
  pageSize,
  onRow,
  getCheckboxProps,
  expandable
}) => {
  const tableContainerRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const scrollTable = (direction) => {
    if (tableContainerRef.current) {
      const scrollAmount = 150;
      const currentScrollLeft = tableContainerRef.current.scrollLeft;
      const maxScrollLeft =
        tableContainerRef.current.scrollWidth -
        tableContainerRef.current.clientWidth;

      if (direction === "left") {
        const newScrollLeft = Math.max(0, currentScrollLeft - scrollAmount);
        tableContainerRef.current.scrollLeft = newScrollLeft;
      } else if (direction === "right") {
        const newScrollLeft = Math.min(
          maxScrollLeft,
          currentScrollLeft + scrollAmount
        );
        tableContainerRef.current.scrollLeft = newScrollLeft;
      }

      checkScrollButtons();
    }
  };

  const checkScrollButtons = () => {
    if (tableContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        tableContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
    }
  };

  const startScrolling = (direction) => {
    stopScrolling();
    scrollIntervalRef.current = setInterval(() => {
      scrollTable(direction);
    }, 50);
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    const tableBody = document.querySelector(".ant-table-body");
    if (tableBody) {
      tableContainerRef.current = tableBody;
      checkScrollButtons();
      tableBody.addEventListener("scroll", checkScrollButtons);
    }

    return () => {
      if (tableBody) {
        tableBody.removeEventListener("scroll", checkScrollButtons);
      }
      stopScrolling();
    };
  }, [data, columns]);

  return (
    <div className="table-container">
      {canScrollLeft && (
        <Button
          shape="round"
          size="small"
          className="scroll-button scroll-left"
          onMouseDown={() => startScrolling("left")}
          onMouseUp={stopScrolling}
          onMouseLeave={stopScrolling}
        >
          <Icon icon="fluent:chevron-left-20-regular" /> Left
        </Button>
      )}
      {canScrollRight && (
        <Button
          shape="round"
          size="small"
          className="scroll-button scroll-right"
          onMouseDown={() => startScrolling("right")}
          onMouseUp={stopScrolling}
          onMouseLeave={stopScrolling}
        >
          <Icon icon="fluent:chevron-right-20-regular" /> Right
        </Button>
      )}
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={scroll}
        onRow={onRow}
        rowKey={rowKey}
        rowClassName={rowClassName}
        expandable={expandable}
        rowSelection={
          rowSelection && {
            type: "checkbox",
            getCheckboxProps: getCheckboxProps,
            selectedRowKeys: selectedRowKeys,
            onChange: onRowSelection,
          }
        }
        footer={() => (
          <div className="table-footer">
            <div>{footerContent}</div>
            {pagination && (
              <Pagination
                style={{ fontSize: 12 }}
                size="small"
                responsive={true}
                showLessItems={true}
                current={page}
                pageSize={pageSize}
                defaultPageSize={50}
                pageSizeOptions={[50, 100, 150, 300, 500]}
                total={totalCount}
                onChange={(e, x) => handlePagination(e, x)}
              />
            )}
          </div>
        )}
      />
    </div>
  );
};

export default CommonTable;
