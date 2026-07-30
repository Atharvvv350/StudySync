import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ArrowLeft, Lightbulb } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const TestSolutions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { answers, questions } = location.state || { answers: {}, questions: [] };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate("/quiz")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Quizzes
      </Button>

      <div className="space-y-2 text-center">
        <h1 className="text-3xl md:text-4xl font-bold">Detailed Solutions</h1>
        <p className="text-muted-foreground">Review each question with detailed explanations</p>
      </div>

      {questions.map((question: any, index: number) => {
        const userAnswerIndex = answers[index];
        const isCorrect = userAnswerIndex === question.correctOption;

        return (
          <Card key={index} className="glass">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                <Badge variant={isCorrect ? "default" : "destructive"}>
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Correct
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Incorrect
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Question */}
              <div>
                <p className="text-lg font-medium mb-4">{question.questionText}</p>
              </div>

              <Separator />

              {/* Options */}
              <div>
                <p className="font-semibold mb-3">Options:</p>
                <div className="space-y-2">
                  {question.options.map((option: string, optIndex: number) => {
                    const isUserAnswer = optIndex === userAnswerIndex;
                    const isCorrectAnswer = optIndex === question.correctOption;

                    return (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg border-2 ${isCorrectAnswer
                            ? 'border-success bg-success/10'
                            : isUserAnswer
                              ? 'border-destructive bg-destructive/10'
                              : 'border-border bg-muted/30'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {isCorrectAnswer && (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Your Answer */}
              <div>
                <p className="font-semibold mb-2">Your Answer:</p>
                <div className={`p-3 rounded-lg ${isCorrect ? 'bg-success/10 border border-success' : 'bg-destructive/10 border border-destructive'
                  }`}>
                  <p className={isCorrect ? 'text-success' : 'text-destructive'}>
                    {userAnswerIndex !== undefined ? question.options[userAnswerIndex] : "Not answered"}
                  </p>
                </div>
              </div>

              {!isCorrect && (
                <div>
                  <p className="font-semibold mb-2">Correct Answer:</p>
                  <div className="p-3 rounded-lg bg-success/10 border border-success">
                    <p className="text-success">{question.options[question.correctOption]}</p>
                  </div>
                </div>
              )}

              <Separator />

              {/* Explanation */}
              <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold mb-2">Explanation:</p>
                    <p className="text-muted-foreground leading-relaxed">
                      {question.explanation || "No explanation provided."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-center pb-8">
        <Button size="lg" onClick={() => navigate("/quiz")}>
          Return to Quizzes
        </Button>
      </div>
    </div>
  );
};

export default TestSolutions;
