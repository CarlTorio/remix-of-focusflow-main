import { MobileHeader } from "@/components/navigation/MobileHeader";
import {
  Home, CalendarDays, Bell, FileText, Wind, Settings,
  CheckCircle2, ChevronRight, Sparkles, Brain, Clock,
  ListTodo, PenLine, Volume2, Target, LayoutGrid
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface TutorialStep {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  steps: string[];
  link: string;
  color: string;
}

const tutorialSections: TutorialStep[] = [
  {
    id: "hub",
    icon: Home,
    title: "Hub — Your Dashboard",
    description: "The Hub is your home base. It shows a quick overview of your day, including tasks due, routines, weekly performance, and mood tracking.",
    steps: [
      "Open the app — you'll land on the Hub automatically.",
      "Check your daily progress at a glance.",
      "View task summaries and upcoming deadlines.",
      "Track your weekly routine completion.",
      "Install the app on your device using the install banner.",
    ],
    link: "/hub",
    color: "hsl(var(--primary))",
  },
  {
    id: "planner",
    icon: CalendarDays,
    title: "Planner — Organize Your Week",
    description: "The Planner helps you schedule tasks across your week. Drag tasks between days, set priorities, and break big tasks into smaller subtasks.",
    steps: [
      "Navigate to the Planner from the sidebar or bottom nav.",
      "Tap the '+' button to add a new task.",
      "Set the task title, priority, estimated hours, and due date.",
      "Break large tasks into subtasks for better focus.",
      "Use the daily view to see what's scheduled for today.",
      "Mark tasks as complete when you're done.",
    ],
    link: "/planner",
    color: "hsl(var(--primary))",
  },
  {
    id: "alarm",
    icon: Bell,
    title: "Alarms & Reminders",
    description: "Set alarms to stay on track. Create one-time or recurring alarms, choose your preferred sound, and attach them to specific tasks.",
    steps: [
      "Go to the Alarm section from the navigation.",
      "Tap 'Add Alarm' to create a new alarm.",
      "Set the time and choose whether it repeats.",
      "Pick a sound that works for you.",
      "Optionally link the alarm to a specific task.",
      "Manage active alarms — toggle, snooze, or delete them.",
    ],
    link: "/alarm",
    color: "hsl(var(--primary))",
  },
  {
    id: "notes",
    icon: FileText,
    title: "Notes — Capture Your Thoughts",
    description: "A full-featured note editor with folders, formatting tools, and multi-column layouts. Perfect for jotting down ideas, meeting notes, or study material.",
    steps: [
      "Open Notes from the navigation.",
      "Create a new note using the '+' button.",
      "Use the toolbar to format text — bold, italic, headings, lists, and more.",
      "Organize notes into folders using the folder panel.",
      "On desktop, switch between 1, 2, or 3 column layouts.",
      "Star important notes for quick access.",
    ],
    link: "/notes",
    color: "hsl(var(--primary))",
  },
  {
    id: "breathing",
    icon: Wind,
    title: "Breathing Exercises",
    description: "Take a moment to relax with guided breathing exercises. Choose a pattern, follow the visual guide, and calm your mind between tasks.",
    steps: [
      "Navigate to the Breathing section.",
      "Choose a breathing pattern that suits your needs.",
      "Follow the animated guide — breathe in, hold, breathe out.",
      "Use this between focus sessions or when feeling overwhelmed.",
    ],
    link: "/breathing",
    color: "hsl(var(--primary))",
  },
  {
    id: "settings",
    icon: Settings,
    title: "Settings & Customization",
    description: "Personalize NexDay to fit your style. Change your theme, update your profile, manage daily limits, and configure nudge notifications.",
    steps: [
      "Go to Settings from the navigation.",
      "Update your profile — name, nickname, and avatar.",
      "Choose your preferred theme and accent color.",
      "Set a daily hour limit to prevent overworking.",
      "Enable or disable nudge reminders.",
      "Manage your data and privacy preferences.",
    ],
    link: "/settings",
    color: "hsl(var(--primary))",
  },
];

function TutorialCard({ section }: { section: TutorialStep }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = section.icon;

  return (
    <div className="group rounded-2xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 px-5 py-4 text-left"
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10"
        >
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground text-[15px]">{section.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{section.description}</p>
        </div>
        <ChevronRight
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-sm text-muted-foreground leading-relaxed">{section.description}</p>

          <ol className="space-y-2">
            {section.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>

          <Link
            to={section.link}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            Try it now
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Tutorial() {
  return (
    <div className="pb-20 md:pb-8">
      <MobileHeader title="Tutorial" />
      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 py-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">How to Use NexDay</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            A step-by-step guide to help you get the most out of your ADHD life management system. Tap any section below to learn more.
          </p>
        </div>

        {/* Quick Tips */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
          <h2 className="text-sm font-semibold text-primary flex items-center gap-2">
            <Target className="h-4 w-4" />
            Quick Tips
          </h2>
          <ul className="space-y-1.5 text-sm text-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>Start each day by checking your <strong>Hub</strong> for an overview.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>Break big tasks into smaller subtasks in the <strong>Planner</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>Use <strong>Breathing Exercises</strong> when you feel overwhelmed.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>Set <strong>Alarms</strong> for important tasks so you never forget.</span>
            </li>
          </ul>
        </div>

        {/* Tutorial Sections */}
        <div className="space-y-3">
          {tutorialSections.map((section) => (
            <TutorialCard key={section.id} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
