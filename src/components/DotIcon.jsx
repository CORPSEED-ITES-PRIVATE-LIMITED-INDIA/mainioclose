import React from "react";

const DotIcon = ({
  size = 8,
  color = "#22c55e", // default green
  margin = 0,
  padding = 0,
  style = {},
}) => {
  return (
    <span
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: "50%",
        display: "inline-block",
        margin,
        padding,
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
};

export default DotIcon;
