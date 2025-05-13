/*
┌──────────────────────────────────────────────────────────────────────────────┐
│ @author: Davidson Gomes                                                      │
│ @file: /app/agents/dialogs/AgentToolDialog.tsx                               │
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

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Agent } from "@/types/agent";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AgentToolDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (tool: { id: string; envs: Record<string, string> }) => void;
  agents: Agent[];
  clientId: string;
}

export function AgentToolDialog({
  open,
  onOpenChange,
  onSave,
  agents,
  clientId,
}: AgentToolDialogProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedAgentId("");
      setSearch("");
    }
  }, [open]);

  const handleSave = () => {
    if (!selectedAgentId) return;
    onSave({ id: selectedAgentId, envs: {} });
    onOpenChange(false);
  };

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] max-h-[90vh] overflow-hidden flex flex-col bg-[#1a1a1a] border-[#333]">
        <DialogHeader>
          <DialogTitle className="text-white">Add Agent Tool</DialogTitle>
          <DialogDescription className="text-gray-400">
            Select an agent to add as a tool.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto px-2 pb-2 space-y-4">
          <Input
            placeholder="Search agent by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2 bg-[#222] border-[#444] text-white placeholder:text-gray-400"
          />
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {filteredAgents.length === 0 && (
              <div className="text-gray-400 text-sm text-center py-6">No agents found.</div>
            )}
            {filteredAgents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgentId(agent.id)}
                className={cn(
                  "w-full flex items-start gap-3 p-3 rounded-md border border-[#333] bg-[#232323] hover:bg-[#222] transition text-left cursor-pointer",
                  selectedAgentId === agent.id && "border-[#00ff9d] bg-[#1a1a1a] shadow-md"
                )}
              >
                <div className="flex-1">
                  <div className="font-medium text-white text-base">{agent.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {agent.description || "No description"}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">ID: {agent.id}</div>
                </div>
                {selectedAgentId === agent.id && (
                  <span className="ml-2 text-[#00ff9d] font-bold">Selected</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <DialogFooter className="p-4 pt-2 border-t border-[#333]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-[#222] border-[#444] text-gray-300 hover:bg-[#333] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#00ff9d] text-black hover:bg-[#00cc7d]"
            disabled={!selectedAgentId}
          >
            Add Tool
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 