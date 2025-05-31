import React, { useCallback, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { Icon } from "@iconify/react"
import { Button, Flex, Input, Typography } from "antd"
import { vendorRequestListForSalesUser } from "../../../Toolkit/Slices/LeadSlice"
import MainHeading from "../../../components/design/MainHeading"
import TableScalaton from "../../../components/TableScalaton"
import CommonTable from "../../../components/CommonTable"
import OverFlowText from "../../../components/OverFlowText"
import VendorsRequestDetails from "./VendorsRequestDetails"
import dayjs from "dayjs"
const { Text } = Typography

const VendorsRequestList = () => {
  const dispatch = useDispatch()
  const loading = useSelector((state) => state.leads.loading)
  const { userid } = useParams()
  const dataList = useSelector(
    (prev) => prev?.leads.requestListForVendors?.vendorRequests
  )

  const totalCount = useSelector(
    (state) => state.leads.requestListForVendors?.totalCount
  )

  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [assigneeId, setAssigneeId] = useState(null)
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  })


  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(dataList);
  }, [dataList]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    const filtered = dataList?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    dispatch(
      vendorRequestListForSalesUser({
        userid: userid,
        page: paginationData?.page,
        size: paginationData?.size,
      })
    )
  }, [dispatch, userid])

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(
        vendorRequestListForSalesUser({
          userid: userid,
          page: dataPage,
          size: size,
        })
      )
      setPaginationData({ size: size, page: dataPage })
    },
    [userid, dispatch]
  )

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      width: 90,
      fixed: "left",
      render: (_, data) => (
        <Flex gap={4} align="center">
          <Text>{data?.vendorRequestId}</Text>
          <Icon
            icon="fluent:circle-16-filled"
            color={data?.currentStatus ? "green" : "red"}
          />
        </Flex>
      ),
    },
    {
      dataIndex: "leadName",
      title: "Lead name",
      fixed: "left",
      render: (_, data) => (
        <VendorsRequestDetails data={data}>
          {data?.leadName}
        </VendorsRequestDetails>
      ),
    },
    {
      dataIndex: "currentStatus",
      title: "Current status",
    },
    {
      dataIndex: "date",
      title: "Date",
      sorter: (a, b) => (dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1),
      defaultSortOrder: "descend",
    },
    {
      dataIndex: "clientName",
      title: "Client name",
    },
    {
      dataIndex: "companyName",
      title: "Client company name",
    },
    {
      dataIndex: "clientNumber",
      title: "Client contact",
    },
    {
      dataIndex: "clientEmail",
      title: "Client email",
    },
    {
      dataIndex: "budgetPrice",
      title: "Client budget",
    },
    {
      dataIndex: "categoryName",
      title: "Category name",
    },
    {
      dataIndex: "subCategoryName",
      title: "Subcategory name",
    },
    {
      dataIndex: "vendorComment",
      title: "Comment",
      render: (_, info) => (
        <OverFlowText>{info?.requirementDescription}</OverFlowText>
      ),
    },
  ]

  return (
    <>
      <div className="create-user-box">
        <MainHeading data={`Client request list for vendors`} />
      </div>
      <Flex className="marginBottom8px">
        <Input 
        value={searchText}
        size="small"
        onChange={handleSearch}
        placeholder="search"
        style={{ width: "25%" }}
        />
      </Flex>
      {loading === "pending" ? (
        <TableScalaton />
      ) : (
        <CommonTable
          data={filteredData}
          columns={columns}
          scroll={{ y: 520, x: 1900 }}
          rowSelection={true}
          onRowSelection={onSelectChange}
          selectedRowKeys={selectedRowKeys}
          rowKey={(record) => record?.vendorRequestId}
          pagination={true}
          page={paginationData?.page}
          pageSize={paginationData?.size}
          totalCount={totalCount}
          handlePagination={handlePagination}
        />
      )}
    </>
  )
}

export default VendorsRequestList
