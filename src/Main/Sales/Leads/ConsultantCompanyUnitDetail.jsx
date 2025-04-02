import { Card, Col, Divider, Flex, Row, Typography } from "antd";
import React from "react";
import { useSelector } from "react-redux";
const { Text, Title } = Typography;

const ConsultantCompanyUnitDetail = () => {
  const companyDetailByUnitId = useSelector(
    (state) => state.leads.servingCompanyDetail
  );
  return (
    <Flex vertical gap={8}>
      <Title level={5} style={{ margin: 0 }}>
        {companyDetailByUnitId?.name}
      </Title>
      <Divider style={{ margin: 0 }} />
      <Flex gap={8}>
        <Text type="secondary">GST number</Text>
        <Text type="secondary">:</Text>
        <Text>
          {companyDetailByUnitId?.gstNo ? companyDetailByUnitId?.gstNo : "NA"}
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
          {companyDetailByUnitId?.state ? companyDetailByUnitId?.state : "NA"}
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

export default ConsultantCompanyUnitDetail;
