import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Save, Loader2, CheckCircle, ArrowLeft, Download, Edit, Search, FileText } from "lucide-react";
import api from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";

interface Question {
    questionText: string;
    options: string[];
    correctOption: number;
}

const AdminQuiz = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("manage");
    const [loading, setLoading] = useState(false);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

    // Form State
    const [quizData, setQuizData] = useState({
        title: "",
        description: "",
        subject: "",
        grade: "11",
        chapter: "",
        topic: "",
        board: "CBSE",
        timeLimit: 20,
        maxAttempts: "",
    });

    const [questions, setQuestions] = useState<Question[]>([
        { questionText: "", options: ["", "", "", ""], correctOption: 0 }
    ]);

    // Results State
    const [results, setResults] = useState<any[]>([]);
    const [loadingResults, setLoadingResults] = useState(false);
    const [resultFilter, setResultFilter] = useState("");

    useEffect(() => {
        if (activeTab === "manage") {
            fetchQuizzes();
        } else if (activeTab === "results") {
            fetchResults();
        }
    }, [activeTab]);

    const fetchQuizzes = async () => {
        setLoadingQuizzes(true);
        try {
            const { data } = await api.get('/quiz');
            setQuizzes(data);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            toast({
                title: "Error",
                description: "Failed to fetch quizzes.",
                variant: "destructive",
            });
        } finally {
            setLoadingQuizzes(false);
        }
    };

    const fetchResults = async () => {
        setLoadingResults(true);
        try {
            const { data } = await api.get('/quiz/admin/results');
            setResults(data);
        } catch (error) {
            console.error("Error fetching results:", error);
            toast({
                title: "Error",
                description: "Failed to fetch quiz results.",
                variant: "destructive",
            });
        } finally {
            setLoadingResults(false);
        }
    };

    const handleDeleteQuiz = async (id: string) => {
        try {
            await api.delete(`/quiz/${id}`);
            setQuizzes(quizzes.filter(q => q._id !== id));
            toast({ title: "Success", description: "Quiz deleted successfully." });
        } catch (error) {
            console.error("Error deleting quiz:", error);
            toast({ title: "Error", description: "Failed to delete quiz.", variant: "destructive" });
        }
    };

    const handleEditQuiz = (quiz: any) => {
        setEditingQuizId(quiz._id);
        setQuizData({
            title: quiz.title,
            description: quiz.description,
            subject: quiz.subject,
            grade: quiz.grade,
            chapter: quiz.chapter,
            topic: quiz.topic,
            board: quiz.board,
            timeLimit: quiz.duration,
            maxAttempts: quiz.maxAttempts || "",
        });
        setQuestions(quiz.questions);
        setActiveTab("create");
    };

    const resetForm = () => {
        setEditingQuizId(null);
        setQuizData({
            title: "",
            description: "",
            subject: "",
            grade: "11",
            chapter: "",
            topic: "",
            board: "CBSE",
            timeLimit: 20,
            maxAttempts: "",
        });
        setQuestions([{ questionText: "", options: ["", "", "", ""], correctOption: 0 }]);
    };

    const addQuestion = () => {
        setQuestions([...questions, { questionText: "", options: ["", "", "", ""], correctOption: 0 }]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== index));
        }
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleSubmit = async () => {
        if (!quizData.title || !quizData.subject || !quizData.chapter || !quizData.topic || !quizData.board) {
            toast({ title: "Missing Information", description: "Please fill in all quiz details.", variant: "destructive" });
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].questionText || questions[i].options.some(opt => !opt)) {
                toast({ title: "Incomplete Questions", description: `Please complete Question ${i + 1}.`, variant: "destructive" });
                return;
            }
        }

        setLoading(true);
        try {
            const payload = { ...quizData, duration: quizData.timeLimit, questions };

            if (editingQuizId) {
                await api.put(`/quiz/${editingQuizId}`, payload);
                toast({ title: "Success!", description: "Quiz updated successfully." });
            } else {
                await api.post("/quiz", payload);
                toast({ title: "Success!", description: "Quiz created successfully." });
            }

            resetForm();
            setActiveTab("manage");
            fetchQuizzes();
        } catch (error: any) {
            console.error("Error saving quiz:", error);
            toast({ title: "Error", description: error.response?.data?.message || "Failed to save quiz.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const downloadCSV = () => {
        if (results.length === 0) return;
        const headers = ["Student Name", "Username", "Quiz Title", "Subject", "Score", "Total Questions", "Date"];
        const csvRows = [headers.join(",")];
        results.forEach(attempt => {
            const row = [
                `"${attempt.student?.name || 'Unknown'}"`,
                `"${attempt.student?.username || 'N/A'}"`,
                `"${attempt.quiz?.title || 'Deleted Quiz'}"`,
                `"${attempt.quiz?.subject || 'N/A'}"`,
                attempt.score,
                attempt.totalQuestions,
                new Date(attempt.completedAt).toLocaleDateString()
            ];
            csvRows.push(row.join(","));
        });
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "quiz_results.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredResults = results.filter(r =>
        resultFilter ? r.quiz?.title === resultFilter : true
    );

    return (
        <div className="max-w-6xl mx-auto animate-fade-in pb-12">
            <Button variant="ghost" onClick={() => navigate("/admin/materials")} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
            </Button>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Quiz Management</h1>
                    <p className="text-slate-400">Create, edit, and manage quizzes.</p>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={(val) => {
                if (val === "create" && activeTab !== "create") resetForm();
                setActiveTab(val);
            }} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-muted">
                    <TabsTrigger value="manage">Manage Quizzes</TabsTrigger>
                    <TabsTrigger value="create">{editingQuizId ? "Edit Quiz" : "Create Quiz"}</TabsTrigger>
                    <TabsTrigger value="results">View Results</TabsTrigger>
                </TabsList>

                <TabsContent value="manage">
                    <Card className="bg-card shadow-sm border">
                        <CardHeader>
                            <CardTitle>All Quizzes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingQuizzes ? (
                                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                            ) : quizzes.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No quizzes found. Create one to get started!</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Subject</TableHead>
                                            <TableHead>Class</TableHead>
                                            <TableHead>Questions</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {quizzes.map((quiz) => (
                                            <TableRow key={quiz._id}>
                                                <TableCell className="font-medium">
                                                    {quiz.title}
                                                    <div className="text-xs text-muted-foreground">{quiz.chapter}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{quiz.subject}</Badge>
                                                </TableCell>
                                                <TableCell>Class {quiz.grade}</TableCell>
                                                <TableCell>{quiz.questions.length}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => {
                                                            setResultFilter(quiz.title);
                                                            setActiveTab("results");
                                                        }}>
                                                            <FileText className="h-4 w-4 text-green-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleEditQuiz(quiz)}>
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
                                                                    <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently delete "{quiz.title}". This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDeleteQuiz(quiz._id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="create" className="space-y-8">
                    <div className="grid gap-8">
                        <Card className="bg-card shadow-sm border">
                            <CardHeader>
                                <CardTitle>{editingQuizId ? "Edit Quiz Details" : "New Quiz Details"}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Quiz Title</Label>
                                    <Input placeholder="e.g., Thermodynamics Mastery Test" value={quizData.title} onChange={(e) => setQuizData({ ...quizData, title: e.target.value })} className="bg-background border-border" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Board</Label>
                                        <Select value={quizData.board} onValueChange={(val) => setQuizData({ ...quizData, board: val })}>
                                            <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select Board" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="CBSE">CBSE</SelectItem>
                                                <SelectItem value="ICSE">ICSE</SelectItem>
                                                <SelectItem value="State Board">State Board</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Topic</Label>
                                        <Input placeholder="e.g., Laws of Thermodynamics" value={quizData.topic} onChange={(e) => setQuizData({ ...quizData, topic: e.target.value })} className="bg-background border-border" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Subject</Label>
                                        <Select value={quizData.subject} onValueChange={(val) => setQuizData({ ...quizData, subject: val })}>
                                            <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select Subject" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Physics">Physics</SelectItem>
                                                <SelectItem value="Chemistry">Chemistry</SelectItem>
                                                <SelectItem value="Mathematics">Mathematics</SelectItem>
                                                <SelectItem value="Biology">Biology</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Class</Label>
                                        <Select value={quizData.grade} onValueChange={(val) => setQuizData({ ...quizData, grade: val })}>
                                            <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="11">Class 11</SelectItem>
                                                <SelectItem value="12">Class 12</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Chapter</Label>
                                        <Input placeholder="e.g., Thermodynamics" value={quizData.chapter} onChange={(e) => setQuizData({ ...quizData, chapter: e.target.value })} className="bg-background border-border" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Time Limit (minutes)</Label>
                                        <Input type="number" value={quizData.timeLimit} onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) })} className="bg-background border-border" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Attempts (Optional)</Label>
                                    <Input type="number" placeholder="Unlimited" value={quizData.maxAttempts} onChange={(e) => setQuizData({ ...quizData, maxAttempts: e.target.value })} className="bg-background border-border" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea placeholder="Brief description..." value={quizData.description} onChange={(e) => setQuizData({ ...quizData, description: e.target.value })} className="bg-background border-border" />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Questions ({questions.length})</h2>
                                <Button variant="outline" onClick={addQuestion} className="gap-2"><Plus className="h-4 w-4" /> Add Question</Button>
                            </div>
                            {questions.map((q, qIndex) => (
                                <Card key={qIndex} className="bg-card shadow-sm border relative group">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-1 space-y-2">
                                                <Label>Question {qIndex + 1}</Label>
                                                <Input placeholder="Enter question text..." value={q.questionText} onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)} className="bg-background border-border font-medium" />
                                            </div>
                                            {questions.length > 1 && (
                                                <Button variant="ghost" size="icon" onClick={() => removeQuestion(qIndex)} className="text-slate-500 hover:text-red-500 mt-8"><Trash2 className="h-4 w-4" /></Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-border">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-2">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${q.correctOption === oIndex ? "border-green-500 bg-green-500/20 text-green-500" : "border-muted-foreground/50 hover:border-muted-foreground"}`} onClick={() => updateQuestion(qIndex, "correctOption", oIndex)}>
                                                        {q.correctOption === oIndex && <CheckCircle className="h-4 w-4" />}
                                                    </div>
                                                    <Input placeholder={`Option ${oIndex + 1}`} value={opt} onChange={(e) => updateOption(qIndex, oIndex, e.target.value)} className={`bg-background border-border ${q.correctOption === oIndex ? "border-green-500/50" : ""}`} />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div className="flex justify-center pt-8">
                            <Button onClick={handleSubmit} disabled={loading} size="lg" className="w-full md:w-auto min-w-[200px] gap-2">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {editingQuizId ? "Update Quiz" : "Publish Quiz"}
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="results">
                    <Card className="bg-card shadow-sm border">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-4">
                                <CardTitle>Student Attempts</CardTitle>
                                {resultFilter && (
                                    <Badge variant="secondary" className="cursor-pointer" onClick={() => setResultFilter("")}>
                                        Filter: {resultFilter} <span className="ml-1">×</span>
                                    </Badge>
                                )}
                            </div>
                            <Button variant="outline" size="sm" onClick={downloadCSV} disabled={results.length === 0}>
                                <Download className="h-4 w-4 mr-2" /> Export CSV
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loadingResults ? (
                                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                            ) : filteredResults.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No quiz attempts found.</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Quiz</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead>Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredResults.map((attempt) => (
                                            <TableRow key={attempt._id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{attempt.student?.name || 'Unknown'}</p>
                                                        <p className="text-xs text-muted-foreground">{attempt.student?.username}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{attempt.quiz?.title || 'Deleted Quiz'}</p>
                                                        <p className="text-xs text-muted-foreground">{attempt.quiz?.subject}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`font-bold ${(attempt.score / attempt.totalQuestions) >= 0.7 ? 'text-green-500' : (attempt.score / attempt.totalQuestions) >= 0.4 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                        {attempt.score} / {attempt.totalQuestions}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{new Date(attempt.completedAt).toLocaleDateString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminQuiz;
