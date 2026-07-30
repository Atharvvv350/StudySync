import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

import { useAuth } from "@/hooks/useAuth";

const TestSimulation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUser } = useAuth();

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // Store index of selected option
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // Default 30 mins
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuizDetails();
    }
  }, [id]);

  const fetchQuizDetails = async () => {
    try {
      const { data } = await api.get(`/quiz/${id}`);
      setQuiz(data);
      // Set duration from quiz data if available, else default to 30 mins
      // Assuming quiz.duration is in minutes string like "30 min" or number
      const duration = parseInt(data.duration) || 30;
      setTimeRemaining(duration * 60);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast({
        title: "Error",
        description: "Could not load quiz details.",
        variant: "destructive",
      });
      navigate('/quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeRemaining > 0 && !isFinished && !loading) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !isFinished && !loading) {
      handleSubmit();
    }
  }, [timeRemaining, isFinished, loading]);

  const handleSubmit = async () => {
    setIsFinished(true);

    try {
      // Format answers for backend: { questionIndex, selectedOption }
      const formattedAnswers = Object.entries(answers).map(([qIndex, optIndex]) => ({
        questionIndex: parseInt(qIndex),
        selectedOption: optIndex
      }));

      const { data } = await api.post('/quiz/attempt', {
        quizId: id,
        answers: formattedAnswers
      });

      // Update local user state if available
      if (user && updateUser) {
        updateUser({ ...user, xp: (user.xp || 0) + (data.xpGained || 0) });
      }

      navigate(`/test-results/${id}`, {
        state: {
          result: data,
          quiz: quiz,
          answers: answers,
          score: data.score,
          totalQuestions: data.totalQuestions,
          xpGained: data.xpGained,
          timeTaken: (parseInt(quiz.duration || 30) * 60) - timeRemaining
        }
      });

    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Submission Failed",
        description: "Could not submit your quiz. Please try again.",
        variant: "destructive",
      });
      setIsFinished(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return <div className="text-center p-8">Quiz not found or has no questions.</div>;
  }

  const questions = quiz.questions;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const totalDuration = parseInt(quiz.duration || 30) * 60;
  const isTimeCritical = timeRemaining < (totalDuration * 0.1); // Less than 10% remaining

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Timer and Progress */}
      <Card className={`glass ${isTimeCritical ? 'border-destructive' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className={`h-5 w-5 ${isTimeCritical ? 'text-destructive' : 'text-primary'}`} />
              <span className={`font-bold text-lg ${isTimeCritical ? 'text-destructive' : ''}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {isTimeCritical && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Less than 5 minutes remaining! Please review your answers.
          </AlertDescription>
        </Alert>
      )}

      {/* Question Card */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-xl">Question {currentQuestion + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">{questions[currentQuestion].questionText}</p>

          <RadioGroup
            value={answers[currentQuestion]?.toString() || ""}
            onValueChange={(value) =>
              setAnswers({ ...answers, [currentQuestion]: parseInt(value) })
            }
          >
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>

            {currentQuestion === questions.length - 1 ? (
              <Button onClick={handleSubmit}>
                Submit Test
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestion(currentQuestion + 1)}
              >
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Question Navigation */}
      <Card className="glass">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-3">Question Navigator</p>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {questions.map((_: any, index: number) => (
              <Button
                key={index}
                variant={index === currentQuestion ? "default" : "outline"}
                size="sm"
                className={`h-10 ${answers[index] !== undefined ? 'bg-success/20 hover:bg-success/30' : ''}`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestSimulation;
