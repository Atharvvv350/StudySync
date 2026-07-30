import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, CheckCircle, Search, Plus, Loader2, Edit2, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

import { useAuth } from "@/hooks/useAuth";

const Forum = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // New Question Form State
  const [newQuestion, setNewQuestion] = useState({
    title: "",
    description: "",
    tags: "",
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data } = await api.get('/forum');
      setPosts(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Error",
        description: "Could not load forum discussions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };



  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // ... (existing state)

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = newQuestion.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");

      const formData = new FormData();
      formData.append('title', newQuestion.title);
      formData.append('description', newQuestion.description);
      tagsArray.forEach(tag => formData.append('tags[]', tag));
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await api.post('/forum', formData);

      toast({
        title: "Question Posted",
        description: "Your question has been added to the forum.",
      });

      setIsDialogOpen(false);
      setNewQuestion({ title: "", description: "", tags: "" });
      setSelectedImage(null);
      fetchQuestions(); // Refresh list
    } catch (error) {
      console.error("Error posting question:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to post question. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;

    try {
      const tagsArray = newQuestion.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "");

      const formData = new FormData();
      formData.append('title', newQuestion.title);
      formData.append('description', newQuestion.description);
      tagsArray.forEach(tag => formData.append('tags[]', tag));
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      await api.put(`/forum/${editingQuestion._id}`, formData);

      toast({
        title: "Question Updated",
        description: "Your question has been successfully updated.",
      });

      setIsDialogOpen(false);
      setEditingQuestion(null);
      setNewQuestion({ title: "", description: "", tags: "" });
      setSelectedImage(null);
      fetchQuestions();
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update question.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question? This will also remove all answers.")) return;

    try {
      await api.delete(`/forum/${id}`);
      toast({
        title: "Question Deleted",
        description: "Your question has been removed.",
      });
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Error",
        description: "Failed to delete question.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (post: any) => {
    setEditingQuestion(post);
    setNewQuestion({
      title: post.title,
      description: post.description,
      tags: post.tags.join(', '),
    });
    setSelectedImage(null); // Reset image selection
    setIsDialogOpen(true);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTab = activeTab === 'all' || (activeTab === 'my' && post.askedBy?._id === user?._id);

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Discussion Forum</h1>
          <p className="text-muted-foreground">Ask questions, share knowledge, and learn together</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingQuestion(null);
            setNewQuestion({ title: "", description: "", tags: "" });
            setSelectedImage(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0">
              <Plus className="mr-2 h-4 w-4" /> Ask Question
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{editingQuestion ? "Edit Question" : "Ask a Question"}</DialogTitle>
              <DialogDescription>
                {editingQuestion ? "Update your question details." : "Describe your doubt clearly. Add tags to help others find it."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editingQuestion ? handleUpdateQuestion : handleAskQuestion}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., How to balance chemical equations?"
                    value={newQuestion.title}
                    onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide more details about your question..."
                    value={newQuestion.description}
                    onChange={(e) => setNewQuestion({ ...newQuestion, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    placeholder="e.g., Chemistry, Class 10, Equations"
                    value={newQuestion.tags}
                    onChange={(e) => setNewQuestion({ ...newQuestion, tags: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Attachment (Optional)</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files ? e.target.files[0] : null)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editingQuestion ? "Update Question" : "Post Question"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex p-1 bg-muted rounded-lg">
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'all' ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:text-primary'}`}
            onClick={() => setActiveTab('all')}
          >
            All Discussions
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'my' ? 'bg-white shadow text-primary' : 'text-muted-foreground hover:text-primary'}`}
            onClick={() => setActiveTab('my')}
          >
            My Questions
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Forum Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {activeTab === 'my' ? "You haven't asked any questions yet." : "No discussions found. Be the first to ask a question!"}
          </div>
        ) : (
          filteredPosts.map((post, index) => (
            <Card
              key={post._id || index}
              className="glass hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 cursor-pointer" onClick={() => navigate(`/forum/${post._id}`)}>
                    <AvatarFallback className="gradient-primary text-white">
                      {post.askedBy?.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/forum/${post._id}`)}>
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          {post.isSolved && (
                            <CheckCircle className="h-5 w-5 text-success" />
                          )}
                        </div>

                        {/* Edit/Delete Actions for Owner */}
                        {user && post.askedBy?._id === user._id && (
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(post)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteQuestion(post._id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{post.askedBy?.username || post.askedBy?.name || "Unknown"}</span>
                        <span>•</span>
                        <span>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : "Just now"}</span>
                      </div>
                    </div>

                    <p className="text-muted-foreground line-clamp-2 cursor-pointer" onClick={() => navigate(`/forum/${post._id}`)}>{post.description}</p>

                    {post.image && (
                      <div className="mt-2 mb-2">
                        <img src={post.image} alt="Attachment" className="h-32 w-auto object-cover rounded-md" />
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <ThumbsUp className="h-4 w-4" />
                        {post.upvotes?.length || 0}
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors" onClick={() => navigate(`/forum/${post._id}`)}>
                        <MessageSquare className="h-4 w-4" />
                        {post.answers?.length || 0} replies
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Forum;
