import React from "react";

const SummaryBox = (props) => {
  return (
    <div className="summary_box">
      <p className="font-inter font-medium text-sm text-gray-700">
        {props.articlesummary}
      </p>
    </div>
  );
};

export default SummaryBox;
