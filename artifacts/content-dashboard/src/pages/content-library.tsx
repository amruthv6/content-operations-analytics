import { useState } from "react";
import { Link } from "wouter";
import { useListContent, useDeleteContent, getListContentQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Heart, MessageSquare, Search, PlusCircle, MoreHorizontal, Edit, Trash, LayoutGrid, List as ListIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function ContentLibrary() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [view, setView] = useState<"table" | "card">("table");

  const queryClient = useQueryClient();
  const { data, isLoading } = useListContent({
    search: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    type: typeFilter !== "all" ? (typeFilter as any) : undefined,
  });

  const deleteContent = useDeleteContent();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this content?")) {
      deleteContent.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListContentQueryKey() });
        }
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "scheduled": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "draft": return "bg-muted text-muted-foreground border-border";
      case "archived": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Library</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your content pieces.</p>
        </div>
        <Link href="/content/new">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            New Content
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search content..." 
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px] bg-background">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="post">Post</SelectItem>
            <SelectItem value="reel">Reel</SelectItem>
            <SelectItem value="story">Story</SelectItem>
            <SelectItem value="short">Short</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex bg-muted p-1 rounded-md">
          <Button variant={view === "table" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setView("table")}>
            <ListIcon className="h-4 w-4" />
          </Button>
          <Button variant={view === "card" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setView("card")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-20 border border-dashed rounded-xl bg-card/50">
          <Library className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium">No content found</h3>
          <p className="text-muted-foreground mt-1 mb-4">Try adjusting your filters or create something new.</p>
          <Link href="/content/new">
            <Button variant="outline">Create Content</Button>
          </Link>
        </div>
      ) : view === "table" ? (
        <Card className="border-border/50 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Metrics</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <Link href={`/content/${item.id}`} className="hover:underline">{item.title}</Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(item.status)}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">{item.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3 text-sm font-mono text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {item.views || 0}</span>
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {item.likes || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {item.publishedAt ? format(new Date(item.publishedAt), 'MMM d, yyyy') : item.scheduledAt ? format(new Date(item.scheduledAt), 'MMM d, yyyy') : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/content/${item.id}`}>
                          <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleDelete(item.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.items.map((item) => (
            <Card key={item.id} className="border-border/50 shadow-sm flex flex-col">
              {item.thumbnailUrl ? (
                <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-muted">
                  <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-t-xl text-muted-foreground">
                  <LayoutGrid className="h-8 w-8 opacity-20" />
                </div>
              )}
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={getStatusColor(item.status)}>{item.status}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Link href={`/content/${item.id}`}>
                        <DropdownMenuItem><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-bold text-lg mb-1 line-clamp-2"><Link href={`/content/${item.id}`} className="hover:underline">{item.title}</Link></h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{item.description || "No description"}</p>
                <div className="mt-auto pt-4 border-t flex justify-between text-sm font-mono text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {item.views || 0}</span>
                  <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> {item.likes || 0}</span>
                  <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> {item.comments || 0}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Temporary placeholder for Library icon from lucide-react, since it was used in empty state
import { Library } from "lucide-react";
