import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { BookOpen, Brain, Trophy, Users, Zap, Target } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Navbar showUserControls={false} />
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
              Welcome to <span className="text-primary">StudySync</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Your personalized learning companion. Master any subject with adaptive quizzes,
              and interactive study materials.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <NavLink to="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 shadow-glow-subtle">
                  Start Learning Free
                </Button>
              </NavLink>
              <NavLink to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 border-primary/50 hover:bg-primary/10">
                  Sign In
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why StudySync?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="glass hover:shadow-glow-subtle transition-all duration-300 hover:-translate-y-1 animate-fade-in border-primary/20">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-4 shadow-glow-subtle">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-scale-in">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse-subtle"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse-subtle"></div>
        </div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already achieving their academic goals with StudySync.
          </p>
          <NavLink to="/signup">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 shadow-lg">
              Get Started Now
            </Button>
          </NavLink>
        </div>
      </section>
    </div>
  );
};

const features = [
  {
    icon: BookOpen,
    title: "Comprehensive Study Materials",
    description: "Access organized notes, PDFs, and videos for every subject and topic.",
  },

  {
    icon: Zap,
    title: "Adaptive Quizzes",
    description: "Take personalized quizzes that adapt to your learning pace and style.",
  },
  {
    icon: Trophy,
    title: "Gamification & Rewards",
    description: "Earn XP, badges, and climb the leaderboard as you learn.",
  },
  {
    icon: Users,
    title: "Discussion Forum",
    description: "Collaborate with peers and get help from the community.",
  },
  {
    icon: Target,
    title: "Progress Tracking",
    description: "Monitor your performance with detailed analytics and insights.",
  },
];

const stats = [
  { value: "50K+", label: "Active Students" },
  { value: "1000+", label: "Study Materials" },
  { value: "500+", label: "Practice Tests" },
  { value: "95%", label: "Success Rate" },
];

export default Landing;
