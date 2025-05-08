import React, { useCallback, useEffect, useState } from "react";
import MainHeading from "../../../components/design/MainHeading";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllSlugAction,
  getAllSlugCount,
  getAllSlugList,
  leadSlugAction,
  searchSlugList,
} from "../../../Toolkit/Slices/LeadSlugSlice";
import EditSlugModal from "../../../Model/EditSlugModal";
import { Button, Form, Input, Modal, notification, Tag, Tooltip } from "antd";
import CommonTable from "../../../components/CommonTable";
import { Icon } from "@iconify/react";
import OverFlowText from "../../../components/OverFlowText";
import { BTN_ICON_HEIGHT, BTN_ICON_WIDTH } from "../../../components/Constants";
import CreatePlantSetupModal from "../../../Model/CreatePlantSetupModal";
const { Search } = Input;

const SlugCreate = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const totalCount = useSelector((state) => state.leadslug.totalSlugCount);
  const allLeadSlug = useSelector((prev) => prev?.leadslug.allLeadSlug);
  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [paginationData, setPaginationData] = useState({
    page: 1,
    size: 50,
  });

  useEffect(() => {
    dispatch(getAllSlugCount());
    dispatch(getAllSlugList());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getAllSlugAction({
        page: paginationData?.page,
        size: paginationData?.size,
      })
    );
  }, [dispatch]);

  const handlePagination = useCallback(
    (dataPage, size) => {
      dispatch(
        getAllSlugAction({
          page: dataPage,
          size: size,
        })
      );
      setPaginationData({ size: size, page: dataPage });
    },
    [dispatch]
  );

  const slugsInTooltip = (data) => {
    return data?.map((items) => {
      return <Tag className="slug-items-tooltip">{items?.name}</Tag>;
    });
  };

  const handleSubmit = (values) => {
    dispatch(leadSlugAction(values?.slugName))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          form.resetFields();
          notification.success({ message: "Slug created succesfully" });
          dispatch(
            getAllSlugAction({
              page: paginationData?.page,
              size: paginationData?.size,
            })
          );
          setOpenModal(false);
        } else {
          notification.error({ message: "Something went wrong !." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong !." }));
  };

  const columns = [
    { title: "Id", dataIndex: "id", fixed: "left", width: 80 },
    { title: "Name", dataIndex: "name", fixed: "left" },
    {
      title: "Slug list",
      dataIndex: "slugList",
      render: (_, data) =>
        data?.slugList?.length > 0 && data?.slugList?.length === 1 ? (
          <OverFlowText>{data?.slugList?.[0]?.name}</OverFlowText>
        ) : data?.slugList?.length >= 2 ? (
          <div className="flex-vert-hori-center">
            <OverFlowText>{data?.slugList?.[0]?.name} </OverFlowText>
            <Tooltip
              title={slugsInTooltip(data?.slugList)}
              arrow={false}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
              overlayStyle={{ maxWidth: 800 }}
            >
              <Icon
                icon="fluent:more-circle-24-regular"
                height={BTN_ICON_HEIGHT + 8}
                width={BTN_ICON_WIDTH + 8}
              />
            </Tooltip>
          </div>
        ) : (
          "N/A"
        ),
    },
    {
      title: "Plant setup",
      dataIndex: "isPlantSetup",
      render: (_, data) => (data?.isPlantSetup ? "True" : "False"),
    },
    {
      title: "Create/Edit plant setup",
      dataIndex: "plantSetUp",
      render: (_, data) => (
        <CreatePlantSetupModal data={data} paginationData={paginationData} />
      ),
    },
    {
      title: "Edit slug",
      name: "edit",
      render: (_, data) => <EditSlugModal data={data} />,
    },
  ];

  const onSearch = (e, b, c) => {
    if (e) {
      setSearchText(e);
      dispatch(searchSlugList(e));
    }
    if (!b) {
      setSearchText("");
      dispatch(
        getAllSlugAction({
          page: paginationData?.page,
          size: paginationData?.size,
        })
      );
    }
  };

  return (
    <div>
      <div className="create-user-box">
        <MainHeading data={`Slug create`} />
        <Button type="primary" size="small" onClick={() => setOpenModal(true)}>
          Create slug
        </Button>
      </div>
      <div className="setting-table">
        <div className="flex-verti-center-hori-start mt-2">
          <Search
            placeholder="search"
            size="small"
            allowClear
            value={searchText}
            onSearch={onSearch}
            onChange={(e) => {
              setSearchText(e.target.value);
              if (!e.target.value && !e.target.value.trim()) {
                dispatch(
                  getAllSlugAction({
                    page: paginationData?.page,
                    size: paginationData?.size,
                  })
                );
                setSearchText("");
              }
            }}
            enterButton="search"
            style={{ width: "250px" }}
            prefix={<Icon icon="fluent:search-24-regular" />}
          />
        </div>
        <CommonTable
          columns={columns}
          data={allLeadSlug}
          pagination={true}
          scroll={{ y: "70vh", x: 1200 }}
          totalCount={totalCount}
          pageSize={paginationData?.size}
          page={paginationData?.page}
          handlePagination={handlePagination}
        />
      </div>

      <Modal
        title="Create slug"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Submit"
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            label="Enter slug name"
            name="slugName"
            rules={[{ required: true, message: "please enter slug name" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SlugCreate;
