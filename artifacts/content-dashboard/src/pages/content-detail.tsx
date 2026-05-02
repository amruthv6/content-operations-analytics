import { useRoute, Link, useLocation } from "wouter";
import { useGetContent, useUpdateContent, useUpdateContentMetrics, getGetContentQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Heart, MessageSquare, Share2, ArrowLeft, Edit, Clock, Tag } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContentDetail() {
  const [, params] = useRoute("/content/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const queryClient = useQueryClient();

  const { data: content, isLoading } = useGetContent(id, {
    query: { enabled: !!id, queryKey: getGetContentQueryKey(id) }
  });

  const updateMetrics = useUpdateContentMetrics();

  const handleSaveMetrics = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMetrics.mutate({
      id,
      data: {
        views: Number(formData.get("views")),
        likes: Number(formData.get("likes")),
        comments: Number(formData.get("comments")),
        shares: Number(formData.get("shares")),
      }
    }, {
      onSuccess: () => {
        setIsEditingMetrics(false);
        queryClient.invalidateQueries({ queryKey: getGetContentQueryKey(id) });
      }
    });
  };

  if (isLoading) {
    return <div className="space-y-4 max-w-5xl mx-auto"><Skeleton className="h-32 w-full" /><Skeleton className="h-[400px] w-full" /></div>;
  }

  if (!content) return <div>Content not found</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/content">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Badge variant="secondary" className="capitalize">{content.type}</Badge>
              <Badge variant="outline">{content.status}</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{content.title}</h1>
          </div>
        </div>
        {/* Placeholder for edit button which would navigate to an edit form */}
        <Button variant="outline"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg">Content Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {content.thumbnailUrl && (
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                  <img src={content.thumbnailUrl} alt={content.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{content.description || "No description provided."}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Performance</CardTitle>
              <Dialog open={isEditingMetrics} onOpenChange={setIsEditingMetrics}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Metrics</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSaveMetrics} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Views</Label>
                        <Input name="views" type="number" defaultValue={content.views || 0} />
                      </div>
                      <div className="space-y-2">
                        <Label>Likes</Label>
                        <Input name="likes" type="number" defaultValue={content.likes || 0} />
                      </div>
                      <div className="space-y-2">
                        <Label>Comments</Label>
                        <Input name="comments" type="number" defaultValue={content.comments || 0} />
                      </div>
                      <div className="space-y-2">
                        <Label>Shares</Label>
                        <Input name="shares" type="number" defaultValue={content.shares || 0} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsEditingMetrics(false)}>Cancel</Button>
                      <Button type="submit" disabled={updateMetrics.isPending}>Save</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                    <Eye className="w-4 h-4" /> Views
                  </div>
                  <div className="text-2xl font-bold font-mono">{content.views?.toLocaleString() || 0}</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                    <Heart className="w-4 h-4" /> Likes
                  </div>
                  <div className="text-2xl font-bold font-mono">{content.likes?.toLocaleString() || 0}</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                    <MessageSquare className="w-4 h-4" /> Comments
                  </div>
                  <div className="text-xl font-bold font-mono">{content.comments?.toLocaleString() || 0}</div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                    <Share2 className="w-4 h-4" /> Shares
                  </div>
                  <div className="text-xl font-bold font-mono">{content.shares?.toLocaleString() || 0}</div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Engagement Rate</span>
                    <span className="font-bold">{((content.engagementRate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(((content.engagementRate || 0) * 100), 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Retention</span>
                    <span className="font-bold">{((content.retentionRate || 0) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${Math.min(((content.retentionRate || 0) * 100), 100)}%` }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg">Metadata</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Tag className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-semibold block mb-1">Category</span>
                  <Badge variant="secondary">{content.category || "None"}</Badge>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="font-semibold block mb-1">Timeline</span>
                  <div className="space-y-1 text-muted-foreground">
                    <p>Created: {format(new Date(content.createdAt), 'MMM d, yyyy')}</p>
                    {content.scheduledAt && <p>Scheduled: {format(new Date(content.scheduledAt), 'MMM d, yyyy')}</p>}
                    {content.publishedAt && <p className="text-emerald-600">Published: {format(new Date(content.publishedAt), 'MMM d, yyyy')}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
