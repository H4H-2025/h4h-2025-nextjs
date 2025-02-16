"use client";
import React from "react";
import Link from "next/link";
import { Search, FileText, Cloud } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-8 px-6 lg:px-12">
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 flex justify-center items-center z-10 opacity-80 animate-logo-foreground pt-12">
          <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500">
            PharmaSure
          </h1>
        </div>
      </div>

      <div className="mt-48 text-center">
        <h1 className="text-5xl font-bold text-white tracking-tight mb-4">
          Transforming Drug Development with PharmaSure
        </h1>
        <p className="text-xl text-muted-foreground mb-12">
           .
        </p>
        <Link href="/drive">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition-colors">
            Get Started
          </button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="hover:bg-accent transition-colors cursor-pointer shadow-xl p-6 rounded-lg bg-white">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-2xl font-medium">Instant Search & Extraction</h3>
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <p>
            Quickly locate and extract key clinical trial data, safety reports, and compliance documents, streamlining your workflow.
          </p>
        </div>

        <div className="hover:bg-accent transition-colors cursor-pointer shadow-xl p-6 rounded-lg bg-white">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-2xl font-medium">Automated Categorization</h3>
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p>
            Automatically organize unstructured data into clear, referencable formats, streamlining the submission process.
          </p>
        </div>

        <div className="hover:bg-accent transition-colors cursor-pointer shadow-xl p-6 rounded-lg bg-white">
          <div className="flex items-center justify-between pb-4">
            <h3 className="text-2xl font-medium">Boost Workflow Efficiency</h3>
            <Cloud className="h-6 w-6 text-muted-foreground" />
          </div>
          <p>
            Save valuable time and resources by reducing redundant work, allowing your team to focus on drug development instead of paperwork.
          </p>
        </div>
      </div>

      <div className="text-center mt-20">
        <h2 className="text-3xl font-semibold text-white mb-6">
          Why PharmaSure Matters
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
          By transforming months of manual work into minutes of automated processing, PharmaSure enables biotech startups to move faster, reduce costs, and bring life-saving treatments to market sooner.
        </p>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-6 rounded-lg shadow-xl">
            <h4 className="text-lg font-medium">Clinical Trials</h4>
            <div className="text-3xl font-bold">6-7</div>
            <p className="text-sm">Years spent on clinical trial research on average before application</p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-6 rounded-lg shadow-xl">
            <h4 className="text-lg font-medium">NDA Application</h4>
            <div className="text-3xl font-bold">1-2</div>
            <p className="text-sm">Years spent on average writing and submitting</p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-6 rounded-lg shadow-xl">
            <h4 className="text-lg font-medium">Money Saved</h4>
            <div className="text-3xl font-bold">$1000+</div>
            <p className="text-sm">On legal teams compiling research data for documents </p>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-6 rounded-lg shadow-xl">
            <h4 className="text-lg font-medium">Documents Searched</h4>
            <div className="text-3xl font-bold">120+</div>
            <p className="text-sm">On average, manually, to compile clinical research</p>
          </div>
        </div>
      </div>
    </div>
  );
}
