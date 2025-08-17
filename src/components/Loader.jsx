import React from "react";

// Loader component displays a loading animation (ellipsis style)
const Loader = ({ hidden = false }) => (
  <div className="lds-ellipsis" hidden={hidden}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
);

export default Loader;