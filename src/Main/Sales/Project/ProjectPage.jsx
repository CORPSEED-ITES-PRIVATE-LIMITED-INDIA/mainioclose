import React, { useCallback, useEffect, useState } from "react";
import TableOutlet from "../../../components/design/TableOutlet";
import MainHeading from "../../../components/design/MainHeading";
import TableScalaton from "../../../components/TableScalaton";
import SomethingWrong from "../../../components/usefulThings/SomethingWrong";
import { useDispatch, useSelector } from "react-redux";
import { getProjectAction } from "../../../Toolkit/Slices/ProjectSlice";
import ColComp from "../../../components/small/ColComp";
import CommonTable from "../../../components/CommonTable";
import OverFlowText from "../../../components/OverFlowText";
import { Icon } from "@iconify/react";
import { Flex, Input } from "antd";

const ProjectPage = () => {
  const dispatch = useDispatch();
  const currUserId = useSelector((prev) => prev?.auth?.currentUser?.id);
  const { allProject, loadingProject, errorProject } = useSelector(
    (prev) => prev?.project
  );

  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });

  useEffect(() => {
    dispatch(
      getProjectAction({
        id: currUserId,
        page: paginationData?.page,
        size: paginationData?.size,
      })
    );
  }, [currUserId, dispatch]);

  useEffect(() => {
    setFilteredData(allProject);
  }, [allProject]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(getProjectAction({ id: currUserId, page: dataPage, size }));
      setPaginationData({ size: size, page: dataPage });
    },
    [currUserId, dispatch]
  );

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchText(value);
    const filtered = allProject?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      width: 50,
      fixed: "left",
    },
    {
      dataIndex: "projectName",
      title: "Project name",
      fixed: "left",
      render: (_, props) => <OverFlowText>{props?.projectName}</OverFlowText>,
    },

    {
      dataIndex: "leadNane",
      title: "Lead name",
      render: (_, props) => <OverFlowText>{props?.leadName}</OverFlowText>,
    },
    {
      dataIndex: "client",
      title: "Client",
      render: (_, props) => <OverFlowText>{props?.client}</OverFlowText>,
    },

    {
      dataIndex: "amount",
      title: "Amount",
      render: (_, props) => <OverFlowText>{props?.amount}</OverFlowText>,
    },
    {
      dataIndex: "assigneeName",
      title: "Assignee name",
      render: (_, props) => <OverFlowText>{props?.assigneeName}</OverFlowText>,
    },
    {
      dataIndex: "status",
      title: "Status",
      render: (_, data) => <ColComp data={data?.status} />,
    },
    {
      dataIndex: "pAddress",
      title: "Primary address",
      render: (_, record) => <OverFlowText>{record?.pAddress}</OverFlowText>,
    },
    {
      dataIndex: "pCity",
      title: "Primary city",
      render: (_, record) => <OverFlowText>{record?.pCity}</OverFlowText>,
    },
    {
      dataIndex: "pState",
      title: "Primary state",
      render: (_, record) => <OverFlowText>{record?.pState}</OverFlowText>,
    },
    {
      dataIndex: "pCountry",
      title: "Primary country",
      render: (_, record) => <OverFlowText>{record?.pCountry}</OverFlowText>,
    },
    {
      dataIndex: "pPinCode",
      title: "Primary pincode",
      render: (_, record) => <OverFlowText>{record?.pPinCode}</OverFlowText>,
    },
    {
      dataIndex: "sAddress",
      title: "Secondary address",
      render: (_, record) => <OverFlowText>{record?.sAddress}</OverFlowText>,
    },
    {
      dataIndex: "sCity",
      title: "Secondary city",
      render: (_, record) => <OverFlowText>{record?.sCity}</OverFlowText>,
    },
    {
      dataIndex: "sState",
      title: "Secondary state",
      render: (_, record) => <OverFlowText>{record?.sState}</OverFlowText>,
    },
    {
      dataIndex: "sCountry",
      title: "Secondary country",
      render: (_, record) => <OverFlowText>{record?.sCountry}</OverFlowText>,
    },
    {
      dataIndex: "sPinCode",
      title: "Secondary pincode",
      render: (_, record) => <OverFlowText>{record?.sPinCode}</OverFlowText>,
    },
  ];

  return (
    <TableOutlet>
      <MainHeading data={`All projects`} />
      <Flex className="marginBottom8px">
        <Input
          value={searchText}
          onChange={handleSearch}
          style={{ width: "20%" }}
          placeholder="search"
          prefix={<Icon icon="fluent:search-24-regular" />}
        />
      </Flex>
      <div className="mt-3">
        {loadingProject && <TableScalaton />}
        {errorProject && <SomethingWrong />}
        {allProject && !loadingProject && !errorProject && (
          <CommonTable
            data={filteredData}
            columns={columns}
            scroll={{ y: 500, x: 2500 }}
            page={paginationData?.page}
            pageSize={paginationData?.size}
            pagination={true}
            totalCount={filteredData?.[0]?.totalProject}
            handlePagination={handlePagination}
          />
        )}
      </div>
    </TableOutlet>
  );
};

export default ProjectPage;
