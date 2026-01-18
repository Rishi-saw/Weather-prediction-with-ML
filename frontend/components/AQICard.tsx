import { Wind } from "lucide-react"

export function AQICard({ data }: { data: any }) {
  const aqi = data?.aqi ?? "N/A"
  const category = data?.category ?? "Unknown"

  let color = "bg-green-100 text-green-700"
  if (category.includes("Moderate")) color = "bg-yellow-100 text-yellow-700"
  if (category.includes("Unhealthy")) color = "bg-red-100 text-red-700"

  return (
    <div className="rounded-2xl p-6 bg-white/80 backdrop-blur shadow-sm h-full flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-full bg-muted">
          <Wind className="w-5 h-5 text-muted-foreground" />
        </div>
        <h3 className="font-medium">Air Quality</h3>
      </div>

      <div>
        <div className="text-3xl font-bold">{aqi}</div>

        <div
          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${color}`}
        >
          {category}
        </div>
      </div>

    </div>
  )
}
