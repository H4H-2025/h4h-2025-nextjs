import React from 'react';
import Link from "next/link";
import { 
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { HomeIcon, FolderIcon, FilePenIcon } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const HomeLayout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar */}
        <Sidebar className="shrink-0 p-4 space-x-4">
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/home">
                  <SidebarMenuButton tooltip="Home">
                    <HomeIcon className="h-4 w-4" />
                    <span>Home</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/home/upload">
                  <SidebarMenuButton tooltip="Upload">
                    <FolderIcon className="h-4 w-4" />
                    <span>Upload</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <Link href="/home/editor">
                  <SidebarMenuButton tooltip="Editor">
                    <FilePenIcon className="h-4 w-4" />
                    <span>Editor</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 w-full px-6 lg:px-12">
          <div className="p-4">
            <SidebarTrigger />
          </div>
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default HomeLayout;
