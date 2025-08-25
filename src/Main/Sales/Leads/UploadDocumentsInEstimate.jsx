import { Button, Drawer, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { docsUploadListInEstimate } from "../../../Toolkit/Slices/LeadSlice";
import CommonTable from "../../../components/CommonTable";

const UploadDocumentsInEstimate = ({ estimateId }) => {
  const dispatch = useDispatch();
  const docList = useSelector((state) => state.leads.docsListInEstimate);
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    if (estimateId) {
      dispatch(docsUploadListInEstimate(estimateId));
    }
  }, [dispatch, estimateId]);

  const columns = [
    { dataIndex: "id", title: "Id" },
    { dataIndex: "documentName", title: "Certificates" },
    {
      dataIndex: "",
      title: "Upload docs",
      render: () => (
        <Upload>
          <Button>Upload</Button>
        </Upload>
      ),
    },
  ];

  return (
    <>
      <Button onClick={() => setOpenDrawer(true)}>Upload documents</Button>
      <Drawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        title="Upload documents"
        width={"60%"}
      >
        <CommonTable
          columns={columns}
          data={[
            {
              id: "1",
              documentName: "Aadhar card",
            },
            {
              id: "2",
              documentName: "Pan card",
            },
          ]}
        />
      </Drawer>
    </>
  );
};

export default UploadDocumentsInEstimate;
