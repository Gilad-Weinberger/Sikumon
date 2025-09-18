"use client";

import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

const PageLayout = ({ children, className = "" }: PageLayoutProps) => {
  return <div className={`pt-12 ${className}`}>{children}</div>;
};

export default PageLayout;
