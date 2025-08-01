import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCompanyByUnitId } from "../../toolkit/slices/companySlice";
import { useParams } from "react-router-dom";
import { Card, CardBody, CardHeader, Chip, Tooltip } from "@heroui/react";
import { Award } from "lucide-react";

const UnitDetails = () => {
  const dispatch = useDispatch();
  const { companyUnitId } = useParams();
  const details = useSelector((state) => state.company.companyDetail);

  useEffect(() => {
    dispatch(getCompanyByUnitId(companyUnitId));
  }, [dispatch, companyUnitId]);

  return (
    <>
      <div className="flex items-center gap-2">
        <Tooltip content={details?.rating}>
          <Award
            className="w-6 h-6 mt-2"
            color={
              details?.rating === "Gold"
                ? "#FFD700"
                : details?.rating === "Silver"
                ? "#C0C0C0"
                : "#CD7F32"
            }
          />
        </Tooltip>
        <h1 className="text-2xl font-medium">{details?.companyName}</h1>

        {details?.status && (
          <Chip
            className="capitalize"
            size="sm"
            color={details?.status === "approved" ? "success" : "secondary"}
          >
            {details?.status}
          </Chip>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-3">
        <Card>
          <CardHeader>Company info</CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">GST number :</p>
                <p className="text-sm">{details?.gstNo || "-"}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">GST type :</p>
                <p className="text-sm">{details?.gstType || "-"}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">Company age :</p>
                <p className="text-sm">{details?.companyAge || "-"}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">Business type :</p>
                <p className="text-sm">{details?.bussinessType || "-"}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">Assignee name :</p>
                <p className="text-sm">{details?.assigneeName || "-"}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">Assignee email :</p>
                <p className="text-sm">{details?.assigneeEmail || "-"}</p>
              </div>
              <div className="flex items-start gap-2">
                <p className="text-gray-400 text-sm">Primary address :</p>
                <p className="text-sm">
                  {details?.address || ""},
                  <br />
                  {details?.city || ""},{details?.state || ""},
                  <br />
                  {details?.country || ""},{details?.primaryPinCode || ""}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <p className="text-gray-400 text-sm">Secondary address :</p>
                <p className="text-sm">
                  {details?.sAddress || ""},
                  <br />
                  {details?.sCity || ""},{details?.sState || ""},
                  <br />
                  {details?.sCountry || ""},{details?.secondaryPinCode || ""}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Industry info</CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">Industry :</p>
                <p className="text-sm">{details?.industry?.name || "-"}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">Sub industry :</p>
                <p className="text-sm">{details?.subIndustry?.name || "-"}</p>
              </div>
              <div className="flex items-start gap-2">
                <p className="text-gray-400 text-sm">Category :</p>
                <p className="text-sm">
                  {details?.subSubIndustry?.name || ""},
                </p>
              </div>
              <div className="flex items-start gap-2">
                <p className="text-gray-400 text-sm">Business activity :</p>
                <p className="text-sm">
                  {details?.industryData?.map((item) => item?.name)?.join(",")}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Primary contact</CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">Name :</p>
                <p className="text-sm">
                  {details?.primaryContact?.name || "-"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">Email :</p>
                <p className="text-sm">
                  {details?.primaryContact?.emails || "-"}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <p className="text-gray-400 text-sm">Contact number :</p>
                <p className="text-sm">
                  {details?.primaryContact?.contactNo || ""},
                </p>
              </div>
              <div className="flex items-start gap-2">
                <p className="text-gray-400 text-sm">Whatsapp number :</p>
                <p className="text-sm">{details?.primaryContact?.whatsappNo}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Secondary contact</CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">Name :</p>
                <p className="text-sm">
                  {details?.secondaryContact?.name || "-"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">Email :</p>
                <p className="text-sm">
                  {details?.secondaryContact?.emails || "-"}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <p className="text-gray-400 text-sm">Contact number :</p>
                <p className="text-sm">
                  {details?.secondaryContact?.contactNo || ""},
                </p>
              </div>
              <div className="flex items-start gap-2">
                <p className="text-gray-400 text-sm">Whatsapp number :</p>
                <p className="text-sm">
                  {details?.secondaryContact?.whatsappNo}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
};

export default UnitDetails;
