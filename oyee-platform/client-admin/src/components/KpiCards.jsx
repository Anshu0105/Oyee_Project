import React from 'react';

const KpiCards = ({ kpis }) => {
  return (
    <div className="g5">
      {kpis.map((kpi, index) => (
        <div className="kpi" key={index}>
          <div className={`kpi-stripe ${kpi.stripe}`}></div>
          <div className="kpi-icon">{kpi.icon}</div>
          <div className="kpi-label">{kpi.label}</div>
          <div className={`kpi-val ${kpi.valClass || ''}`}>{kpi.val}</div>
          <div className={`kpi-delta ${kpi.deltaClass || ''}`}>{kpi.delta}</div>
        </div>
      ))}
    </div>
  );
};

export default KpiCards;