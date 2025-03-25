import React from "react";
import { Layout } from "@/components/layout";
import CompareClient from "./compare-client";

export const metadata = {
  title: "Compare Players - NBA Stat Projections",
  description: "Compare statistical projections between NBA players to see how they stack up against each other.",
};

export default function ComparePage() {
  return (
    <Layout>
      <CompareClient />
    </Layout>
  );
} 