import { useGetMonthlyTrends, useGetCategoryPerformance, useGetUploadConsistency } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from "recharts";
import { motion } from "framer-motion";

export default function AnalyticsOverview() {
  const { data: trends, isLoading: isTrendsLoading } = useGetMonthlyTrends({ months: 6 });
  const { data: categories, isLoading: isCategoriesLoading } = useGetCategoryPerformance();
  const { data: consistency, isLoading: isConsistencyLoading } = useGetUploadConsistency({ weeks: 8 });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your content performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Views Trend</CardTitle>
            <CardDescription>Total views over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {isTrendsLoading ? <Skeleton className="h-[300px] w-full" /> : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Upload Consistency</CardTitle>
            <CardDescription>Last 8 weeks performance</CardDescription>
          </CardHeader>
          <CardContent>
            {isConsistencyLoading ? <Skeleton className="h-[300px] w-full" /> : (
              <div className="space-y-4">
                {consistency?.map((week, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{week.weekLabel}</span>
                      <span className="font-medium">{week.uploadsCount} / {week.targetUploads}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${week.consistencyScore >= 1 ? 'bg-emerald-500' : week.consistencyScore >= 0.5 ? 'bg-amber-500' : 'bg-destructive'}`} 
                        style={{ width: `${Math.min(week.consistencyScore * 100, 100)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Engagement breakdown by content category</CardDescription>
          </CardHeader>
          <CardContent>
            {isCategoriesLoading ? <Skeleton className="h-[300px] w-full" /> : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categories || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    />
                    <Legend />
                    <Bar dataKey="totalViews" name="Views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalLikes" name="Likes" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
