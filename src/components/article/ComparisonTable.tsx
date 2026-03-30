interface Service {
  name: string;
  features: string;
  salaryRange: string;
  rating: number;
  url: string;
}

interface ComparisonTableProps {
  services: Service[];
}

function Stars({ count }: { count: number }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: '14px', letterSpacing: '2px' }}>
      {'★'.repeat(count)}
      {'☆'.repeat(5 - count)}
    </span>
  );
}

export default function ComparisonTable({ services }: ComparisonTableProps) {
  if (!services || services.length === 0) return null;

  return (
    <div
      className="my-8 -mx-4 md:mx-0"
      style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}
    >
      <table
        style={{
          width: '100%',
          minWidth: '600px',
          borderCollapse: 'collapse',
          fontFamily: "'Noto Sans JP', sans-serif",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#fafafa', borderBottom: '2px solid #eee' }}>
            {['サービス名', '特徴', '年収帯', 'おすすめ度', 'リンク'].map((header) => (
              <th
                key={header}
                style={{
                  padding: '12px 16px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#666',
                  whiteSpace: 'nowrap',
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {services.map((service, i) => (
            <tr
              key={i}
              style={{
                borderBottom: '1px solid #eee',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = '#fafafa')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
            >
              <td
                style={{
                  padding: '14px 16px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#333',
                  whiteSpace: 'nowrap',
                }}
              >
                {service.name}
              </td>
              <td
                style={{
                  padding: '14px 16px',
                  fontSize: '13px',
                  color: '#666',
                  lineHeight: 1.6,
                  maxWidth: '200px',
                }}
              >
                {service.features}
              </td>
              <td
                style={{
                  padding: '14px 16px',
                  fontSize: '13px',
                  color: '#333',
                  whiteSpace: 'nowrap',
                }}
              >
                {service.salaryRange}
              </td>
              <td style={{ padding: '14px 16px' }}>
                <Stars count={service.rating} />
              </td>
              <td style={{ padding: '14px 16px' }}>
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    backgroundColor: '#e74c3c',
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  公式サイト
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
