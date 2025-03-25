import { Typography } from "antd"
import React from "react"
const {Text,Title}=Typography

const MainHeading = ({ count, data }) => {
  return (
    <Title level={3} className="main-heading-text">
      {data} {count && { count }}
    </Title>
  )
}

export default MainHeading
