'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface RegionChartProps {
  data: {
    name: string;
    mahallas: number;
    districts: number;
  }[];
}

export function RegionDistributionChart({ data }: RegionChartProps) {
  return (
    <Card className="col-span-4 lg:col-span-3 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>Viloyatlar bo'yicha taqsimot</CardTitle>
        <CardDescription>
          Har bir viloyatdagi mahallalar soni
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false}
              angle={-45}
              textAnchor="end"
              interval={0}
              height={80}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ 
                backgroundColor: 'var(--popover)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
              }}
              labelStyle={{ color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
              labelFormatter={(label) => `${label.replace(' viloyati', '')} mahallalar`}
              formatter={(value) => [`${value}`, 'mahallalar']}
            />
            <Bar
              dataKey="mahallas"
              fill="currentColor"
              radius={[4, 4, 0, 0]}
              className="fill-primary"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface StreetTypeChartProps {
  data: {
    name: string;
    value: number;
  }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export function StreetTypeChart({ data }: StreetTypeChartProps) {
  // Filter out tiny values for cleaner chart
  const filteredData = data.filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  return (
    <Card className="col-span-4 lg:col-span-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>Ko'cha turlari</CardTitle>
        <CardDescription>
          Mavjud ko'cha turlarining ulushi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
               contentStyle={{ 
                 backgroundColor: 'var(--popover)', 
                 border: '1px solid var(--border)', 
                 borderRadius: '8px', 
                 boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
               }}
               labelStyle={{ color: 'var(--foreground)' }}
               itemStyle={{ color: 'var(--foreground)' }}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface DataHealthChartProps {
  hidden: number;
  total: number;
}

export function DataHealthChart({ hidden, total }: DataHealthChartProps) {
  const visible = total - hidden;
  const data = [
    { name: 'Faol', value: visible },
    { name: 'Optimallashgan', value: hidden },
  ];

  return (
     <Card className="col-span-4 lg:col-span-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>Ma'lumot holati</CardTitle>
        <CardDescription>
          Optimallashgan vs Faol mahallalar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill="#10b981" />
              <Cell fill="#ef4444" />
            </Pie>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="text-3xl font-bold">{((visible / total) * 100).toFixed(1)}%</span>
              <p className="text-xs text-muted-foreground">Faol</p>
            </div>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--popover)', 
                border: '1px solid var(--border)', 
                borderRadius: '8px', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
              }}
              labelStyle={{ color: 'var(--foreground)' }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-500">{visible}</div>
            <div className="text-xs text-muted-foreground">Faol</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">{hidden}</div>
            <div className="text-xs text-muted-foreground">Optimallashgan</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
