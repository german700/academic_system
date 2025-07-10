import React from "react";
import "./IAAnalysisSection_css/IAInsightNarrative.css";

const IAInsightNarrative = ({ narrative }) => (
  <div className="ia-narrative-container">
    <h3 className="ia-narrative-title">Narrativa IA</h3>
    <p className="ia-narrative-text">{narrative}</p>
  </div>
);

export default IAInsightNarrative;
