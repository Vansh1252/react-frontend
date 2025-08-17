import "../styles/metricscards.css";

export const MetricsCard = ({ title, value, bgColor = "metrics-card", textColor = "text-foreground" }) => {
  return (
    <div className={bgColor}>
      <div className="metrics-card-content">
        <p className="metrics-card-title">{title}</p>
        <p className={`metrics-card-value ${textColor}`}>{value}</p>
      </div>
    </div>
  );
};