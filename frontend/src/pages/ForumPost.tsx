import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, CheckCircle, ArrowLeft, Loader2, Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const ForumPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newAnswer, setNewAnswer] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    useEffect(() => {
        if (id) {
            fetchPostDetails();
        }
    }, [id]);

    const fetchPostDetails = async () => {
        try {
            const { data } = await api.get(`/forum/${id}`);
            setPost(data);
        } catch (error) {
            console.error("Error fetching post:", error);
            toast({
                title: "Error",
                description: "Could not load discussion details.",
                variant: "destructive",
            });
            navigate('/forum');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async () => {
        if (!newAnswer.trim()) return;

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('text', newAnswer);
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            await api.post(`/forum/${id}/answers`, formData);

            toast({
                title: "Answer Posted",
                description: "Your answer has been added.",
            });
            setNewAnswer("");
            setSelectedImage(null);
            fetchPostDetails(); // Refresh to show new answer
        } catch (error) {
            console.error("Error posting answer:", error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to post answer. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpvote = async (answerId: string) => {
        try {
            await api.put(`/forum/${id}/answers/${answerId}/upvote`);
            fetchPostDetails(); // Refresh to update upvote count
        } catch (error: any) {
            if (error.response && error.response.status === 400) {
                toast({
                    title: "Already Upvoted",
                    description: "You have already upvoted this answer.",
                    variant: "default",
                });
            } else {
                console.error("Error upvoting:", error);
                toast({
                    title: "Error",
                    description: "Failed to upvote.",
                    variant: "destructive",
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!post) return null;

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            <Button
                variant="ghost"
                onClick={() => navigate("/forum")}
                className="mb-4"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forum
            </Button>

            {/* Question Card */}
            <Card className="glass border-l-4 border-l-primary">
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold">{post.title}</h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Posted by {post.askedBy?.username || post.askedBy?.name || "Unknown"}</span>
                                <span>•</span>
                                <span>{post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : "Just now"}</span>
                            </div>
                        </div>
                        {post.isSolved && (
                            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                                <CheckCircle className="h-3 w-3 mr-1" /> Solved
                            </Badge>
                        )}
                    </div>

                    <p className="text-lg leading-relaxed">{post.description}</p>

                    {post.image && (
                        <div className="mt-4">
                            <img src={post.image} alt="Attachment" className="max-h-96 w-auto object-contain rounded-md" />
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2">
                        {post.tags.map((tag: string, i: number) => (
                            <Badge key={i} variant="outline">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center gap-2 text-lg font-semibold px-2">
                <MessageSquare className="h-5 w-5" />
                {post.answers.length} Answers
            </div>

            {/* Answers List */}
            <div className="space-y-4">
                {post.answers.map((answer: any) => (
                    <Card key={answer._id} className={`glass ${answer.isVerified ? 'border-success/50 bg-success/5' : ''}`}>
                        <CardContent className="p-6">
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-1 hover:bg-transparent hover:text-primary"
                                        onClick={() => handleUpvote(answer._id)}
                                    >
                                        <ThumbsUp className={`h-5 w-5 ${answer.upvotes?.includes("CURRENT_USER_ID_PLACEHOLDER") ? "fill-primary text-primary" : ""}`} />
                                    </Button>
                                    <span className="font-bold text-sm">{answer.upvotes?.length || 0}</span>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-xs">
                                                    {answer.answeredBy?.name?.[0] || "U"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium text-sm">{answer.answeredBy?.username || answer.answeredBy?.name || "Unknown"}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {answer.createdAt ? formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true }) : ""}
                                            </span>
                                        </div>
                                        {answer.isVerified && (
                                            <Badge variant="default" className="bg-success hover:bg-success/90">
                                                <CheckCircle className="h-3 w-3 mr-1" /> Verified Answer
                                            </Badge>
                                        )}
                                    </div>

                                    <p className="text-muted-foreground">{answer.text}</p>
                                    {answer.image && (
                                        <div className="mt-2">
                                            <img src={answer.image} alt="Attachment" className="max-h-64 w-auto object-contain rounded-md" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add Answer Form */}
            <Card className="glass mt-8">
                <CardHeader>
                    <CardTitle className="text-lg">Your Answer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                        placeholder="Write your detailed answer here..."
                        className="min-h-[150px]"
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                    />
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <label className="text-sm font-medium mb-1 block">Attachment (Optional)</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                onChange={(e) => setSelectedImage(e.target.files ? e.target.files[0] : null)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleSubmitAnswer} disabled={submitting || !newAnswer.trim()}>
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" /> Post Answer
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForumPost;
