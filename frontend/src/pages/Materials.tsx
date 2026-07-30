import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, FileText, Video, Search, Loader2, LayoutGrid, List, Grid, Filter } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const ALL_SUBJECTS = [
  "Physics",
  "Chemistry",
  "Mathematics",
  "Biology"
];

const Materials = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [viewMode, setViewMode] = useState<"course" | "topic">("course");
  const [layoutMode, setLayoutMode] = useState<"grid" | "list">("grid");
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data } = await api.get('/study-materials');
      setMaterials(data);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast({
        title: "Error",
        description: "Could not load study materials.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter materials based on search query, selected subject, and grade
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = searchQuery === "" ||
      material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (material.topic && material.topic.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (material.tags && material.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesSubject = selectedSubject === "all" ||
      material.subject.toLowerCase() === selectedSubject.toLowerCase();

    const matchesGrade = selectedGrade === "all" ||
      material.grade === selectedGrade;

    return matchesSearch && matchesSubject && matchesGrade;
  });

  // Group materials by subject for "Course View" - using ALL_SUBJECTS
  // Counts should reflect the selected grade filter
  const subjectGroups = ALL_SUBJECTS.map(subject => {
    const count = materials.filter(m => {
      const matchSubject = m.subject.toLowerCase() === subject.toLowerCase();
      const matchGrade = selectedGrade === "all" || m.grade === selectedGrade;
      return matchSubject && matchGrade;
    }).length;
    return { name: subject, count };
  });

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video': return Video;
      case 'notes': return FileText;
      default: return BookOpen;
    }
  };

  const getColor = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'mathematics': return 'gradient-primary';
      case 'physics': return 'gradient-secondary';
      case 'chemistry': return 'gradient-accent';
      case 'biology': return 'gradient-success'; // Added specific color for Biology if needed, or reuse
      default: return 'gradient-primary';
    }
  };

  // If searching, force topic view layout (but keep viewMode state as is)
  const isSearching = searchQuery.trim() !== "";
  const effectiveViewMode = isSearching ? "topic" : viewMode;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-bold">Study Materials</h1>

          <div className="flex items-center gap-4">
            {/* View Toggle (Course/Topic) */}
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border">
              <Button
                variant={viewMode === "course" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("course")}
                className="gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Course Wise
              </Button>
              <Button
                variant={viewMode === "topic" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("topic")}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Topic Wise
              </Button>
            </div>

            {/* Layout Toggle (Grid/List) - Only visible in Topic View */}
            {effectiveViewMode === "topic" && (
              <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border">
                <Button
                  variant={layoutMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setLayoutMode("grid")}
                  className="h-8 w-8"
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={layoutMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setLayoutMode("list")}
                  className="h-8 w-8"
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search topics, chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Class Filter - Always Visible */}
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-full md:w-40">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Select Class" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              <SelectItem value="11">Class 11</SelectItem>
              <SelectItem value="12">Class 12</SelectItem>
            </SelectContent>
          </Select>

          {/* Subject Filter - Only in Topic View (or if searching) */}
          {(effectiveViewMode === "topic") && (
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {ALL_SUBJECTS.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Course View (Subject Cards - Big Tiles) */}
          {effectiveViewMode === "course" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {subjectGroups.map((group) => (
                <Card
                  key={group.name}
                  className="bg-card shadow-sm border hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-64 flex flex-col items-center justify-center text-center relative overflow-hidden"
                  onClick={() => {
                    setSelectedSubject(group.name);
                    setViewMode("topic");
                  }}
                >
                  {/* Background decoration */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${getColor(group.name).replace('gradient-', 'bg-')}`} />

                  <CardContent className="p-6 flex flex-col items-center gap-6 z-10">
                    <div className={`w-20 h-20 rounded-2xl ${getColor(group.name)} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                      <BookOpen className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-2xl mb-2">{group.name}</h3>
                      <Badge variant="secondary" className="text-sm px-3 py-1">
                        {group.count} Topics
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Topic View (Material Cards - Grid or List) */}
          {effectiveViewMode === "topic" && (
            <div className={layoutMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
              {filteredMaterials.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No materials found matching your criteria.</p>
                  {(selectedSubject !== 'all' || selectedGrade !== 'all') && (
                    <Button variant="link" onClick={() => { setSelectedSubject('all'); setSelectedGrade('all'); }}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                filteredMaterials.map((material, index) => {
                  const Icon = getIcon(material.type);
                  const color = getColor(material.subject);

                  if (layoutMode === "list") {
                    return (
                      <Card key={material._id || index} className="bg-card shadow-sm border hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/materials/${material._id}`)}>
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>

                          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                            <div className="md:col-span-4">
                              <h3 className="font-semibold truncate">{material.title}</h3>
                              <p className="text-sm text-muted-foreground md:hidden">{material.subject} • {material.topic}</p>
                            </div>

                            <div className="hidden md:block md:col-span-3 text-sm text-muted-foreground">
                              {material.subject} • {material.topic}
                            </div>

                            <div className="hidden md:flex md:col-span-3 flex-wrap gap-2">
                              {material.tags && material.tags.slice(0, 2).map((tag: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="md:col-span-2 flex items-center justify-end gap-3">
                              <Badge variant={material.isPremium ? "default" : "secondary"} className="hidden lg:inline-flex">
                                {material.isPremium ? "Premium" : "Free"}
                              </Badge>
                              <Button size="sm" variant="ghost" className="text-primary">
                                View
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <Card key={material._id || index} className="bg-card shadow-sm border hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <Badge variant={material.isPremium ? "default" : "secondary"}>
                            {material.isPremium ? "Premium" : "Free"}
                          </Badge>
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{material.title}</h3>
                          <p className="text-sm text-muted-foreground">{material.subject} • {material.topic}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {material.tags && material.tags.map((tag: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-sm text-muted-foreground">View Content</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:text-primary"
                            onClick={() => navigate(`/materials/${material._id}`)}
                          >
                            View →
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Materials;
