import React, { useCallback, useEffect, useState } from "react";
import CommonTable from "../../../../components/CommonTable";
import { useDispatch, useSelector } from "react-redux";
import MainHeading from "../../../../components/design/MainHeading";
import { getAllUnbillList } from "../../../../Toolkit/Slices/AccountSlice";
import { Input } from "antd";
import { Icon } from "@iconify/react";

const Unbill = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.account.unBillList);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });

  useEffect(() => {
    dispatch(getAllUnbillList());
  }, [dispatch]);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchText(value);
    const filtered = data?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handlePagination = useCallback(
    (dataPage, size) => {
      setPaginationData({ size: size, page: dataPage });
    },
    [dispatch]
  );

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      width:50
    },
    {
      dataIndex: "estimateId",
      title: "Estimate id",
    },
    {
      dataIndex: "company",
      title: "Company",
    },
    {
      dataIndex: "client",
      title: "Client",
    },
    {
      dataIndex: "txnAmount",
      title: "Tax amount",
    },
    {
      dataIndex: "orderAmount",
      title: "Order amount",
    },
    {
      dataIndex: "dueAmount",
      title: "Due amount",
    },
    {
      dataIndex: "paidAmount",
      title: "Paid amount",
    },
    {
      dataIndex: "status",
      title: "Status",
    },
  ];
  return (
    <div>
      <div className="create-user-box">
        <MainHeading data={`Unbill items list`} />
      </div>
      <Input
        value={searchText}
        onChange={handleSearch}
        style={{ width: "25%",margin:'8px 0px' }}
        placeholder="search"
        prefix={<Icon icon="fluent:search-24-regular" />}
      />
      <CommonTable
        data={filteredData}
        columns={columns}
        scroll={{ y: 520, x: 1200 }}
        rowSelection={true}
        rowKey={(record) => record?.id}
        rowClassName={(record) => (!record.view ? "light-gray-row" : "")}
        pagination={true}
        page={paginationData?.page}
        pageSize={paginationData?.size}
        totalCount={data?.length}
        handlePagination={handlePagination}
      />
    </div>
  );
};

export default Unbill;
