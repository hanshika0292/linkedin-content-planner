"use client"

interface ActivityChartProps {
  data: Array<{ date: string; count: number }>
}

export function ActivityChart({ data }: ActivityChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Weekly Activity</h3>
        <p className="text-sm text-gray-600 mt-1">Posts created in the last 7 days</p>
      </div>
      <div className="p-6">
        <div className="flex items-end justify-between h-32 gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full flex items-end justify-center mb-2" style={{ height: "80px" }}>
                <div
                  className="bg-blue-500 rounded-t-sm w-full max-w-8 transition-all hover:bg-blue-600"
                  style={{
                    height: `${(item.count / maxCount) * 80}px`,
                    minHeight: item.count > 0 ? "4px" : "0px",
                  }}
                  title={`${item.count} posts on ${item.date}`}
                />
              </div>
              <span className="text-xs text-gray-600 font-medium">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
