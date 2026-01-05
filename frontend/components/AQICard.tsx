export default function AQICard({ data }: { data: any }) {
  const color =
    data.category === "Good"
      ? "bg-green-500"
      : data.category.includes("Unhealthy")
      ? "bg-red-500"
      : "bg-yellow-500";

  return (
    <div className={`p-5 rounded-xl text-white ${color}`}>
      <h2 className="text-xl font-semibold">Air Quality Index</h2>
      <p className="text-4xl font-bold">{data.aqi ?? "N/A"}</p>
      <p className="mt-2">{data.category}</p>
    </div>
  );
}
