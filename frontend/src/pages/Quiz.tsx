import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Trophy, Target, TrendingUp, Loader2 } from "lucide-react";
import api from "@/lib/api";

const Quiz = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [stats, setStats] = useState({ averageAccuracy: 0, improvement: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quizRes, analyticsRes] = await Promise.all([
        api.get('/quiz'),
        api.get('/analytics')
      ]);

      setQuizzes(quizRes.data);
      setStats({
        averageAccuracy: analyticsRes.data.averageAccuracy || 0,
        improvement: analyticsRes.data.improvement || 0
      });
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Adaptive Quizzes</h1>
          <p className="text-muted-foreground text-lg">Test your knowledge and track your progress</p>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quizzes Available</p>
                <p className="text-2xl font-bold">{quizzes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold text-success">{Math.round(stats.averageAccuracy)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Improvement</p>
                <p className={`text-2xl font-bold ${stats.improvement >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stats.improvement > 0 ? '+' : ''}{Math.round(stats.improvement)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Quizzes */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Available Quizzes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quizzes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No quizzes available at the moment.</p>
          ) : (
            quizzes.map((quiz, index) => (
              <div key={quiz._id || index} className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{quiz.title}</h3>
                      <Badge variant="secondary">
                        {quiz.subject}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{quiz.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {quiz.duration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {quiz.questions?.length || 0} questions
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        Attempts: {quiz.attemptsTaken || 0} / {quiz.maxAttempts ? quiz.maxAttempts : '∞'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[140px]">
                    <Button
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => navigate(`/test-simulation/${quiz._id}`)}
                      disabled={quiz.maxAttempts && quiz.attemptsTaken >= quiz.maxAttempts}
                    >
                      {quiz.maxAttempts && quiz.attemptsTaken >= quiz.maxAttempts ? 'Limit Reached' : 'Start Quiz'}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;
