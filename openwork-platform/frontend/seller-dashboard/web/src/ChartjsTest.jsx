import React, { useRef, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ChartjsTest() {
  const chartRef = useRef(null);
  useEffect(() => {
    console.log('React version:', React.version);
    console.log('Chart.js ref:', chartRef.current);
  }, []);
  const data = {
    labels: ['A', 'B', 'C', 'D'],
    datasets: [
      {
        label: 'Test',
        data: [1, 2, 3, 4],
        borderColor: 'blue',
        backgroundColor: 'rgba(59,130,246,0.2)'
      }
    ]
  };
  return (
    <div style={{ padding: 40, background: 'white', minHeight: '100vh' }}>
      <h2>Chart.js useRef Test</h2>
      <Line ref={chartRef} data={data} />
      <div style={{ marginTop: 30, color: '#6b7280' }}>
        If you see a chart, react-chartjs-2 is working.<br/>
        If you see an error, check the console for details.
      </div>
    </div>
  );
}
