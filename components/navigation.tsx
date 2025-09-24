// ABOUTME: Main navigation sidebar component with collapsible categories
// ABOUTME: Provides navigation for all calculators and tools in the application

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Calculator,
  Wrench,
  Package,
  Building,
  Home,
  Fence as FenceIcon,
  QrCode,
  FileText,
  Settings,
  Database,
  Ruler,
  Weight,
} from "lucide-react";
import { useState } from "react";

const navigationItems = [
  {
    category: "CALCULATORS",
    items: [
      {
        name: "PALLET//CALC",
        href: "/calculators/pallet",
        icon: Package,
        status: "active",
      },
      {
        name: "FENCE//CALC",
        href: "/calculators/fence",
        icon: FenceIcon,
        status: "coming-soon",
      },
      {
        name: "CONCRETE//MIX",
        href: "/calculators/concrete",
        icon: Building,
        status: "planned",
      },
      {
        name: "LOAD//CALC",
        href: "/calculators/load",
        icon: Weight,
        status: "planned",
      },
      {
        name: "LUMBER//EST",
        href: "/calculators/lumber",
        icon: Ruler,
        status: "planned",
      },
    ],
  },
  {
    category: "TOOLS",
    items: [
      {
        name: "BARCODE//GEN",
        href: "/tools/barcode",
        icon: QrCode,
        status: "coming-soon",
      },
      {
        name: "SPEC//SHEET",
        href: "/tools/spec-sheet",
        icon: FileText,
        status: "planned",
      },
      {
        name: "UNIT//CONV",
        href: "/tools/converter",
        icon: Calculator,
        status: "planned",
      },
      {
        name: "MATERIAL//DB",
        href: "/tools/materials",
        icon: Database,
        status: "planned",
      },
    ],
  },
  {
    category: "SYSTEM",
    items: [
      {
        name: "CONFIG",
        href: "/system/config",
        icon: Settings,
        status: "planned",
      },
    ],
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["CALCULATORS", "TOOLS"]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  return (
    <nav className="fixed left-0 top-0 w-64 bg-gray-900 border-r border-gray-800 h-full overflow-y-auto z-40">
      <div className="p-4">
        <Link href="/" className="block">
          <div className="bg-black border border-gray-700 rounded p-3 hover:bg-gray-950 transition-colors">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-gray-400" />
              <h1 className="text-sm font-mono font-bold tracking-tight text-white">
                AAC//TOOLS
              </h1>
            </div>
            <p className="text-xs font-mono text-gray-500 mt-1">
              TECHNICAL SUITE v2.1.4
            </p>
          </div>
        </Link>
      </div>

      <div className="px-4 pb-4 space-y-3">
        {navigationItems.map((section) => (
          <div key={section.category} className="bg-black rounded border border-gray-800">
            <button
              onClick={() => toggleCategory(section.category)}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-gray-950 rounded-t transition-colors"
            >
              <span className="font-mono font-semibold text-xs tracking-wider text-gray-400">
                {section.category}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform text-gray-500",
                  expandedCategories.includes(section.category) ? "rotate-180" : ""
                )}
              />
            </button>

            {expandedCategories.includes(section.category) && (
              <div className="p-2 space-y-1 border-t border-gray-800">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const isDisabled = item.status === "planned";
                  const isComingSoon = item.status === "coming-soon";

                  if (isDisabled) {
                    return (
                      <div
                        key={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded opacity-30 cursor-not-allowed"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0 text-gray-600" />
                        <div className="font-mono text-sm text-gray-600">{item.name}</div>
                        <span className="ml-auto text-xs font-mono text-gray-700">[PLANNED]</span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200 group",
                        isActive
                          ? "bg-gray-800 text-white border border-gray-700"
                          : "hover:bg-gray-950 text-gray-400 hover:text-white"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"
                        )}
                      />
                      <div className="font-mono text-sm font-medium">{item.name}</div>
                      {isComingSoon && (
                        <span className="ml-auto text-xs font-mono text-gray-500">[SOON]</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto p-4 border-t border-gray-800">
        <div className="bg-black rounded border border-gray-800 p-3">
          <div className="text-xs font-mono text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Build</span>
              <span className="text-gray-400 font-bold">
                {new Date().toISOString().split("T")[0].replace(/-/g, "")}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 font-medium">OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}