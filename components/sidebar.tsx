/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /components/sidebar.tsx                                               │
│ Developed by: Davidson Gomes                                                 │
│ Creation date: May 13, 2025                                                  │
│ Contact: contato@evolution-api.com                                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ @copyright © Evolution API 2025. All rights reserved.                        │
│ Licensed under the Apache License, Version 2.0                               │
│                                                                              │
│ You may not use this file except in compliance with the License.             │
│ You may obtain a copy of the License at                                      │
│                                                                              │
│    http://www.apache.org/licenses/LICENSE-2.0                                │
│                                                                              │
│ Unless required by applicable law or agreed to in writing, software          │
│ distributed under the License is distributed on an "AS IS" BASIS,            │
│ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.     │
│ See the License for the specific language governing permissions and          │
│ limitations under the License.                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ @important                                                                   │
│ For any future changes to the code in this file, it is recommended to        │
│ include, together with the modification, the information of the developer    │
│ who changed it and the date of modification.                                 │
└──────────────────────────────────────────────────────────────────────────────┘
*/
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageSquare,
  Grid3X3,
  Server,
  Users,
  User,
  Shield,
  LogOut,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  FileText,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          const parsed = JSON.parse(user);
          setIsAdmin(!!parsed.is_admin);
        } catch {}
      }
    }
  }, []);

  const menuItems = [
    ...(!isAdmin
      ? [
          {
            name: "Agents",
            href: "/agents",
            icon: Grid3X3,
          },
          {
            name: "Chat",
            href: "/chat",
            icon: MessageSquare,
          },
          {
            name: "Documentation",
            href: "/documentation",
            icon: FileText,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            name: "MCP Servers",
            href: "/mcp-servers",
            icon: Server,
          },
          {
            name: "Clients",
            href: "/clients",
            icon: Users,
          },
          {
            name: "Evolution API",
            href: "/whatsapp-instances",
            icon: MessageSquare,
          },
          {
            name: "Documentation",
            href: "/documentation",
            icon: FileText,
          },
        ]
      : []),
  ];

  const userMenuItems = [
    {
      name: "Profile",
      href: "/profile",
      icon: User,
      onClick: () => {}
    },
    {
      name: "Security",
      href: "/security",
      icon: Shield,
      onClick: () => {}
    },
    {
      name: "Logout",
      href: "#",
      icon: LogOut,
      onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        setLogoutDialogOpen(true)
        setUserMenuOpen(false)
      }
    },
  ];
  
  const handleLogout = () => {
    setLogoutDialogOpen(false)
    router.push("/logout")
  }

  return (
    <div className="w-56 bg-[#121212] text-white p-4 flex flex-col h-full">
      <div className="mb-8">
        <Link href="/">
          <Image
            src="https://evolution-api.com/files/evo/logo-evo-ai.svg"
            alt="Evolution API"
            width={90}
            height={40}
            className="mt-2"
          />
        </Link>
      </div>

      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-[#1a1a1a] text-[#00ff9d] border-l-2 border-[#00ff9d]"
                  : "text-gray-400 hover:text-[#00ff9d] hover:bg-[#1a1a1a]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 pt-4 mt-4">
        <div className="mb-4 relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors",
              userMenuOpen
                ? "bg-[#1a1a1a] text-[#00ff9d]"
                : "text-gray-400 hover:text-[#00ff9d] hover:bg-[#1a1a1a]"
            )}
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5" />
              <span>My Account</span>
            </div>
            {userMenuOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {userMenuOpen && (
            <div className="absolute bottom-full left-0 w-full mb-1 bg-[#1a1a1a] rounded-md overflow-hidden shadow-lg">
              {userMenuItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={item.onClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 transition-colors",
                      isActive
                        ? "bg-[#252525] text-[#00ff9d]"
                        : "text-gray-400 hover:text-[#00ff9d] hover:bg-[#252525]"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-400">Evo AI</div>
        <div className="text-xs text-gray-500 mt-1">
          © {new Date().getFullYear()} Evolution API
        </div>
      </div>
      
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#333] text-white">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-orange-500" />
              <DialogTitle>Confirmation of Logout</DialogTitle>
            </div>
            <DialogDescription className="text-gray-400">
              Are you sure you want to logout?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setLogoutDialogOpen(false)}
              className="border-[#444] text-white hover:bg-[#333] hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleLogout}
              className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
            >
              Yes, logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
