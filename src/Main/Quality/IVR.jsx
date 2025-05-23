import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TableOutlet from "../../components/design/TableOutlet";
import MainHeading from "../../components/design/MainHeading";
import TableScalaton from "../../components/TableScalaton";
import SomethingWrong from "../../components/usefulThings/SomethingWrong";
import CreateNEditIVR from "../../Model/CreateNEditIVR";
import CommonTable from "../../components/CommonTable";
import { Input, Typography } from "antd";
import { Icon } from "@iconify/react";
import { getAllIvrWithPage } from "../../Toolkit/Slices/IvrSlice";
import dayjs from "dayjs";
const { Text } = Typography;

const IVR = () => {
  const { allIvr, ivrLoading, ivrError, totalCount } = useSelector(
    (prev) => prev?.ivr
  );
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });

  useEffect(() => {
    dispatch(getAllIvrWithPage(paginationData));
  }, [dispatch]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(
        getAllIvrWithPage({
          page: dataPage,
          size: size,
        })
      );
      setPaginationData({ size: size, page: dataPage });
    },
    [dispatch]
  );

  const columns = [
    {
      dataIndex: "id",
      title: "Id",
      fixed: "left",
      width: 80,
    },
    {
      dataIndex: "agentName",
      title: "Agent name",
      fixed: "left",
      width: 250,
    },
    {
      dataIndex: "callerName",
      title: "Caller name",
    },
    {
      dataIndex: "startTime",
      title: "Start time",
      render: (_, data) => (
        <Text>{dayjs(data?.startTime).format("DD-MM-YYYY ,  hh:mm a")}</Text>
      ),
    },
    // {
    //   dataIndex: "endTime",
    //   title: "End time",
    //   render: (_, data) => (
    //     <Text>{dayjs(data?.endTime).format("DD-MM-YYYY ,  hh:mm a")}</Text>
    //   ),
    // },
    {
      dataIndex: "duration",
      title: "Duration",
    },
    {
      dataIndex: "recording",
      title: "Recording",
      width: 400,
      render: (_, props) =>
        props?.recordingUrls ? (
          <audio controls className="audio-player" style={{ height: "40px" }}>
            <source src={props?.recordingUrls} type="audio/mpeg" />
          </audio>
        ) : (
          "NA"
        ),
    },
  ];

  useEffect(() => {
    setFilteredData(allIvr);
  }, [allIvr]);

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchText(value);
    const filtered = allIvr?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  return (
    <TableOutlet>
      <div className="create-user-box">
        <MainHeading data={"All ivr"} />
        <CreateNEditIVR paginationData={paginationData} />
      </div>
      <div className="flex-verti-center-hori-start mt-2">
        <Input
          value={searchText}
          size="small"
          onChange={handleSearch}
          style={{ width: "220px" }}
          placeholder="search"
          prefix={<Icon icon="fluent:search-24-regular" />}
        />
      </div>
      <div>
        {ivrLoading && <TableScalaton />}
        {ivrError && <SomethingWrong />}
        {allIvr && !ivrLoading && !ivrError && (
          <CommonTable
            data={filteredData}
            columns={columns}
            scroll={{ y: 550, x: 1200 }}
            pagination={true}
            page={paginationData?.page}
            pageSize={paginationData?.size}
            totalCount={totalCount}
            handlePagination={handlePagination}
          />
        )}
      </div>
    </TableOutlet>
  );
};

export default IVR;
