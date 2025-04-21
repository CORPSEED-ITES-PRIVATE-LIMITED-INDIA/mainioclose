import { Card, Col, Divider, Flex, Row, Tag, Tooltip, Typography } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { Icon } from '@iconify/react'
const { Text, Title } = Typography;

const NewCompanyUnitDetails = () => {
  const companyDetailByUnitId = useSelector(
    (state) => state.leads.companyDetailByUnitId
  );
  return (
    <Flex vertical gap={8}>
      <Flex align="center" gap={12} style={{ margin: "8px 0px" }}>
        <Title level={3} style={{ margin: 0 }}>
          {companyDetailByUnitId?.companyName}
        </Title>
        <Tooltip title={companyDetailByUnitId?.rating}>
          <Icon
            icon="carbon:badge"
            width="32"
            height="32"
            style={{
              color:
                companyDetailByUnitId?.rating === "Gold"
                  ? "#FFD700"
                  : companyDetailByUnitId?.rating === "Silver"
                    ? "#C0C0C0"
                    : "#CD7F32",
            }}
          />
        </Tooltip>
      </Flex>

      <Divider style={{ margin: 0 }} />
      <Flex justify="space-between">
        <Flex vertical gap={4}>
          <Flex gap={8}>
            <Text type="secondary">GST number</Text>
            <Text type="secondary">:</Text>
            <Text>
              {companyDetailByUnitId?.gstNo
                ? companyDetailByUnitId?.gstNo
                : "NA"}
            </Text>
          </Flex>
          <Flex gap={8}>
            <Text type="secondary">Company age</Text>
            <Text type="secondary">:</Text>
            <Text>
              {companyDetailByUnitId?.companyAge
                ? companyDetailByUnitId?.companyAge
                : "NA"}
            </Text>
          </Flex>
          <Flex gap={8}>
            <Text type="secondary">Address</Text>
            <Text type="secondary">:</Text>
            <Text>
              {companyDetailByUnitId?.address
                ? companyDetailByUnitId?.address
                : "NA"}
            </Text>
          </Flex>
          <Flex gap={8}>
            <Text type="secondary">City</Text>
            <Text type="secondary">:</Text>
            <Text>
              {companyDetailByUnitId?.city ? companyDetailByUnitId?.city : "NA"}
            </Text>
          </Flex>
          <Flex gap={8}>
            <Text type="secondary">State</Text>
            <Text type="secondary">:</Text>
            <Text>
              {companyDetailByUnitId?.state
                ? companyDetailByUnitId?.state
                : "NA"}
            </Text>
          </Flex>
          <Flex gap={8}>
            <Text type="secondary">Country</Text>
            <Text type="secondary">:</Text>
            <Text>
              {companyDetailByUnitId?.country
                ? companyDetailByUnitId?.country
                : "NA"}
            </Text>
          </Flex>
          <Flex gap={8}>
            <Text type="secondary">Pin code</Text>
            <Text type="secondary">:</Text>
            <Text>
              {companyDetailByUnitId?.primaryPinCode
                ? companyDetailByUnitId?.primaryPinCode
                : "NA"}
            </Text>
          </Flex>
        </Flex>

        <Flex vertical gap={4}>
          <Flex gap={8}>
            <Text type="secondary">Industry</Text>
            <Text type="secondary">:</Text>
            <Text>
              {companyDetailByUnitId?.industry
                ? companyDetailByUnitId?.industry?.name
                : "NA"}
            </Text>
          </Flex>
          <Flex gap={8}>
            <Text type="secondary">Sub industry</Text>
            <Text type="secondary">:</Text>
            <Text>
              {companyDetailByUnitId?.subIndustry
                ? companyDetailByUnitId?.subIndustry?.name
                : "NA"}
            </Text>
          </Flex>
          <Flex gap={8}>
            <Text type="secondary">Category</Text>
            <Text type="secondary">:</Text>
            <Text>
              {companyDetailByUnitId?.subSubIndustry
                ? companyDetailByUnitId?.subSubIndustry?.name
                : "NA"}
            </Text>
          </Flex>
          <Flex gap={8}>
            <Text type="secondary">Business activity</Text>
            <Text type="secondary">:</Text>
            <Flex gap={4}>
              {companyDetailByUnitId?.industryData
                ? companyDetailByUnitId?.industryData?.map((item) => (
                  <Tag key={`${item?.id}industryData`}>{item?.name}</Tag>
                ))
                : "NA"}
            </Flex>
          </Flex>
        </Flex>
      </Flex>

      <Title level={5} style={{ margin: 0 }}>
        Secondary address
      </Title>

      <Divider style={{ margin: 0 }} />
      <Flex vertical gap={6}>
        <Flex gap={8}>
          <Text type="secondary">Address</Text>
          <Text type="secondary">:</Text>
          <Text>
            {companyDetailByUnitId?.sAddress
              ? companyDetailByUnitId?.sAddress
              : "NA"}
          </Text>
        </Flex>
        <Flex gap={8}>
          <Text type="secondary">Contact</Text>
          <Text type="secondary">:</Text>
          <Text>
            {companyDetailByUnitId?.secondaryContact?.contactNo
              ? companyDetailByUnitId?.secondaryContact?.contactNo
              : "NA"}
          </Text>
        </Flex>
        <Flex gap={8}>
          <Text type="secondary">City</Text>
          <Text type="secondary">:</Text>
          <Text>
            {companyDetailByUnitId?.sCity ? companyDetailByUnitId?.sCity : "NA"}
          </Text>
        </Flex>
        <Flex gap={8}>
          <Text type="secondary">State</Text>
          <Text type="secondary">:</Text>
          <Text>
            {companyDetailByUnitId?.sState
              ? companyDetailByUnitId?.sState
              : "NA"}
          </Text>
        </Flex>
        <Flex gap={8}>
          <Text type="secondary">Country</Text>
          <Text type="secondary">:</Text>
          <Text>
            {companyDetailByUnitId?.sCountry
              ? companyDetailByUnitId?.sCountry
              : "NA"}
          </Text>
        </Flex>
        <Flex gap={8}>
          <Text type="secondary">Pin code</Text>
          <Text type="secondary">:</Text>
          <Text>
            {companyDetailByUnitId?.secondaryPinCode
              ? companyDetailByUnitId?.secondaryPinCode
              : "NA"}
          </Text>
        </Flex>
      </Flex>

      <Row gutter={16}>
        <Col>
          <Card title="Primary contact" style={{ minWidth: 300 }}>
            <Flex vertical gap={6}>
              <Flex gap={8}>
                <Text type="secondary">Name</Text>
                <Text type="secondary">:</Text>
                <Text>{companyDetailByUnitId?.primaryContact?.name}</Text>
              </Flex>
              <Flex gap={8}>
                <Text type="secondary">Email</Text>
                <Text type="secondary">:</Text>
                <Text>{companyDetailByUnitId?.primaryContact?.emails}</Text>
              </Flex>
              <Flex gap={8}>
                <Text type="secondary">Contact no.</Text>
                <Text type="secondary">:</Text>
                <Text>{companyDetailByUnitId?.primaryContact?.contactNo}</Text>
              </Flex>
            </Flex>
          </Card>
        </Col>
        <Col>
          <Card title="Secondary contact" style={{ minWidth: 300 }}>
            <Flex vertical gap={6}>
              <Flex gap={8}>
                <Text type="secondary">Name</Text>
                <Text type="secondary">:</Text>
                <Text>{companyDetailByUnitId?.secondaryContact?.name}</Text>
              </Flex>
              <Flex gap={8}>
                <Text type="secondary">Email</Text>
                <Text type="secondary">:</Text>
                <Text>{companyDetailByUnitId?.secondaryContact?.emails}</Text>
              </Flex>
              <Flex gap={8}>
                <Text type="secondary">Contact no.</Text>
                <Text type="secondary">:</Text>
                <Text>
                  {companyDetailByUnitId?.secondaryContact?.contactNo}
                </Text>
              </Flex>
            </Flex>
          </Card>
        </Col>
        <Col>
          <Card title="Assignee details" style={{ minWidth: 300 }}>
            <Flex vertical gap={6}>
              <Flex gap={8}>
                <Text type="secondary">Name</Text>
                <Text type="secondary">:</Text>
                <Text>{companyDetailByUnitId?.assigneeName}</Text>
              </Flex>
              <Flex gap={8}>
                <Text type="secondary">Email</Text>
                <Text type="secondary">:</Text>
                <Text>{companyDetailByUnitId?.assigneeEmail}</Text>
              </Flex>
              <Flex gap={8}>
                <Text type="secondary">Contact no.</Text>
                <Text type="secondary">:</Text>
                <Text>{companyDetailByUnitId?.primaryContact?.contactNo}</Text>
              </Flex>
            </Flex>
          </Card>
        </Col>
      </Row>
    </Flex>
  );
};

export default NewCompanyUnitDetails;
