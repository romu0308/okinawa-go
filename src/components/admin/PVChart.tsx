import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { date: '3/24', pv: 1520 },
  { date: '3/25', pv: 1780 },
  { date: '3/26', pv: 1650 },
  { date: '3/27', pv: 2100 },
  { date: '3/28', pv: 1890 },
  { date: '3/29', pv: 2350 },
  { date: '3/30', pv: 2160 },
];

export default function PVChart() {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip
            contentStyle={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '13px',
            }}
          />
          <Line
            type="monotone"
            dataKey="pv"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
