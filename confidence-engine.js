/**
 * Festiva AI - Celebration Confidence Engine
 * Computes an objective, data-driven readiness score (0-100)
 * and generates actionable recommendations to reach peak confidence.
 */

const ConfidenceEngine = {
  calculate(event) {
    if (!event) return this.getDefaultScore();

    // 1. Task Completion (35 Points Max)
    const tasks = Array.isArray(event.tasks) ? event.tasks.filter(item => item && typeof item === "object") : [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completed").length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) : 0;
    const taskScore = Math.round(taskCompletionRate * 35);

    // 2. Vendor Health & Booking Status (30 Points Max)
    const vendors = Array.isArray(event.vendors) ? event.vendors.filter(item => item && typeof item === "object") : [];
    const totalVendors = vendors.length;
    let vendorWeightedPoints = 0;
    
    // Core essential categories for celebration
    const essentialCategories = ["Venue", "Catering", "Photography", "Music", "Decor", "Site"];
    const unconfirmedEssential = [];

    vendors.forEach(v => {
      const isEssential = essentialCategories.some(cat => 
        (v.category || "").toLowerCase().includes(cat.toLowerCase())
      );

      if (v.status === "Booked" || v.status === "Completed") {
        vendorWeightedPoints += 1.0;
      } else if (v.status === "Shortlisted") {
        vendorWeightedPoints += 0.5;
        if (isEssential) unconfirmedEssential.push(v);
      } else {
        vendorWeightedPoints += 0.2;
        if (isEssential) unconfirmedEssential.push(v);
      }
    });

    const vendorScore = totalVendors > 0 
      ? Math.round((vendorWeightedPoints / totalVendors) * 30) 
      : 15; // default neutral if no vendors entered yet

    // 3. Budget Health (20 Points Max)
    const totalBudget = Math.max(1, EventUtils.numeric(event.budget));
    const budgetItems = Array.isArray(event.budgetItems) ? event.budgetItems.filter(item => item && typeof item === "object") : [];
    const totalAllocated = budgetItems.reduce((sum, item) => sum + EventUtils.numeric(item.allocated), 0);
    const totalActual = budgetItems.reduce((sum, item) => sum + EventUtils.numeric(item.actual), 0);
    const totalEstimated = budgetItems.reduce((sum, item) => sum + EventUtils.numeric(item.estimated), 0);

    const budgetUtilization = Math.round((totalActual / totalBudget) * 100);
    const plannedUtilization = Math.round((totalEstimated / totalBudget) * 100);

    let budgetScore = 20;
    // Over-budget penalties
    if (totalActual > totalBudget) {
      budgetScore = Math.max(4, 20 - Math.round(((totalActual - totalBudget) / totalBudget) * 40));
    } else if (totalEstimated > totalBudget * 1.1) {
      // Estimated exceeds budget by >10%
      budgetScore = 14;
    } else if (totalEstimated > totalBudget) {
      budgetScore = 17;
    }

    // 4. Timeline & Deadline Health (15 Points Max)
    const today = EventUtils.todayLocalDate();
    const overdueTasks = tasks.filter(t => t.status !== "completed" && t.deadline && t.deadline < today);
    const highPriorityOutstanding = tasks.filter(t => t.status !== "completed" && t.priority === "High");

    let timelineScore = 15;
    if (overdueTasks.length > 0) {
      timelineScore = Math.max(3, 15 - (overdueTasks.length * 3));
    }
    if (highPriorityOutstanding.length > 5) {
      timelineScore = Math.max(4, timelineScore - 3);
    }

    // Total Overall Score (0-100)
    const totalScore = Math.min(100, Math.max(0, taskScore + vendorScore + budgetScore + timelineScore));

    // Determine Status Grade & Color
    let grade = "On Track";
    let badgeClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
    let message = "Your celebration planning is well-coordinated and on track!";
    
    if (totalScore >= 85) {
      grade = "Peak Readiness";
      badgeClass = "text-emerald-800 bg-emerald-100/80 border-emerald-300";
      message = "Outstanding! Your event is primed for a flawless, stress-free celebration.";
    } else if (totalScore >= 70) {
      grade = "Solid Momentum";
      badgeClass = "text-amber-800 bg-amber-50 border-amber-300";
      message = "Strong progress. A few critical vendor locks and deadlines will ensure perfection.";
    } else if (totalScore >= 50) {
      grade = "Active Buildout";
      badgeClass = "text-amber-800 bg-amber-100 border-amber-400";
      message = "Good groundwork laid, but key high-priority vendors and tasks require attention.";
    } else {
      grade = "Early Planning";
      badgeClass = "text-rose-700 bg-rose-50 border-rose-300";
      message = "Action required: finalize your anchor venue and high-priority timeline milestones.";
    }

    // Generate 3 High-Impact Next Actions
    const nextActions = [];

    // Action A: Overdue tasks or high-priority uncompleted tasks
    if (overdueTasks.length > 0) {
      const taskTitle = overdueTasks[0].title || "Milestone task";
      nextActions.push({
        title: `Resolve ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? "s" : ""}`,
        subtitle: `"${taskTitle}" is past due`,
        impact: `+${Math.min(10, overdueTasks.length * 3)} pts`,
        tab: "timeline",
        type: "urgent"
      });
    } else if (highPriorityOutstanding.length > 0) {
      const topTask = highPriorityOutstanding[0];
      const taskTitle = topTask.title || "Milestone milestone";
      nextActions.push({
        title: `Complete high-priority task`,
        subtitle: `"${taskTitle}" assigned to ${topTask.owner || 'Host'}`,
        impact: "+5 pts",
        tab: "timeline",
        type: "priority"
      });
    }

    // Action B: Unconfirmed essential vendors
    const pendingVendors = vendors.filter(v => v.status !== "Booked" && v.status !== "Completed");
    if (pendingVendors.length > 0) {
      const topVendor = pendingVendors[0];
      nextActions.push({
        title: `Confirm booking for ${topVendor.name || topVendor.category}`,
        subtitle: `Status is currently '${topVendor.status}'`,
        impact: "+8 pts",
        tab: "vendors",
        type: "vendor"
      });
    }

    // Action C: Budget review or contingency check
    if (totalActual > totalBudget) {
      nextActions.push({
        title: `Trim expenses back to budget`,
        subtitle: `Current actuals exceed target by ${event.currencySymbol || '$'}${(totalActual - totalBudget).toLocaleString()}`,
        impact: "+10 pts",
        tab: "budget",
        type: "budget"
      });
    } else if (tasks.filter(t => t.status === "in-progress").length > 0) {
      const inProg = tasks.find(t => t.status === "in-progress");
      nextActions.push({
        title: `Finalize in-progress milestone`,
        subtitle: `Wrap up: "${inProg.title || 'Active task'}"`,
        impact: "+4 pts",
        tab: "timeline",
        type: "progress"
      });
    } else {
      nextActions.push({
        title: `Review Creative Idea Studio`,
        subtitle: `Select your preferred touchpoints and favors for guests`,
        impact: "+3 pts",
        tab: "ideas",
        type: "creative"
      });
    }

    // Ensure we always have 3 actions
    while (nextActions.length < 3) {
      nextActions.push({
        title: "Verify guest RSVPs & dietary needs",
        subtitle: "Check dietary accommodations for catering accuracy",
        impact: "+3 pts",
        tab: "guests",
        type: "guests"
      });
    }

    return {
      overallScore: totalScore,
      grade,
      badgeClass,
      message,
      breakdown: {
        taskScore: { current: taskScore, max: 35, percentage: Math.round(taskCompletionRate * 100) },
        vendorScore: { current: vendorScore, max: 30, bookedCount: vendors.filter(v => v.status === 'Booked' || v.status === 'Completed').length, total: totalVendors },
        budgetScore: { current: budgetScore, max: 20, utilization: budgetUtilization, plannedUtilization },
        timelineScore: { current: timelineScore, max: 15, overdueCount: overdueTasks.length, highPriorityCount: highPriorityOutstanding.length }
      },
      stats: {
        completedTasks,
        totalTasks,
        taskCompletionRate: Math.round(taskCompletionRate * 100),
        budgetUtilization,
        overdueTasksCount: overdueTasks.length,
        highPriorityOutstandingCount: highPriorityOutstanding.length,
        unconfirmedVendorsCount: pendingVendors.length
      },
      nextActions: nextActions.slice(0, 3)
    };
  },

  getDefaultScore() {
    return {
      overallScore: 65,
      grade: "Active Buildout",
      badgeClass: "text-amber-800 bg-amber-100 border-amber-300",
      message: "Ready to accelerate your event planning.",
      breakdown: {
        taskScore: { current: 20, max: 35, percentage: 57 },
        vendorScore: { current: 18, max: 30, bookedCount: 3, total: 6 },
        budgetScore: { current: 16, max: 20, utilization: 60, plannedUtilization: 95 },
        timelineScore: { current: 11, max: 15, overdueCount: 0, highPriorityCount: 2 }
      },
      stats: {
        completedTasks: 5,
        totalTasks: 12,
        taskCompletionRate: 42,
        budgetUtilization: 60,
        overdueTasksCount: 0,
        highPriorityOutstandingCount: 2,
        unconfirmedVendorsCount: 3
      },
      nextActions: [
        { title: "Select preferred event concept", subtitle: "Locks your visual theme and decor palette", impact: "+5 pts", tab: "plan", type: "concept" },
        { title: "Confirm anchor venue vendor", subtitle: "Secures your event date and capacity", impact: "+12 pts", tab: "vendors", type: "vendor" },
        { title: "Send formal invitations", subtitle: "Kickstarts RSVP collection and dietary checks", impact: "+6 pts", tab: "timeline", type: "timeline" }
      ]
    };
  }
};

if (typeof window !== "undefined") {
  window.ConfidenceEngine = ConfidenceEngine;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { ConfidenceEngine };
}
