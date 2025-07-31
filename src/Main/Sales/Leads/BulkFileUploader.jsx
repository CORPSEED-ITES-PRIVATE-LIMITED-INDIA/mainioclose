import React, { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import {
  Button,
  Flex,
  Input,
  Select,
  Space,
  Typography,
  Upload,
  notification,
} from "antd";
import "./BulkFileUpload.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  createRemakWithFile,
  getAllRemarkAndCommnts,
} from "../../../Toolkit/Slices/LeadSlice";
import { useParams } from "react-router-dom";
import { getAllComments } from "../../../Toolkit/Slices/UserRatingSlice";
const { Dragger } = Upload;
const { Text } = Typography;

const BulkFileUploader = ({ leadid, addressInfo, industryInfo }) => {
  const dispatch = useDispatch();
  const storageData = localStorage.getItem("userDetail");
  let localData = null;
  if (storageData) {
    try {
      localData = JSON.parse(storageData);
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  } else {
    console.warn("user detail not found in localStorage");
  }
  const allComments = useSelector((state) => state.rating.allComments);
  const currentUserDetail = useSelector(
    (state) => state.auth.getDepartmentDetail
  );
  const { userid } = useParams();
  const [files, setFiles] = useState([]);
  const [text, setText] = useState("");
  const [flag, setFlag] = useState(null);
  const [inputCommentText, setInputCommentText] = useState("");
  const [apiLoading, setApiLoading] = useState("");
  const [showUploadList, setUploadList] = useState(true);
  const [filesToUpload, setFilesToUpload] = useState([]);

  useEffect(() => {
    dispatch(getAllComments());
  }, [dispatch]);

  const props = {
    name: "file",
    multiple: true,
    // showUploadList: showUploadList,
    action: "/leadService/api/v1/upload/uploadimageToFileSystem",
    headers: {
      Authorization: `Bearer ${localData?.jwt}`,
    },
    fileList: filesToUpload,
    onChange(info) {
      setFiles(info?.fileList?.map((file) => file?.response));
      setFilesToUpload(info?.fileList);
    },
    onDrop(e) {},
  };

  const onSubmit = useCallback(() => {
    let data = {
      leadId: leadid,
      userId: userid,
      type: text === "Other" ? "Other" : "selected",
      message: text === "Other" ? inputCommentText : text,
      file: files,
    };
    if ((text !== "" || inputCommentText !== "") && files?.length > 0) {
      setApiLoading("pending");
      dispatch(createRemakWithFile(data))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({ message: "Remark added successfully" });
            setFlag(true);
            setApiLoading("success");
            setFiles([]);
            setFilesToUpload([]);
            setText("");
            setInputCommentText("");
            dispatch(getAllRemarkAndCommnts(leadid));
            setUploadList(false);
          } else {
            notification.error({ message: "Something went wrong" });
            setApiLoading("error");
          }
        })
        .catch(() => {
          notification.error({ message: "Something went wrong" });
          setApiLoading("error");
        });
    } else if (text !== "" || inputCommentText !== "") {
      setApiLoading("pending");
      dispatch(createRemakWithFile(data))
        .then((resp) => {
          if (resp.meta.requestStatus === "fulfilled") {
            notification.success({ message: "Remark added successfully" });
            setFlag(true);
            setFiles([]);
            setText("");
            setInputCommentText("");
            setApiLoading("success");
            setUploadList(false);
            dispatch(getAllRemarkAndCommnts(leadid));
          } else {
            notification.error({ message: "Something went wrong" });
            setApiLoading("error");
          }
        })
        .catch(() => {
          notification.error({ message: "Something went wrong" });
          setApiLoading("error");
        });
    } else {
      setFlag(false);
    }
  }, [
    leadid,
    userid,
    text,
    files,
    dispatch,
    inputCommentText,
    addressInfo,
    industryInfo,
    currentUserDetail,
  ]);

  return (
    <Flex vertical gap={8}>
      <Text className="heading-text">Select the comment</Text>
      <Select
        style={{ width: "100%", margin: "12px 0px" }}
        placeholder="Select comment..."
        value={text === "" ? null : text}
        size="large"
        showSearch
        allowClear
        options={
          [{ name: "Other" }, ...allComments]?.map((item) => ({
            label: item?.name,
            value: item?.name,
          })) || []
        }
        filterOption={(input, option) =>
          option.label.toLowerCase().includes(input.toLowerCase())
        }
        onClear={(e) => {
          setText(undefined);
        }}
        onChange={(e) => {
          setText(e);
          setFlag(null);
        }}
      />
      {text === "Other" && (
        <Input.TextArea
          style={{ width: "100%", margin: "12px 0px" }}
          size="large"
          value={inputCommentText}
          placeholder="write comment here ..."
          // autoSize={{ minRows: 1, maxRows: 2 }}
          onChange={(e) => setInputCommentText(e.target.value)}
        />
      )}

      {flag === false && (
        <Text type="danger">Please give the caption then submit</Text>
      )}
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <Icon icon="fluent:document-add-20-regular" height={32} width={32} />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibited from
          uploading company data or other banned files.
        </p>
      </Dragger>
      <div className="dragger-submit-btn">
        <Button
          type="primary"
          loading={apiLoading === "pending" ? true : false}
          disabled={text === "" || text === undefined ? true : false}
          onClick={onSubmit}
        >
          {" "}
          Submit
        </Button>
      </div>
    </Flex>
  );
};

export default BulkFileUploader;
