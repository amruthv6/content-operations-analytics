import { useGetAnalyticsSummary, useGetTopContent } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Eye, Heart, MessageSquare, Share2, Activity, AlertCircle, BarChart3 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function MetricCard({ title, value, icon: Icon, trend, trendUp }: any) {
  return (
    <Card className="border border-border/50 shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold font-mono tracking-tight">{value}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span className={trendUp ? "text-emerald-500 font-medium" : "text-destructive font-medium"}>
              {trend}
            </span>
            <span className="text-muted-foreground ml-2">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading, error: summaryError } = useGetAnalyticsSummary();
  const { data: topContent, isLoading: isTopLoading } = useGetTopContent({ limit: 5 });

  if (summaryError) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load dashboard data. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto flex flex-col gap-8"
    >
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Welcome back. Here's what's happening with your content.</p>
        </div>
      </div>

      {isSummaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[140px] rounded-xl" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Views" 
            value={summary.totalViews.toLocaleString()} 
            icon={Eye} 
            trend="+12.5%" 
            trendUp={true} 
          />
          <MetricCard 
            title="Avg Engagement" 
            value={`${(summary.avgEngagementRate * 100).toFixed(1)}%`} 
            icon={Activity} 
            trend="+2.1%" 
            trendUp={true} 
          />
          <MetricCard 
            title="Total Likes" 
            value={summary.totalLikes.toLocaleString()} 
            icon={Heart} 
          />
          <MetricCard 
            title="Published Content" 
            value={summary.publishedContent} 
            icon={BarChart3} 
          />
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card className="h-full border border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle>Top Performing Content</CardTitle>
              <CardDescription>Based on total views and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              {isTopLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : topContent?.length ? (
                <div className="flex flex-col gap-4">
                  {topContent.map((item, i) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-secondary flex items-center justify-center text-secondary-foreground font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm line-clamp-1">{item.title}</h4>
                          <p className="text-xs text-muted-foreground capitalize mt-1">{item.type} • {item.category || "Uncategorized"}</p>
                        </div>
                      </div>
                      <div className="flex gap-6 text-sm font-mono text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {item.views?.toLocaleString() || 0}</div>
                        <div className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> {item.likes?.toLocaleString() || 0}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-lg">
                  No published content found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full border border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Pipeline Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : summary ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Published</span>
                      <span className="font-bold">{summary.publishedContent}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(summary.publishedContent / summary.totalContent) * 100}%` }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Scheduled</span>
                      <span className="font-bold">{summary.scheduledContent}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${(summary.scheduledContent / summary.totalContent) * 100}%` }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Drafts</span>
                      <span className="font-bold">{summary.draftContent}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-muted-foreground" style={{ width: `${(summary.draftContent / summary.totalContent) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
