/**
 * Festiva AI - Main Application Controller
 * Handles application state, reactive UI updates, wizard navigation,
 * dynamic chart rendering, and persistent storage.
 */

const App = {
  currentEvent: null,
  activeTab: "overview",
  currentView: "landing", // "landing" or "dashboard"
  timelineFilter: "all",
  ideaTier: "balanced",
  wizardStep: 1,
  budgetChartInstance: null,

  init() {
    // Remove the insecure API-key setting written by older client-side versions.
    try { localStorage.removeItem("festiva_gemini_api_key"); } catch (error) { /* storage may be disabled */ }
    const hasStoredEvent = this.loadStoredEvent();
    this.updateAiStatusPill();
    this.navigateTo(hasStoredEvent ? "dashboard" : "landing");
    if (window.lucide) lucide.createIcons();
  },

  // ================= STORAGE & STATE =================
  loadStoredEvent() {
    try {
      const stored = localStorage.getItem("festiva_current_event");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && parsed.name) {
          this.currentEvent = parsed;
          return true;
        }
      }
    } catch (error) {
      console.warn("Saved event data could not be read; loading the demo instead.");
    }
    this.currentEvent = JSON.parse(JSON.stringify(window.DEMO_EVENT));
    return false;
  },

  saveCurrentEvent() {
    if (!this.currentEvent) return;
    try {
      localStorage.setItem("festiva_current_event", JSON.stringify(this.currentEvent));
    } catch (error) {
      console.warn("Local event save failed (storage may be unavailable or full).");
      this.showToast("Changes are active for this session but could not be saved in this browser.", "warning");
    }
    this.renderActiveTab();
    this.renderBanner();
  },

  loadDemoEvent() {
    this.currentEvent = JSON.parse(JSON.stringify(window.DEMO_EVENT));
    this.saveCurrentEvent();
    this.navigateTo("dashboard");
    this.showToast("Loaded Sophia & Liam's Tuscan Vineyard Wedding Demo!", "info");
    this.triggerConfetti();
  },

  // ================= NAVIGATION & VIEWS =================
  navigateTo(viewName) {
    this.currentView = viewName;
    const landing = document.getElementById("landingView");
    const dashboard = document.getElementById("dashboardView");
    const navLinks = document.getElementById("topNavDashboardLinks");

    if (viewName === "landing") {
      landing.classList.remove("hidden");
      dashboard.classList.add("hidden");
      navLinks.classList.add("hidden");
    } else {
      landing.classList.add("hidden");
      dashboard.classList.remove("hidden");
      navLinks.classList.remove("hidden");
      this.renderBanner();
      this.switchTab(this.activeTab);
    }
    if (window.lucide) lucide.createIcons();
  },

  switchTab(tabName) {
    this.activeTab = tabName;

    // Update Tab Navigation Active Styles
    document.querySelectorAll(".tab-btn").forEach(btn => {
      if (btn.getAttribute("data-tab") === tabName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Hide all tab panes
    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.add("hidden");
    });

    // Show target pane
    const targetPane = document.getElementById(`tabContent-${tabName}`);
    if (targetPane) {
      targetPane.classList.remove("hidden");
    }

    this.renderActiveTab();
    if (window.lucide) lucide.createIcons();
  },

  renderActiveTab() {
    if (!this.currentEvent) return;

    if (this.activeTab === "overview") {
      this.renderOverviewTab();
    } else if (this.activeTab === "plan") {
      this.renderConceptsTab();
    } else if (this.activeTab === "budget") {
      this.renderBudgetTab();
    } else if (this.activeTab === "timeline") {
      this.renderTimelineTab();
    } else if (this.activeTab === "vendors") {
      this.renderVendorsTab();
    } else if (this.activeTab === "ideas") {
      this.renderIdeasTab();
    } else if (this.activeTab === "guests") {
      this.renderGuestsTab();
    }
  },

  // ================= BANNER & COUNTDOWN =================
  renderBanner() {
    const e = this.currentEvent;
    if (!e) return;

    document.getElementById("bannerEventName").textContent = e.name || "Celebration Plan";
    document.getElementById("bannerEventTypeBadge").textContent = e.type || "Event";
    document.getElementById("bannerEventStyle").textContent = e.style || "Refined";
    document.getElementById("bannerEventDate").textContent = this.formatDateReadable(e.date);
    document.getElementById("bannerEventLocation").textContent = e.location || "Private Venue";
    document.getElementById("bannerGuestCount").textContent = `${e.guests} Guests`;
    document.getElementById("bannerBudgetTotal").textContent = `${e.currencySymbol || '$'}${Number(e.budget).toLocaleString()} Budget`;

    const demoBadge = document.getElementById("bannerDemoBadge");
    if (e.id && e.id.includes("demo")) {
      demoBadge.classList.remove("hidden");
    } else {
      demoBadge.classList.add("hidden");
    }

    // Count calendar days in the user's local timezone (not 24-hour periods).
    const days = this.calculateDaysRemaining(e.date);
    const countdownEl = document.getElementById("countdownNumber");
    const countdownLabel = document.getElementById("countdownLabel");
    if (days === null) {
      countdownEl.textContent = "—";
      if (countdownLabel) countdownLabel.textContent = "Set a valid event date";
    } else if (days > 0) {
      countdownEl.textContent = String(days);
      if (countdownLabel) countdownLabel.textContent = "Days to Celebrate";
    } else if (days === 0) {
      countdownEl.textContent = "Today";
      if (countdownLabel) countdownLabel.textContent = "Event Day";
    } else {
      countdownEl.textContent = String(Math.abs(days));
      if (countdownLabel) countdownLabel.textContent = "Days Since Event";
    }
  },

  // ================= TAB 1: OVERVIEW & CONFIDENCE SCORE =================
  renderOverviewTab() {
    const scoreData = ConfidenceEngine.calculate(this.currentEvent);

    // 1. Radial Gauge
    const scoreNum = document.getElementById("scoreDisplayNumber");
    scoreNum.textContent = scoreData.overallScore;

    const gaugeCircle = document.getElementById("scoreGaugeCircle");
    const circumference = 2 * Math.PI * 42; // ~263.89
    const offset = circumference - (scoreData.overallScore / 100) * circumference;
    gaugeCircle.style.strokeDashoffset = offset;

    // Change circle stroke color based on score
    if (scoreData.overallScore >= 85) {
      gaugeCircle.setAttribute("stroke", "var(--sage-accent)");
    } else if (scoreData.overallScore >= 60) {
      gaugeCircle.setAttribute("stroke", "var(--gold-primary)");
    } else {
      gaugeCircle.setAttribute("stroke", "var(--coral-accent)");
    }

    // 2. Score Badge & Message
    const gradeBadge = document.getElementById("scoreGradeBadge");
    gradeBadge.textContent = scoreData.grade;
    gradeBadge.className = `festiva-badge ${scoreData.badgeClass}`;
    document.getElementById("scoreMessage").textContent = scoreData.message;

    // 3. Breakdown Bars
    document.getElementById("statTasksScore").textContent = `${scoreData.breakdown.taskScore.current} / 35`;
    document.getElementById("barTasksScore").style.width = `${scoreData.breakdown.taskScore.percentage}%`;

    document.getElementById("statVendorsScore").textContent = `${scoreData.breakdown.vendorScore.current} / 30`;
    document.getElementById("barVendorsScore").style.width = `${Math.round((scoreData.breakdown.vendorScore.current / 30) * 100)}%`;

    document.getElementById("statBudgetScore").textContent = `${scoreData.breakdown.budgetScore.current} / 20`;
    document.getElementById("barBudgetScore").style.width = `${Math.round((scoreData.breakdown.budgetScore.current / 20) * 100)}%`;

    document.getElementById("statTimelineScore").textContent = `${scoreData.breakdown.timelineScore.current} / 15`;
    document.getElementById("barTimelineScore").style.width = `${Math.round((scoreData.breakdown.timelineScore.current / 15) * 100)}%`;

    // 4. Recommended Next Actions
    const actionsBox = document.getElementById("nextActionsContainer");
    actionsBox.innerHTML = "";

    scoreData.nextActions.forEach(action => {
      const card = document.createElement("div");
      card.className = "p-3.5 rounded-xl bg-ivory-50 border border-ivory-200 flex items-center justify-between hover:border-coral-400 transition-colors cursor-pointer";
      card.onclick = () => App.switchTab(action.tab);

      card.innerHTML = `
        <div class="space-y-0.5 pr-2">
          <div class="font-bold text-xs text-ink-900">${this.escapeHtml(action.title)}</div>
          <div class="text-[11px] text-ink-500 line-clamp-1">${this.escapeHtml(action.subtitle)}</div>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">${this.escapeHtml(action.impact)}</span>
          <i data-lucide="chevron-right" class="w-4 h-4 text-ink-500"></i>
        </div>
      `;
      actionsBox.appendChild(card);
    });

    // 5. Quick Widgets
    this.renderQuickWidgets();
  },

  renderQuickWidgets() {
    const e = this.currentEvent;
    const symbol = e.currencySymbol || "$";

    // Financial Pulse
    const totalBudget = Number(e.budget) || 0;
    const actualSpent = (e.budgetItems || []).reduce((sum, item) => sum + (Number(item.actual) || 0), 0);
    const remaining = totalBudget - actualSpent;
    const ratio = totalBudget > 0 ? Math.min(100, Math.round((actualSpent / totalBudget) * 100)) : 0;

    document.getElementById("quickTotalBudget").textContent = `${symbol}${totalBudget.toLocaleString()}`;
    document.getElementById("quickActualSpent").textContent = `${symbol}${actualSpent.toLocaleString()}`;
    
    const remEl = document.getElementById("quickRemainingBalance");
    remEl.textContent = `${symbol}${remaining.toLocaleString()}`;
    if (remaining < 0) {
      remEl.className = "font-bold text-rose-600";
    } else {
      remEl.className = "font-bold text-sage-accent";
    }

    document.getElementById("quickBudgetBar").style.width = `${ratio}%`;
    document.getElementById("quickBudgetStatusText").textContent = `${ratio}% utilized across ${(e.budgetItems || []).length} categories.`;

    // Active Concept
    const activeConcept = (e.concepts || []).find(c => c.id === e.activeConceptId) || (e.concepts || [])[0];
    if (activeConcept) {
      document.getElementById("quickConceptName").textContent = activeConcept.name;
      document.getElementById("quickConceptTagline").textContent = `"${activeConcept.tagline}"`;
      document.getElementById("quickConceptDecor").textContent = activeConcept.decorStyle;

      const swatchBox = document.getElementById("quickConceptSwatches");
      swatchBox.innerHTML = "";
      (activeConcept.colorPalette || []).forEach((hex, i) => {
        const span = document.createElement("span");
        span.className = "swatch-chip";
        span.style.backgroundColor = EventUtils.safeColor(hex);
        span.title = String((activeConcept.paletteNames && activeConcept.paletteNames[i]) || hex);
        swatchBox.appendChild(span);
      });
    }

    // Immediate Milestones
    const tasksBox = document.getElementById("quickUpcomingTasks");
    tasksBox.innerHTML = "";
    const pendingTasks = (e.tasks || []).filter(t => t.status !== "completed").slice(0, 3);

    if (pendingTasks.length === 0) {
      tasksBox.innerHTML = `<div class="text-xs text-sage-accent font-semibold p-2 bg-sage-soft rounded-lg">🎉 All scheduled tasks are completed!</div>`;
    } else {
      pendingTasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "flex items-center justify-between text-xs p-2 rounded-lg bg-ivory-50 border border-ivory-200";
        item.innerHTML = `
          <div class="flex items-center gap-2 truncate pr-2">
            <span class="w-1.5 h-1.5 rounded-full ${task.priority === 'High' ? 'bg-rose-500' : 'bg-gold-500'}"></span>
            <span class="truncate font-medium text-ink-900">${this.escapeHtml(task.title)}</span>
          </div>
          <span class="text-[11px] font-semibold text-ink-500 flex-shrink-0">${this.escapeHtml(task.deadline)}</span>
        `;
        tasksBox.appendChild(item);
      });
    }
  },

  // ================= TAB 2: MY EVENT PLAN & CONCEPTS =================
  renderConceptsTab() {
    const e = this.currentEvent;
    const grid = document.getElementById("conceptsCardsGrid");
    grid.innerHTML = "";

    (e.concepts || []).forEach(concept => {
      const isActive = concept.id === e.activeConceptId;
      const card = document.createElement("div");
      card.className = `festiva-card p-6 bg-white flex flex-col justify-between transition-all ${
        isActive ? "ring-2 ring-coral-500 border-transparent shadow-lg" : "border-ivory-200"
      }`;

      // Swatches HTML
      let swatchesHtml = "";
      (concept.colorPalette || []).forEach((hex, i) => {
        const name = (concept.paletteNames && concept.paletteNames[i]) || hex;
        const color = EventUtils.safeColor(hex);
        swatchesHtml += `<span class="swatch-chip" style="background-color: ${color};" title="${this.escapeHtml(name)}"></span>`;
      });

      card.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-serif-editorial font-bold text-xl text-ink-900">${this.escapeHtml(concept.name)}</h4>
              </div>
              <p class="text-xs text-coral-600 font-medium italic mt-0.5">"${this.escapeHtml(concept.tagline)}"</p>
            </div>
            ${concept.isRecommended ? `<span class="festiva-badge text-gold-700 bg-gold-light border-gold-300">Recommended</span>` : ""}
            ${isActive ? `<span class="festiva-badge text-coral-600 bg-coral-soft border-coral-200">Active</span>` : ""}
          </div>

          <p class="text-xs text-ink-700 leading-relaxed">${this.escapeHtml(concept.description)}</p>

          <div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-ink-500 block mb-1.5">Color Palette</span>
            <div class="flex items-center gap-1.5">${swatchesHtml}</div>
          </div>

          <div class="space-y-2 text-xs border-t border-ivory-200 pt-3">
            <div>
              <span class="font-bold text-ink-900">Decor & Florals:</span>
              <p class="text-ink-600 mt-0.5">${this.escapeHtml(concept.decorStyle)}</p>
            </div>
            <div>
              <span class="font-bold text-ink-900">Lighting & Mood:</span>
              <p class="text-ink-600 mt-0.5">${this.escapeHtml(concept.lighting)}</p>
            </div>
            <div>
              <span class="font-bold text-ink-900">Dining & Refreshments:</span>
              <p class="text-ink-600 mt-0.5">${this.escapeHtml(concept.foodAndDrink)}</p>
            </div>
            <div>
              <span class="font-bold text-ink-900">Signature Guest Experience:</span>
              <p class="text-ink-600 mt-0.5">${this.escapeHtml(concept.guestExperience)}</p>
            </div>
          </div>
        </div>

        <div class="pt-5 mt-4 border-t border-ivory-200">
          <button onclick="App.setActiveConcept(decodeURIComponent('${this.inlineArg(concept.id)}'))" class="w-full ${
            isActive ? 'btn-secondary text-coral-600 border-coral-300' : 'btn-primary'
          } text-xs py-2.5">
            ${isActive ? '✓ Active Theme Selected' : 'Choose This Concept'}
          </button>
        </div>
      `;
      grid.appendChild(card);
    });

    // Populate Parameters
    document.getElementById("paramVenue").textContent = e.venuePreference || "Flexible";
    document.getElementById("paramCatering").textContent = e.cateringPreference || "Buffet";
    document.getElementById("paramDietary").textContent = e.dietaryRestrictions || "None specified";
    document.getElementById("paramPriorities").textContent = e.planningPriorities || "Experience";
  },

  setActiveConcept(conceptId) {
    if (!this.currentEvent) return;
    this.currentEvent.activeConceptId = conceptId;
    const c = (this.currentEvent.concepts || []).find(item => item.id === conceptId);
    if (c) {
      this.currentEvent.colorPalette = c.colorPalette;
      this.currentEvent.paletteNames = c.paletteNames;
      this.showToast(`Active concept set to: "${c.name}"`, "success");
    }
    this.saveCurrentEvent();
    this.renderConceptsTab();
  },

  async regenerateConcepts() {
    this.showToast("Synthesizing 3 fresh tailored event concepts...", "info");
    const newConcepts = AIEngine.generateTailoredConcepts(
      this.currentEvent.type,
      this.currentEvent.style,
      this.currentEvent.planningPriorities,
      this.currentEvent.location
    );
    this.currentEvent.concepts = newConcepts;
    this.currentEvent.activeConceptId = newConcepts[0].id;
    this.saveCurrentEvent();
    this.renderConceptsTab();
    if (window.lucide) lucide.createIcons();
  },

  // ================= TAB 3: INTELLIGENT BUDGET PLANNER =================
  renderBudgetTab() {
    const e = this.currentEvent;
    const symbol = e.currencySymbol || "$";
    const items = Array.isArray(e.budgetItems) ? e.budgetItems : [];
    const metrics = EventUtils.budgetMetrics(e.budget, items);
    const { cap: totalBudget, allocated: totalAllocated, estimated: totalEstimated, actual: totalActual, remaining } = metrics;

    document.getElementById("budgetStatTotal").textContent = `${symbol}${totalBudget.toLocaleString()}`;
    document.getElementById("budgetStatAllocated").textContent = `${symbol}${totalAllocated.toLocaleString()}`;
    document.getElementById("budgetStatActual").textContent = `${symbol}${totalActual.toLocaleString()}`;
    const percentage = value => totalBudget > 0 ? Math.round((value / totalBudget) * 100) : 0;
    const allocatedRatio = document.getElementById("budgetAllocatedRatio");
    const actualRatio = document.getElementById("budgetActualRatio");
    if (allocatedRatio) allocatedRatio.textContent = `${percentage(totalAllocated)}% of budget allocated`;
    if (actualRatio) actualRatio.textContent = `${percentage(totalActual)}% of budget recorded`;

    const remEl = document.getElementById("budgetStatRemaining");
    remEl.textContent = remaining < 0 ? `-${symbol}${Math.abs(remaining).toLocaleString()}` : `${symbol}${remaining.toLocaleString()}`;
    const warnBanner = document.getElementById("budgetWarningBanner");
    const warningMessage = document.getElementById("budgetWarningMessage");
    let budgetAlert = "";
    if (metrics.actualOverCap) budgetAlert = "Recorded spending exceeds the total budget cap.";
    else if (metrics.estimateOverCap) budgetAlert = "Estimated spending exceeds the total budget cap.";
    else if (metrics.allocationOverCap) budgetAlert = "Category allocations exceed the total budget cap.";
    warnBanner.classList.toggle("hidden", !budgetAlert);
    if (warningMessage) warningMessage.textContent = budgetAlert;

    const remainingSub = document.getElementById("budgetRemainingSub");
    if (metrics.actualOverCap) {
      remEl.className = "text-2xl font-serif-editorial font-bold text-rose-600";
      remainingSub.textContent = "Actual spend over cap";
      remainingSub.className = "text-xs text-rose-600 font-semibold";
    } else if (metrics.estimateOverCap) {
      remEl.className = "text-2xl font-serif-editorial font-bold text-rose-600";
      remainingSub.textContent = "Estimate exceeds cap";
      remainingSub.className = "text-xs text-rose-600 font-semibold";
    } else if (metrics.allocationOverCap) {
      remEl.className = "text-2xl font-serif-editorial font-bold text-rose-600";
      remainingSub.textContent = "Allocations exceed cap";
      remainingSub.className = "text-xs text-rose-600 font-semibold";
    } else {
      remEl.className = "text-2xl font-serif-editorial font-bold text-sage-accent";
      remainingSub.textContent = metrics.allocationAtCap ? "Fully allocated; balance vs actual spend" : "Available vs actual spend";
      remainingSub.className = "text-xs text-sage-accent font-semibold";
    }

    // Render Table
    const tbody = document.getElementById("budgetItemTableBody");
    tbody.innerHTML = "";

    items.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-ivory-50/80 transition-colors";

      const isOver = EventUtils.numeric(item.actual) > EventUtils.numeric(item.allocated);

      tr.innerHTML = `
        <td class="py-3 px-4 font-semibold text-ink-900">${this.escapeHtml(item.category)}</td>
        <td class="py-3 px-4 text-xs text-ink-600">${this.escapeHtml(item.vendor || 'TBD')}</td>
        <td class="py-3 px-4 text-right font-medium cursor-pointer hover:text-coral-500" onclick="App.editBudgetItemAllocated(decodeURIComponent('${this.inlineArg(item.id)}'))" title="Click to edit allocation">
          ${this.escapeHtml(symbol)}${EventUtils.numeric(item.allocated).toLocaleString()}
        </td>
        <td class="py-3 px-4 text-right text-ink-600">${this.escapeHtml(symbol)}${EventUtils.numeric(item.estimated).toLocaleString()}</td>
        <td class="py-3 px-4 text-right font-bold cursor-pointer hover:text-coral-500 ${isOver ? 'text-rose-600' : 'text-ink-900'}" onclick="App.editBudgetItemActual(decodeURIComponent('${this.inlineArg(item.id)}'))" title="Click to edit actual spent">
          ${this.escapeHtml(symbol)}${EventUtils.numeric(item.actual).toLocaleString()} ${isOver ? '⚠️' : ''}
        </td>
        <td class="py-3 px-4 text-center">
          <span class="festiva-badge ${item.status === 'booked' || item.status === 'completed' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-amber-700 bg-amber-50 border-amber-200'}">
            ${this.escapeHtml(item.status || 'Pending')}
          </span>
        </td>
        <td class="py-3 px-4 text-center">
          <button aria-label="Delete budget category ${this.escapeHtml(item.category)}" onclick="App.deleteBudgetItem(decodeURIComponent('${this.inlineArg(item.id)}'))" class="text-ink-400 hover:text-rose-600 p-1" title="Delete Category">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Render Chart
    this.renderBudgetChart(items);
  },

  renderBudgetChart(items) {
    const canvas = document.getElementById("budgetDistributionChart");
    if (!canvas) return;

    if (this.budgetChartInstance) {
      this.budgetChartInstance.destroy();
    }

    const labels = items.map(i => i.category);
    const data = items.map(i => i.allocated);
    const colors = [
      "#E06A55", "#C5A059", "#4A7C59", "#2A1B3D", "#88A096", 
      "#D48C70", "#4A2E35", "#3A0CA3", "#D97706", "#64748B"
    ];

    this.budgetChartInstance = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          borderColor: "#FFFFFF"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 12,
              font: { size: 11, family: "'Plus Jakarta Sans', sans-serif" },
              color: "#4A3E56"
            }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw || 0;
                const sym = App.currentEvent?.currencySymbol || "$";
                return ` ${ctx.label}: ${sym}${val.toLocaleString()}`;
              }
            }
          }
        },
        cutout: "68%"
      }
    });
  },

  editBudgetItemAllocated(id) {
    const item = (this.currentEvent.budgetItems || []).find(i => i.id === id);
    if (!item) return;
    const newVal = prompt(`Update allocated budget for "${item.category}":`, item.allocated);
    if (newVal !== null && newVal.trim() !== '' && Number.isFinite(Number(newVal)) && Number(newVal) >= 0) {
      item.allocated = EventUtils.numeric(newVal);
      this.saveCurrentEvent();
      this.showToast(`Updated allocation for ${item.category}`, "success");
    }
  },

  editBudgetItemActual(id) {
    const item = (this.currentEvent.budgetItems || []).find(i => i.id === id);
    if (!item) return;
    const newVal = prompt(`Update actual spending for "${item.category}":`, item.actual);
    if (newVal !== null && newVal.trim() !== '' && Number.isFinite(Number(newVal)) && Number(newVal) >= 0) {
      item.actual = EventUtils.numeric(newVal);
      if (item.actual > 0) item.status = "booked";
      this.saveCurrentEvent();
      this.showToast(`Updated actual spending for ${item.category}`, "success");
    }
  },

  deleteBudgetItem(id) {
    if (!confirm("Remove this budget item?")) return;
    this.currentEvent.budgetItems = (this.currentEvent.budgetItems || []).filter(i => i.id !== id);
    this.saveCurrentEvent();
    this.showToast("Budget category removed", "info");
  },

  openAddBudgetItemModal() {
    document.getElementById("addBudgetItemModal").classList.remove("hidden");
  },
  closeAddBudgetItemModal() {
    document.getElementById("addBudgetItemModal").classList.add("hidden");
  },

  saveNewBudgetItem() {
    const cat = document.getElementById("newBudgetCategory").value.trim();
    const alloc = EventUtils.numeric(document.getElementById("newBudgetAllocated").value);
    const actual = EventUtils.numeric(document.getElementById("newBudgetActual").value);
    const notes = document.getElementById("newBudgetNotes").value.trim();

    if (!cat) {
      alert("Please provide a category name.");
      return;
    }

    const newItem = {
      id: "b-" + Date.now(),
      category: cat,
      allocated: alloc,
      estimated: alloc,
      actual: actual,
      status: actual > 0 ? "booked" : "pending",
      vendor: "Target Specialist",
      notes: notes
    };

    if (!this.currentEvent.budgetItems) this.currentEvent.budgetItems = [];
    this.currentEvent.budgetItems.push(newItem);
    this.saveCurrentEvent();
    this.closeAddBudgetItemModal();
    this.showToast(`Added ${cat} to budget plan`, "success");
  },

  // ================= TAB 4: PERSONALIZED EXECUTION TIMELINE =================
  renderTimelineTab() {
    const e = this.currentEvent;
    const container = document.getElementById("timelineTasksContainer");
    container.innerHTML = "";

    const tasks = e.tasks || [];
    const completedCount = tasks.filter(t => t.status === "completed").length;
    document.getElementById("timelineCompletedCounter").textContent = `${completedCount} of ${tasks.length} completed`;

    const today = EventUtils.todayLocalDate();

    const filtered = tasks.filter(task => {
      if (this.timelineFilter === "all") return true;
      if (this.timelineFilter === "High") return task.priority === "High";
      return task.status === this.timelineFilter;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-ink-500 festiva-card bg-white">No tasks match this filter.</div>`;
      return;
    }

    filtered.forEach(task => {
      const isCompleted = task.status === "completed";
      const isOverdue = !isCompleted && task.deadline && task.deadline < today;
      
      const item = document.createElement("div");
      item.className = `festiva-card p-4 bg-white flex items-center justify-between gap-4 transition-all ${
        isCompleted ? "opacity-75 bg-ivory-50" : ""
      }`;

      item.innerHTML = `
        <div class="flex items-center gap-3.5 flex-grow">
          <input type="checkbox" class="custom-checkbox flex-shrink-0" aria-label="Mark ${this.escapeHtml(task.title)} completed" ${isCompleted ? 'checked' : ''} onchange="App.toggleTaskCompletion(decodeURIComponent('${this.inlineArg(task.id)}'))" />
          
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="font-bold text-sm text-ink-900 ${isCompleted ? 'line-through text-ink-500' : ''}">${this.escapeHtml(task.title)}</span>
              <span class="festiva-badge ${task.priority === 'High' ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-ink-600 bg-ivory-100'}">${this.escapeHtml(task.priority)} Priority</span>
              ${isOverdue ? `<span class="festiva-badge text-rose-800 bg-rose-100 border-rose-300">Overdue</span>` : ''}
            </div>

            <div class="flex flex-wrap items-center gap-3 text-xs text-ink-500">
              <span>Category: <strong class="text-ink-700">${this.escapeHtml(task.category)}</strong></span>
              <span>Owner: <strong class="text-ink-700">${this.escapeHtml(task.owner || 'Host')}</strong></span>
              ${task.notes ? `<span class="italic text-ink-400">"${this.escapeHtml(task.notes)}"</span>` : ''}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 flex-shrink-0">
          <div class="text-right">
            <span class="text-xs font-semibold ${isOverdue ? 'text-rose-600 font-bold' : 'text-ink-600'}">${this.escapeHtml(task.deadline)}</span>
          </div>

          <button aria-label="Delete task ${this.escapeHtml(task.title)}" onclick="App.deleteTask(decodeURIComponent('${this.inlineArg(task.id)}'))" class="text-ink-400 hover:text-rose-600 p-1" title="Delete Task">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      `;
      container.appendChild(item);
    });

    if (window.lucide) lucide.createIcons();
  },

  toggleTaskCompletion(taskId) {
    const task = (this.currentEvent.tasks || []).find(t => t.id === taskId);
    if (!task) return;

    if (task.status === "completed") {
      task.status = "pending";
    } else {
      task.status = "completed";
      this.triggerConfetti();
    }
    this.saveCurrentEvent();
    this.renderTimelineTab();
  },

  filterTimeline(filter) {
    this.timelineFilter = filter;
    document.querySelectorAll(".timeline-filter-btn").forEach(btn => {
      if (btn.getAttribute("data-filter") === filter) {
        btn.className = "timeline-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-ivory-200 text-ink-900";
      } else {
        btn.className = "timeline-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold text-ink-600 hover:bg-ivory-100";
      }
    });
    this.renderTimelineTab();
  },

  deleteTask(taskId) {
    if (!confirm("Delete this milestone task?")) return;
    this.currentEvent.tasks = (this.currentEvent.tasks || []).filter(t => t.id !== taskId);
    this.saveCurrentEvent();
    this.showToast("Task removed", "info");
  },

  openAddTaskModal() {
    document.getElementById("addTaskModal").classList.remove("hidden");
  },
  closeAddTaskModal() {
    document.getElementById("addTaskModal").classList.add("hidden");
  },

  saveNewTask() {
    const title = document.getElementById("newTaskTitle").value.trim();
    const category = document.getElementById("newTaskCategory").value.trim() || "Milestone";
    const deadline = document.getElementById("newTaskDeadline").value || this.currentEvent.date;
    const priority = document.getElementById("newTaskPriority").value;
    const owner = document.getElementById("newTaskOwner").value.trim() || "Host";
    const notes = document.getElementById("newTaskNotes").value.trim();

    if (!title) {
      alert("Please enter a task title.");
      return;
    }

    const newTask = {
      id: "t-" + Date.now(),
      title,
      category,
      deadline,
      status: "pending",
      priority,
      owner,
      notes
    };

    if (!this.currentEvent.tasks) this.currentEvent.tasks = [];
    this.currentEvent.tasks.push(newTask);
    this.saveCurrentEvent();
    this.closeAddTaskModal();
    this.showToast("New milestone task created!", "success");
  },

  // ================= TAB 5: SMART VENDOR CHECKLIST =================
  renderVendorsTab() {
    const e = this.currentEvent;
    const symbol = e.currencySymbol || "$";
    const vendors = e.vendors || [];

    // Financial summaries
    const totalContracted = vendors.reduce((sum, v) => sum + (EventUtils.numeric(v.actualCost || v.estimatedCost)), 0);
    const totalDeposits = vendors.reduce((sum, v) => sum + EventUtils.numeric(v.depositPaid), 0);
    const totalBalance = vendors.reduce((sum, v) => sum + EventUtils.numeric(v.balanceDue), 0);
    const bookedCount = vendors.filter(v => v.status === "Booked" || v.status === "Completed").length;

    document.getElementById("vendorStatContracted").textContent = `${symbol}${totalContracted.toLocaleString()}`;
    document.getElementById("vendorStatDeposits").textContent = `${symbol}${totalDeposits.toLocaleString()}`;
    document.getElementById("vendorStatBalance").textContent = `${symbol}${totalBalance.toLocaleString()}`;
    document.getElementById("vendorStatCoverage").textContent = `${bookedCount} / ${vendors.length} Confirmed`;

    const grid = document.getElementById("vendorsGridContainer");
    grid.innerHTML = "";

    vendors.forEach(v => {
      const card = document.createElement("div");
      card.className = "festiva-card p-6 bg-white space-y-4 border border-ivory-200 flex flex-col justify-between";

      card.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="text-[11px] font-bold uppercase tracking-wider text-coral-600 block">${this.escapeHtml(v.category)}</span>
              <h4 class="font-serif-editorial font-bold text-lg text-ink-900">${this.escapeHtml(v.name)}</h4>
            </div>

            <!-- Status selector -->
            <select onchange="App.updateVendorStatus(decodeURIComponent('${this.inlineArg(v.id)}'), this.value)" class="text-xs font-semibold rounded-lg px-2 py-1 border border-ivory-200 bg-ivory-50 text-ink-900 focus:outline-none">
              <option value="Inquiry" ${v.status === 'Inquiry' ? 'selected' : ''}>Inquiry</option>
              <option value="Shortlisted" ${v.status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
              <option value="Booked" ${v.status === 'Booked' ? 'selected' : ''}>Booked</option>
              <option value="Completed" ${v.status === 'Completed' ? 'selected' : ''}>Completed</option>
            </select>
          </div>

          <p class="text-xs text-ink-600 leading-relaxed">${this.escapeHtml(v.service)}</p>

          <!-- Numbers -->
          <div class="grid grid-cols-3 gap-2 p-3 rounded-xl bg-ivory-50 border border-ivory-200 text-xs">
            <div>
              <span class="text-ink-500 block text-[10px] uppercase font-bold">Cost</span>
              <span class="font-bold text-ink-900">${this.escapeHtml(symbol)}${EventUtils.numeric(v.actualCost || v.estimatedCost).toLocaleString()}</span>
            </div>
            <div>
              <span class="text-ink-500 block text-[10px] uppercase font-bold">Deposit</span>
              <span class="font-bold text-emerald-700">${this.escapeHtml(symbol)}${EventUtils.numeric(v.depositPaid).toLocaleString()}</span>
            </div>
            <div>
              <span class="text-ink-500 block text-[10px] uppercase font-bold">Balance</span>
              <span class="font-bold text-coral-600">${this.escapeHtml(symbol)}${EventUtils.numeric(v.balanceDue).toLocaleString()}</span>
            </div>
          </div>

          <!-- Contact & Notes -->
          <div class="text-xs text-ink-500 space-y-1 pt-1">
            ${v.contactPerson ? `<div>Contact: <strong class="text-ink-800">${this.escapeHtml(v.contactPerson)}</strong> ${v.contactPhone ? `(${this.escapeHtml(v.contactPhone)})` : ''}</div>` : ''}
            ${v.notes ? `<div class="italic text-[11px] text-ink-600 line-clamp-2">"${this.escapeHtml(v.notes)}"</div>` : ''}
          </div>
        </div>

        <div class="pt-4 border-t border-ivory-200 flex items-center justify-between">
          <span class="festiva-badge ${v.isVerified ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-ink-500 bg-ivory-100'}">
            ${v.isVerified ? 'Verified by You' : 'Not Independently Verified'}
          </span>

          <div class="flex items-center gap-2">
            <button aria-label="${v.isVerified ? 'Remove verification mark for' : 'Mark as checked'} ${this.escapeHtml(v.name)}" onclick="App.toggleVendorVerification(decodeURIComponent('${this.inlineArg(v.id)}'))" class="text-xs font-semibold px-2 py-1 rounded-lg border border-ivory-200 hover:bg-ivory-50" title="Mark verified only after independently checking the vendor">${v.isVerified ? 'Undo check' : 'Mark checked'}</button>
            <button aria-label="Delete vendor ${this.escapeHtml(v.name)}" onclick="App.deleteVendor(decodeURIComponent('${this.inlineArg(v.id)}'))" class="text-ink-400 hover:text-rose-600 p-1" title="Delete Vendor">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  },

  updateVendorStatus(vendorId, newStatus) {
    const v = (this.currentEvent.vendors || []).find(item => item.id === vendorId);
    if (!v) return;
    if (!["Inquiry", "Shortlisted", "Booked", "Completed"].includes(newStatus)) return;
    v.status = newStatus;
    this.saveCurrentEvent();
    this.showToast(`Updated status for ${v.name} to ${newStatus}`, "success");
  },

  toggleVendorVerification(vendorId) {
    const vendor = (this.currentEvent.vendors || []).find(item => item.id === vendorId);
    if (!vendor) return;
    if (!vendor.isVerified && !confirm("Only mark this vendor checked after independently verifying their identity, contact details, credentials, and availability. Have you checked these details?")) return;
    vendor.isVerified = !vendor.isVerified;
    this.saveCurrentEvent();
    this.showToast(vendor.isVerified ? `Marked ${vendor.name} as checked by you` : `Removed your check mark for ${vendor.name}`, "info");
  },

  deleteVendor(vendorId) {
    if (!confirm("Remove this vendor entry?")) return;
    this.currentEvent.vendors = (this.currentEvent.vendors || []).filter(v => v.id !== vendorId);
    this.saveCurrentEvent();
    this.showToast("Vendor removed", "info");
  },

  openAddVendorModal() {
    document.getElementById("addVendorModal").classList.remove("hidden");
  },
  closeAddVendorModal() {
    document.getElementById("addVendorModal").classList.add("hidden");
  },

  saveNewVendor() {
    const name = document.getElementById("newVendorName").value.trim();
    const category = document.getElementById("newVendorCategory").value.trim() || "Service";
    const status = document.getElementById("newVendorStatus").value;
    const cost = EventUtils.numeric(document.getElementById("newVendorActualCost").value);
    const deposit = Math.min(cost, EventUtils.numeric(document.getElementById("newVendorDepositPaid").value));
    const contact = document.getElementById("newVendorContactPerson").value.trim();
    const info = document.getElementById("newVendorContactInfo").value.trim();
    const notes = document.getElementById("newVendorNotes").value.trim();

    if (!name) {
      alert("Please provide vendor name.");
      return;
    }

    const newVendor = {
      id: "v-" + Date.now(),
      name,
      category,
      service: notes || "Full service package",
      estimatedCost: cost,
      actualCost: cost,
      depositPaid: deposit,
      balanceDue: Math.max(0, cost - deposit),
      status,
      contactPerson: contact,
      contactPhone: info,
      contactEmail: "",
      isVerified: false,
      notes
    };

    if (!this.currentEvent.vendors) this.currentEvent.vendors = [];
    this.currentEvent.vendors.push(newVendor);
    this.saveCurrentEvent();
    this.closeAddVendorModal();
    this.showToast("Vendor added to your celebration roster!", "success");
  },

  // ================= TAB 6: CREATIVE IDEA STUDIO =================
  renderIdeasTab() {
    const e = this.currentEvent;
    const grid = document.getElementById("ideasContainer");
    grid.innerHTML = "";

    const ideas = e.ideas || [];

    ideas.forEach(idea => {
      const card = document.createElement("div");
      card.className = "festiva-card p-6 bg-white space-y-4 border border-ivory-200 flex flex-col justify-between";

      // Selected tier text
      let tierContent = "";
      if (idea.tiers) {
        if (this.ideaTier === "affordable") {
          tierContent = `<div class="p-3 rounded-xl bg-ivory-100 text-ink-800 text-xs"><strong>Affordable Option:</strong> ${this.escapeHtml(idea.tiers.affordable)}</div>`;
        } else if (this.ideaTier === "premium") {
          tierContent = `<div class="p-3 rounded-xl bg-gold-light/60 text-ink-900 border border-gold-200 text-xs"><strong>Luxury Tier:</strong> ${this.escapeHtml(idea.tiers.premium)}</div>`;
        } else {
          tierContent = `<div class="p-3 rounded-xl bg-coral-soft text-ink-900 border border-coral-200 text-xs"><strong>Balanced Value:</strong> ${this.escapeHtml(idea.tiers.balanced)}</div>`;
        }
      }

      card.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase tracking-wider text-coral-600">${this.escapeHtml(idea.category)}</span>
            <span class="festiva-badge text-gold-700 bg-gold-light border-gold-200">${this.escapeHtml(idea.tag || 'Touchpoint')}</span>
          </div>

          <h4 class="font-serif-editorial font-bold text-lg text-ink-900">${this.escapeHtml(idea.title)}</h4>
          <p class="text-xs text-ink-700 leading-relaxed">${this.escapeHtml(idea.description)}</p>
          
          <div class="text-[11px] text-ink-500 italic bg-ivory-50 p-2.5 rounded-lg border border-ivory-200">
            <strong>Why it fits:</strong> ${this.escapeHtml(idea.whyItFits)}
          </div>

          ${tierContent}
        </div>

        <div class="pt-3 border-t border-ivory-200 flex justify-between items-center text-xs">
          <span class="text-ink-400 text-[11px]">Personalized by Festiva AI</span>
          <button type="button" data-action="adopt-idea" class="text-xs font-semibold text-coral-500 hover:text-coral-600 flex items-center gap-1">
            <i data-lucide="plus-circle" class="w-3.5 h-3.5"></i> Add to Timeline
          </button>
        </div>
      `;
      const adoptButton = card.querySelector('[data-action="adopt-idea"]');
      adoptButton.addEventListener("click", () => this.adoptIdeaIntoTasks(idea.title));
      grid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  },

  setIdeaTier(tier) {
    this.ideaTier = tier;
    document.querySelectorAll(".idea-tier-btn").forEach(btn => {
      if (btn.getAttribute("data-tier") === tier) {
        btn.className = "idea-tier-btn px-3 py-1 rounded-lg text-xs font-semibold bg-coral-500 text-white";
      } else {
        btn.className = "idea-tier-btn px-3 py-1 rounded-lg text-xs font-semibold text-ink-700 hover:bg-ivory-100";
      }
    });
    this.renderIdeasTab();
  },

  triggerSurpriseMe() {
    const surprises = (this.currentEvent && this.currentEvent.surpriseIdeas) || [
      { title: "Audio Guestbook in Vintage Rotary Phone", description: "Heartfelt guest voice messages captured on retro hardware.", category: "Guest Experience" },
      { title: "Midnight Truffle Pizza Cart", description: "Fresh piping hot artisan slices as the dancefloor hits its peak.", category: "Late Night Bite" },
      { title: "Golden Hour Starlight Silent Disco", description: "Keep dancing under the open night sky without noise curfew issues.", category: "Entertainment" }
    ];

    const pick = surprises[Math.floor(Math.random() * surprises.length)];
    this.triggerConfetti();

    // Add to ideas
    const newIdea = {
      id: "idea-surprise-" + Date.now(),
      category: pick.category || "Surprise Delight",
      title: `✨ Surprise: ${pick.title}`,
      description: pick.description,
      whyItFits: "Uncommon, delightful sensory twist that creates viral memories for your attendees.",
      tiers: {
        affordable: "Simplified community version (~$150)",
        balanced: `Standard professional execution (${pick.estimatedCost || '$450'})`,
        premium: "Full bespoke luxury presentation (~$900)"
      },
      tag: "Surprise Twist"
    };

    if (!this.currentEvent.ideas) this.currentEvent.ideas = [];
    this.currentEvent.ideas.unshift(newIdea);
    this.saveCurrentEvent();
    this.renderIdeasTab();
    this.showToast(`Surprise Unlocked: "${pick.title}"!`, "success");
  },

  adoptIdeaIntoTasks(title) {
    const newTask = {
      id: "t-" + Date.now(),
      title: `Execute: ${title}`,
      category: "Creative Touch",
      deadline: this.currentEvent.date,
      status: "pending",
      priority: "Medium",
      owner: "Host",
      notes: "Generated from Creative Idea Studio"
    };

    if (!this.currentEvent.tasks) this.currentEvent.tasks = [];
    this.currentEvent.tasks.push(newTask);
    this.saveCurrentEvent();
    this.showToast(`Added "${title}" as a milestone task!`, "success");
  },

  // ================= TAB 7: GUEST OVERVIEW =================
  renderGuestsTab() {
    const e = this.currentEvent;
    const guests = e.guestsList || [];

    const rsvpCounts = EventUtils.guestRsvpCounts(guests);
    const { attending, declined, pending } = rsvpCounts;

    document.getElementById("guestStatCapacity").textContent = e.guests || 100;
    document.getElementById("guestStatAttending").textContent = attending;
    document.getElementById("guestStatDeclined").textContent = declined;
    document.getElementById("guestStatPending").textContent = pending;

    const tbody = document.getElementById("guestsTableBody");
    tbody.innerHTML = "";

    if (guests.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-ink-500">No guests added yet. Click "+ Add Guest" to begin your directory.</td></tr>`;
      return;
    }

    guests.forEach(g => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-ivory-50/80 transition-colors";

      tr.innerHTML = `
        <td class="py-3 px-4 font-semibold text-ink-900">${this.escapeHtml(g.name)}</td>
        <td class="py-3 px-4 text-xs text-ink-600">${this.escapeHtml(g.group || 'Guest')}</td>
        <td class="py-3 px-4 text-center">
          <select onchange="App.updateGuestRsvp(decodeURIComponent('${this.inlineArg(g.id)}'), this.value)" class="text-xs rounded-lg px-2 py-1 border border-ivory-200 bg-white font-medium focus:outline-none">
            <option value="attending" ${g.rsvp === 'attending' ? 'selected' : ''}>Attending</option>
            <option value="pending" ${g.rsvp === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="declined" ${g.rsvp === 'declined' ? 'selected' : ''}>Declined</option>
          </select>
        </td>
        <td class="py-3 px-4 text-center font-bold">${EventUtils.numeric(g.count) || 1}</td>
        <td class="py-3 px-4 text-xs text-ink-600">${this.escapeHtml(g.dietary || 'None')}</td>
        <td class="py-3 px-4 text-xs text-ink-500">${this.escapeHtml(g.notes || '-')}</td>
        <td class="py-3 px-4 text-center">
          <button aria-label="Delete guest ${this.escapeHtml(g.name)}" onclick="App.deleteGuest(decodeURIComponent('${this.inlineArg(g.id)}'))" class="text-ink-400 hover:text-rose-600 p-1" title="Delete Guest">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (window.lucide) lucide.createIcons();
  },

  updateGuestRsvp(guestId, newRsvp) {
    const g = (this.currentEvent.guestsList || []).find(item => item.id === guestId);
    if (!g) return;
    g.rsvp = newRsvp;
    this.saveCurrentEvent();
    this.showToast(`Updated RSVP for ${g.name}`, "info");
  },

  deleteGuest(guestId) {
    if (!confirm("Remove this guest entry?")) return;
    this.currentEvent.guestsList = (this.currentEvent.guestsList || []).filter(g => g.id !== guestId);
    this.saveCurrentEvent();
    this.showToast("Guest removed", "info");
  },

  openAddGuestModal() {
    document.getElementById("addGuestModal").classList.remove("hidden");
  },
  closeAddGuestModal() {
    document.getElementById("addGuestModal").classList.add("hidden");
  },

  saveNewGuest() {
    const name = document.getElementById("newGuestName").value.trim();
    const group = document.getElementById("newGuestGroup").value.trim() || "Friends";
    const count = Number(document.getElementById("newGuestCount").value) || 1;
    const rsvp = document.getElementById("newGuestRsvp").value;
    const dietary = document.getElementById("newGuestDietary").value.trim() || "None";
    const notes = document.getElementById("newGuestNotes").value.trim();

    if (!name) {
      alert("Please provide guest name.");
      return;
    }

    const newGuest = {
      id: "g-" + Date.now(),
      name,
      group,
      count,
      rsvp,
      dietary,
      notes
    };

    if (!this.currentEvent.guestsList) this.currentEvent.guestsList = [];
    this.currentEvent.guestsList.push(newGuest);
    this.saveCurrentEvent();
    this.closeAddGuestModal();
    this.showToast("Guest added to directory!", "success");
  },

  exportGuestsCSV() {
    const guests = this.currentEvent?.guestsList || [];
    if (guests.length === 0) {
      alert("No guests to export yet.");
      return;
    }

    let csv = EventUtils.csvRow(["Name", "Group", "PartySize", "RSVP", "Dietary", "Notes"]) + "\r\n";
    guests.forEach(g => {
      csv += EventUtils.csvRow([g.name, g.group || "", g.count || 1, g.rsvp, g.dietary || "", g.notes || ""]) + "\r\n";
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(this.currentEvent.name || "festiva").replace(/[^a-z0-9_-]+/gi, "-")}-guest-list.csv`;
    a.click();
    this.showToast("Exported guest directory CSV", "success");
  },

  // ================= EVENT CREATION WIZARD =================
  openWizard(isEditMode = false) {
    this.wizardStep = 1;
    this.showWizardStep(1);

    if (isEditMode && this.currentEvent) {
      document.getElementById("inputEventType").value = this.currentEvent.type || "Wedding";
      document.getElementById("inputEventName").value = this.currentEvent.name || "";
      document.getElementById("inputEventDescription").value = this.currentEvent.description || "";
      document.getElementById("inputEventDate").value = this.currentEvent.date || "";
      document.getElementById("inputEventLocation").value = this.currentEvent.location || "";
      document.getElementById("inputEventGuests").value = this.currentEvent.guests || 80;
      document.getElementById("inputEventBudget").value = this.currentEvent.budget || 25000;
      document.getElementById("inputEventCurrency").value = this.currentEvent.currency || "USD";
      document.getElementById("inputEventStyle").value = this.currentEvent.style || "Elegant & Refined";
      document.getElementById("inputEventVenuePref").value = this.currentEvent.venuePreference || "Outdoor with covered backup";
      document.getElementById("inputEventCatering").value = this.currentEvent.cateringPreference || "";
      document.getElementById("inputEventDietary").value = this.currentEvent.dietaryRestrictions || "";
      document.getElementById("inputEventTraditions").value = this.currentEvent.culturalTraditions || "";
      document.getElementById("inputEventPriorities").value = this.currentEvent.planningPriorities || "Guest Experience & Entertainment";
    } else {
      // Defaults for brand new event
      document.getElementById("inputEventDate").value = AIEngine.getDefaultFutureDate(6);
    }

    this.handleEventTypeChange();
    document.getElementById("wizardModal").classList.remove("hidden");
  },

  closeWizard() {
    document.getElementById("wizardModal").classList.add("hidden");
  },

  handleEventTypeChange() {
    const type = document.getElementById("inputEventType").value;
    const container = document.getElementById("conditionalFieldsContainer");
    container.innerHTML = "";

    if (type === "Wedding") {
      container.innerHTML = `
        <div>
          <label class="block font-bold text-ink-700 mb-1">Ceremony & Reception Details</label>
          <input type="text" id="condCeremony" placeholder="e.g. Sunset outdoor ceremony followed by lawn reception" class="w-full p-2 rounded-lg border border-ivory-200 bg-white text-xs" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-ink-700 mb-1">Bridal Party Size</label>
            <input type="number" id="condPartySize" value="6" min="0" class="w-full p-2 rounded-lg border border-ivory-200 bg-white text-xs" />
          </div>
          <div>
            <label class="block font-bold text-ink-700 mb-1">Floral Scale</label>
            <select id="condFloral" class="w-full p-2 rounded-lg border border-ivory-200 bg-white text-xs">
              <option value="Statement Floral Installations">Abundant & Statement Arches</option>
              <option value="Minimal Greenery & Candles">Minimal Greenery & Candlelight</option>
              <option value="Balanced Garden Arrangements" selected>Balanced Garden Arrangements</option>
            </select>
          </div>
        </div>
      `;
    } else if (type === "Birthday") {
      container.innerHTML = `
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-ink-700 mb-1">Milestone Age Group</label>
            <input type="text" id="condMilestoneAge" placeholder="e.g. 30th, 50th, Sweet 16" class="w-full p-2 rounded-lg border border-ivory-200 bg-white text-xs" />
          </div>
          <div>
            <label class="block font-bold text-ink-700 mb-1">Entertainment Vibe</label>
            <select id="condEntertainment" class="w-full p-2 rounded-lg border border-ivory-200 bg-white text-xs">
              <option value="Live DJ & Dance Floor">Live DJ & High-Energy Dancing</option>
              <option value="Acoustic Lounge / Speakeasy">Intimate Speakeasy / Lounge</option>
              <option value="Interactive Games & Activities">Interactive Games & Trivia</option>
            </select>
          </div>
        </div>
      `;
    } else if (type === "Corporate Event") {
      container.innerHTML = `
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-ink-700 mb-1">AV & Stage Requirements</label>
            <input type="text" id="condAV" placeholder="e.g. Dual LED screens, 4 wireless mics" class="w-full p-2 rounded-lg border border-ivory-200 bg-white text-xs" />
          </div>
          <div>
            <label class="block font-bold text-ink-700 mb-1">Event Format</label>
            <select id="condCorpFormat" class="w-full p-2 rounded-lg border border-ivory-200 bg-white text-xs">
              <option value="Keynote Presentation + Networking">Keynote + Networking Cocktail</option>
              <option value="Full Day Conference + Breakouts">Conference + Workshops</option>
              <option value="Annual Awards Gala">Annual Awards Gala & Dinner</option>
            </select>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div>
          <label class="block font-bold text-ink-700 mb-1">Special Focal Point or Activity</label>
          <input type="text" id="condCustomFocal" placeholder="e.g. Live charity auction, silent disco, or food tasting" class="w-full p-2 rounded-lg border border-ivory-200 bg-white text-xs" />
        </div>
      `;
    }
  },

  showWizardStep(step) {
    this.wizardStep = step;
    
    // Hide all step panes
    document.querySelectorAll(".wizard-step-pane").forEach((pane, idx) => {
      if (idx + 1 === step) pane.classList.remove("hidden");
      else pane.classList.add("hidden");
    });

    // Update Progress Bar & Titles
    const pct = step * 25;
    document.getElementById("wizardProgressBar").style.width = `${pct}%`;
    document.getElementById("wizardStepIndicator").textContent = `Step ${step} of 4`;

    const titles = [
      "Celebration Essentials",
      "Financials & Aesthetics",
      "Hospitality & Priorities",
      "Review & AI Plan Synthesis"
    ];
    document.getElementById("wizardTitle").textContent = titles[step - 1];

    // Buttons
    const backBtn = document.getElementById("wizardBackBtn");
    const nextBtn = document.getElementById("wizardNextBtn");
    const genBtn = document.getElementById("wizardGenerateBtn");

    if (step === 1) {
      backBtn.classList.add("invisible");
    } else {
      backBtn.classList.remove("invisible");
    }

    if (step === 4) {
      nextBtn.classList.add("hidden");
      genBtn.classList.remove("hidden");
      this.populateWizardReview();
    } else {
      nextBtn.classList.remove("hidden");
      genBtn.classList.add("hidden");
    }
  },

  nextWizardStep() {
    if (this.wizardStep === 1) {
      const name = document.getElementById("inputEventName").value.trim();
      const date = document.getElementById("inputEventDate").value;
      if (!name) {
        alert("Please enter a celebration name.");
        return;
      }
      if (!date) {
        alert("Please select your celebration date.");
        return;
      }
    } else if (this.wizardStep === 2) {
      const budget = Number(document.getElementById("inputEventBudget").value);
      if (!budget || budget <= 0) {
        alert("Please enter a valid event budget.");
        return;
      }
    }
    this.showWizardStep(this.wizardStep + 1);
  },

  prevWizardStep() {
    if (this.wizardStep > 1) {
      this.showWizardStep(this.wizardStep - 1);
    }
  },

  populateWizardReview() {
    const name = document.getElementById("inputEventName").value.trim() || "My Celebration";
    const date = document.getElementById("inputEventDate").value || "TBD";
    const loc = document.getElementById("inputEventLocation").value.trim() || "Local Venue";
    const budget = Number(document.getElementById("inputEventBudget").value) || 20000;
    const curr = document.getElementById("inputEventCurrency").value || "USD";
    const sym = AIEngine.getCurrencySymbol(curr);
    const guests = document.getElementById("inputEventGuests").value || 80;

    document.getElementById("reviewName").textContent = name;
    document.getElementById("reviewDateLocation").textContent = `${this.formatDateReadable(date)} • ${loc}`;
    document.getElementById("reviewBudget").textContent = `${sym}${budget.toLocaleString()} ${curr}`;
    document.getElementById("reviewGuests").textContent = `${guests} Expected Attendees`;
  },

  async submitWizardGeneration() {
    const loadingBox = document.getElementById("wizardLoadingStatus");
    const progressEl = document.getElementById("wizardGenProgress");
    const msgEl = document.getElementById("wizardLoadingMsg");
    const genBtn = document.getElementById("wizardGenerateBtn");
    const backBtn = document.getElementById("wizardBackBtn");

    loadingBox.classList.remove("hidden");
    genBtn.disabled = true;
    backBtn.disabled = true;

    // Collect all form data
    const formData = {
      type: document.getElementById("inputEventType").value,
      name: document.getElementById("inputEventName").value.trim(),
      description: document.getElementById("inputEventDescription").value.trim(),
      date: document.getElementById("inputEventDate").value,
      location: document.getElementById("inputEventLocation").value.trim(),
      guests: Number(document.getElementById("inputEventGuests").value),
      budget: Number(document.getElementById("inputEventBudget").value),
      currency: document.getElementById("inputEventCurrency").value,
      style: document.getElementById("inputEventStyle").value,
      theme: document.getElementById("inputEventTheme").value.trim(),
      venuePreference: document.getElementById("inputEventVenuePref").value,
      cateringPreference: document.getElementById("inputEventCatering").value.trim(),
      dietaryRestrictions: document.getElementById("inputEventDietary").value.trim(),
      culturalTraditions: document.getElementById("inputEventTraditions").value.trim(),
      planningPriorities: document.getElementById("inputEventPriorities").value,
      conditionalDetails: {}
    };

    try {
      const generatedPlan = await AIEngine.generateEventPlan(formData, (statusMsg, pct) => {
        msgEl.textContent = statusMsg;
        progressEl.style.width = `${pct}%`;
      });

      this.currentEvent = generatedPlan;
      this.updateAiStatusPill();
      this.saveCurrentEvent();
      this.closeWizard();
      this.navigateTo("dashboard");
      this.showToast("Your tailored celebration plan is ready!", "success");
      this.triggerConfetti();
    } catch (err) {
      console.error(err);
      alert("Failed to generate plan: " + err.message);
    } finally {
      loadingBox.classList.add("hidden");
      genBtn.disabled = false;
      backBtn.disabled = false;
    }
  },

  // ================= AI SETTINGS MODAL =================
  openAiModal() {
    this.updateAiStatusPill();
    document.getElementById("aiModal").classList.remove("hidden");
  },
  closeAiModal() {
    document.getElementById("aiModal").classList.add("hidden");
  },

  saveAiSettings() {
    this.updateAiStatusPill();
    this.closeAiModal();
    this.showToast("AI settings checked. Secrets are configured on the backend, never in this page.", "info");
  },

  updateAiStatusPill() {
    const label = document.getElementById("aiStatusLabel");
    const statusText = document.getElementById("aiEngineCurrentStatusText");
    const usingGemini = AIEngine.activeMode === "gemini-live";
    if (label) label.textContent = usingGemini ? "Gemini AI" : "Festiva Intelligence";
    if (statusText) {
      statusText.textContent = usingGemini
        ? "This plan was generated by the secured, server-side Gemini service."
        : "Heuristic planning is ready. Gemini requires a configured server-side backend; no API key is stored in this browser.";
    }
  },

  // ================= EXPORT & PRINT =================
  openExportModal() {
    document.getElementById("exportModal").classList.remove("hidden");
  },
  closeExportModal() {
    document.getElementById("exportModal").classList.add("hidden");
  },

  copyPlanSummaryToClipboard() {
    const e = this.currentEvent;
    if (!e) return;
    const scoreData = ConfidenceEngine.calculate(e);
    const sym = e.currencySymbol || "$";

    const text = `
🎉 FESTIVA AI CELEBRATION PLAN BRIEF
=========================================
Celebration: ${e.name}
Type: ${e.type} | Style: ${e.style}
Date: ${e.date} | Location: ${e.location}
Guest Count: ${e.guests} attendees
Total Budget: ${sym}${Number(e.budget).toLocaleString()} ${e.currency}

CELEBRATION CONFIDENCE SCORE: ${scoreData.overallScore}/100 (${scoreData.grade})
- Tasks: ${scoreData.stats.completedTasks}/${scoreData.stats.totalTasks} Completed (${scoreData.stats.taskCompletionRate}%)
- Budget Utilization: ${scoreData.stats.budgetUtilization}%
- Confirmed Vendors: ${(e.vendors || []).filter(v => v.status === 'Booked' || v.status === 'Completed').length} of ${(e.vendors || []).length}

ACTIVE CONCEPT:
"${(e.concepts || [])[0]?.name || 'Standard Concept'}"
${(e.concepts || [])[0]?.description || ''}

TOP 3 NEXT ACTIONS:
${scoreData.nextActions.map((a, i) => `${i + 1}. ${a.title} - ${a.subtitle} (${a.impact})`).join("\n")}

Planned with Festiva AI — The Smart Celebration & Event Planner
    `.trim();

    navigator.clipboard.writeText(text).then(() => {
      this.showToast("Complete plan summary copied to clipboard!", "success");
      this.closeExportModal();
    }).catch(() => {
      alert("Please copy manually from text box.");
    });
  },

  exportJSON() {
    const e = this.currentEvent;
    if (!e) return;
    const blob = new Blob([JSON.stringify(e, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(e.name || "festiva-plan").replace(/[^a-z0-9_-]+/gi, "-")}.json`;
    a.click();
    this.showToast("Downloaded event state JSON", "success");
  },

  resetEventDataPrompt() {
    if (confirm("Reset current plan and restore original demo wedding?")) {
      this.loadDemoEvent();
      this.closeExportModal();
    }
  },

  // ================= UTILITIES & HELPERS =================
  triggerConfetti() {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#E06A55", "#C5A059", "#4A7C59", "#FAF8F5"]
      });
    }
  },

  showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "festiva-toast";
    
    let icon = "check-circle";
    if (type === "info") icon = "info";
    if (type === "warning") icon = "alert-triangle";

    toast.innerHTML = `
      <i data-lucide="${icon}" class="w-4 h-4 text-coral-500"></i>
      <span>${this.escapeHtml(message)}</span>
    `;
    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  calculateDaysRemaining(dateStr) {
    return EventUtils.daysUntil(dateStr);
  },

  formatDateReadable(dateStr) {
    const parsed = EventUtils.parseDateOnly(dateStr);
    if (!parsed) return "TBD";
    const d = new Date(parsed.year, parsed.month - 1, parsed.day);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  },

  escapeHtml(value) {
    return EventUtils.escapeHtml(value);
  },

  inlineArg(value) {
    return EventUtils.inlineArg(value);
  }
};

// Bootstrap application on window load
window.addEventListener("DOMContentLoaded", () => {
  App.init();
});
