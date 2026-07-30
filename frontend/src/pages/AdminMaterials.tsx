import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus, Search, Loader2, FileText, Video } from "lucide-react";
import api from "@/lib/api";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminMaterials = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterSubject, setFilterSubject] = useState("all");
    const [filterGrade, setFilterGrade] = useState("all");

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const { data } = await api.get("/study-materials");
            setMaterials(data);
        } catch (error) {
            console.error("Error fetching materials:", error);
            toast({
                title: "Error",
                description: "Failed to load study materials.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/study-materials/${id}`);
            setMaterials(materials.filter((m) => m._id !== id));
            toast({
                title: "Success",
                description: "Material deleted successfully.",
            });
        } catch (error) {
            console.error("Error deleting material:", error);
            toast({
                title: "Error",
                description: "Failed to delete material.",
                variant: "destructive",
            });
        }
    };

    const filteredMaterials = materials.filter((material) => {
        const matchesSearch = material.title.toLowerCase().includes(search.toLowerCase()) ||
            material.chapter.toLowerCase().includes(search.toLowerCase());
        const matchesSubject = filterSubject === "all" || material.subject === filterSubject;
        const matchesGrade = filterGrade === "all" || material.grade === filterGrade;
        return matchesSearch && matchesSubject && matchesGrade;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Manage Materials</h1>
                    <p className="text-muted-foreground">View, edit, or delete study resources.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => navigate("/admin/quiz")} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4" />
                        Manage Quizzes
                    </Button>
                    <Button onClick={() => navigate("/admin/upload")} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Topic
                    </Button>
                </div>
            </div>

            <Card className="glass">
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title or chapter..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-background/50"
                            />
                        </div>
                        <Select value={filterSubject} onValueChange={setFilterSubject}>
                            <SelectTrigger className="w-[180px] bg-background/50">
                                <SelectValue placeholder="Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Subjects</SelectItem>
                                <SelectItem value="Physics">Physics</SelectItem>
                                <SelectItem value="Chemistry">Chemistry</SelectItem>
                                <SelectItem value="Mathematics">Mathematics</SelectItem>
                                <SelectItem value="Biology">Biology</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterGrade} onValueChange={setFilterGrade}>
                            <SelectTrigger className="w-[180px] bg-background/50">
                                <SelectValue placeholder="Class" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Classes</SelectItem>
                                <SelectItem value="11">Class 11</SelectItem>
                                <SelectItem value="12">Class 12</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border bg-background/50">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Class</TableHead>
                                    <TableHead>Content</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMaterials.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No materials found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMaterials.map((material) => (
                                        <TableRow key={material._id}>
                                            <TableCell className="font-medium">
                                                <div>
                                                    {material.title}
                                                    <div className="text-xs text-muted-foreground">{material.chapter}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={
                                                    material.subject === 'Physics' ? 'border-blue-500 text-blue-500' :
                                                        material.subject === 'Chemistry' ? 'border-green-500 text-green-500' :
                                                            material.subject === 'Mathematics' ? 'border-red-500 text-red-500' :
                                                                'border-purple-500 text-purple-500'
                                                }>
                                                    {material.subject}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>Class {material.grade}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {material.pdfs && material.pdfs.length > 0 && (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <FileText className="h-3 w-3" /> {material.pdfs.length}
                                                        </Badge>
                                                    )}
                                                    {material.videos && material.videos.length > 0 && (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <Video className="h-3 w-3" /> {material.videos.length}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => navigate(`/admin/edit/${material._id}`)}
                                                    >
                                                        <Edit className="h-4 w-4 text-blue-500" />
                                                    </Button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <Trash2 className="h-4 w-4 text-red-500" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete the topic
                                                                    "{material.title}" and all associated files.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDelete(material._id)}
                                                                    className="bg-red-500 hover:bg-red-600"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminMaterials;
