import React, { useCallback, useEffect, useState } from "react";
import MainHeading from "../../../components/design/MainHeading";
import {
  Button,
  Flex,
  Form,
  Input,
  Modal,
  notification,
  Popconfirm,
  Popover,
  Select,
  Typography,
  Upload,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import CommonTable from "../../../components/CommonTable";
import { Icon } from "@iconify/react";
import ProductDetails from "./ProductDetails";
import "./Product.scss";
import { Link, useParams } from "react-router-dom";
import {
  createProduct,
  getAllProductData,
  getAllProductListByType,
  importProductByCSV,
} from "../../../Toolkit/Slices/ProductSlice";
import { deleteProduct } from "../../../Toolkit/Slices/LeadSlice";
import { BTN_ICON_HEIGHT, BTN_ICON_WIDTH } from "../../../components/Constants";
const { Text, Title } = Typography;

const ProductsChange = () => {
  const dispatch = useDispatch();
  const { userid } = useParams();
  const [form] = Form.useForm();
  const productData = useSelector((state) => state.product.productList);
  const [openModal, setOpenModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    dispatch(getAllProductListByType(filter));
  }, [dispatch, filter]);

  useEffect(() => {
    setFilteredData(productData);
  }, [productData]);

  const handleSearch = (e) => {
    const value = e.target.value.trim();
    setSearchText(value);
    const filtered = productData?.filter((item) =>
      Object.values(item)?.some((val) =>
        String(val)?.toLowerCase()?.includes(value?.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const ProductCol = [
    { dataIndex: "id", title: "Id", fixed: "left", width: 50 },
    {
      dataIndex: "productName",
      title: "Product name",
      fixed: "left",
      render: (_, records) =>
        records?.type === "Service" ? (
          <ProductDetails data={records}>{records?.productName}</ProductDetails>
        ) : (
          <Link
            className="link-heading"
            to={`/erp/${userid}/setting/erpSetting/products/${records.id}/arrangement`}
          >
            {records?.productName}
          </Link>
        ),
    },
    {
      dataIndex: "type",
      title: "Type",
    },
    {
      dataIndex: "Action",
      title: "Delete",
      render: (_, props) => (
        <Popconfirm
          title="Delete the product"
          description="Are you sure to delete the product"
          onConfirm={() =>
            dispatch(deleteProduct(props.id))
              .then((resp) => {
                if (resp.meta.requestStatus === "fulfilled") {
                  notification.success({
                    message: "Peoduct deleted successfully!.",
                  });
                  dispatch(getAllProductData());
                } else {
                  notification.error({ message: "Something went wrong !." });
                }
              })
              .catch(() =>
                notification.error({ message: "Something went wrong !." })
              )
          }
        >
          <Button size="small" danger>
            <Icon icon="fluent:delete-20-regular" /> Delete
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const handleFinish = (values) => {
    values.userId = userid;
    dispatch(createProduct(values))
      .then((resp) => {
        if (resp.meta.requestStatus === "fulfilled") {
          notification.success({ message: "Product created successfully" });
          form.resetFields();
          setOpenModal(false);
        } else {
          notification.error({ message: "Something went wrong!." });
        }
      })
      .catch(() => notification.error({ message: "Something went wrong!." }));
  };

  const props = {
    name: "file",
    multiple: true,
    action: "/leadService/api/v1/upload/uploadimageToFileSystem",
    onChange(info) {
      setUploadedFile(info?.file?.response);
    },
    onDrop(e) {},
  };

  const handleUploadFile = useCallback(() => {
    if (uploadedFile) {
      dispatch(importProductByCSV(uploadedFile))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({ message: "File uploaded successfully !." });
          } else {
            notification.error({ message: "Something wemt wrong !." });
          }
        })
        .catch(() =>
          notification.error({ message: "Something wemt wrong !." })
        );
    }
  }, [dispatch, uploadedFile]);

  return (
    <div>
      <div className="create-user-box">
        <MainHeading data={`Lead product`} />
      </div>
      <div className="setting-table">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Flex gap={8}>
            {" "}
            <Input
              value={searchText}
              onChange={handleSearch}
              style={{ width: "20%" }}
              placeholder="search"
              prefix={<Icon icon="fluent:search-24-regular" />}
            />
            <Select
              value={filter}
              style={{ width: "15%" }}
              onChange={(e) => setFilter(e)}
              options={[
                { label: "All", value: "all" },
                { label: "Product", value: "Product" },
                { label: "Service", value: "Service" },
              ]}
            />
          </Flex>

          <Flex gap={8} align="center">
            <Popover
              trigger={"click"}
              overlayInnerStyle={{ minWidth: 200 }}
              placement="bottomRight"
              content={
                <Flex vertical gap={24}>
                  <Flex vertical gap={8}>
                    <Title level={5}>Upload csv file or excel sheet </Title>
                    <Upload {...props}>
                      <Button>
                        <Icon
                          icon="fluent:attach-16-regular"
                          width="16"
                          height="16"
                        />
                        Attach
                      </Button>
                    </Upload>
                  </Flex>
                  <Button type="primary" onClick={handleUploadFile}>
                    Submit
                  </Button>
                </Flex>
              }
            >
              <Button className="mr-2">
                {" "}
                <Icon
                  icon="fluent:arrow-download-16-filled"
                  height={BTN_ICON_HEIGHT}
                  width={BTN_ICON_WIDTH}
                />{" "}
                Import
              </Button>
            </Popover>
            <Button
              type="primary"
              size="small"
              onClick={() => setOpenModal(true)}
            >
              Add product
            </Button>
          </Flex>
        </div>

        <CommonTable
          data={filteredData}
          columns={ProductCol}
          scroll={{ y: "72vh" }}
        />
      </div>

      <Modal
        title="Add product"
        centered
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onClose={() => setOpenModal(false)}
        onOk={() => form.submit()}
        okText="Submit"
      >
        <Form layout="vertical" form={form} onFinish={handleFinish}>
          <Form.Item
            label="Enter product name"
            name="name"
            rules={[
              { required: true, message: "please enter the product name" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: "please select type" }]}
          >
            <Select
              options={[
                { label: "Product", value: "Product" },
                { label: "Service", value: "Service" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsChange;
