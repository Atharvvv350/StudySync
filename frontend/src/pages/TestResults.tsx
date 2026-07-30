import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Target, CheckCircle2, XCircle, BookOpen, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TestResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  // Destructure with default values to prevent crashes
  const { answers, quiz, score, totalQuestions, timeTaken } = location.state || {
    answers: {},
    quiz: { questions: [] },
    score: 0,
    totalQuestions: 0,
    timeTaken: 0
  };

  const questions = quiz?.questions || [];
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getPerformanceLevel = () => {
    if (percentage >= 90) return { text: "Outstanding!", color: "text-success" };
    if (percentage >= 75) return { text: "Excellent!", color: "text-success" };
    if (percentage >= 60) return { text: "Good!", color: "text-primary" };
    if (percentage >= 40) return { text: "Fair", color: "text-warning" };
    return { text: "Needs Improvement", color: "text-destructive" };
  };

  const performance = getPerformanceLevel();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <Trophy className="h-16 w-16 mx-auto text-primary animate-pulse-subtle" />
        <h1 className="text-3xl md:text-4xl font-bold">Test Completed!</h1>
        <p className={`text-xl ${performance.color} font-semibold`}>{performance.text}</p>
      </div>

      {/* Score Overview */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Your Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-primary">{percentage}%</div>
            <Progress value={percentage} className="h-4" />
            <p className="text-muted-foreground">
              You scored {score} out of {totalQuestions} questions correctly
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{score}/{totalQuestions}</p>
              <p className="text-sm text-muted-foreground">Correct Answers</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{formatTime(timeTaken)}</p>
              <p className="text-sm text-muted-foreground">Time Taken</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{percentage >= 75 ? "A" : percentage >= 60 ? "B" : percentage >= 40 ? "C" : "D"}</p>
              <p className="text-sm text-muted-foreground">Grade</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold text-yellow-500">+{score} XP</p>
              <p className="text-sm text-muted-foreground">XP Gained</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question-wise Analysis */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Question Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question: any, index: number) => {
            const userAnswerIndex = answers[index];
            const isCorrect = userAnswerIndex === question.correctOption;

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-success/50 bg-success/10' : 'border-destructive/50 bg-destructive/10'
                  }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0 mt-1" />
                  ) : (
                    <XCircle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium">Q{index + 1}. {question.questionText}</p>
                      <Badge variant={isCorrect ? "default" : "destructive"}>
                        {isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                    {!isCorrect && (
                      <div className="space-y-1 text-sm">
                        <p className="text-destructive">
                          Your answer: {userAnswerIndex !== undefined ? question.options[userAnswerIndex] : "Not answered"}
                        </p>
                        <p className="text-success">
                          Correct answer: {question.options[question.correctOption]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-center">

        <Button
          size="lg"
          variant="secondary"
          onClick={() => navigate("/quiz")}
        >
          Back to Quizzes
        </Button>
      </div>
    </div>
  );
};

export default TestResults;
