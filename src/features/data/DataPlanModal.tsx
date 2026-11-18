"use client";

import * as React from "react";
import { Search, X, Check, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NAV_ICON_STROKE_WIDTH } from "@/config/navigation";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  type DataBundlePlan,
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

  // Available categories derived dynamically from actual plans
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

  // Filter plans by search query and category
  const filteredPlans = React.useMemo(() => {
    return plans.filter((plan) => {
      const category = getPlanValidityCategory(plan);
      if (activeCategory !== "all" && category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = plan.name.toLowerCase().includes(q);
      const matchSize = plan.size.toLowerCase().includes(q);
      const matchPrice = plan.price.toString().includes(q);
      const matchValidity = plan.validity.toLowerCase().includes(q);
      const matchAllowance = (plan.allowance || "").toLowerCase().includes(q);

      return matchName || matchSize || matchPrice || matchValidity || matchAllowance;
    });
  }, [plans, activeCategory, searchQuery]);

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
        <div className="border-b border-border p-5 sm:p-6 pb-4 space-y-4 bg-card shrink-0">
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
                  Choose a data bundle for your recipient.
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

          {/* Segmented Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat;
              const label = cat === "all" ? "All" : cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "rounded-[6px] px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap shrink-0",
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
        </div>

        {/* Scrollable Plan Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 max-h-[55vh]">
          {filteredPlans.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="mx-auto flex size-10 items-center justify-center rounded-[8px] bg-muted text-muted-foreground">
                <Wifi className="size-5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                No data plans found
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                No packages match &ldquo;{searchQuery}&rdquo;. Try another search or filter category.
              </p>
              {searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="mt-2 text-xs rounded-[6px] h-8"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {filteredPlans.map((plan) => {
                const isSelected = plan.id === selectedPlanId;
                const allowance = getPlanAllowance(plan);

                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      onSelectPlan(plan);
                      onClose();
                    }}
                    className={cn(
                      "relative flex flex-col justify-between rounded-[10px] border p-3.5 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                      isSelected
                        ? "border-primary bg-primary/[0.04] text-foreground"
                        : "border-border bg-card hover:border-primary/40 hover:bg-muted/20 text-foreground"
                    )}
                  >
                    {/* Top Row: Plan Name & Selected Check */}
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                        {plan.name}
                      </span>
                      {isSelected ? (
                        <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div className="size-4.5 shrink-0 rounded-full border border-border" />
                      )}
                    </div>

                    {/* Middle: Price */}
                    <div className="mt-2.5">
                      <span className="font-mono text-sm sm:text-base font-bold text-foreground">
                        {formatCurrency(plan.price, "NGN")}
                      </span>
                    </div>

                    {/* Bottom: Validity & Allowance */}
                    <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <span>{plan.validity}</span>
                      <span>·</span>
                      <span>{allowance}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-border p-3.5 sm:p-4 bg-muted/15 flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <span>
            Showing {filteredPlans.length} {filteredPlans.length === 1 ? "plan" : "plans"}
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
