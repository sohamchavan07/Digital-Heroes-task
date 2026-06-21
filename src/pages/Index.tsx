import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Flame
} from "lucide-react";
import { format, differenceInDays, addWeeks, addDays, isAfter, isBefore, startOfToday } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Index = () => {
  const [goalName, setGoalName] = useState("");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [workload, setWorkload] = useState<string>("");
  const [workloadType, setWorkloadType] = useState<"hours" | "tasks">("hours");
  const [useFoundersBuffer, setUseFoundersBuffer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const today = startOfToday();

  const stats = useMemo(() => {
    if (!deadline || !workload) return null;

    const daysRemaining = differenceInDays(deadline, today);
    let totalWorkload = parseFloat(workload);

    if (isNaN(totalWorkload) || daysRemaining <= 0) return null;

    // Apply Founder's Buffer (15%)
    if (useFoundersBuffer) {
      totalWorkload = totalWorkload * 1.15;
    }

    const dailyVelocity = totalWorkload / daysRemaining;

    // Status Logic
    let statusLabel = "Chill";
    let statusColor = "text-success bg-success/10 border-success/20";
    let statusEmoji = <CheckCircle2 className="w-3.5 h-3.5" />;

    if (workloadType === "hours" && dailyVelocity > 8) {
      statusLabel = "Burnout Warning";
      statusColor = "text-destructive bg-destructive/10 border-destructive/20 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]";
      statusEmoji = <Flame className="w-3.5 h-3.5" />;
    } else if (dailyVelocity >= 5) {
      statusLabel = "Crunch Time";
      statusColor = "text-destructive bg-destructive/10 border-destructive/20";
      statusEmoji = <Zap className="w-3.5 h-3.5" />;
    } else if (dailyVelocity >= 2) {
      statusLabel = "Focused";
      statusColor = "text-warning bg-warning/10 border-warning/20";
      statusEmoji = <Zap className="w-3.5 h-3.5" />;
    } else {
      statusEmoji = <CheckCircle2 className="w-3.5 h-3.5" />;
    }

    // Calculate weekly milestones
    const milestones = [];
    const weeksCount = Math.ceil(daysRemaining / 7);

    for (let i = 1; i <= weeksCount; i++) {
      const milestoneDate = addWeeks(today, i);
      const dateToUse = isAfter(milestoneDate, deadline) ? deadline : milestoneDate;
      const targetAmount = (totalWorkload / weeksCount) * i;

      milestones.push({
        week: i,
        date: format(dateToUse, "MMM d, yyyy"),
        target: targetAmount.toFixed(1),
        isLast: isAfter(milestoneDate, deadline) || i === weeksCount
      });

      if (isAfter(milestoneDate, deadline)) break;
    }

    return {
      daysRemaining,
      dailyVelocity: dailyVelocity.toFixed(1),
      milestones,
      statusLabel,
      statusColor,
      statusEmoji
    };
  }, [deadline, workload, today, useFoundersBuffer, workloadType]);

  const copyBlueprint = () => {
    if (!stats) return;

    const text = `🚀 My Blueprint: ${goalName || "Untitled Mission"}\n\n📅 Deadline: ${stats.daysRemaining} Days Remaining\n⚡ Daily Velocity Required: ${stats.dailyVelocity} ${workloadType === "hours" ? "Hours" : "Tasks"}/Day (Status: ${stats.statusLabel})\n\nCalculated via Goalz Calculator`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Blueprint copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleInputLink = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGoalName(e.target.value);
    setActivePreset(null);
  };

  const handleWorkloadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkload(e.target.value);
    setActivePreset(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent selection:bg-primary/30">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 bg-[#030303] overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 md:py-16">
        <div className="flex justify-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-sm transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] shadow-lg"
            >
              Built for Digital Heroes
              <ExternalLink className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono mb-4">
            <Target className="w-3 h-3" />
            <span>PRECISION PLANNING ENGINE</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-gradient mb-4">
            Goalz Calculator
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Calculate exact targets and milestones to crush your goals without burnout.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-[1fr_1.2fr]">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="floating-card p-6 rounded-2xl h-fit border border-white/5"
          >
            <h2 className="text-xl font-bold font-display mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Define Your Mission
            </h2>

            {/* Quick-Select Presets */}
            <div className="mb-6 space-y-3">
              <p className="text-[10px] uppercase tracking-wider font-mono opacity-40">Quick-Select Presets</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setGoalName("Build a SaaS MVP");
                    setWorkload("120");
                    setWorkloadType("hours");
                    setDeadline(addDays(today, 30));
                    setActivePreset("saas");
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all flex items-center gap-2",
                    activePreset === "saas" 
                      ? "bg-primary/20 border-primary shadow-[0_0_10px_rgba(79,70,229,0.3)] text-white" 
                      : "bg-white/5 border-white/10 text-white hover:bg-primary/10 hover:border-primary/30"
                  )}
                >
                  <Zap className="w-3 h-3 text-primary" />
                  SaaS MVP (30d / 120h)
                </button>
                <button
                  onClick={() => {
                    setGoalName("Prep for a Tech Interview");
                    setWorkload("40");
                    setWorkloadType("hours");
                    setDeadline(addDays(today, 10));
                    setActivePreset("interview");
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all flex items-center gap-2",
                    activePreset === "interview" 
                      ? "bg-primary/20 border-primary shadow-[0_0_10px_rgba(79,70,229,0.3)] text-white" 
                      : "bg-white/5 border-white/10 text-white hover:bg-primary/10 hover:border-primary/30"
                  )}
                >
                  <Zap className="w-3 h-3 text-primary" />
                  Tech Interview (10d / 40h)
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="goal" className="text-xs uppercase tracking-wider font-mono opacity-60">Goal Name</Label>
                <Input
                  id="goal"
                  placeholder="e.g. Build truebg SaaS"
                  value={goalName}
                  onChange={handleInputLink}
                  className="bg-black/40 border-white/10 focus:border-primary/50 transition-all h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-mono opacity-60">Target Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-black/40 border-white/10 hover:bg-black/60 h-12",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-card border-white/10" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={(d) => {
                        setDeadline(d);
                        setActivePreset(null);
                      }}
                      disabled={(date) => isBefore(date, startOfToday())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end mb-2">
                  <Label htmlFor="workload" className="text-xs uppercase tracking-wider font-mono opacity-60">
                    Estimated {workloadType === "hours" ? "Hours" : "Tasks"}
                  </Label>
                  <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                    <button
                      onClick={() => setWorkloadType("hours")}
                      className={cn(
                        "px-2 py-1 text-[10px] uppercase font-bold rounded-md transition-all",
                        workloadType === "hours" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                      )}
                    >
                      Hours
                    </button>
                    <button
                      onClick={() => setWorkloadType("tasks")}
                      className={cn(
                        "px-2 py-1 text-[10px] uppercase font-bold rounded-md transition-all",
                        workloadType === "tasks" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                      )}
                    >
                      Tasks
                    </button>
                  </div>
                </div>
                <Input
                  id="workload"
                  type="number"
                  placeholder={workloadType === "hours" ? "e.g. 100" : "e.g. 50"}
                  value={workload}
                  onChange={handleWorkloadChange}
                  className="bg-black/40 border-white/10 focus:border-primary/50 transition-all h-12"
                />
              </div>

              {/* Founder's Buffer Toggle */}
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <div>
                      <Label htmlFor="buffer" className="font-bold text-sm text-white">Founder's Buffer (15%)</Label>
                      <p className="text-[10px] text-muted-foreground">Add safety net for bottlenecks</p>
                    </div>
                  </div>
                  <Switch
                    id="buffer"
                    checked={useFoundersBuffer}
                    onCheckedChange={setUseFoundersBuffer}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results Section */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {!stats ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/5 rounded-2xl"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-muted-foreground opacity-20" />
                  </div>
                  <h3 className="text-xl font-bold font-display opacity-40">Ready to calculate?</h3>
                  <p className="text-muted-foreground text-sm opacity-40">Fill in your goal details to see the breakdown.</p>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="floating-card p-6 rounded-2xl border border-white/5">
                      <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Days Remaining</p>
                      <div className="text-3xl font-bold font-display text-white">{stats.daysRemaining}</div>
                      <p className="text-[10px] text-primary mt-1 font-medium">Until Deadline</p>
                    </div>
                    <div className="floating-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Daily Velocity</p>
                        <div className="text-3xl font-bold font-display text-white">{stats.dailyVelocity}</div>
                        <p className="text-[10px] text-accent mt-1 font-medium">{workloadType}/day required</p>
                      </div>

                      {/* Urgency Badge */}
                      <div className={cn(
                        "mt-4 px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit transition-all duration-500",
                        stats.statusColor
                      )}>
                        {stats.statusEmoji}
                        <span>Status: {stats.statusLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Milestones Card */}
                  <div className="floating-card p-6 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold font-display flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent" />
                        Weekly Breakthroughs
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 text-[10px] text-accent font-mono uppercase tracking-widest">
                        Timeline
                      </span>
                    </div>

                    <div className="relative max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-white/5">
                        {stats.milestones.map((ms, idx) => (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            key={ms.week}
                            className="relative pl-8"
                          >
                            <div className={cn(
                              "absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 bg-[#0a0a0f] z-10 flex items-center justify-center",
                              ms.isLast ? "border-primary glow-primary" : "border-white/10"
                            )}>
                              {ms.isLast ? <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> : <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                            </div>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs font-mono text-muted-foreground uppercase">Week {ms.week}</p>
                                <h4 className="font-bold text-white">{ms.date}</h4>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-mono text-muted-foreground uppercase">Cumulative Target</p>
                                <p className="font-mono text-sm font-bold text-accent">{ms.target} {workloadType}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Copy Hustle Blueprint Button */}
                  <Button
                    onClick={copyBlueprint}
                    className={cn(
                      "w-full font-bold h-12 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]",
                      copied 
                        ? "bg-success text-success-foreground border-success hover:bg-success/90" 
                        : "bg-white text-black hover:bg-white/90"
                    )}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "✓ Blueprint Copied to Clipboard!" : "Copy Hustle Blueprint"}
                  </Button>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This velocity assumes a 7-day work week. {useFoundersBuffer && "The Founder's Buffer accounts for a 15% margin of error."}
                      Consistency is the key to achieving <strong>{goalName || "your mission"}</strong>.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mandatory Branding Footer */}
      <footer className="w-full mt-auto pb-12 pt-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <p className="text-xs font-mono uppercase tracking-[0.2em]">
                Developer: <a href="https://www.sohamchavan.site/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">Soham Chavan</a>
              </p>
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;


