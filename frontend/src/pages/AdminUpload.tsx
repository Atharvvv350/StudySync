import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Video, Loader2, CheckCircle, Plus, Trash2, X, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AdminUpload = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(!!id);
    const [files, setFiles] = useState<File[]>([]);
    const [videos, setVideos] = useState<{ title: string; url: string }[]>([]);
    const [newVideo, setNewVideo] = useState({ title: "", url: "" });
    const [content, setContent] = useState("");

    // Keep track of existing PDFs to allow deletion
    const [existingPdfs, setExistingPdfs] = useState<{ title: string; url: string }[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subject: "",
        chapter: "",
        topic: "",
        grade: "11",
        board: "CBSE",
        tags: "",
        isPremium: false
    });

    useEffect(() => {
        if (id) {
            fetchMaterial();
        }
    }, [id]);

    const fetchMaterial = async () => {
        try {
            const { data } = await api.get(`/study-materials/${id}`);
            setFormData({
                title: data.title,
                description: data.description,
                subject: data.subject,
                chapter: data.chapter,
                topic: data.topic,
                grade: data.grade,
                board: data.board,
                tags: data.tags.join(", "),
                isPremium: data.isPremium || false
            });
            setContent(data.content || "");
            setVideos(data.videos || []);
            setExistingPdfs(data.pdfs || []);

            // Handle legacy single file/video format
            if ((!data.pdfs || data.pdfs.length === 0) && data.type === 'pdf' && data.url) {
                setExistingPdfs([{ title: data.title, url: data.url }]);
            }
            if ((!data.videos || data.videos.length === 0) && data.type === 'youtube' && data.url) {
                setVideos([{ title: data.title, url: data.url }]);
            }

        } catch (error) {
            console.error("Error fetching material:", error);
            toast({
                title: "Error",
                description: "Failed to load material details.",
                variant: "destructive",
            });
            navigate("/admin/materials");
        } finally {
            setFetching(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingPdf = (index: number) => {
        setExistingPdfs(prev => prev.filter((_, i) => i !== index));
    };

    const addVideo = () => {
        if (newVideo.title && newVideo.url) {
            setVideos(prev => [...prev, newVideo]);
            setNewVideo({ title: "", url: "" });
        }
    };

    const removeVideo = (index: number) => {
        setVideos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (files.length === 0 && videos.length === 0 && !content && existingPdfs.length === 0) {
            toast({
                title: "Content Required",
                description: "Please add at least some text, a file, or a video.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        const data = new FormData();

        // Append multiple files
        files.forEach(file => {
            data.append("pdfs", file);
        });

        // Append videos as JSON string
        data.append("videos", JSON.stringify(videos));

        // Append existing PDFs (to keep them)
        data.append("existingPdfs", JSON.stringify(existingPdfs));

        // Append rich text content
        data.append("content", content);

        Object.keys(formData).forEach(key => {
            data.append(key, (formData as any)[key]);
        });

        try {
            if (id) {
                await api.put(`/study-materials/${id}`, data);
                toast({
                    title: "Success!",
                    description: "Topic updated successfully.",
                });
            } else {
                await api.post("/study-materials", data);
                toast({
                    title: "Success!",
                    description: "Topic created successfully.",
                });
            }

            navigate("/admin/materials");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast({
                title: "Upload Failed",
                description: error.response?.data?.message || "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in pb-12">
            <Button variant="ghost" onClick={() => navigate("/admin/materials")} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
            </Button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{id ? "Edit Topic" : "Create New Topic"}</h1>
                <p className="text-muted-foreground">Add rich study materials, PDFs, and videos for a specific topic.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Form */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle>Topic Details</CardTitle>
                            <CardDescription>Metadata for categorization.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Topic Title</Label>
                                <Input
                                    placeholder="e.g., Understanding Thermodynamics"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    className="bg-background border-border focus:border-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Class</Label>
                                    <Select
                                        value={formData.grade}
                                        onValueChange={(val) => setFormData({ ...formData, grade: val })}
                                    >
                                        <SelectTrigger className="bg-background border-border">
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="11">Class 11</SelectItem>
                                            <SelectItem value="12">Class 12</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Subject</Label>
                                    <Select
                                        value={formData.subject}
                                        onValueChange={(val) => setFormData({ ...formData, subject: val })}
                                    >
                                        <SelectTrigger className="bg-background border-border">
                                            <SelectValue placeholder="Select Subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Physics">Physics</SelectItem>
                                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                                            <SelectItem value="Biology">Biology</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Chapter Name</Label>
                                    <Input
                                        placeholder="e.g., Thermodynamics"
                                        value={formData.chapter}
                                        onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                                        className="bg-background border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Sub-Topic (Optional)</Label>
                                    <Input
                                        placeholder="e.g., Laws of Thermodynamics"
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        className="bg-background border-border"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Short Description</Label>
                                <Textarea
                                    placeholder="Brief overview..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-background border-border"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <Input
                                    placeholder="important, formula, 2024"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="bg-background border-border"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle>Rich Content</CardTitle>
                            <CardDescription>Add detailed notes, explanations, and formatted text.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg overflow-hidden">
                                <ReactQuill
                                    theme="snow"
                                    value={content}
                                    onChange={setContent}
                                    modules={modules}
                                    className="h-64 mb-12"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle>PDF Documents</CardTitle>
                            <CardDescription>Upload multiple PDF notes or papers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    accept=".pdf"
                                    multiple
                                />
                                <div className="flex flex-col items-center text-muted-foreground">
                                    <Upload className="h-10 w-10 mb-2" />
                                    <p>Click to upload PDFs</p>
                                    <p className="text-xs mt-1">Multiple files allowed</p>
                                </div>
                            </div>

                            {/* Existing PDFs */}
                            {existingPdfs.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Existing Files</p>
                                    {existingPdfs.map((file, index) => (
                                        <div key={`existing-${index}`} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-blue-400" />
                                                <span className="text-sm truncate max-w-[200px]">{file.title}</span>
                                                <span className="text-xs text-muted-foreground">(Existing)</span>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => removeExistingPdf(index)} className="text-red-500 hover:text-red-400">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* New Files */}
                            {files.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">New Files</p>
                                    {files.map((file, index) => (
                                        <div key={`new-${index}`} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-green-400" />
                                                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                                <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-400">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle>Recommended Videos</CardTitle>
                            <CardDescription>Add YouTube video links.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Video Title"
                                    value={newVideo.title}
                                    onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                                    className="bg-background border-border"
                                />
                                <Input
                                    placeholder="YouTube URL"
                                    value={newVideo.url}
                                    onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                                    className="bg-background border-border"
                                />
                                <Button onClick={addVideo} variant="secondary">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {videos.length > 0 && (
                                <div className="space-y-2">
                                    {videos.map((video, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                                            <div className="flex items-center gap-3">
                                                <Video className="h-5 w-5 text-red-500" />
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">{video.title}</span>
                                                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">{video.url}</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => removeVideo(index)} className="text-red-500 hover:text-red-400">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Button
                        onClick={handleSubmit}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                {id ? "Updating Topic..." : "Creating Topic..."}
                            </>
                        ) : (
                            id ? "Update Topic" : "Publish Topic"
                        )}
                    </Button>
                </div>

                {/* Sidebar / Tips */}
                <div className="space-y-6">
                    <Card className="bg-card border-border sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Upload Checklist</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <div className="flex gap-3 items-start">
                                <CheckCircle className={`h-5 w-5 ${formData.title ? 'text-green-500' : 'text-muted-foreground'}`} />
                                <div>
                                    <p className="font-medium text-foreground">Topic Metadata</p>
                                    <p>Title, Subject, and Class are required.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <CheckCircle className={`h-5 w-5 ${content.length > 50 ? 'text-green-500' : 'text-muted-foreground'}`} />
                                <div>
                                    <p className="font-medium text-foreground">Rich Content</p>
                                    <p>Add detailed notes with formatting.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <CheckCircle className={`h-5 w-5 ${files.length > 0 || existingPdfs.length > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
                                <div>
                                    <p className="font-medium text-foreground">PDF Resources</p>
                                    <p>Attach at least one PDF note.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AdminUpload;
