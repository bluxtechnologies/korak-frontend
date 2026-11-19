"use client";

import * as React from "react";
import { Search, X, Check, Wifi, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NAV_ICON_STROKE_WIDTH } from "@/config/navigation";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  type DataBundlePlan,
  type DataPlanType,
  getPlanValidityCategory,
  getPlanAllowance,
} from "./api";

export interface DataPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: DataBundlePlan[];
  selectedPlanId: string;
  onSelectPlan: (plan: DataBundlePlan) => void;
  networkName: string; // e.g. "MTN Nigeria"
  networkLogo?: string;
}

/**
 * Parses size strings like "500 MB", "1.0 GB", "10.0 GB" into megabytes for natural numerical sorting.
 */
function parseSizeToMb(sizeStr: string): number {
  const match = sizeStr.match(/(\d+(?:\.\d+)?)\s*(GB|MB|TB)/i);
  if (!match) return 0;
  const val = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === "TB") return val * 1024 * 1024;
  if (unit === "GB") return val * 1024;
  return val; // MB
}

export function DataPlanModal({
  isOpen,
  onClose,
  plans,
  selectedPlanId,
  onSelectPlan,
  networkName,
  networkLogo,
}: DataPlanModalProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [activeType, setActiveType] = React.useState<string>("all");
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Focus search input when modal opens & lock body scroll
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => {
        document.body.style.overflow = "";
        clearTimeout(timer);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Available validity categories derived dynamically from actual plans
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    plans.forEach((p) => {
      const cat = getPlanValidityCategory(p);
      set.add(cat);
    });
    const list = ["all"];
    if (set.has("Daily")) list.push("Daily");
    if (set.has("Weekly")) list.push("Weekly");
    if (set.has("Monthly")) list.push("Monthly");
    return list;
  }, [plans]);

  // Available bundle types derived dynamically from actual plans (e.g. SME, Corporate, Gifting)
  const bundleTypes = React.useMemo(() => {
    const types = new Set<string>();
    plans.forEach((p) => {
      if (p.plan_type) types.add(p.plan_type);
    });
    const list: { id: string; label: string }[] = [{ id: "all", label: "All Types" }];
    if (types.has("sme")) list.push({ id: "sme", label: "SME Data" });
    if (types.has("corporate")) list.push({ id: "corporate", label: "Corporate Gifting" });
    if (types.has("gifting")) list.push({ id: "gifting", label: "Direct Gifting" });
    return list;
  }, [plans]);

  // Filter plans by search query, validity category, and bundle type
  const filteredPlans = React.useMemo(() => {
    return plans.filter((plan) => {
      // 1. Validity category filter
      const category = getPlanValidityCategory(plan);
      if (activeCategory !== "all" && category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }

      // 2. Bundle type filter (sme / corporate / gifting)
      if (activeType !== "all" && plan.plan_type !== activeType) {
        return false;
      }

      // 3. Search query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = plan.name.toLowerCase().includes(q);
      const matchSize = plan.size.toLowerCase().includes(q);
      const matchPrice = plan.price.toString().includes(q);
      const matchValidity = plan.validity.toLowerCase().includes(q);
      const matchAllowance = (plan.allowance || "").toLowerCase().includes(q);

      return matchName || matchSize || matchPrice || matchValidity || matchAllowance;
    });
  }, [plans, activeCategory, activeType, searchQuery]);

  // Sort plans logically by bundle size in megabytes (ascending) and then by price
  const sortedPlans = React.useMemo(() => {
    return [...filteredPlans].sort((a, b) => {
      const mbA = parseSizeToMb(a.size || a.name);
      const mbB = parseSizeToMb(b.size || b.name);
      if (mbA !== mbB) return mbA - mbB;
      return a.price - b.price;
    });
  }, [filteredPlans]);

  // Group sorted plans by validity category when viewing "all" without active search
  const isGroupedView = activeCategory === "all" && !searchQuery.trim();
  const groupedSections = React.useMemo(() => {
    if (!isGroupedView) return [];

    const daily = sortedPlans.filter((p) => getPlanValidityCategory(p) === "Daily");
    const weekly = sortedPlans.filter((p) => getPlanValidityCategory(p) === "Weekly");
    const monthly = sortedPlans.filter((p) => getPlanValidityCategory(p) === "Monthly");

    const sections = [];
    if (daily.length > 0) sections.push({ title: "Daily Bundles", plans: daily });
    if (weekly.length > 0) sections.push({ title: "Weekly Bundles", plans: weekly });
    if (monthly.length > 0) sections.push({ title: "Monthly Bundles", plans: monthly });
    return sections;
  }, [isGroupedView, sortedPlans]);

  const renderPlanCard = (plan: DataBundlePlan) => {
    const isSelected = plan.id === selectedPlanId;
    const allowance = getPlanAllowance(plan);
    const validityCat = getPlanValidityCategory(plan);

    return (
      <button
        key={plan.id}
        type="button"
        onClick={() => {
          onSelectPlan(plan);
          onClose();
        }}
        className={cn(
          "group relative flex flex-col justify-between rounded-[10px] border p-3.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
          isSelected
            ? "border-primary bg-primary/[0.04] text-foreground shadow-2xs"
            : "border-border bg-card hover:border-primary/40 hover:bg-muted/20 text-foreground"
        )}
      >
        {/* Top: Plan Name, Category Tag & Selected Indicator */}
        <div className="flex items-start justify-between gap-2 w-full">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="rounded-[4px] bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                {validityCat}
              </span>
              {plan.plan_type && (
                <span className="rounded-[4px] bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase text-muted-foreground">
                  {plan.plan_type}
                </span>
              )}
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground block group-hover:text-primary transition-colors leading-tight">
              {plan.name}
            </span>
          </div>

          {isSelected ? (
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
              <Check className="size-3" strokeWidth={2.5} />
            </div>
          ) : (
            <div className="size-5 shrink-0 rounded-full border border-border group-hover:border-primary/50 transition-colors" />
          )}
        </div>

        {/* Middle: Price */}
        <div className="mt-3">
          <span className="font-mono text-base sm:text-lg font-bold text-foreground block">
            {formatCurrency(plan.price, "NGN")}
          </span>
        </div>

        {/* Bottom: Validity & Allowance Metadata */}
        <div className="mt-1.5 text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium border-t border-border/50 pt-2">
          <span>{plan.validity}</span>
          <span>·</span>
          <span>{allowance}</span>
        </div>
      </button>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-plan-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-2xl rounded-[12px] border border-border bg-card p-0 shadow-xl transition-all overflow-hidden flex flex-col max-h-[90vh]">
        {/* Fixed Header */}
        <div className="border-b border-border p-5 sm:p-6 pb-4 space-y-3.5 bg-card shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {networkLogo && (
                <div className="flex size-9 items-center justify-center rounded-[8px] border border-border bg-background p-1 shrink-0">
                  <img
                    src={networkLogo}
                    alt={networkName}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
              <div>
                <h2
                  id="data-plan-modal-title"
                  className="text-base sm:text-lg font-bold text-foreground"
                >
                  Select {networkName} Data Plan
                </h2>
                <p className="text-xs text-muted-foreground">
                  Choose an organized data bundle tailored to your needs.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-8 rounded-[8px] text-muted-foreground hover:text-foreground hover:bg-muted"
              aria-label="Close data plan modal"
            >
              <X className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            </Button>
          </div>

          {/* Search Field */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
              strokeWidth={NAV_ICON_STROKE_WIDTH}
            />
            <Input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search data plans..."
              className="h-10 pl-9 pr-9 rounded-[8px] text-xs sm:text-sm bg-muted/30 border-border focus-visible:ring-1 focus-visible:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Category & Type Filter Segment Controls */}
          <div className="space-y-2">
            {/* Row 1: Validity Categories */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">
                Validity:
              </span>
              {categories.map((cat) => {
                const isSelected = activeCategory === cat;
                const label = cat === "all" ? "All" : cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "rounded-[6px] px-2.5 py-1 text-xs font-semibold transition-all whitespace-nowrap shrink-0",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Row 2: Bundle Types (if multiple types available) */}
            {bundleTypes.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5 pb-0.5 no-scrollbar">
                <span className="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">
                  Type:
                </span>
                {bundleTypes.map((type) => {
                  const isSelected = activeType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setActiveType(type.id)}
                      className={cn(
                        "rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold transition-all whitespace-nowrap shrink-0",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/30"
                      )}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Plan Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 max-h-[55vh]">
          {sortedPlans.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="mx-auto flex size-10 items-center justify-center rounded-[8px] bg-muted text-muted-foreground">
                <Wifi className="size-5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                No data plans found
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No packages match &ldquo;{searchQuery}&rdquo;. Try another search or adjust your category filters.
              </p>
              {(searchQuery || activeCategory !== "all" || activeType !== "all") && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                    setActiveType("all");
                  }}
                  className="mt-2 text-xs rounded-[6px] h-8"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : isGroupedView ? (
            /* Grouped Sections Layout for Organized Browsing */
            <div className="space-y-6">
              {groupedSections.map((section) => (
                <div key={section.title} className="space-y-2.5">
                  <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                      {section.plans.length} {section.plans.length === 1 ? "plan" : "plans"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {section.plans.map(renderPlanCard)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Flat Grid for Filtered / Searched Views */
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {sortedPlans.map(renderPlanCard)}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-border p-3.5 sm:p-4 bg-muted/15 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <span>
            Showing {sortedPlans.length} {sortedPlans.length === 1 ? "plan" : "plans"}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 px-3 rounded-[6px] text-xs font-semibold"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
