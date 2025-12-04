const MetricCard = ({ title, value, icon: Icon, trend, className = '' }) => {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 border border-gray-200 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {trend && (
              <p className={`text-sm mt-2 ${trend > 0 ? 'text-primary' : 'text-red-600'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
              </p>
            )}
          </div>
          {Icon && (
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default MetricCard;
  