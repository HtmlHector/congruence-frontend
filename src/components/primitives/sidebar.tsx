"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppShell } from "./app-shell";

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function SidebarNav({ className = "", children, ...props }: SidebarNavProps) {
  return (
    <nav data-slot="sidebar-nav" className={className} {...props}>
      {children}
    </nav>
  );
}

export interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  children: React.ReactNode;
}

export function SidebarGroup({ label, className = "", children, ...props }: SidebarGroupProps) {
  const { isSidebarCollapsed } = useAppShell();

  return (
    <div data-slot="sidebar-group" data-collapsed={isSidebarCollapsed} className={className} {...props}>
      {label && !isSidebarCollapsed && (
        <div data-slot="sidebar-group-label" className="sidebar-group-label">
          {label}
        </div>
      )}
      <ul data-slot="sidebar-group-list" className="sidebar-group-list">
        {children}
      </ul>
    </div>
  );
}

export interface SidebarItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  href: string;
  icon?: React.ReactNode;
  label: React.ReactNode;
  badge?: React.ReactNode;
  exact?: boolean;
}

export function SidebarItem({
  href,
  icon,
  label,
  badge,
  exact = false,
  className = "",
  ...props
}: SidebarItemProps) {
  const pathname = usePathname();
  const { isSidebarCollapsed } = useAppShell();

  const isActive = exact ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <li
      data-slot="sidebar-item"
      data-active={isActive}
      data-collapsed={isSidebarCollapsed}
      className={className}
      {...props}
    >
      <Link
        href={href}
        data-slot="sidebar-link"
        data-active={isActive}
        aria-current={isActive ? "page" : undefined}
      >
        {icon && <span data-slot="sidebar-icon">{icon}</span>}
        {!isSidebarCollapsed && <span data-slot="sidebar-label">{label}</span>}
        {!isSidebarCollapsed && badge && <span data-slot="sidebar-badge">{badge}</span>}
      </Link>
    </li>
  );
}

export function SidebarCollapseTrigger({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggleCollapse, isSidebarCollapsed } = useAppShell();

  return (
    <button
      type="button"
      data-slot="sidebar-collapse-trigger"
      aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      data-collapsed={isSidebarCollapsed}
      onClick={toggleCollapse}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}
